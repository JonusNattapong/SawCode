/**
 * Code Metrics Tool - Calculate LOC, complexity, coverage estimates
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join, extname } from 'path'

const codeMetricsSchema = z.object({
  path: z.string().optional().describe('Project path'),
  language: z.string().optional().describe('Language filter (ts, js, py, etc.)'),
})

type CodeMetricsArgs = z.infer<typeof codeMetricsSchema>

interface FileMetrics {
  lines: number
  code: number
  comments: number
  blank: number
  complexity: number
}

/**
 * Calculate metrics for a file
 */
function analyzeFile(filePath: string): FileMetrics | null {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    let codeLines = 0
    let commentLines = 0
    let blankLines = 0
    let complexity = 1 // Base complexity

    let inMultilineComment = false

    for (const line of lines) {
      const trimmed = line.trim()

      // Blank lines
      if (trimmed === '') {
        blankLines++
        continue
      }

      // Multiline comments
      if (inMultilineComment) {
        commentLines++
        if (trimmed.includes('*/')) {
          inMultilineComment = false
        }
        continue
      }

      if (trimmed.startsWith('/*')) {
        inMultilineComment = true
        commentLines++
        continue
      }

      // Single-line comments
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('--')) {
        commentLines++
        continue
      }

      // Count code lines
      codeLines++

      // Complexity: count control flow structures
      if (/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b|\bcatch\b|\b\?\s*:/.test(trimmed)) {
        complexity++
      }

      // Functions increase complexity
      if (/\bfunction\b|\b\(\s*\)\s*=>|\bdef\b/.test(trimmed)) {
        complexity++
      }
    }

    return {
      lines: lines.length,
      code: codeLines,
      comments: commentLines,
      blank: blankLines,
      complexity: Math.max(1, Math.floor(complexity / 5)), // Normalize
    }
  } catch {
    return null
  }
}

/**
 * Map file extension to language
 */
function getLanguage(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const langMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.rs': 'rust',
    '.rb': 'ruby',
    '.php': 'php',
    '.swift': 'swift',
  }
  return langMap[ext] || 'other'
}

export const codeMetricsTool = createTool(
  'code-metrics',
  'Calculate code metrics: LOC, complexity, comments ratio',
  codeMetricsSchema,
  async (args: CodeMetricsArgs) => {
    try {
      const rootPath = args.path || '.'
      const languageFilter = args.language?.toLowerCase()

      const stats: Record<string, any> = {
        total: { lines: 0, code: 0, comments: 0, blank: 0 },
        byLanguage: {} as Record<string, any>,
      }

      function traverse(currentPath: string) {
        try {
          const entries = readdirSync(currentPath)

          for (const entry of entries) {
            if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist') continue

            const fullPath = join(currentPath, entry)
            const stat = statSync(fullPath)

            if (stat.isDirectory()) {
              traverse(fullPath)
            } else if (stat.isFile()) {
              const lang = getLanguage(fullPath)

              if (languageFilter && lang !== languageFilter) continue

              const metrics = analyzeFile(fullPath)
              if (metrics) {
                // Update totals
                stats.total.lines += metrics.lines
                stats.total.code += metrics.code
                stats.total.comments += metrics.comments
                stats.total.blank += metrics.blank

                // Update by language
                if (!stats.byLanguage[lang]) {
                  stats.byLanguage[lang] = { lines: 0, code: 0, comments: 0, files: 0 }
                }
                stats.byLanguage[lang].lines += metrics.lines
                stats.byLanguage[lang].code += metrics.code
                stats.byLanguage[lang].comments += metrics.comments
                stats.byLanguage[lang].files += 1
              }
            }
          }
        } catch {
          // Skip permission denied
        }
      }

      traverse(rootPath)

      // Format output
      let output = '📈 Code Metrics\n\n'

      output += `Total Statistics:
├─ Lines: ${stats.total.lines}
├─ Code: ${stats.total.code}
├─ Comments: ${stats.total.comments}
├─ Blank: ${stats.total.blank}
└─ Ratio: ${((stats.total.comments / stats.total.code) * 100).toFixed(1)}% comments

By Language:\n`

      for (const [lang, data] of Object.entries(stats.byLanguage)) {
        const langData = data as { files: number; lines: number; code: number; comments: number }
        output += `${lang} (${langData.files} files)
  • Lines: ${langData.lines}
  • Code: ${langData.code}
  • Comments: ${langData.comments}\n\n`
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
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }
    }
  }
)

export { codeMetricsSchema }
