/**
 * Utility modules for SawCode Agent
 */

// Foundation utilities (Claude Code reference)
export * from './array.js'
export * from './error-classes.js'
export * from './env.js'  // includes: isEnvTruthy, isEnvDefinedFalsy, isBareMode, parseEnvVars, getAWSRegion
export * from './ids.js'
export * from './logger.js'

// Advanced utilities (Claude Code techniques)
export * from './feature-flags.js'  // Feature flag system with 13 configurable flags and tool availability mapping

// Phase 7: Code Writing Enhancement
export {
  parseMarkdown,
  extractAllCode,
  hasCodeContent,
  getCodeBlockCount,
  formatCodeBlockSimple,
  detectLanguage,
  type CodeBlock,
  type ParsedContent,
} from './markdown-parser.js'

export * from './syntax-highlighter.js'  // Syntax highlighting for terminal output
export * from './code-formatter.js'  // Format code blocks with line numbers, highlighting, and boxes
