import Anthropic from '@anthropic-ai/sdk'
import type { Store } from '../state/store.js'
import type { SawCodeAppState } from '../state/types.js'
import type { AgentMessage, QueryOptions, QueryResult } from '../types.js'
import { getAgentState } from '../state/selectors.js'
import { listTools, getTool } from '../tools/index.js'
import { zodToJsonSchema } from '../utils/zod-to-json.js'
import { createLogger } from '../utils/advanced-logging.js'
import { isAbortError } from '../utils/error-classes.js'
import { retryWithBackoff, withTimeout } from '../utils/retry-timeout.js'
import {
  buildQueryContextSnapshot,
  buildSystemPromptWithContext,
  toAnthropicApiMessages,
} from '../context/query-context.js'
import {
  trackQuery,
  trackToolUse,
  trackError as trackAnalyticsError,
  getAnalyticsStore,
} from '../services/analytics/tracking.js'
import {
  calculateTokenBudget,
  smartCompact,
  type TokenBudget,
} from '../services/compact/autocompact.js'

const logger = createLogger('query-engine')

export type QueryEngineConfig = {
  store: Store<SawCodeAppState>
  getClient?: () => Anthropic
  maxIterations?: number
  timeoutMs?: number
}

export class QueryEngine {
  private readonly store: Store<SawCodeAppState>
  private readonly getClientImpl: () => Anthropic
  private readonly maxIterations: number
  private readonly timeoutMs: number

  constructor(config: QueryEngineConfig) {
    this.store = config.store
    this.getClientImpl = config.getClient ?? getDefaultClient
    this.maxIterations = config.maxIterations ?? 25
    this.timeoutMs = config.timeoutMs ?? 60000
  }

  async submit(
    userInput: string,
    options?: QueryOptions,
  ): Promise<QueryResult> {
    const client = this.getClientImpl()
    const initialAgentState = getAgentState(this.store.getState())

    logger.debug('Query started', {
      userInputLength: userInput.length,
      model: options?.model ?? initialAgentState.config.model,
    })

    this.appendAgentMessage({ type: 'user', content: userInput })

    const model =
      options?.model ??
      initialAgentState.config.model ??
      'claude-sonnet-4-20250514'
    const maxTokens = options?.maxTokens ?? initialAgentState.config.maxTokens ?? 4096
    const temperature =
      options?.temperature ?? initialAgentState.config.temperature ?? 0.7
    const contextSnapshot = await buildQueryContextSnapshot(this.store)
    const systemPrompt = buildSystemPromptWithContext({
      baseSystemPrompt: options?.systemPrompt ?? initialAgentState.config.systemPrompt,
      contextSnapshot,
    })
    const apiTools = this.getApiTools()

    // Autocompact check before API call
    const currentMessages = getAgentState(this.store.getState()).messages
    const budget: TokenBudget = calculateTokenBudget(currentMessages, model)
    if (budget.shouldCompact) {
      const compactResult = smartCompact(currentMessages, model)
      if (compactResult.strategy !== 'none') {
        logger.info('Autocompact applied before query', {
          strategy: compactResult.strategy,
          removed: compactResult.removedCount,
          savedTokens: compactResult.savedTokens,
        })
        // Replace messages in store
        this.store.setState(prev => ({
          ...prev,
          agent: {
            ...prev.agent,
            messages: compactResult.messages,
          },
        }))
      }
    }

    // Track session start (lazy init)
    const sessionId = this.store.getState().sessionId ?? 'default'
    if (!getAnalyticsStore().getSessionMetrics(sessionId)) {
      getAnalyticsStore().startSession(sessionId)
    }

    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      try {
        const response = await this.callApiWithTimeout(client, {
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: toAnthropicApiMessages(getAgentState(this.store.getState()).messages),
          ...(apiTools.length > 0 ? { tools: apiTools } : {}),
        })

        // Track query usage
        trackQuery(
          sessionId,
          model,
          response.usage?.input_tokens ?? 0,
          response.usage?.output_tokens ?? 0,
        )

        const textParts: string[] = []
        const toolCalls: QueryResult['toolCalls'] = []

        for (const block of response.content) {
          if (block.type === 'text') {
            textParts.push(block.text)
            continue
          }

          if (block.type === 'tool_use') {
            toolCalls?.push({
              id: block.id,
              name: block.name,
              args: block.input as Record<string, unknown>,
            })
          }
        }

        if ((toolCalls?.length ?? 0) > 0) {
          this.appendAgentMessage({
            type: 'assistant_with_tools',
            content: textParts.join('\n'),
            blocks: response.content as Anthropic.ContentBlock[],
          })
        } else {
          this.appendAgentMessage({
            type: 'assistant',
            content: textParts.join('\n'),
          })
        }

        if (!toolCalls || toolCalls.length === 0) {
          return {
            response: textParts.join('\n'),
            messages: getAgentState(this.store.getState()).messages,
          }
        }

        for (const toolCall of toolCalls) {
          trackToolUse(sessionId, toolCall.name)
          await this.executeToolCall(toolCall)
        }

        if (response.stop_reason === 'end_turn') {
          const messages = getAgentState(this.store.getState()).messages
          const finalResponse =
            textParts.join('\n') ||
            messages
              .filter(message => message.type === 'tool_result')
              .map(message => message.content)
              .pop() ||
            ''

          return {
            response: finalResponse,
            messages,
            toolCalls,
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)

        // Track error
        trackAnalyticsError(sessionId, errorMessage, {
          model,
          userInputLength: userInput.length,
        })

        if (isAbortError(error)) {
          return {
            response: 'Query was cancelled',
            messages: getAgentState(this.store.getState()).messages,
          }
        }

        if (errorMessage.includes('timed out')) {
          return {
            response:
              'Error: Query took too long and was cancelled. Please try again.',
            messages: getAgentState(this.store.getState()).messages,
          }
        }

        logger.error(
          'Query execution failed',
          error instanceof Error ? error : new Error(String(error)),
        )
        return {
          response: `Error: ${errorMessage}`,
          messages: getAgentState(this.store.getState()).messages,
        }
      }
    }

    return {
      response: 'Error: Maximum tool iterations reached',
      messages: getAgentState(this.store.getState()).messages,
    }
  }

  async submitToolResult(
    toolUseId: string,
    toolName: string,
    toolArgs: Record<string, unknown>,
  ): Promise<QueryResult> {
    const tool = getTool(getAgentState(this.store.getState()).toolRegistry, toolName)
    if (!tool) {
      return {
        response: `Error: Tool "${toolName}" not found`,
        messages: getAgentState(this.store.getState()).messages,
      }
    }

    try {
      const result = await tool.handler(toolArgs as never)
      const text = extractTextContent(result)

      this.appendAgentMessage({
        type: 'tool_result',
        toolUseId,
        content: text,
        isError: !!result.isError,
      })

      return {
        response: text,
        messages: getAgentState(this.store.getState()).messages,
      }
    } catch (error) {
      return {
        response: `Error executing tool: ${
          error instanceof Error ? error.message : String(error)
        }`,
        messages: getAgentState(this.store.getState()).messages,
      }
    }
  }

  private getApiTools(): Anthropic.Tool[] {
    const tools = listTools(getAgentState(this.store.getState()).toolRegistry)
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: zodToJsonSchema(tool.inputSchema) as Anthropic.Tool['input_schema'],
    }))
  }

  private appendAgentMessage(message: AgentMessage): void {
    this.store.setState(prev => ({
      ...prev,
      agent: {
        ...prev.agent,
        messages: [...prev.agent.messages, message],
      },
    }))
  }

  private async executeToolCall(toolCall: NonNullable<QueryResult['toolCalls']>[number]): Promise<void> {
    const tool = getTool(getAgentState(this.store.getState()).toolRegistry, toolCall.name)
    let content: string
    let isError = false

    if (!tool) {
      content = `Error: Tool "${toolCall.name}" not found`
      isError = true
    } else {
      try {
        const result = await tool.handler(toolCall.args as never)
        content = extractTextContent(result)
        isError = !!result.isError
      } catch (error) {
        content = `Error executing tool: ${
          error instanceof Error ? error.message : String(error)
        }`
        isError = true
      }
    }

    this.appendAgentMessage({
      type: 'tool_result',
      toolUseId: toolCall.id,
      content,
      isError,
    })
  }

  private async callApiWithTimeout(
    client: Anthropic,
    params: Parameters<typeof client.messages.create>[0],
  ): Promise<Anthropic.Message> {
    return withTimeout(
      () =>
        retryWithBackoff(
          async () =>
            (await client.messages.create(
              params,
            )) as Anthropic.Message,
          {
            maxAttempts: 3,
            initialDelayMs: 500,
            maxDelayMs: 10000,
            backoffMultiplier: 2,
            onRetry: (attempt, error) => {
              if (!isAbortError(error)) {
                logger.warn(`API call retry attempt ${attempt}`, {
                  errorMessage:
                    error instanceof Error ? error.message : String(error),
                })
              }
            },
          },
        ),
      this.timeoutMs,
    )
  }
}

let defaultClient: Anthropic | null = null

function getDefaultClient(): Anthropic {
  if (!defaultClient) {
    defaultClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  return defaultClient
}

function extractTextContent(result: { content?: unknown; isError?: boolean }): string {
  if (!('content' in result) || !Array.isArray(result.content)) {
    return JSON.stringify(result)
  }

  const parts: string[] = []
  for (const content of result.content) {
    if (typeof content === 'object' && content !== null && 'text' in content) {
      parts.push((content as { text: string }).text)
    } else {
      parts.push(JSON.stringify(content))
    }
  }

  return parts.join('\n') || JSON.stringify(result)
}
