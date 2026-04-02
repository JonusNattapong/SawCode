/**
 * Compact Service
 *
 * Context compaction and token budget management.
 * Based on Claude Code's services/compact/ architecture.
 *
 * Features:
 * - Token budget tracking per model
 * - Autocompact when approaching limits
 * - Microcompact for small reductions
 * - Message history summarization
 */

import type { AgentMessage } from '../../types.js'
import { roughTokenCountEstimation, roughTokenCountEstimationForMessages } from '../tokenEstimation.js'
import { createLogger } from '../../utils/advanced-logging.js'

const logger = createLogger('compact')

// ─── Model Context Limits ──────────────────────────────────────────

export type ModelLimits = {
  contextWindow: number
  maxOutputTokens: number
  reserveForOutput: number
  compactThreshold: number  // Percentage (0-1) of contextWindow to trigger compaction
}

const MODEL_LIMITS: Record<string, ModelLimits> = {
  'claude-sonnet-4-20250514': {
    contextWindow: 200_000,
    maxOutputTokens: 16_384,
    reserveForOutput: 16_384,
    compactThreshold: 0.75,
  },
  'claude-opus-4-20250514': {
    contextWindow: 200_000,
    maxOutputTokens: 32_768,
    reserveForOutput: 32_768,
    compactThreshold: 0.70,
  },
  'claude-haiku-4-20250514': {
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    reserveForOutput: 8_192,
    compactThreshold: 0.80,
  },
  'default': {
    contextWindow: 200_000,
    maxOutputTokens: 16_384,
    reserveForOutput: 16_384,
    compactThreshold: 0.75,
  },
}

// ─── Token Budget ──────────────────────────────────────────────────

export type TokenBudget = {
  totalUsed: number
  inputTokens: number
  outputTokens: number
  remaining: number
  contextWindow: number
  percentUsed: number
  shouldCompact: boolean
  shouldMicrocompact: boolean
}

export function calculateTokenBudget(
  messages: AgentMessage[],
  model: string = 'default',
): TokenBudget {
  const limits = MODEL_LIMITS[model] ?? MODEL_LIMITS.default
  const used = roughTokenCountEstimationForMessages(
    messages.map(m => ({
      type: m.type,
      content: m.content,
      blocks: m.type === 'assistant_with_tools' ? (m as { blocks?: unknown[] }).blocks : undefined,
    })),
  )

  const available = limits.contextWindow - limits.reserveForOutput
  const remaining = Math.max(0, available - used)
  const percentUsed = used / limits.contextWindow

  return {
    totalUsed: used,
    inputTokens: used,
    outputTokens: 0,
    remaining,
    contextWindow: limits.contextWindow,
    percentUsed,
    shouldCompact: percentUsed >= limits.compactThreshold,
    shouldMicrocompact: percentUsed >= limits.compactThreshold * 0.9,
  }
}

export function getModelLimits(model: string): ModelLimits {
  return MODEL_LIMITS[model] ?? MODEL_LIMITS.default
}

// ─── Compaction Strategies ─────────────────────────────────────────

export type CompactResult = {
  messages: AgentMessage[]
  removedCount: number
  savedTokens: number
  strategy: 'none' | 'microcompact' | 'autocompact' | 'summary'
}

/**
 * Microcompact: Remove oldest tool_result messages (keep recent 50%).
 * Fast, no summarization needed.
 */
export function microcompact(messages: AgentMessage[]): CompactResult {
  const toolResults = messages.filter(m => m.type === 'tool_result')

  if (toolResults.length <= 2) {
    return { messages, removedCount: 0, savedTokens: 0, strategy: 'none' }
  }

  // Keep the last 50% of tool results
  const keepCount = Math.max(1, Math.floor(toolResults.length * 0.5))
  const keptToolResults = toolResults.slice(-keepCount)
  const removed = toolResults.length - keptToolResults.length

  // Reconstruct in original order
  const result: AgentMessage[] = []
  let toolIdx = 0
  for (const msg of messages) {
    if (msg.type === 'tool_result') {
      if (toolIdx < toolResults.length - removed) {
        toolIdx++
        continue // Skip old tool results
      }
      result.push(msg)
      toolIdx++
    } else {
      result.push(msg)
    }
  }

  const savedTokens = roughTokenCountEstimationForMessages(
    messages.filter(m => m.type === 'tool_result').slice(0, removed).map(m => ({
      type: m.type,
      content: m.content,
    })),
  )

  logger.info('Microcompact applied', { removed, savedTokens })
  return { messages: result, removedCount: removed, savedTokens, strategy: 'microcompact' }
}

/**
 * Autocompact: Keep system messages + first user message + last N messages.
 * More aggressive than microcompact.
 */
export function autocompact(
  messages: AgentMessage[],
  keepLast: number = 20,
): CompactResult {
  if (messages.length <= keepLast) {
    return { messages, removedCount: 0, savedTokens: 0, strategy: 'none' }
  }

  const firstUserIdx = messages.findIndex(m => m.type === 'user')
  const head = firstUserIdx >= 0 ? [messages[firstUserIdx]!] : []
  const tail = messages.slice(-keepLast)

  // Merge head + tail, avoiding duplicates
  const result: AgentMessage[] = [...head]
  for (const msg of tail) {
    if (!result.includes(msg)) {
      result.push(msg)
    }
  }

  const removed = messages.length - result.length
  const savedTokens = roughTokenCountEstimationForMessages(
    messages.slice(0, removed).map(m => ({
      type: m.type,
      content: m.content,
    })),
  )

  logger.info('Autocompact applied', { original: messages.length, compacted: result.length, removed, savedTokens })
  return { messages: result, removedCount: removed, savedTokens, strategy: 'autocompact' }
}

/**
 * Smart compact: Choose strategy based on token budget.
 */
export function smartCompact(
  messages: AgentMessage[],
  model: string = 'default',
): CompactResult {
  const budget = calculateTokenBudget(messages, model)

  if (!budget.shouldMicrocompact && !budget.shouldCompact) {
    return { messages, removedCount: 0, savedTokens: 0, strategy: 'none' }
  }

  if (budget.shouldMicrocompact && !budget.shouldCompact) {
    return microcompact(messages)
  }

  // Full autocompact
  const limits = getModelLimits(model)
  const targetTokens = limits.contextWindow * 0.5 // Target 50% usage after compact
  const keepLast = estimateKeepCount(messages, targetTokens)

  return autocompact(messages, keepLast)
}

/**
 * Estimate how many recent messages to keep to fit within target token budget.
 */
function estimateKeepCount(messages: AgentMessage[], targetTokens: number): number {
  let tokens = 0
  let count = 0

  for (let i = messages.length - 1; i >= 0; i--) {
    const msgTokens = roughTokenCountEstimation(messages[i]!.content)
    if (tokens + msgTokens > targetTokens) break
    tokens += msgTokens
    count++
  }

  return Math.max(5, count) // Always keep at least 5 messages
}

// ─── Export ────────────────────────────────────────────────────────

export { MODEL_LIMITS }
