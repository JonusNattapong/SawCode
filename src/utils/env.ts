/**
 * Environment variable utilities
 *
 * Load and validate environment configuration from .env file
 */

/**
 * Environment configuration schema
 */
export interface EnvConfig {
  // Claude API
  anthropicApiKey?: string
  claudeModel: string

  // Agent Settings
  agentTemperature: number
  agentMaxTokens: number
  agentSystemPrompt?: string

  // TUI Settings
  tuiPrompt: string
  tuiShowWelcome: boolean
  tuiShowHelp: boolean
  tuiMaxHistory: number

  // Tool Settings
  enableBashTool: boolean
  enableWebfetchTool: boolean
  bashTimeout: number
  httpTimeout: number

  // Development
  nodeEnv: 'development' | 'production'
  debug: string
  verbose: boolean

  // Storage
  stateDir: string
  autoSaveInterval: number

  // Advanced
  kilocodeApiUrl?: string
  kilocodeApiKey?: string
  kilocodeToken?: string
}

/**
 * Get environment variable with type conversion
 */
function getEnv(key: string, defaultValue?: string): string | undefined {
  const value = process.env[key]
  return value !== undefined ? value : defaultValue
}

/**
 * Get boolean environment variable
 */
function getBoolEnv(key: string, defaultValue: boolean = false): boolean {
  const value = getEnv(key)
  if (value === undefined) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

/**
 * Get number environment variable
 */
function getNumEnv(key: string, defaultValue: number = 0): number {
  const value = getEnv(key)
  if (value === undefined) return defaultValue
  const num = Number.parseFloat(value)
  return Number.isNaN(num) ? defaultValue : num
}

/**
 * Load environment configuration
 */
export function loadEnvConfig(): EnvConfig {
  return {
    // Claude API
    anthropicApiKey: getEnv('ANTHROPIC_API_KEY'),
    claudeModel: getEnv('CLAUDE_MODEL', 'claude-opus-4-6'),

    // Agent Settings
    agentTemperature: getNumEnv('AGENT_TEMPERATURE', 0.7),
    agentMaxTokens: getNumEnv('AGENT_MAX_TOKENS', 2048),
    agentSystemPrompt: getEnv('AGENT_SYSTEM_PROMPT'),

    // TUI Settings
    tuiPrompt: getEnv('TUI_PROMPT', '> '),
    tuiShowWelcome: getBoolEnv('TUI_SHOW_WELCOME', true),
    tuiShowHelp: getBoolEnv('TUI_SHOW_HELP', true),
    tuiMaxHistory: getNumEnv('TUI_MAX_HISTORY', 100),

    // Tool Settings
    enableBashTool: getBoolEnv('ENABLE_BASH_TOOL', true),
    enableWebfetchTool: getBoolEnv('ENABLE_WEBFETCH_TOOL', true),
    bashTimeout: getNumEnv('BASH_TIMEOUT', 30000),
    httpTimeout: getNumEnv('HTTP_TIMEOUT', 5000),

    // Development
    nodeEnv: (getEnv('NODE_ENV', 'development') as 'development' | 'production'),
    debug: getEnv('DEBUG', ''),
    verbose: getBoolEnv('VERBOSE', false),

    // Storage
    stateDir: getEnv('STATE_DIR', './state'),
    autoSaveInterval: getNumEnv('AUTO_SAVE_INTERVAL', 0),

    // Advanced
    kilocodeApiUrl: getEnv('KILOCODE_API_URL'),
    kilocodeApiKey: getEnv('KILOCODE_API_KEY'),
    kilocodeToken: getEnv('KILOCODE_TOKEN'),
  }
}

/**
 * Validate required environment variables
 */
export function validateEnv(required: string[] = []): void {
  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(key => console.error(`   - ${key}`))
    console.error('\n📝 Copy .env.example to .env and fill in the values')
    process.exit(1)
  }
}

/**
 * Print environment configuration (with secrets masked)
 */
export function printEnvConfig(config: EnvConfig): void {
  console.log('⚙️  Environment Configuration:')
  console.log('─'.repeat(50))

  const entries: Array<[string, string]> = [
    ['Model', config.claudeModel],
    ['Temperature', config.agentTemperature.toString()],
    ['Max Tokens', config.agentMaxTokens.toString()],
    ['TUI Prompt', config.tuiPrompt],
    ['Environment', config.nodeEnv],
    ['Bash Tool', config.enableBashTool ? '✅' : '❌'],
    ['Webfetch Tool', config.enableWebfetchTool ? '✅' : '❌'],
    ['State Dir', config.stateDir],
    ['API Key', config.anthropicApiKey ? '***' : '❌ NOT SET'],
  ]

  for (const [key, value] of entries) {
    console.log(`  ${key.padEnd(20)} ${value}`)
  }

  console.log('─'.repeat(50))
}

// Auto-load on import if .env exists
export function loadEnv(): void {
  try {
    // Try to load .env file using dynamic import
    const fs = require('fs')
    if (fs.existsSync('.env')) {
      const dotenv = require('dotenv')
      dotenv.config()
    }
  } catch {
    // Silently fail if dotenv is not installed
    // Environment variables can still be set manually
  }
}
