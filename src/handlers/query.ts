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
  options?: QueryOptions,
): Promise<QueryResult> {
  // Add user message to history
  const userMessage: AgentMessage = {
    type: 'user',
    content: userInput,
  }
  state.messages.push(userMessage)

  // Merge config with options
  const config = { ...state.config, ...options }

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

    const toolResultMessage: AgentMessage = {
      type: 'tool_result',
      toolUseId,
      content: result.type === 'text' ? result.text : JSON.stringify(result),
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
