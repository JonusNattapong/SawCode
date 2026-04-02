/**
 * Advanced error classes following Claude Code patterns
 */

import { APIUserAbortError } from '@anthropic-ai/sdk'

export class ClaudeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class AbortError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'AbortError'
  }
}

export class ConfigParseError extends Error {
  constructor(
    message: string,
    public filePath: string,
    public defaultConfig: unknown,
  ) {
    super(message)
    this.name = 'ConfigParseError'
  }
}

export class ShellError extends Error {
  constructor(
    public stdout: string,
    public stderr: string,
    public code: number,
    public interrupted: boolean,
  ) {
    super('Shell command failed')
    this.name = 'ShellError'
  }
}

export class ToolError extends Error {
  constructor(
    public toolName: string,
    message: string,
    public context?: Record<string, unknown>,
  ) {
    super(`Tool '${toolName}' error: ${message}`)
    this.name = 'ToolError'
  }
}

/**
 * Check if error is abort-shaped
 */
export function isAbortError(e: unknown): boolean {
  return (
    e instanceof AbortError ||
    e instanceof APIUserAbortError ||
    (e instanceof Error && e.name === 'AbortError')
  )
}

/**
 * Convert unknown error to standard Error
 */
export function toError(e: unknown): Error {
  if (e instanceof Error) return e
  return new Error(String(e))
}

/**
 * Extract error message safely
 */
export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  return String(e)
}
