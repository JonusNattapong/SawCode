/**
 * Streaming Handler - Real-time streaming from Claude API
 * Returns async iterables for progressive output
 */

import Anthropic from '@anthropic-ai/sdk'
import type { AgentState, AgentMessage } from '../types.js'
import { createLogger } from '../utils/advanced-logging.js'

const logger = createLogger('streaming-handler')

export interface StreamEvent {
  type: 'start' | 'text' | 'tool_use' | 'tool_result' | 'end' | 'error'
  content?: string
  toolName?: string
  toolInput?: string
  delta?: string
}

export interface StreamProgress {
  totalTokens: number
  inputTokens: number
  outputTokens: number
  stopReason: string | null
}

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
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
 * Stream response from Claude API with real-time events
 * Usage:
 *   for await (const event of streamQuery(agent, "hello")) {
 *     if (event.type === 'text') console.log(event.delta)
 *   }
 */
export async function* streamQuery(
  state: AgentState,
  userInput: string
): AsyncGenerator<StreamEvent> {
  const client = getClient()
  const messages = [...state.messages, { type: 'user' as const, content: userInput }]
  const apiMessages = toApiMessages(messages)

  logger.debug('Starting stream', { userInput, messageCount: messages.length })

  try {
    yield { type: 'start', content: 'Streaming response...' }

    const stream = client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: apiMessages,
    })

    let buffer = ''
    let isInToolUse = false
    let currentToolName = ''
    let currentToolInput = ''

    for await (const event of stream) {
      // Handle content block start
      if (event.type === 'content_block_start') {
        if (event.content_block.type === 'tool_use') {
          isInToolUse = true
          currentToolName = event.content_block.name
          currentToolInput = ''
          yield {
            type: 'tool_use',
            toolName: currentToolName,
          }
        }
      }

      // Handle content block delta
      if (event.type === 'content_block_delta') {
        const delta = event.delta

        if ('text' in delta) {
          // Regular text
          buffer += delta.text
          yield {
            type: 'text',
            delta: delta.text,
            content: buffer,
          }
        } else if ('input' in delta) {
          // Tool input
          currentToolInput += delta.input
          yield {
            type: 'tool_use',
            toolName: currentToolName,
            toolInput: currentToolInput,
          }
        }
      }

      // Handle content block stop
      if (event.type === 'content_block_stop') {
        if (isInToolUse) {
          isInToolUse = false
          yield {
            type: 'end',
            content: `Tool call complete: ${currentToolName}`,
          }
        }
      }

      // Handle message stop (final event)
      if (event.type === 'message_stop') {
        logger.debug('Stream completed', {
          inputTokens: (event as any).message?.usage?.input_tokens,
          outputTokens: (event as any).message?.usage?.output_tokens,
        })

        yield {
          type: 'end',
          content: buffer,
        }
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    logger.error('Streaming error', { message: errorMsg })
    yield {
      type: 'error',
      content: errorMsg,
    }
  }
}

/**
 * Collect all stream events into final result
 */
export async function collectStream(
  state: AgentState,
  userInput: string
): Promise<string> {
  let result = ''

  for await (const event of streamQuery(state, userInput)) {
    if (event.type === 'text') {
      result += event.delta || ''
    } else if (event.type === 'end') {
      break
    } else if (event.type === 'error') {
      throw new Error(event.content || 'Unknown error')
    }
  }

  return result
}

/**
 * Stream with progress callback
 */
export async function streamWithProgress(
  state: AgentState,
  userInput: string,
  onProgress: (event: StreamEvent) => void
): Promise<string> {
  let result = ''

  for await (const event of streamQuery(state, userInput)) {
    onProgress(event)

    if (event.type === 'text') {
      result += event.delta || ''
    } else if (event.type === 'end') {
      break
    } else if (event.type === 'error') {
      throw new Error(event.content || 'Unknown error')
    }
  }

  return result
}

/**
 * Stream to callback function (for line-by-line processing)
 */
export async function streamLines(
  state: AgentState,
  userInput: string,
  onLine: (line: string) => void
): Promise<void> {
  let buffer = ''

  for await (const event of streamQuery(state, userInput)) {
    if (event.type === 'text' && event.delta) {
      buffer += event.delta

      // Check for complete lines
      const lines = buffer.split('\n')
      for (let i = 0; i < lines.length - 1; i++) {
        onLine(lines[i])
      }
      buffer = lines[lines.length - 1]
    } else if (event.type === 'end') {
      if (buffer) {
        onLine(buffer)
      }
    }
  }
}

/**
 * Stream with formatting (applies markdown parser)
 */
export async function streamFormatted(
  state: AgentState,
  userInput: string,
  onChunk: (chunk: string, type: 'text' | 'code' | 'tool') => void
): Promise<void> {
  const { parseMarkdown } = await import('../utils/markdown-parser.js')

  let buffer = ''
  let lastProcessedIndex = 0

  for await (const event of streamQuery(state, userInput)) {
    if (event.type === 'text' && event.delta) {
      buffer += event.delta

      // Try to detect code blocks
      const parsed = parseMarkdown(buffer)

      if (parsed.blocks.length > 0) {
        // Has code blocks, emit separately
        const beforeFirstBlock = buffer.substring(0, buffer.indexOf('```'))
        if (beforeFirstBlock.length > lastProcessedIndex) {
          onChunk(beforeFirstBlock.substring(lastProcessedIndex), 'text')
          lastProcessedIndex = beforeFirstBlock.length
        }

        for (const block of parsed.blocks) {
          onChunk(block.code, 'code')
        }
      } else {
        // No code blocks, emit as text
        onChunk(buffer.substring(lastProcessedIndex), 'text')
        lastProcessedIndex = buffer.length
      }
    } else if (event.type === 'tool_use') {
      onChunk(`[Tool: ${event.toolName}]`, 'tool')
    } else if (event.type === 'end') {
      break
    }
  }
}
