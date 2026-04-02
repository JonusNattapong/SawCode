/**
 * Logger utility for SawCode Agent
 *
 * Provides structured logging with different levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  context: string
  message: string
  data?: unknown
}

export class Logger {
  private context: string
  private minLevel: LogLevel = 'info'
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  constructor(context: string) {
    this.context = context

    // Set min level from environment
    const debugEnv = process.env.DEBUG || ''
    if (debugEnv.includes(context) || debugEnv === '*' || debugEnv.includes('*')) {
      this.minLevel = 'debug'
    }

    if (process.env.VERBOSE === 'true') {
      this.minLevel = 'debug'
    }
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    // Skip if level is below minimum
    if (this.levels[level] < this.levels[this.minLevel]) {
      return
    }

    const timestamp = new Date().toISOString()
    const emoji = this.getEmoji(level)
    const prefix = `[${timestamp}] ${emoji} [${this.context}]`

    if (data) {
      console.log(`${prefix} ${message}`)
      if (typeof data === 'object') {
        console.log(JSON.stringify(data, null, 2))
      } else {
        console.log(data)
      }
    } else {
      console.log(`${prefix} ${message}`)
    }
  }

  private getEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }
    return emojis[level]
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data)
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data)
  }

  /**
   * Log an error with stack trace
   */
  exception(error: Error, context?: string): void {
    const message = context ? `${context}: ${error.message}` : error.message
    this.error(message)
    if (this.minLevel === 'debug' && error.stack) {
      console.log(error.stack)
    }
  }
}

/**
 * Create a logger for a given context
 */
export function createLogger(context: string): Logger {
  return new Logger(context)
}

/**
 * Global logger instance
 */
export const logger = createLogger('sawcode')
