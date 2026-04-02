/**
 * Error classes - adapted from Claude Code reference
 * https://github.com/anthropics/claude-code/blob/main/src/utils/errors.ts
 */

/**
 * Base error class for Claude-related errors
 */
export class ClaudeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * Error thrown when a command is malformed
 */
export class MalformedCommandError extends ClaudeError {}

/**
 * Error thrown when an operation is aborted
 */
export class AbortError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'AbortError'
  }
}

/**
 * Checks if an error is an abort-shaped error
 * Handles instanceof checks and string matching for minified code
 */
export function isAbortError(e: unknown): boolean {
  return (
    e instanceof AbortError ||
    (e instanceof Error && e.name === 'AbortError')
  )
}

/**
 * Error thrown when config file parsing fails
 */
export class ConfigParseError extends ClaudeError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly defaultConfig: unknown,
  ) {
    super(message)
    this.name = 'ConfigParseError'
  }
}

/**
 * Error thrown when a shell command fails
 */
export class ShellError extends ClaudeError {
  constructor(
    public readonly stdout: string,
    public readonly stderr: string,
    public readonly code: number,
    public readonly interrupted: boolean,
  ) {
    super('Shell command failed')
    this.name = 'ShellError'
  }
}

/**
 * Error class for telemetry-safe errors
 * Messages must be verified to not contain sensitive data
 */
export class TelemetrySafeError extends ClaudeError {
  readonly telemetryMessage: string

  constructor(message: string, telemetryMessage?: string) {
    super(message)
    this.name = 'TelemetrySafeError'
    this.telemetryMessage = telemetryMessage ?? message
  }
}

/**
 * Check if an error has an exact message
 */
export function hasExactErrorMessage(error: unknown, message: string): boolean {
  return error instanceof Error && error.message === message
}

/**
 * Normalize an unknown value into an Error
 */
export function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

/**
 * Extract a message from an unknown error value
 */
export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
