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

  // Tools - Phase 9: Git Tools
  ENABLE_GIT_STATUS_TOOL: boolean
  ENABLE_GIT_DIFF_TOOL: boolean
  ENABLE_GIT_LOG_TOOL: boolean
  ENABLE_GIT_BRANCH_TOOL: boolean
  ENABLE_GIT_ADD_TOOL: boolean
  ENABLE_GIT_COMMIT_TOOL: boolean

  // Tools - Phase 9: GitHub Tools
  ENABLE_GITHUB_PR_HELPER_TOOL: boolean
  ENABLE_GITHUB_ISSUE_TEMPLATE_TOOL: boolean
  ENABLE_GITHUB_RELEASE_TOOL: boolean
  ENABLE_GITHUB_WORKFLOW_TOOL: boolean

  // Tools - Phase 10: Context Extraction
  ENABLE_CONTEXT_EXTRACTOR_TOOL: boolean
  ENABLE_CODE_ANALYZER_TOOL: boolean
  ENABLE_GIT_HISTORY_ANALYZER_TOOL: boolean

  ENABLE_WEB_SEARCH_TOOL: boolean

  // Phase 29: Buddy Companion
  ENABLE_BUDDY: boolean

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
  // Phase 9: Git tools all enabled by default
  ENABLE_GIT_STATUS_TOOL: true,
  ENABLE_GIT_DIFF_TOOL: true,
  ENABLE_GIT_LOG_TOOL: true,
  ENABLE_GIT_BRANCH_TOOL: true,
  ENABLE_GIT_ADD_TOOL: true,
  ENABLE_GIT_COMMIT_TOOL: true,
  // Phase 9: GitHub tools all enabled by default
  ENABLE_GITHUB_PR_HELPER_TOOL: true,
  ENABLE_GITHUB_ISSUE_TEMPLATE_TOOL: true,
  ENABLE_GITHUB_RELEASE_TOOL: true,
  ENABLE_GITHUB_WORKFLOW_TOOL: true,
  // Phase 10: Context extraction tools all enabled by default
  ENABLE_CONTEXT_EXTRACTOR_TOOL: true,
  ENABLE_CODE_ANALYZER_TOOL: true,
  ENABLE_GIT_HISTORY_ANALYZER_TOOL: true,
  ENABLE_WEB_SEARCH_TOOL: false, // Disabled by default
  // Phase 29: Buddy companion enabled by default
  ENABLE_BUDDY: true,

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
    ENABLE_GIT_LOG_TOOL: getFlag('ENABLE_GIT_LOG_TOOL'),
    ENABLE_GIT_BRANCH_TOOL: getFlag('ENABLE_GIT_BRANCH_TOOL'),
    ENABLE_GIT_ADD_TOOL: getFlag('ENABLE_GIT_ADD_TOOL'),
    ENABLE_GIT_COMMIT_TOOL: getFlag('ENABLE_GIT_COMMIT_TOOL'),
    ENABLE_GITHUB_PR_HELPER_TOOL: getFlag('ENABLE_GITHUB_PR_HELPER_TOOL'),
    ENABLE_GITHUB_ISSUE_TEMPLATE_TOOL: getFlag('ENABLE_GITHUB_ISSUE_TEMPLATE_TOOL'),
    ENABLE_GITHUB_RELEASE_TOOL: getFlag('ENABLE_GITHUB_RELEASE_TOOL'),
    ENABLE_GITHUB_WORKFLOW_TOOL: getFlag('ENABLE_GITHUB_WORKFLOW_TOOL'),
    ENABLE_CONTEXT_EXTRACTOR_TOOL: getFlag('ENABLE_CONTEXT_EXTRACTOR_TOOL'),
    ENABLE_CODE_ANALYZER_TOOL: getFlag('ENABLE_CODE_ANALYZER_TOOL'),
    ENABLE_GIT_HISTORY_ANALYZER_TOOL: getFlag('ENABLE_GIT_HISTORY_ANALYZER_TOOL'),
    ENABLE_WEB_SEARCH_TOOL: getFlag('ENABLE_WEB_SEARCH_TOOL'),
    ENABLE_BUDDY: getFlag('ENABLE_BUDDY'),
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
    // Phase 9: Git tools
    gitStatus: flags.ENABLE_GIT_STATUS_TOOL,
    gitDiff: flags.ENABLE_GIT_DIFF_TOOL,
    gitLog: flags.ENABLE_GIT_LOG_TOOL,
    gitBranch: flags.ENABLE_GIT_BRANCH_TOOL,
    gitAdd: flags.ENABLE_GIT_ADD_TOOL,
    gitCommit: flags.ENABLE_GIT_COMMIT_TOOL,
    // Phase 9: GitHub tools
    githubPRHelper: flags.ENABLE_GITHUB_PR_HELPER_TOOL,
    githubIssueTemplate: flags.ENABLE_GITHUB_ISSUE_TEMPLATE_TOOL,
    githubRelease: flags.ENABLE_GITHUB_RELEASE_TOOL,
    githubWorkflow: flags.ENABLE_GITHUB_WORKFLOW_TOOL,
    // Phase 10: Context extraction tools
    contextExtractor: flags.ENABLE_CONTEXT_EXTRACTOR_TOOL,
    codeAnalyzer: flags.ENABLE_CODE_ANALYZER_TOOL,
    gitHistoryAnalyzer: flags.ENABLE_GIT_HISTORY_ANALYZER_TOOL,
    websearch: flags.ENABLE_WEB_SEARCH_TOOL,
  }
}
