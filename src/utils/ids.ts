/**
 * ID utilities for deterministic agent/session/request IDs
 * Copied from Claude Code reference
 * https://github.com/anthropics/claude-code/blob/main/src/utils/agentId.ts
 */

/**
 * Formats an agent ID in the format `agentName@teamName`
 * @example
 * formatAgentId('assistant', 'my-project') => 'assistant@my-project'
 */
export function formatAgentId(agentName: string, teamName: string): string {
  return `${agentName}@${teamName}`
}

/**
 * Parses an agent ID into its components
 * @returns null if the ID doesn't contain the @ separator
 * @example
 * parseAgentId('assistant@my-project') => { agentName: 'assistant', teamName: 'my-project' }
 */
export function parseAgentId(
  agentId: string,
): { agentName: string; teamName: string } | null {
  const atIndex = agentId.indexOf('@')
  if (atIndex === -1) {
    return null
  }
  return {
    agentName: agentId.slice(0, atIndex),
    teamName: agentId.slice(atIndex + 1),
  }
}

/**
 * Formats a request ID in the format `{requestType}-{timestamp}@{agentId}`
 * @example
 * generateRequestId('shutdown', 'assistant@my-project')
 * => 'shutdown-1702500000000@assistant@my-project'
 */
export function generateRequestId(
  requestType: string,
  agentId: string,
): string {
  const timestamp = Date.now()
  return `${requestType}-${timestamp}@${agentId}`
}

/**
 * Parses a request ID into its components
 * @returns null if the request ID doesn't match the expected format
 * @example
 * parseRequestId('shutdown-1702500000000@assistant@my-project')
 * => { requestType: 'shutdown', timestamp: 1702500000000, agentId: 'assistant@my-project' }
 */
export function parseRequestId(
  requestId: string,
): { requestType: string; timestamp: number; agentId: string } | null {
  const atIndex = requestId.indexOf('@')
  if (atIndex === -1) {
    return null
  }

  const prefix = requestId.slice(0, atIndex)
  const agentId = requestId.slice(atIndex + 1)

  const lastDashIndex = prefix.lastIndexOf('-')
  if (lastDashIndex === -1) {
    return null
  }

  const requestType = prefix.slice(0, lastDashIndex)
  const timestampStr = prefix.slice(lastDashIndex + 1)
  const timestamp = Number.parseInt(timestampStr, 10)

  if (Number.isNaN(timestamp)) {
    return null
  }

  return { requestType, timestamp, agentId }
}

/**
 * Session ID type - unique identifier for a session
 */
export type SessionId = string & { readonly __brand: 'SessionId' }

/**
 * Create a branded SessionId type
 */
export function asSessionId(id: string): SessionId {
  return id as SessionId
}

/**
 * Agent ID type - unique identifier for an agent
 */
export type AgentId = string & { readonly __brand: 'AgentId' }

/**
 * Create a branded AgentId type
 */
export function asAgentId(id: string): AgentId {
  return id as AgentId
}

/**
 * Generate a random session ID
 */
export function generateSessionId(): SessionId {
  return asSessionId(
    `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )
}

/**
 * Generate a random agent ID
 */
export function generateAgentId(): AgentId {
  return asAgentId(
    `agent-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )
}
