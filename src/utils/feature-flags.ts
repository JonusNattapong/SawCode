/**
 * Feature flags system following Claude Code patterns
 * Allows conditional tool/feature enablement via environment variables
 */

export interface FeatureFlags {
  // Core features
  ADVANCED_ERRORS: boolean
  FEATURE_FLAGS: boolean
  STRUCTURED_LOGGING: boolean

  // Tools - Phase 1-2
  ENABLE_BASH_TOOL: boolean
  ENABLE_WEBFETCH_TOOL: boolean
  ENABLE_FILE_TOOLS: boolean

  // Tools - Phase 8
  ENABLE_GREP_TOOL: boolean
  ENABLE_FIND_TOOL: boolean
  ENABLE_TREE_TOOL: boolean

  // Tools - Phase 9
  ENABLE_GIT_STATUS_TOOL: boolean
  ENABLE_GIT_DIFF_TOOL: boolean
  ENABLE_PR_HELPER_TOOL: boolean
  ENABLE_BRANCH_HELPER_TOOL: boolean

  ENABLE_WEB_SEARCH_TOOL: boolean

  // Experimental
  ENABLE_STREAMING: boolean
  ENABLE_MULTI_TURN: boolean
  ENABLE_CACHING: boolean

  // Development
  DEBUG_MODE: boolean
  VERBOSE_LOGGING: boolean
}

/**
 * Get feature flag value
 */
function getFlag(name: keyof FeatureFlags): boolean {
  const envVar = process.env[`SAWCODE_${name}`] || process.env[name]
  if (envVar === undefined) return defaultFlags[name]
  return envVar === 'true' || envVar === '1' || envVar === 'yes'
}

/**
 * Default feature flag values
 */
const defaultFlags: FeatureFlags = {
  // Core features enabled by default
  ADVANCED_ERRORS: true,
  FEATURE_FLAGS: true,
  STRUCTURED_LOGGING: true,

  // All tools enabled by default
  ENABLE_BASH_TOOL: true,
  ENABLE_WEBFETCH_TOOL: true,
  ENABLE_FILE_TOOLS: true,
  ENABLE_GREP_TOOL: true,
  ENABLE_FIND_TOOL: true,
  ENABLE_TREE_TOOL: true,
  ENABLE_GIT_STATUS_TOOL: true,
  ENABLE_GIT_DIFF_TOOL: true,
  ENABLE_PR_HELPER_TOOL: true,
  ENABLE_BRANCH_HELPER_TOOL: true,
  ENABLE_WEB_SEARCH_TOOL: false, // Disabled by default

  // Experimental features disabled by default  
  ENABLE_STREAMING: false,
  ENABLE_MULTI_TURN: true,
  ENABLE_CACHING: false,

  // Development features
  DEBUG_MODE: process.env.DEBUG ? true : false,
  VERBOSE_LOGGING: process.env.VERBOSE === 'true',
}

/**
 * Get all feature flags
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    ADVANCED_ERRORS: getFlag('ADVANCED_ERRORS'),
    FEATURE_FLAGS: getFlag('FEATURE_FLAGS'),
    STRUCTURED_LOGGING: getFlag('STRUCTURED_LOGGING'),
    ENABLE_BASH_TOOL: getFlag('ENABLE_BASH_TOOL'),
    ENABLE_WEBFETCH_TOOL: getFlag('ENABLE_WEBFETCH_TOOL'),
    ENABLE_FILE_TOOLS: getFlag('ENABLE_FILE_TOOLS'),
    ENABLE_GREP_TOOL: getFlag('ENABLE_GREP_TOOL'),
    ENABLE_FIND_TOOL: getFlag('ENABLE_FIND_TOOL'),
    ENABLE_TREE_TOOL: getFlag('ENABLE_TREE_TOOL'),
    ENABLE_GIT_STATUS_TOOL: getFlag('ENABLE_GIT_STATUS_TOOL'),
    ENABLE_GIT_DIFF_TOOL: getFlag('ENABLE_GIT_DIFF_TOOL'),
    ENABLE_PR_HELPER_TOOL: getFlag('ENABLE_PR_HELPER_TOOL'),
    ENABLE_BRANCH_HELPER_TOOL: getFlag('ENABLE_BRANCH_HELPER_TOOL'),
    ENABLE_WEB_SEARCH_TOOL: getFlag('ENABLE_WEB_SEARCH_TOOL'),
    ENABLE_STREAMING: getFlag('ENABLE_STREAMING'),
    ENABLE_MULTI_TURN: getFlag('ENABLE_MULTI_TURN'),
    ENABLE_CACHING: getFlag('ENABLE_CACHING'),
    DEBUG_MODE: getFlag('DEBUG_MODE'),
    VERBOSE_LOGGING: getFlag('VERBOSE_LOGGING'),
  }
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getFeatureFlags()[feature]
}

/**
 * Get tool availability map
 */
export function getAvailableTools(): Record<string, boolean> {
  const flags = getFeatureFlags()
  return {
    bash: flags.ENABLE_BASH_TOOL,
    webfetch: flags.ENABLE_WEBFETCH_TOOL,
    fileread: flags.ENABLE_FILE_TOOLS,
    filewrite: flags.ENABLE_FILE_TOOLS,
    listdir: flags.ENABLE_FILE_TOOLS,
    grep: flags.ENABLE_GREP_TOOL,
    find: flags.ENABLE_FIND_TOOL,
    tree: flags.ENABLE_TREE_TOOL,
    gitStatus: flags.ENABLE_GIT_STATUS_TOOL,
    gitDiff: flags.ENABLE_GIT_DIFF_TOOL,
    prHelper: flags.ENABLE_PR_HELPER_TOOL,
    branchHelper: flags.ENABLE_BRANCH_HELPER_TOOL,
    websearch: flags.ENABLE_WEB_SEARCH_TOOL,
  }
}
