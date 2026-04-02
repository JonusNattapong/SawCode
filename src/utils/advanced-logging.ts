/**
 * Structured logging system following Claude Code patterns
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel
  timestamp: string
  component: string
  message: string
  context?: Record<string, unknown>
}

/**
 * Advanced logger with structured context
 */
export class Logger {
  constructor(private component: string) {}

  private shouldLog(level: LogLevel): boolean {
    const debugMode = process.env.DEBUG ? true : false
    if (level === LogLevel.DEBUG && !debugMode) return false
    if (level === LogLevel.ERROR || level === LogLevel.WARN) return true
    return process.env.VERBOSE === 'true'
  }

  private formatEntry(entry: LogEntry): string {
    const { level, timestamp, component, message, context } = entry
    let output = `[${timestamp}] [${level.toUpperCase()}] ${component}: ${message}`
    if (context && Object.keys(context).length > 0) {
      output += ` ${JSON.stringify(context)}`
    }
    return output
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry: LogEntry = {
        level: LogLevel.DEBUG,
        timestamp: new Date().toISOString(),
        component: this.component,
        message,
        context,
      }
      console.debug(this.formatEntry(entry))
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry: LogEntry = {
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        component: this.component,
        message,
        context,
      }
      console.log(this.formatEntry(entry))
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry: LogEntry = {
        level: LogLevel.WARN,
        timestamp: new Date().toISOString(),
        component: this.component,
        message,
        context,
      }
      console.warn(this.formatEntry(entry))
    }
  }

  error(message: string, context?: Record<string, unknown> | Error): void {
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      timestamp: new Date().toISOString(),
      component: this.component,
      message,
      context:
        context instanceof Error
          ? { error: context.message, stack: context.stack }
          : context,
    }
    console.error(this.formatEntry(entry))
  }
}

/**
 * Create logger for a component
 */
export function createLogger(component: string): Logger {
  return new Logger(component)
}
