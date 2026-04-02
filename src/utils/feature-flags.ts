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

  // Tools - Phase 14: Skills & Plugins
  ENABLE_SKILL_REGISTRY_TOOL: boolean
  ENABLE_PLUGIN_LOADER_TOOL: boolean
  ENABLE_SKILL_SPECIALIZATION_TOOL: boolean

  // Tools - Phase 15: Agent Teams
  ENABLE_TEAM_COORDINATOR_TOOL: boolean
  ENABLE_TASK_DELEGATION_TOOL: boolean
  ENABLE_WORKFLOW_ORCHESTRATOR_TOOL: boolean

  // Tools - Phase 16: Desktop/Mobile
  ENABLE_DEVICE_COORDINATOR_TOOL: boolean
  ENABLE_SESSION_HANDOFF_TOOL: boolean
  ENABLE_REMOTE_EXECUTION_TOOL: boolean

  // Tools - Phase 17: Monitoring & Cost Tracking
  ENABLE_COST_TRACKING_TOOL: boolean
  ENABLE_PERFORMANCE_METRICS_TOOL: boolean
  ENABLE_USAGE_ANALYTICS_TOOL: boolean
  ENABLE_COST_PREDICTION_TOOL: boolean

  // Tools - Phase 18: AI Features
  ENABLE_CODE_GENERATOR_TOOL: boolean
  ENABLE_CODE_REVIEWER_TOOL: boolean
  ENABLE_COMPLIANCE_CHECKER_TOOL: boolean
  ENABLE_COST_ANALYZER_TOOL: boolean

  // Tools - Phase 12: Voice & Audio
  ENABLE_SPEECH_TO_TEXT_TOOL: boolean
  ENABLE_TEXT_TO_SPEECH_TOOL: boolean
  ENABLE_AUDIO_PROCESSOR_TOOL: boolean

  // Tools - Phase 13: Memory & Learning
  ENABLE_MEMORY_STORAGE_TOOL: boolean
  ENABLE_PATTERN_LEARNING_TOOL: boolean
  ENABLE_EXPERIENCE_REPLAY_TOOL: boolean

  // Tools - Reference Tools (Claude Code Integration)
  ENABLE_MCP_CONNECTOR_TOOL: boolean
  ENABLE_NOTEBOOK_EXECUTOR_TOOL: boolean
  ENABLE_SKILL_LOADER_TOOL: boolean

  // Voice Features
  ENABLE_VOICE_LIVE: boolean
  ENABLE_VOICE_STREAM: boolean

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
  // Phase 14: Skills & Plugins tools all enabled by default
  ENABLE_SKILL_REGISTRY_TOOL: true,
  ENABLE_PLUGIN_LOADER_TOOL: true,
  ENABLE_SKILL_SPECIALIZATION_TOOL: true,
  // Phase 15: Agent Teams tools all enabled by default
  ENABLE_TEAM_COORDINATOR_TOOL: true,
  ENABLE_TASK_DELEGATION_TOOL: true,
  ENABLE_WORKFLOW_ORCHESTRATOR_TOOL: true,
  // Phase 16: Desktop/Mobile tools all enabled by default
  ENABLE_DEVICE_COORDINATOR_TOOL: true,
  ENABLE_SESSION_HANDOFF_TOOL: true,
  ENABLE_REMOTE_EXECUTION_TOOL: true,
  // Phase 17: Monitoring & Cost Tracking tools all enabled by default
  ENABLE_COST_TRACKING_TOOL: true,
  ENABLE_PERFORMANCE_METRICS_TOOL: true,
  ENABLE_USAGE_ANALYTICS_TOOL: true,
  ENABLE_COST_PREDICTION_TOOL: true,
  // Phase 18: AI Features tools all enabled by default
  ENABLE_CODE_GENERATOR_TOOL: true,
  ENABLE_CODE_REVIEWER_TOOL: true,
  ENABLE_COMPLIANCE_CHECKER_TOOL: true,
  ENABLE_COST_ANALYZER_TOOL: true,
  // Phase 12: Voice & Audio tools all enabled by default
  ENABLE_SPEECH_TO_TEXT_TOOL: true,
  ENABLE_TEXT_TO_SPEECH_TOOL: true,
  ENABLE_AUDIO_PROCESSOR_TOOL: true,
  // Phase 13: Memory & Learning tools all enabled by default
  ENABLE_MEMORY_STORAGE_TOOL: true,
  ENABLE_PATTERN_LEARNING_TOOL: true,
  ENABLE_EXPERIENCE_REPLAY_TOOL: true,
  // Reference Tools (Claude Code Integration) all enabled by default
  ENABLE_MCP_CONNECTOR_TOOL: true,
  ENABLE_NOTEBOOK_EXECUTOR_TOOL: true,
  ENABLE_SKILL_LOADER_TOOL: true,
  // Voice Features
  ENABLE_VOICE_LIVE: false,
  ENABLE_VOICE_STREAM: false,
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
    ENABLE_SKILL_REGISTRY_TOOL: getFlag('ENABLE_SKILL_REGISTRY_TOOL'),
    ENABLE_PLUGIN_LOADER_TOOL: getFlag('ENABLE_PLUGIN_LOADER_TOOL'),
    ENABLE_SKILL_SPECIALIZATION_TOOL: getFlag('ENABLE_SKILL_SPECIALIZATION_TOOL'),
    ENABLE_TEAM_COORDINATOR_TOOL: getFlag('ENABLE_TEAM_COORDINATOR_TOOL'),
    ENABLE_TASK_DELEGATION_TOOL: getFlag('ENABLE_TASK_DELEGATION_TOOL'),
    ENABLE_WORKFLOW_ORCHESTRATOR_TOOL: getFlag('ENABLE_WORKFLOW_ORCHESTRATOR_TOOL'),
    ENABLE_DEVICE_COORDINATOR_TOOL: getFlag('ENABLE_DEVICE_COORDINATOR_TOOL'),
    ENABLE_SESSION_HANDOFF_TOOL: getFlag('ENABLE_SESSION_HANDOFF_TOOL'),
    ENABLE_REMOTE_EXECUTION_TOOL: getFlag('ENABLE_REMOTE_EXECUTION_TOOL'),
    ENABLE_COST_TRACKING_TOOL: getFlag('ENABLE_COST_TRACKING_TOOL'),
    ENABLE_PERFORMANCE_METRICS_TOOL: getFlag('ENABLE_PERFORMANCE_METRICS_TOOL'),
    ENABLE_USAGE_ANALYTICS_TOOL: getFlag('ENABLE_USAGE_ANALYTICS_TOOL'),
    ENABLE_COST_PREDICTION_TOOL: getFlag('ENABLE_COST_PREDICTION_TOOL'),
    ENABLE_CODE_GENERATOR_TOOL: getFlag('ENABLE_CODE_GENERATOR_TOOL'),
    ENABLE_CODE_REVIEWER_TOOL: getFlag('ENABLE_CODE_REVIEWER_TOOL'),
    ENABLE_COMPLIANCE_CHECKER_TOOL: getFlag('ENABLE_COMPLIANCE_CHECKER_TOOL'),
    ENABLE_COST_ANALYZER_TOOL: getFlag('ENABLE_COST_ANALYZER_TOOL'),
    ENABLE_SPEECH_TO_TEXT_TOOL: getFlag('ENABLE_SPEECH_TO_TEXT_TOOL'),
    ENABLE_TEXT_TO_SPEECH_TOOL: getFlag('ENABLE_TEXT_TO_SPEECH_TOOL'),
    ENABLE_AUDIO_PROCESSOR_TOOL: getFlag('ENABLE_AUDIO_PROCESSOR_TOOL'),
    ENABLE_MEMORY_STORAGE_TOOL: getFlag('ENABLE_MEMORY_STORAGE_TOOL'),
    ENABLE_PATTERN_LEARNING_TOOL: getFlag('ENABLE_PATTERN_LEARNING_TOOL'),
    ENABLE_EXPERIENCE_REPLAY_TOOL: getFlag('ENABLE_EXPERIENCE_REPLAY_TOOL'),
    ENABLE_MCP_CONNECTOR_TOOL: getFlag('ENABLE_MCP_CONNECTOR_TOOL'),
    ENABLE_NOTEBOOK_EXECUTOR_TOOL: getFlag('ENABLE_NOTEBOOK_EXECUTOR_TOOL'),
    ENABLE_SKILL_LOADER_TOOL: getFlag('ENABLE_SKILL_LOADER_TOOL'),
    ENABLE_VOICE_LIVE: getFlag('ENABLE_VOICE_LIVE'),
    ENABLE_VOICE_STREAM: getFlag('ENABLE_VOICE_STREAM'),
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
    // Phase 14: Skills & Plugins
    skillRegistry: flags.ENABLE_SKILL_REGISTRY_TOOL,
    pluginLoader: flags.ENABLE_PLUGIN_LOADER_TOOL,
    skillSpecialization: flags.ENABLE_SKILL_SPECIALIZATION_TOOL,
    // Phase 15: Agent Teams
    teamCoordinator: flags.ENABLE_TEAM_COORDINATOR_TOOL,
    taskDelegation: flags.ENABLE_TASK_DELEGATION_TOOL,
    workflowOrchestrator: flags.ENABLE_WORKFLOW_ORCHESTRATOR_TOOL,
    // Phase 16: Desktop/Mobile
    deviceCoordinator: flags.ENABLE_DEVICE_COORDINATOR_TOOL,
    sessionHandoff: flags.ENABLE_SESSION_HANDOFF_TOOL,
    remoteExecution: flags.ENABLE_REMOTE_EXECUTION_TOOL,
    // Phase 17: Monitoring & Cost Tracking
    costTracking: flags.ENABLE_COST_TRACKING_TOOL,
    performanceMetrics: flags.ENABLE_PERFORMANCE_METRICS_TOOL,
    usageAnalytics: flags.ENABLE_USAGE_ANALYTICS_TOOL,
    costPrediction: flags.ENABLE_COST_PREDICTION_TOOL,
    // Phase 18: AI Features
    codeGenerator: flags.ENABLE_CODE_GENERATOR_TOOL,
    codeReviewer: flags.ENABLE_CODE_REVIEWER_TOOL,
    complianceChecker: flags.ENABLE_COMPLIANCE_CHECKER_TOOL,
    costAnalyzer: flags.ENABLE_COST_ANALYZER_TOOL,
    websearch: flags.ENABLE_WEB_SEARCH_TOOL,
  }
}
