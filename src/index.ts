/**
 * Claude Code Agent/Skill - Main Entry Point
 *
 * This is a Bun + TypeScript based agent that can be used as a Claude Code skill.
 * It provides a simple interface for creating agents with custom tools.
 *
 * Usage:
 * ```ts
 * import { Agent } from '@sawcode/agent'
 *
 * const agent = new Agent({
 *   model: 'claude-opus-4-6',
 *   tools: [bashTool, webfetchTool],
 * })
 *
 * const result = await agent.query('What is 2 + 2?')
 * ```
 */

import type { AgentConfig, AgentMessage, AgentState, QueryOptions, QueryResult, ToolDefinition } from './types.js'
import { createRegistry } from './tools/index.js'
import { handleQuery, handleToolResult } from './handlers/query.js'

export * from './types.js'
export { createTool, createRegistry, getTool, listTools } from './tools/index.js'
export { bashTool, bashSchema } from './tools/bash.js'
export { webfetchTool, webfetchSchema } from './tools/webfetch.js'

/**
 * Main Agent class
 */
export class Agent {
  private state: AgentState

  constructor(config: AgentConfig = {}) {
    const tools = config.tools || []

    this.state = {
      messages: [],
      config: {
        model: config.model || 'claude-opus-4-6',
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 2048,
        systemPrompt: config.systemPrompt,
      },
      toolRegistry: createRegistry(tools),
    }
  }

  /**
   * Get current message history
   */
  getMessages(): AgentMessage[] {
    return this.state.messages
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.state.messages = []
  }

  /**
   * Add a tool to the agent
   */
  addTool(tool: ToolDefinition): void {
    this.state.toolRegistry.set(tool.name, tool)
  }

  /**
   * Get configuration
   */
  getConfig(): AgentConfig {
    return this.state.config
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.state.config = { ...this.state.config, ...config }
  }

  /**
   * Query the agent with a message
   */
  async query(message: string, options?: QueryOptions): Promise<QueryResult> {
    return handleQuery(this.state, message, options)
  }

  /**
   * Process a tool result
   */
  async processToolResult(
    toolUseId: string,
    toolName: string,
    toolArgs: Record<string, unknown>,
  ): Promise<QueryResult> {
    return handleToolResult(this.state, toolUseId, toolName, toolArgs)
  }

  /**
   * Export state for persistence
   */
  exportState(): AgentState {
    return structuredClone(this.state)
  }

  /**
   * Import state for resuming
   */
  importState(state: AgentState): void {
    this.state = structuredClone(state)
  }
}

/**
 * Create a new agent instance
 */
export function createAgent(config?: AgentConfig): Agent {
  return new Agent(config)
}

// Export version
export const version = '0.1.0'
