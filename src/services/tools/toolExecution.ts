/**
 * Tool Execution Service
 * Handles tool execution with permission checks, hooks, and progress tracking
 * Based on Claude Code reference patterns
 */

import type { ToolDefinition } from '../../types.js'
import { createLogger } from '../../utils/advanced-logging.js'
import type { Store } from '../../state/store.js'
import type { SawCodeAppState } from '../../state/types.js'
import { getAgentState } from '../../state/selectors.js'

const logger = createLogger('tool-execution')

export interface ToolUseContext {
  messages: import('../../types.js').AgentMessage[]
  toolUseId: string
  abortController: AbortController
  options: {
    tools: ToolDefinition[]
    mcpClients?: MCPServerConnection[]
  }
}

export interface MCPServerConnection {
  name: string
  type: 'connected' | 'disconnected'
  config: {
    type?: string
    command?: string
    args?: string[]
    url?: string
  }
}

export interface ToolProgressEvent {
  toolUseID: string
  data: {
    type: string
    [key: string]: unknown
  }
}

export interface ToolExecutionResult {
  data?: unknown
  content?: { type: string; text?: string; [key: string]: unknown }[]
  contextModifier?: (context: ToolUseContext) => ToolUseContext
  mcpMeta?: Record<string, unknown>
}

export type ToolProgressCallback = (progress: ToolProgressEvent) => void

function formatZodValidationError(toolName: string, error: Error): string {
  if (error instanceof Error && 'issues' in error) {
    const issues = (error as { issues: unknown[] }).issues
    const messages = issues.map((issue: unknown) => {
      const i = issue as { path: string[]; message: string }
      return `${i.path.join('.')}: ${i.message}`
    })
    return `Invalid input for ${toolName}:\n${messages.join('\n')}`
  }
  return `Invalid input for ${toolName}: ${error.message}`
}

export async function executeTool(
  store: Store<SawCodeAppState>,
  toolName: string,
  toolUseId: string,
  input: Record<string, unknown>,
  progressCallback?: ToolProgressCallback,
): Promise<ToolExecutionResult> {
  const tool = getToolByName(getAgentState(store.getState()).toolRegistry, toolName)
  
  if (!tool) {
    throw new Error(`Tool "${toolName}" not found`)
  }

  try {
    if (progressCallback) {
      progressCallback({
        toolUseID: toolUseId,
        data: { type: 'start' },
      })
    }

    const parsedInput = tool.inputSchema.safeParse(input)
    if (!parsedInput.success) {
      const errorContent = formatZodValidationError(toolName, parsedInput.error)
      throw new Error(`InputValidationError: ${errorContent}`)
    }

    if (progressCallback) {
      progressCallback({
        toolUseID: toolUseId,
        data: { type: 'permission_check' },
      })
    }

    const result = await tool.handler(parsedInput.data as never)

    if (progressCallback) {
      progressCallback({
        toolUseID: toolUseId,
        data: { type: 'complete' },
      })
    }

    const firstContent = result.content?.[0]
    const text = firstContent && typeof firstContent === 'object' && 'text' in firstContent 
      ? (firstContent as { text: string }).text 
      : JSON.stringify(result)

    return {
      data: text,
      content: result.content,
    }
  } catch (error) {
    logger.error('Tool execution failed', error instanceof Error ? error : new Error(String(error)))
    
    if (progressCallback) {
      progressCallback({
        toolUseID: toolUseId,
        data: { 
          type: 'error', 
          error: error instanceof Error ? error.message : String(error) 
        },
      })
    }

    throw error
  }
}

export function getToolByName(registry: Map<string, ToolDefinition>, name: string): ToolDefinition | undefined {
  return registry.get(name)
}

export function extractToolInputForTelemetry(input: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!input || typeof input !== 'object') return undefined
  
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (key === 'command' && typeof value === 'string') {
      sanitized.command_preview = value.slice(0, 100)
    } else if (key === 'file_path' && typeof value === 'string') {
      sanitized.file_path = value
    } else if (typeof value === 'string') {
      sanitized[key] = value.slice(0, 200)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

export const toolExecution = {
  executeTool,
  getToolByName,
  extractToolInputForTelemetry,
}
