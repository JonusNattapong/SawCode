/**
 * Analytics Service
 *
 * Usage tracking, feature flags (GrowthBook-style), and session metrics.
 * Based on Claude Code's services/analytics/ architecture.
 *
 * Features:
 * - Session-level event tracking
 * - Feature flag evaluation with caching
 * - Usage statistics aggregation
 * - Cost tracking per model
 */

import { createLogger } from '../../utils/advanced-logging.js'

const logger = createLogger('analytics')

// ─── Types ─────────────────────────────────────────────────────────

export type AnalyticsEvent = {
  type: 'query' | 'tool_use' | 'error' | 'session_start' | 'session_end'
  timestamp: number
  data: Record<string, unknown>
}

export type SessionMetrics = {
  sessionId: string
  startTime: number
  endTime?: number
  queryCount: number
  toolUseCount: number
  errorCount: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCostUsd: number
  modelsUsed: Set<string>
  toolsUsed: Set<string>
}

export type FeatureFlagDefinition = {
  key: string
  defaultValue: boolean
  description?: string
  conditions?: Array<{
    attribute: string
    operator: 'eq' | 'ne' | 'in' | 'not_in' | 'gt' | 'lt'
    value: unknown
  }>
}

export type ModelCostConfig = {
  inputPerMillion: number   // USD per 1M input tokens
  outputPerMillion: number  // USD per 1M output tokens
}

// ─── Model Costs ───────────────────────────────────────────────────

const MODEL_COSTS: Record<string, ModelCostConfig> = {
  'claude-sonnet-4-20250514': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-opus-4-20250514': { inputPerMillion: 15.0, outputPerMillion: 75.0 },
  'claude-haiku-4-20250514': { inputPerMillion: 0.25, outputPerMillion: 1.25 },
  'claude-sonnet-4.5-20250929': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'default': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
}

// ─── Analytics Store ───────────────────────────────────────────────

class AnalyticsStore {
  private events: AnalyticsEvent[] = []
  private sessionMetrics: Map<string, SessionMetrics> = new Map()
  private featureFlags: Map<string, FeatureFlagDefinition> = new Map()
  private flagCache: Map<string, boolean> = new Map()

  // ─── Session Management ──────────────────────────────────────────

  startSession(sessionId: string): void {
    const metrics: SessionMetrics = {
      sessionId,
      startTime: Date.now(),
      queryCount: 0,
      toolUseCount: 0,
      errorCount: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCostUsd: 0,
      modelsUsed: new Set(),
      toolsUsed: new Set(),
    }
    this.sessionMetrics.set(sessionId, metrics)
    this.trackEvent('session_start', { sessionId })
    logger.info('Session started', { sessionId })
  }

  endSession(sessionId: string): void {
    const metrics = this.sessionMetrics.get(sessionId)
    if (metrics) {
      metrics.endTime = Date.now()
      this.trackEvent('session_end', { sessionId, duration: metrics.endTime - metrics.startTime })
      logger.info('Session ended', {
        sessionId,
        duration: metrics.endTime - metrics.startTime,
        queries: metrics.queryCount,
        tools: metrics.toolUseCount,
      })
    }
  }

  getSessionMetrics(sessionId: string): SessionMetrics | undefined {
    return this.sessionMetrics.get(sessionId)
  }

  // ─── Event Tracking ──────────────────────────────────────────────

  trackEvent(type: AnalyticsEvent['type'], data: Record<string, unknown> = {}): void {
    this.events.push({ type, timestamp: Date.now(), data })
  }

  trackQuery(sessionId: string, model: string, inputTokens: number, outputTokens: number): void {
    const metrics = this.sessionMetrics.get(sessionId)
    if (!metrics) return

    metrics.queryCount++
    metrics.totalInputTokens += inputTokens
    metrics.totalOutputTokens += outputTokens
    metrics.modelsUsed.add(model)

    const costConfig = MODEL_COSTS[model] ?? MODEL_COSTS.default
    const cost = (inputTokens / 1_000_000) * costConfig.inputPerMillion +
                 (outputTokens / 1_000_000) * costConfig.outputPerMillion
    metrics.totalCostUsd += cost

    this.trackEvent('query', { sessionId, model, inputTokens, outputTokens, cost })
  }

  trackToolUse(sessionId: string, toolName: string): void {
    const metrics = this.sessionMetrics.get(sessionId)
    if (!metrics) return

    metrics.toolUseCount++
    metrics.toolsUsed.add(toolName)
    this.trackEvent('tool_use', { sessionId, toolName })
  }

  trackError(sessionId: string, error: string, context?: Record<string, unknown>): void {
    const metrics = this.sessionMetrics.get(sessionId)
    if (metrics) metrics.errorCount++

    this.trackEvent('error', { sessionId, error, ...context })
    logger.error('Analytics error tracked', new Error(error))
  }

  // ─── Feature Flags ───────────────────────────────────────────────

  registerFlag(flag: FeatureFlagDefinition): void {
    this.featureFlags.set(flag.key, flag)
    this.flagCache.delete(flag.key)
  }

  registerFlags(flags: FeatureFlagDefinition[]): void {
    for (const flag of flags) {
      this.registerFlag(flag)
    }
  }

  evaluateFlag(key: string, attributes?: Record<string, unknown>): boolean {
    // Check cache first
    const cacheKey = `${key}:${JSON.stringify(attributes ?? {})}`
    const cached = this.flagCache.get(cacheKey)
    if (cached !== undefined) return cached

    const flag = this.featureFlags.get(key)
    if (!flag) {
      logger.warn(`Feature flag not found: ${key}`)
      return false
    }

    // No conditions = return default
    if (!flag.conditions || flag.conditions.length === 0) {
      this.flagCache.set(cacheKey, flag.defaultValue)
      return flag.defaultValue
    }

    // Evaluate conditions (all must match for enable)
    for (const condition of flag.conditions) {
      const attrValue = attributes?.[condition.attribute]
      const matches = evaluateCondition(attrValue, condition.operator, condition.value)
      if (!matches) {
        this.flagCache.set(cacheKey, false)
        return false
      }
    }

    this.flagCache.set(cacheKey, true)
    return true
  }

  getRegisteredFlags(): FeatureFlagDefinition[] {
    return [...this.featureFlags.values()]
  }

  clearFlagCache(): void {
    this.flagCache.clear()
  }

  // ─── Aggregation ─────────────────────────────────────────────────

  getEvents(type?: AnalyticsEvent['type']): AnalyticsEvent[] {
    if (!type) return [...this.events]
    return this.events.filter(e => e.type === type)
  }

  getAllSessionMetrics(): SessionMetrics[] {
    return [...this.sessionMetrics.values()]
  }

  getTotalStats(): {
    totalSessions: number
    totalQueries: number
    totalToolUses: number
    totalErrors: number
    totalCostUsd: number
  } {
    const sessions = [...this.sessionMetrics.values()]
    return {
      totalSessions: sessions.length,
      totalQueries: sessions.reduce((s, m) => s + m.queryCount, 0),
      totalToolUses: sessions.reduce((s, m) => s + m.toolUseCount, 0),
      totalErrors: sessions.reduce((s, m) => s + m.errorCount, 0),
      totalCostUsd: sessions.reduce((s, m) => s + m.totalCostUsd, 0),
    }
  }

  clearEvents(): void {
    this.events = []
  }
}

// ─── Condition Evaluation ──────────────────────────────────────────

function evaluateCondition(
  attrValue: unknown,
  operator: string,
  expectedValue: unknown,
): boolean {
  switch (operator) {
    case 'eq':
      return attrValue === expectedValue
    case 'ne':
      return attrValue !== expectedValue
    case 'in':
      return Array.isArray(expectedValue) && expectedValue.includes(attrValue)
    case 'not_in':
      return Array.isArray(expectedValue) && !expectedValue.includes(attrValue)
    case 'gt':
      return typeof attrValue === 'number' && typeof expectedValue === 'number' && attrValue > expectedValue
    case 'lt':
      return typeof attrValue === 'number' && typeof expectedValue === 'number' && attrValue < expectedValue
    default:
      return false
  }
}

// ─── Singleton ─────────────────────────────────────────────────────

let storeInstance: AnalyticsStore | null = null

export function getAnalyticsStore(): AnalyticsStore {
  if (!storeInstance) {
    storeInstance = new AnalyticsStore()
  }
  return storeInstance
}

// ─── Convenience Functions ─────────────────────────────────────────

export function trackQuery(sessionId: string, model: string, inputTokens: number, outputTokens: number): void {
  getAnalyticsStore().trackQuery(sessionId, model, inputTokens, outputTokens)
}

export function trackToolUse(sessionId: string, toolName: string): void {
  getAnalyticsStore().trackToolUse(sessionId, toolName)
}

export function trackError(sessionId: string, error: string, context?: Record<string, unknown>): void {
  getAnalyticsStore().trackError(sessionId, error, context)
}

export function isAnalyticsFeatureEnabled(flagKey: string, attributes?: Record<string, unknown>): boolean {
  return getAnalyticsStore().evaluateFlag(flagKey, attributes)
}

export function getSessionStats(sessionId: string): SessionMetrics | undefined {
  return getAnalyticsStore().getSessionMetrics(sessionId)
}

export function getTotalStats(): ReturnType<AnalyticsStore['getTotalStats']> {
  return getAnalyticsStore().getTotalStats()
}

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const config = MODEL_COSTS[model] ?? MODEL_COSTS.default
  return (inputTokens / 1_000_000) * config.inputPerMillion +
         (outputTokens / 1_000_000) * config.outputPerMillion
}

export { MODEL_COSTS }
