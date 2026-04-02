/**
 * Query handler for agent processing
 */

import type { AgentMessage, AgentState, QueryOptions, QueryResult } from '../types.js'
import { getTool } from '../tools/index.js'

/**
 * Process a user query through the agent
 */
export async function handleQuery(
  state: AgentState,
  userInput: string,
  _options?: QueryOptions,
): Promise<QueryResult> {
  // Add user message to history
  const userMessage: AgentMessage = {
    type: 'user',
    content: userInput,
  }
  state.messages.push(userMessage)

  // TODO: Merge config with options and use for Claude API calls
  // const config = { ...state.config, ...options }

  // For now, return a simple response
  // In a real implementation, this would call the Claude API
  const assistantMessage: AgentMessage = {
    type: 'assistant',
    content: `You asked: "${userInput}"\n\nThis is a mock response from the agent.`,
  }
  state.messages.push(assistantMessage)

  return {
    response: assistantMessage.content,
    messages: state.messages,
  }
}

/**
 * Handle tool call results
 */
export async function handleToolResult(
  state: AgentState,
  toolUseId: string,
  toolName: string,
  toolArgs: Record<string, unknown>,
): Promise<QueryResult> {
  // Get tool from registry
  const tool = getTool(state.toolRegistry, toolName)
  if (!tool) {
    return {
      response: `Error: Tool "${toolName}" not found`,
      messages: state.messages,
    }
  }

  // Execute tool
  try {
    const result = await tool.handler(toolArgs as never)

    // Extract text from MCP result format
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
