/**
 * Environment variable utilities
 *
 * Load and validate environment configuration from .env file
 * Adapted from Claude Code reference: https://github.com/anthropics/claude-code/blob/main/src/utils/envUtils.ts
 */

/**
 * Check if an environment variable is "truthy"
 * Handles strings like '1', 'true', 'yes', 'on' (case-insensitive)
 * Also handles booleans directly
 * @example
 * isEnvTruthy(process.env.ENABLE_FEATURE) => true
 * isEnvTruthy('1') => true
 * isEnvTruthy('false') => false
 * isEnvTruthy(undefined) => false
 */
export function isEnvTruthy(envVar: string | boolean | undefined): boolean {
  if (!envVar) return false
  if (typeof envVar === 'boolean') return envVar
  const normalizedValue = envVar.toLowerCase().trim()
  return ['1', 'true', 'yes', 'on'].includes(normalizedValue)
}

/**
 * Check if an environment variable is explicitly set to a "falsy" value
 * Checks for '0', 'false', 'no', 'off' (case-insensitive)
 * Returns false if undefined
 * @example
 * isEnvDefinedFalsy(process.env.FEATURE) => true (if set to 'false')
 * isEnvDefinedFalsy(undefined) => false
 */
export function isEnvDefinedFalsy(
  envVar: string | boolean | undefined,
): boolean {
  if (envVar === undefined) return false
  if (typeof envVar === 'boolean') return !envVar
  if (!envVar) return false
  const normalizedValue = envVar.toLowerCase().trim()
  return ['0', 'false', 'no', 'off'].includes(normalizedValue)
}

/**
 * Check if running in bare mode
 * Bare mode skips hooks, LSP, plugins, and credential reads
 * Can be enabled via CLAUDE_CODE_SIMPLE=1 env var or --bare CLI flag
 * @example
 * isBareMode() => true (if --bare was passed or CLAUDE_CODE_SIMPLE is set)
 */
export function isBareMode(): boolean {
  return (
    isEnvTruthy(process.env.CLAUDE_CODE_SIMPLE) ||
    process.argv.includes('--bare')
  )
}

/**
 * Parses an array of environment variable strings into a key-value object
 * @param envVars Array of strings in KEY=VALUE format
 * @returns Object with key-value pairs
 * @throws Error if format is invalid
 * @example
 * parseEnvVars(['-e', 'KEY1=value1', '-e', 'KEY2=value2'])
 */
export function parseEnvVars(
  rawEnvArgs: string[] | undefined,
): Record<string, string> {
  const parsedEnv: Record<string, string> = {}

  if (rawEnvArgs) {
    for (const envStr of rawEnvArgs) {
      const [key, ...valueParts] = envStr.split('=')
      if (!key || valueParts.length === 0) {
        throw new Error(
          `Invalid environment variable format: ${envStr}, environment variables should be added as: -e KEY1=value1 -e KEY2=value2`,
        )
      }
      parsedEnv[key] = valueParts.join('=')
    }
  }
  return parsedEnv
}

/**
 * Get the AWS region with fallback to default
 * Matches the Anthropic Bedrock SDK's region behavior
 */
export function getAWSRegion(): string {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
}

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
function getEnv(key: string): string | undefined
function getEnv(key: string, defaultValue: string): string
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
  return isEnvTruthy(value)
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

/**
 * Load .env file
 * Note: Bun automatically loads .env files, so this is mainly for other runtimes
 */
export function loadEnv(): void {
  // Bun automatically loads .env files on startup
  // This function is a no-op in Bun but kept for compatibility
  // For Node.js, you would need to call: await import('dotenv/config')
}
