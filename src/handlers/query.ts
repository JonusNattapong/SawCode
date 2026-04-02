/**
 * Query handler for agent processing
 * Calls the real Anthropic Claude API with tool use support.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { AgentMessage, AgentState, QueryOptions, QueryResult } from '../types.js'
import { getTool, listTools } from '../tools/index.js'
import { zodToJsonSchema } from '../utils/zod-to-json.js'
import { createLogger } from '../utils/advanced-logging.js'

const logger = createLogger('query-handler')

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    // Use Anthropic API directly
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return _client
}

/**
 * Convert internal messages to Anthropic API format
 */
function toApiMessages(messages: AgentMessage[]): Anthropic.MessageParam[] {
  const apiMessages: Anthropic.MessageParam[] = []

  for (const msg of messages) {
    if (msg.type === 'user') {
      apiMessages.push({ role: 'user', content: msg.content })
    } else if (msg.type === 'assistant') {
      apiMessages.push({ role: 'assistant', content: msg.content })
    } else if (msg.type === 'assistant_with_tools') {
      apiMessages.push({ role: 'assistant', content: msg.blocks as Anthropic.ContentBlockParam[] })
    } else if (msg.type === 'tool_result') {
      // Tool results are grouped as user messages with tool_result content blocks
      apiMessages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: msg.toolUseId,
            content: msg.content,
            is_error: msg.isError,
          },
        ],
      })
    }
  }

  return apiMessages
}

/**
 * Convert tool definitions to Anthropic API format
 */
function toApiTools(state: AgentState): Anthropic.Tool[] {
  const tools = listTools(state.toolRegistry)
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: zodToJsonSchema(tool.inputSchema) as Anthropic.Tool['input_schema'],
  }))
}

/**
 * Process a user query through the agent via real Claude API
 */
export async function handleQuery(
  state: AgentState,
  userInput: string,
  options?: QueryOptions,
): Promise<QueryResult> {
  const client = getClient()
  
  // Log query start
  logger.debug('Query started', { 
    userInputLength: userInput.length,
    model: options?.model ?? state.config.model,
  })

  // Add user message to history
  const userMessage: AgentMessage = { type: 'user', content: userInput }
  state.messages.push(userMessage)

  // Merge config with per-call options
  const model = options?.model ?? state.config.model ?? 'claude-sonnet-4-20250514'
  const maxTokens = options?.maxTokens ?? state.config.maxTokens ?? 4096
  const temperature = options?.temperature ?? state.config.temperature ?? 0.7
  const systemPrompt = options?.systemPrompt ?? state.config.systemPrompt

  const apiTools = toApiTools(state)

  // Agentic loop: keep calling API until we get a final text response (no more tool calls)
  const MAX_ITERATIONS = 25
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt ?? undefined,
      messages: toApiMessages(state.messages),
      ...(apiTools.length > 0 ? { tools: apiTools } : {}),
    })

    // Collect text and tool_use blocks
    const textParts: string[] = []
    const toolCalls: { id: string; name: string; args: Record<string, unknown> }[] = []

    for (const block of response.content) {
      if (block.type === 'text') {
        textParts.push(block.text)
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          args: block.input as Record<string, unknown>,
        })
      }
    }

    // Store the assistant response (with raw blocks for round-trip fidelity)
    if (toolCalls.length > 0) {
      const assistantMsg: AgentMessage = {
        type: 'assistant_with_tools',
        content: textParts.join('\n') || '',
        blocks: response.content as Anthropic.ContentBlock[],
      }
      state.messages.push(assistantMsg)
    } else {
      const assistantMsg: AgentMessage = {
        type: 'assistant',
        content: textParts.join('\n'),
      }
      state.messages.push(assistantMsg)
    }

    // If no tool calls → we're done
    if (toolCalls.length === 0 || response.stop_reason === 'end_turn') {
      // If there were tool calls AND end_turn, still done
      if (toolCalls.length === 0) {
        return {
          response: textParts.join('\n'),
          messages: state.messages,
        }
      }
    }

    // Execute each tool call and append results
    for (const call of toolCalls) {
      const tool = getTool(state.toolRegistry, call.name)
      let resultContent: string
      let isError = false

      if (!tool) {
        resultContent = `Error: Tool "${call.name}" not found`
        isError = true
        logger.warn('Tool not found', { toolName: call.name })
      } else {
        try {
          logger.debug('Executing tool', { 
            toolName: call.name,
            argsCount: Object.keys(call.args).length,
          })
          
          const result = await tool.handler(call.args as never)
          // Extract text from MCP CallToolResult
          const parts: string[] = []
          if ('content' in result && Array.isArray(result.content)) {
            for (const c of result.content) {
              if (typeof c === 'object' && 'text' in c) {
                parts.push((c as { text: string }).text)
              } else {
                parts.push(JSON.stringify(c))
              }
            }
          }
          resultContent = parts.join('\n') || JSON.stringify(result)
          isError = !!result.isError
          
          logger.debug('Tool executed successfully', {
            toolName: call.name,
            resultLength: resultContent.length,
          })
        } catch (error) {
          resultContent = `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
          isError = true
          logger.error('Tool execution failed', error instanceof Error ? error : new Error(String(error)))
        }
      }

      const toolResultMsg: AgentMessage = {
        type: 'tool_result',
        toolUseId: call.id,
        content: resultContent,
        isError,
      }
      state.messages.push(toolResultMsg)
    }

    // If stop_reason was end_turn (with tool calls already executed), return
    if (response.stop_reason === 'end_turn') {
      const finalResponse = textParts.join('\n') || state.messages
        .filter(m => m.type === 'tool_result')
        .map(m => m.content)
        .pop() || ''
      
      logger.info('Query completed', {
        responseLength: finalResponse.length,
        messageCount: state.messages.length,
        toolCallsExecuted: toolCalls.length,
      })
      
      return {
        response: finalResponse,
        messages: state.messages,
        toolCalls,
      }
    }

    // Otherwise, loop back to let Claude see the tool results
  }

  logger.warn('Maximum tool iterations reached')
  return {
    response: 'Error: Maximum tool iterations reached',
    messages: state.messages,
  }
}

/**
 * Handle a single tool call result (for manual tool execution)
 */
export async function handleToolResult(
  state: AgentState,
  toolUseId: string,
  toolName: string,
  toolArgs: Record<string, unknown>,
): Promise<QueryResult> {
  const tool = getTool(state.toolRegistry, toolName)
  if (!tool) {
    return {
      response: `Error: Tool "${toolName}" not found`,
      messages: state.messages,
    }
  }

  try {
    const result = await tool.handler(toolArgs as never)

    let content = ''
    if ('content' in result && Array.isArray(result.content) && result.content.length > 0) {
      const firstContent = result.content[0]
      if (typeof firstContent === 'object' && 'text' in firstContent) {
        content = (firstContent as { text: string }).text
      } else {
        content = JSON.stringify(result.content[0])
      }
    } else {
      content = JSON.stringify(result)
    }

    const toolResultMessage: AgentMessage = {
      type: 'tool_result',
      toolUseId,
      content,
    }
    state.messages.push(toolResultMessage)

    return {
      response: toolResultMessage.content,
      messages: state.messages,
    }
  } catch (error) {
    return {
      response: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
      messages: state.messages,
    }
  }
}
