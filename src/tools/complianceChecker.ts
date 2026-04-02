/**
 * Compliance Checker Tool
 *
 * Checks code against project standards, style guides, and best practices.
 * Validates naming conventions, code structure, and coding standards.
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readFile } from 'fs/promises'

interface ComplianceViolation {
  rule: string
  severity: 'error' | 'warning' | 'info'
  message: string
  line?: number
  fix?: string
}

interface ComplianceReport {
  fileName: string
  totalViolations: number
  bySeverity: Record<string, number>
  violations: ComplianceViolation[]
  score: number
}

const COMPLIANCE_RULES = [
  {
    name: 'naming-convention',
    check: (content: string) => {
      const violations: ComplianceViolation[] = []
      // Check for camelCase in exports
      const exportMatches = content.matchAll(/export\s+(const|function|class)\s+([A-Z][a-zA-Z]*)/gu)
      for (const match of exportMatches) {
        violations.push({
          rule: 'naming-convention',
          severity: 'warning' as const,
          message: `Export '${match[2]}' should be camelCase (e.g., ${match[2].toLowerCase()})`,
          fix: `Use camelCase for constants: ${match[2].toLowerCase()}`,
        })
      }
      return violations
    },
  },
  {
    name: 'unused-variables',
    check: (content: string) => {
      const violations: ComplianceViolation[] = []
      const lines = content.split('\n')

      // Find variable declarations
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const match = line.match(/const\s+(\w+)\s*=/)
        if (match) {
          const varName = match[1]
          const restOfContent = content.substring(content.indexOf(line) + line.length)
          if (!restOfContent.includes(varName) || restOfContent.split('\n').slice(0, 5).join('').indexOf(varName) === -1) {
            violations.push({
              rule: 'unused-variables',
              severity: 'warning',
              message: `Variable '${varName}' appears to be unused`,
              line: i + 1,
              fix: `Remove unused variable or implement usage`,
            })
          }
        }
      }
      return violations
    },
  },
  {
    name: 'documentation',
    check: (content: string) => {
      const violations: ComplianceViolation[] = []

      // Check exported functions have docs
      const imports = content.matchAll(/export\s+(function|class)\s+(\w+)/g)
      for (const match of imports) {
        const funcName = match[2]
        const index = content.indexOf(match[0])
        const beforeContent = content.substring(Math.max(0, index - 200), index)

        if (!/\/\*\*|\/\/\s*[A-Z]/.test(beforeContent)) {
          violations.push({
            rule: 'documentation',
            severity: 'info',
            message: `Exported ${match[1].toLowerCase()} '${funcName}' lacks JSDoc documentation`,
            fix: 'Add JSDoc comment above the export',
          })
        }
      }
      return violations
    },
  },
  {
    name: 'code-length',
    check: (content: string) => {
      const violations: ComplianceViolation[] = []
      const lines = content.split('\n')

      if (lines.length > 300) {
        violations.push({
          rule: 'code-length',
          severity: 'warning',
          message: `File is too long (${lines.length} lines). Recommended: < 300 lines`,
          fix: 'Consider splitting into smaller modules',
        })
      }

      // Check function length
      for (let i = 0; i < lines.length; i++) {
        if (/function|const.*=>|=>|method/.test(lines[i])) {
          let length = 0
          for (let j = i; j < lines.length && length < 100; j++) {
            length++
            if (lines[j].includes('}') && length > 50) {
              violations.push({
                rule: 'code-length',
                severity: 'warning',
                message: `Function is too long (${length} lines). Recommended: < 50 lines`,
                line: i + 1,
                fix: 'Consider extracting helper functions',
              })
              break
            }
          }
        }
      }
      return violations
    },
  },
  {
    name: 'imports-organization',
    check: (content: string) => {
      const violations: ComplianceViolation[] = []
      const lines = content.split('\n')
      let lastImportLine = 0

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import')) {
          lastImportLine = i
        } else if (!lines[i].startsWith('//') && lines[i].trim() && lastImportLine > 0) {
          // Found first non-import, non-comment line
          if (i - lastImportLine > 3) {
            violations.push({
              rule: 'imports-organization',
              severity: 'info',
              message: 'Imports should be at the top of the file',
              line: lastImportLine + 1,
            })
          }
          break
        }
      }
      return violations
    },
  },
]

function checkCompliance(content: string, fileName: string): ComplianceReport {
  const violations: ComplianceViolation[] = []
  const bySeverity: Record<string, number> = { error: 0, warning: 0, info: 0 }

  // Run all compliance checks
  for (const rule of COMPLIANCE_RULES) {
    const ruleViolations = rule.check(content)
    violations.push(...ruleViolations)
    for (const v of ruleViolations) {
      bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1
    }
  }

  // Calculate compliance score (100 - violations with penalty)
  const score = Math.max(0, 100 - bySeverity.error * 10 - bySeverity.warning * 3 - bySeverity.info)

  return {
    fileName,
    totalViolations: violations.length,
    bySeverity,
    violations: violations.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    }),
    score,
  }
}

export const complianceCheckerTool = createTool(
  'compliance-checker',
  'Check code compliance with project standards',
  z.object({
    filePath: z.string().describe('Path to file to check'),
    standard: z.enum(['strict', 'normal', 'relaxed']).optional().describe('Compliance level'),
  }),
  async ({ filePath, standard = 'normal' }) => {
    try {
      const content = await readFile(filePath, 'utf-8')
      const report = checkCompliance(content, filePath)

      // Adjust for strict/relaxed mode
      let violations = report.violations
      if (standard === 'strict') {
        // Include all violations
      } else if (standard === 'relaxed') {
        // Filter out info-level violations
        violations = violations.filter((v) => v.severity !== 'info')
      }

      const output = `
✅ Compliance Report: ${report.fileName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compliance Score: ${report.score}/100 ${report.score >= 80 ? '🟢' : report.score >= 60 ? '🟡' : '🔴'}
Total Violations: ${report.totalViolations}
├─ 🔴 Errors: ${report.bySeverity.error || 0}
├─ 🟡 Warnings: ${report.bySeverity.warning || 0}
└─ ℹ️ Info: ${report.bySeverity.info || 0}

${violations.length === 0 ? '✨ All checks passed!' : `Violations (${violations.length}):\n${violations.map((v) => `  [${v.severity.toUpperCase()}] Line ${v.line || '?'}: ${v.message}${v.fix ? `\n    Fix: ${v.fix}` : ''}`).join('\n')}`}
`

      return {
        content: [
          {
            type: 'text',
            text: output,
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [
          {
            type: 'text',
            text: `Error checking compliance: ${message}`,
          },
        ],
      }
    }
  }
)

export const complianceCheckerSchema = z.object({
  filePath: z.string(),
  standard: z.enum(['strict', 'normal', 'relaxed']).optional(),
})
