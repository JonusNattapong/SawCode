/**
 * Code Reviewer Tool
 *
 * Performs automated code review checking for quality issues,
 * security vulnerabilities, and coding standard violations.
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readFile } from 'fs/promises'

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

interface ReviewIssue {
  line: number
  severity: IssueSeverity
  category: string
  message: string
  suggestion?: string
  code?: string
}

interface ReviewResult {
  fileName: string
  totalIssues: number
  bySeverity: Record<IssueSeverity, number>
  issues: ReviewIssue[]
}

const SECURITY_PATTERNS = [
  { pattern: /eval\s*\(/, severity: 'critical' as IssueSeverity, message: 'Use of eval() detected', category: 'security' },
  { pattern: /sql\s*=\s*['"].*\$\{/, severity: 'critical' as IssueSeverity, message: 'Potential SQL injection', category: 'security' },
  { pattern: /password|secret|token/, severity: 'high' as IssueSeverity, message: 'Possible hardcoded secret', category: 'security' },
]

const QUALITY_PATTERNS = [
  { pattern: /any\s*[;}]/, severity: 'high' as IssueSeverity, message: 'Use of "any" type', category: 'type-safety' },
  { pattern: /console\.(log|warn|error)/, severity: 'medium' as IssueSeverity, message: 'Debug console statement', category: 'debug' },
  { pattern: /\/\/\s*TODO/, severity: 'info' as IssueSeverity, message: 'TODO comment found', category: 'maintenance' },
  { pattern: /\/\/\s*FIXME/, severity: 'medium' as IssueSeverity, message: 'FIXME comment found', category: 'maintenance' },
  { pattern: /\s+$/, severity: 'low' as IssueSeverity, message: 'Trailing whitespace', category: 'format' },
]

const COMPLEXITY_INDICATORS = [
  { pattern: /if\s*\(/, name: 'if' },
  { pattern: /else\s+(if|{)/, name: 'else' },
  { pattern: /for\s*\(/, name: 'for' },
  { pattern: /while\s*\(/, name: 'while' },
  { pattern: /case\s+/, name: 'case' },
  { pattern: /\.catch\(/, name: 'catch' },
]

function analyzeCode(content: string, fileName: string): ReviewResult {
  const lines = content.split('\n')
  const issues: ReviewIssue[] = []
  const bySeverity: Record<IssueSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  }

  // Check security patterns
  for (const { pattern, severity, message, category } of SECURITY_PATTERNS) {
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        issues.push({
          line: index + 1,
          severity,
          category,
          message,
          code: line.trim(),
        })
        bySeverity[severity]++
      }
    })
  }

  // Check quality patterns
  for (const { pattern, severity, message, category } of QUALITY_PATTERNS) {
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        const existingIssue = issues.find((i) => i.line === index + 1 && i.category === category)
        if (!existingIssue) {
          issues.push({
            line: index + 1,
            severity,
            category,
            message,
            code: line.trim().substring(0, 80),
          })
          bySeverity[severity]++
        }
      }
    })
  }

  // Check for long functions
  let inFunction = false
  let functionStart = 0
  let braceCount = 0

  lines.forEach((line, index) => {
    if (/^(async\s+)?function|const\s+\w+\s*=|^\s*\w+\s*\(/.test(line)) {
      inFunction = true
      functionStart = index
    }

    if (inFunction) {
      braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length

      if (braceCount === 0 && line.includes('}')) {
        const length = index - functionStart
        if (length > 50) {
          issues.push({
            line: functionStart + 1,
            severity: 'medium',
            category: 'complexity',
            message: `Long function (${length} lines)`,
          })
          bySeverity.medium++
        }
        inFunction = false
        braceCount = 0
      }
    }
  })

  // Check cyclomatic complexity
  for (const { pattern } of COMPLEXITY_INDICATORS) {
    const matches = content.match(pattern) || []
    if (matches.length > 10) {
      issues.push({
        line: 1,
        severity: 'medium',
        category: 'complexity',
        message: `High cyclomatic complexity (${matches.length} decision points)`,
      })
      break
    }
  }

  return {
    fileName,
    totalIssues: issues.length,
    bySeverity,
    issues: issues.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    }),
  }
}

export const codeReviewerTool = createTool(
  'code-reviewer',
  'Perform automated code review for quality and security issues',
  z.object({
    filePath: z.string().describe('Path to file to review'),
    language: z.enum(['typescript', 'javascript', 'python']).optional(),
    maxIssues: z.number().optional().describe('Maximum issues to report'),
  }),
  async ({ filePath, maxIssues = 100 }) => {
    try {
      const content = await readFile(filePath, 'utf-8')
      const result = analyzeCode(content, filePath)

      // Filter by maxIssues
      if (result.issues.length > maxIssues) {
        result.issues = result.issues.slice(0, maxIssues)
      }

      const summary = `
📋 Code Review: ${result.fileName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Issues: ${result.totalIssues}
├─ 🔴 Critical: ${result.bySeverity.critical}
├─ 🟠 High: ${result.bySeverity.high}
├─ 🟡 Medium: ${result.bySeverity.medium}
├─ 🟢 Low: ${result.bySeverity.low}
└─ ℹ️ Info: ${result.bySeverity.info}

Issues:
${result.issues.map((i) => `  Line ${i.line} [${i.severity.toUpperCase()}] ${i.message}${i.code ? ` - ${i.code}` : ''}`).join('\n')}
`

      return {
        content: [
          {
            type: 'text',
            text: summary,
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [
          {
            type: 'text',
            text: `Error reviewing code: ${message}`,
          },
        ],
      }
    }
  }
)

export const codeReviewerSchema = z.object({
  filePath: z.string(),
  language: z.enum(['typescript', 'javascript', 'python']).optional(),
  maxIssues: z.number().optional(),
})
