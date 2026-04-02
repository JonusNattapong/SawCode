/**
 * Phase 18: Diagnostic Engine Tool
 * Analyze code to identify issues, suggest fixes, and explain problems
 *
 * Features:
 * - Identify performance issues
 * - Detect code smell
 * - Explain error messages
 * - Suggest optimization strategies
 */

import { z } from 'zod'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { createTool } from './index.js'

export const diagnosticEngineSchema = z.object({
  code: z.string().describe('Code snippet to analyze'),
  language: z.enum(['typescript', 'javascript', 'python', 'bash']).default('typescript').describe('Programming language'),
  focusArea: z.enum(['performance', 'security', 'readability', 'correctness', 'all']).default('all').describe('What aspect to focus on'),
  includeExplanations: z.boolean().default(true).describe('Include detailed explanations'),
  includeFixes: z.boolean().default(true).describe('Suggest fixes for issues'),
})

export type DiagnosticEngineInput = z.infer<typeof diagnosticEngineSchema>

interface DiagnosticIssue {
  severity: 'error' | 'warning' | 'info'
  category: string
  message: string
  line?: number
  suggestion?: string
  explanation?: string
}

/**
 * Analyze code for performance issues
 */
function analyzePerformance(code: string): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  // Check for obvious performance issues
  if (code.includes('for') && code.includes('JSON.stringify')) {
    issues.push({
      severity: 'warning',
      category: 'Performance',
      message: 'JSON.stringify in loop detected',
      suggestion: 'Move JSON.stringify outside the loop or use a different approach',
      explanation: 'JSON.stringify is expensive and should not be called repeatedly in loops',
    })
  }

  if (code.includes('Object.keys') && code.includes('for')) {
    issues.push({
      severity: 'info',
      category: 'Performance',
      message: 'Consider using Object.entries for key-value iteration',
      suggestion: 'Replace Object.keys loop with Object.entries',
      explanation: 'Object.entries is more efficient for getting both keys and values',
    })
  }

  if (code.match(/while\s*\(\s*true\s*\)/)) {
    issues.push({
      severity: 'warning',
      category: 'Performance',
      message: 'Infinite loop detected',
      suggestion: 'Add proper loop termination condition',
      explanation: 'Infinite loops can cause performance issues and application hangs',
    })
  }

  return issues
}

/**
 * Analyze code for security issues
 */
function analyzeSecurity(code: string): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  if (code.includes('eval(')) {
    issues.push({
      severity: 'error',
      category: 'Security',
      message: 'eval() usage detected',
      suggestion: 'Remove eval() and use safer alternatives (JSON.parse, Function constructor with restrictions)',
      explanation: 'eval() is a serious security vulnerability and performance risk',
    })
  }

  if (code.includes('innerHtml') || code.includes('innerHTML')) {
    issues.push({
      severity: 'warning',
      category: 'Security',
      message: 'innerHTML assignment detected',
      suggestion: 'Use textContent or sanitize input before using innerHTML',
      explanation: 'innerHTML can be exploited for XSS attacks if not properly sanitized',
    })
  }

  if (code.includes('require(') && code.includes('process.env')) {
    issues.push({
      severity: 'warning',
      category: 'Security',
      message: 'Environment variable access detected',
      suggestion: 'Validate and sanitize environment variables',
      explanation: 'Environment variables may contain sensitive information',
    })
  }

  return issues
}

/**
 * Analyze code for readability issues
 */
function analyzeReadability(code: string): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  const lines = code.split('\n')

  // Check for long lines
  if (lines.some(line => line.length > 120)) {
    issues.push({
      severity: 'info',
      category: 'Readability',
      message: 'Lines longer than 120 characters detected',
      suggestion: 'Break long lines into multiple lines',
      explanation: 'Long lines are harder to read and maintain',
    })
  }

  // Check for missing comments
  if (code.includes('function') && !code.includes('//') && !code.includes('/*')) {
    issues.push({
      severity: 'info',
      category: 'Readability',
      message: 'No comments found',
      suggestion: 'Add comments explaining complex logic',
      explanation: 'Clear comments improve code maintainability',
    })
  }

  // Check for deeply nested code
  if (code.match(/^(\s{16,})/m)) {
    issues.push({
      severity: 'warning',
      category: 'Readability',
      message: 'Deep nesting detected (4+ levels)',
      suggestion: 'Extract nested blocks into separate functions',
      explanation: 'Deep nesting reduces readability and increases complexity',
    })
  }

  return issues
}

/**
 * Analyze code for correctness issues
 */
function analyzeCorrectness(code: string): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  // Check for missing error handling
  if (code.includes('await') && !code.includes('try') && !code.includes('.catch')) {
    issues.push({
      severity: 'warning',
      category: 'Correctness',
      message: 'Missing error handling for async operation',
      suggestion: 'Wrap await in try-catch or add .catch() handler',
      explanation: 'Unhandled promise rejections can crash the application',
    })
  }

  // Check for potential null reference
  if (code.includes('.') && code.includes('?')) {
    issues.push({
      severity: 'info',
      category: 'Correctness',
      message: 'Optional chaining detected',
      suggestion: 'Ensure null/undefined handling is intentional',
      explanation: 'Optional chaining is good practice, just ensure it is intentional',
    })
  }

  // Check for missing return statement
  if (code.includes('function') && (code.includes('if') || code.includes('for'))) {
    issues.push({
      severity: 'info',
      category: 'Correctness',
      message: 'Consider documented function contracts',
      suggestion: 'Document what the function returns in all code paths',
      explanation: 'Clear return patterns prevent bugs',
    })
  }

  return issues
}

/**
 * Main diagnostic engine handler
 */
async function handleDiagnosticEngine(input: DiagnosticEngineInput): Promise<CallToolResult> {
  try {
    let issues: DiagnosticIssue[] = []

    // Run diagnostics based on focus area
    if (input.focusArea === 'performance' || input.focusArea === 'all') {
      issues = [...issues, ...analyzePerformance(input.code)]
    }
    if (input.focusArea === 'security' || input.focusArea === 'all') {
      issues = [...issues, ...analyzeSecurity(input.code)]
    }
    if (input.focusArea === 'readability' || input.focusArea === 'all') {
      issues = [...issues, ...analyzeReadability(input.code)]
    }
    if (input.focusArea === 'correctness' || input.focusArea === 'all') {
      issues = [...issues, ...analyzeCorrectness(input.code)]
    }

    // Sort by severity
    const severityOrder = { error: 0, warning: 1, info: 2 }
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    // Format output
    let output = `# Code Diagnostic Report\n\n**Language**: ${input.language}\n**Focus Area**: ${input.focusArea}\n**Issues Found**: ${issues.length}\n\n`

    if (issues.length === 0) {
      output += '✅ No issues detected! Code looks good.\n'
    } else {
      // Count by severity
      const errorCount = issues.filter(i => i.severity === 'error').length
      const warningCount = issues.filter(i => i.severity === 'warning').length
      const infoCount = issues.filter(i => i.severity === 'info').length

      if (errorCount > 0) output += `🔴 **Errors**: ${errorCount}\n`
      if (warningCount > 0) output += `🟠 **Warnings**: ${warningCount}\n`
      if (infoCount > 0) output += `🔵 **Info**: ${infoCount}\n`

      output += '\n---\n\n'

      // List all issues
      issues.forEach((issue, index) => {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'
        output += `${icon} **${index + 1}. [${issue.severity.toUpperCase()}] ${issue.category}**\n\n`
        output += `${issue.message}\n\n`

        if (input.includeExplanations && issue.explanation) {
          output += `📖 **Explanation**: ${issue.explanation}\n\n`
        }

        if (input.includeFixes && issue.suggestion) {
          output += `💡 **Suggestion**: ${issue.suggestion}\n\n`
        }

        output += '---\n\n'
      })
    }

    // Add summary and recommendations
    output += `## Summary\n\n`
    if (issues.length === 0) {
      output += 'Code passes all diagnostic checks. Continue maintenance and testing.\n'
    } else {
      const errors = issues.filter(i => i.severity === 'error')
      const warnings = issues.filter(i => i.severity === 'warning')

      if (errors.length > 0) {
        output += `⚠️ **Priority**: Fix ${errors.length} error(s) before deployment\n`
      }
      if (warnings.length > 0) {
        output += `📋 **Recommended**: Address ${warnings.length} warning(s) for better code quality\n`
      }
      output += '\n'
    }

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error in diagnostic analysis: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Diagnostic Engine Tool
 * Analyze code to identify issues, suggest fixes, and explain problems
 */
export const diagnosticEngineTool = createTool(
  'diagnostic-engine',
  'Analyze code to identify performance issues, security vulnerabilities, readability problems, and correctness issues. Suggests fixes and provides detailed explanations.',
  diagnosticEngineSchema,
  handleDiagnosticEngine,
)
