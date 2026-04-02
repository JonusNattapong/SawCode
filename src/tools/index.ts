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
    handler: handler as (args: Record<string, unknown>) => Promise<CallToolResult>,
  } as ToolDefinition<Schema>
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

// Export all tools
export * from './bash.js'
export * from './webfetch.js'
export * from './fileread.js'
export * from './filewrite.js'
export * from './listdir.js'
export * from './grep.js'
export * from './find.js'
export * from './tree.js'
// Phase 9: Git & GitHub Tools
export * from './git.js'
export * from './github.js'
// Phase 10: Context Extraction
export * from './contextExtractor.js'
export * from './codeAnalyzer.js'
export * from './gitHistoryAnalyzer.js'
// Phase 11: Code Review
export * from './codeReviewer.js'
export * from './suggestionEngine.js'
export * from './complianceChecker.js'
// Phase 12: Voice & Audio
export * from './speechToText.js'
export * from './textToSpeech.js'
export * from './audioProcessor.js'
// Phase 18: AI-Powered Features
export * from './semantic-search.js'
export * from './diagnostic-engine.js'
export * from './optimization-suggester.js'
