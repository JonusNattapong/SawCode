/**
 * Claude Code Agent/Skill - Main Entry Point
 *
 * This is a Bun + TypeScript based agent that can be used as a Claude Code skill.
 * It provides a simple interface for creating agents with custom tools.
 *
 * Usage:
 * ```ts
 * import { Agent } from '@sawcode/agent'
 *
 * const agent = new Agent({
 *   model: 'claude-opus-4-6',
 *   tools: [bashTool, webfetchTool],
 * })
 *
 * const result = await agent.query('What is 2 + 2?')
 * ```
 */

import type { AgentConfig, AgentMessage, AgentState, QueryOptions, QueryResult, ToolDefinition } from './types.js'
import { createRegistry } from './tools/index.js'
import { handleQuery, handleToolResult } from './handlers/query.js'

export * from './types.js'
export { createTool, createRegistry, getTool, listTools } from './tools/index.js'
export { bashTool, bashSchema } from './tools/bash.js'
export { webfetchTool, webfetchSchema } from './tools/webfetch.js'
export { filereadTool, filereadSchema } from './tools/fileread.js'
export { filewriteTool, filewriteSchema } from './tools/filewrite.js'
export { listdirTool, listdirSchema } from './tools/listdir.js'
export { grepTool, grepSchema } from './tools/grep.js'
export { findTool, findSchema } from './tools/find.js'
export { treeTool, treeSchema } from './tools/tree.js'
// Phase 9: Git & GitHub Tools
export { 
  gitStatusTool, gitStatusSchema,
  gitDiffTool, gitDiffSchema,
  gitLogTool, gitLogSchema,
  gitBranchTool, gitBranchSchema,
  gitAddTool, gitAddSchema,
  gitCommitTool, gitCommitSchema
} from './tools/git.js'
export { 
  githubPRHelperTool, githubPRHelperSchema,
  githubIssueTemplateTool, githubIssueTemplateSchema,
  githubReleaseTool, githubReleaseSchema,
  githubWorkflowTool, githubWorkflowSchema
} from './tools/github.js'
// Phase 10: Context Extraction
export { contextExtractorTool, contextExtractorSchema } from './tools/contextExtractor.js'
export { codeAnalyzerTool, codeAnalyzerSchema } from './tools/codeAnalyzer.js'
export { gitHistoryAnalyzerTool, gitHistoryAnalyzerSchema } from './tools/gitHistoryAnalyzer.js'
// Phase 11: Code Review
export { codeReviewerTool, codeReviewerSchema } from './tools/codeReviewer.js'
export { suggestionEngineTool, suggestionEngineSchema } from './tools/suggestionEngine.js'
export { complianceCheckerTool, complianceCheckerSchema } from './tools/complianceChecker.js'
// Phase 12: Voice & Audio
export { speechToTextTool, speechToTextSchema } from './tools/speechToText.js'
export { textToSpeechTool, textToSpeechSchema } from './tools/textToSpeech.js'
export { audioProcessorTool, audioProcessorSchema } from './tools/audioProcessor.js'
// Phase 18: AI-Powered Features
export { semanticSearchTool, semanticSearchSchema } from './tools/semantic-search.js'
export { diagnosticEngineTool, diagnosticEngineSchema } from './tools/diagnostic-engine.js'
export { optimizationSuggesterTool, optimizationSuggesterSchema } from './tools/optimization-suggester.js'
// Phase 17: Monitoring & Cost Tracking
export { costTrackingTool, costTrackingSchema } from './tools/cost-tracking.js'
export { performanceMetricsTool, performanceMetricsSchema } from './tools/performance-metrics.js'
export { usageAnalyticsTool, usageAnalyticsSchema } from './tools/usage-analytics.js'
export { costPredictionTool, costPredictionSchema } from './tools/cost-prediction.js'
// Phase 15: Agent Teams & Coordination
export { teamCoordinatorTool, teamCoordinatorSchema } from './tools/team-coordinator.js'
export { taskDelegationTool, taskDelegationSchema } from './tools/task-delegation.js'
export { workflowOrchestratorTool, workflowOrchestratorSchema } from './tools/workflow-orchestrator.js'
// Phase 14: Skills & Plugins System
export { skillRegistryTool, skillRegistrySchema } from './tools/skill-registry.js'
export { pluginLoaderTool, pluginLoaderSchema } from './tools/plugin-loader.js'
export { skillSpecializationTool, skillSpecializationSchema } from './tools/skill-specialization.js'
// Phase 13: Memory & Learning System
export { memoryStorageTool, memoryStorageSchema } from './tools/memory-storage.js'
export { patternLearningTool, patternLearningSchema } from './tools/pattern-learning.js'
export { experienceReplayTool, experienceReplaySchema } from './tools/experience-replay.js'
// Phase 16: Desktop/Mobile Apps
export { deviceCoordinatorTool, deviceCoordinatorSchema } from './tools/device-coordinator.js'
export { sessionHandoffTool, sessionHandoffSchema } from './tools/session-handoff.js'
export { remoteExecutionTool, remoteExecutionSchema } from './tools/remote-execution.js'
export { AgentTUI, launchTUI } from './tui/index.js'
export type { TUIConfig } from './tui/index.js'
export * from './providers/index.js'
export * from './utils/index.js'
// Phase 29: Buddy Companion System
export * from './buddy/index.js'

/**
 * Main Agent class
 */
export class Agent {
  private state: AgentState

  constructor(config: AgentConfig = {}) {
    const tools = config.tools || []

    this.state = {
      messages: [],
      config: {
        model: config.model || 'qwen3-coder-next:cloud',
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 4096,
        systemPrompt: config.systemPrompt,
      },
      toolRegistry: createRegistry(tools),
    }
  }

  /**
   * Get current message history
   */
  getMessages(): AgentMessage[] {
    return this.state.messages
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.state.messages = []
  }

  /**
   * Add a tool to the agent
   */
  addTool(tool: ToolDefinition): void {
    this.state.toolRegistry.set(tool.name, tool)
  }

  /**
   * Get configuration
   */
  getConfig(): AgentConfig {
    return this.state.config
  }

  /**
   * Get available tools
   */
  getTools(): ToolDefinition[] {
    return Array.from(this.state.toolRegistry.values())
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.state.config = { ...this.state.config, ...config }
  }

  /**
   * Query the agent with a message
   */
  async query(message: string, options?: QueryOptions): Promise<QueryResult> {
    return handleQuery(this.state, message, options)
  }

  /**
   * Process a tool result
   */
  async processToolResult(
    toolUseId: string,
    toolName: string,
    toolArgs: Record<string, unknown>,
  ): Promise<QueryResult> {
    return handleToolResult(this.state, toolUseId, toolName, toolArgs)
  }

  /**
   * Export state for persistence
   */
  exportState(): AgentState {
    return {
      messages: [...this.state.messages],
      config: { ...this.state.config },
      toolRegistry: new Map(this.state.toolRegistry),
    }
  }

  /**
   * Import state for resuming
   */
  importState(state: AgentState): void {
    this.state = {
      messages: [...state.messages],
      config: { ...state.config },
      toolRegistry: new Map(state.toolRegistry),
    }
  }
}

/**
 * Create a new agent instance
 */
export function createAgent(config?: AgentConfig): Agent {
  return new Agent(config)
}

// Export version
export const version = '0.1.0'
