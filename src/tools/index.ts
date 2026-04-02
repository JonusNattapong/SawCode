/**
 * Tool Registry and Builder
 */

import { z } from 'zod'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { ToolDefinition, ToolRegistry, ToolSchema } from '../types.js'

/**
 * Create a tool definition with type-safe schema
 */
export function createTool<Schema extends ToolSchema>(
  name: string,
  description: string,
  inputSchema: z.ZodObject<Schema>,
  handler: (args: z.infer<z.ZodObject<Schema>>) => Promise<CallToolResult>,
): ToolDefinition<Schema> {
  return {
    name,
    description,
    inputSchema,
    handler,
  }
}

/**
 * Create a tool registry from definitions
 */
export function createRegistry(tools: ToolDefinition[]): ToolRegistry {
  const registry = new Map<string, ToolDefinition>()
  for (const tool of tools) {
    registry.set(tool.name, tool)
  }
  return registry
}

/**
 * Get tool by name from registry
 */
export function getTool(registry: ToolRegistry, name: string): ToolDefinition | undefined {
  return registry.get(name)
}

/**
 * List all tools in registry
 */
export function listTools(registry: ToolRegistry): ToolDefinition[] {
  return Array.from(registry.values())
}

// Export built-in tools
export * from './bash.js'
export * from './webfetch.js'
