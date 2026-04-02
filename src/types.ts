/**
 * Type definitions for Claude Code Agent/Skill
 */

import type { CallToolResult, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

// ============================================================================
// Agent Messages
// ============================================================================

export type UserMessage = {
  type: 'user'
  content: string
}

export type AssistantMessage = {
  type: 'assistant'
  content: string
}

export type ToolResultMessage = {
  type: 'tool_result'
  toolUseId: string
  content: string
  isError?: boolean
}

export type AgentMessage = UserMessage | AssistantMessage | ToolResultMessage

// ============================================================================
// Tool Definition
// ============================================================================

export type ToolSchema = z.ZodRawShape
export type InferSchema<T extends ToolSchema> = z.infer<z.ZodObject<T>>

export type ToolDefinition<Schema extends ToolSchema = ToolSchema> = {
  name: string
  description: string
  inputSchema: z.ZodObject<Schema>
  handler: (args: InferSchema<Schema>) => Promise<CallToolResult>
  annotations?: ToolAnnotations
}

export type AnyToolDefinition = ToolDefinition<any>

export type ToolRegistry = Map<string, AnyToolDefinition>

// ============================================================================
// Agent Configuration
// ============================================================================

export type AgentConfig = {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  tools?: AnyToolDefinition[]
}

// ============================================================================
// Agent State
// ============================================================================

export type AgentState = {
  messages: AgentMessage[]
  config: AgentConfig
  toolRegistry: ToolRegistry
}

// ============================================================================
// Query Options
// ============================================================================

export type QueryOptions = {
  systemPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
  tools?: ToolDefinition[]
}

// ============================================================================
// Results
// ============================================================================

export type QueryResult = {
  response: string
  messages: AgentMessage[]
  toolCalls?: Array<{
    id: string
    name: string
    args: Record<string, unknown>
  }>
}
