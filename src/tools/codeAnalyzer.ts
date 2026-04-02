/**
 * Code Analyzer Tool
 *
 * Analyzes code structure including imports, exports, functions, classes,
 * dependencies, and complexity metrics.
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readFile } from 'fs/promises'

interface CodeStructure {
  imports: string[]
  exports: string[]
  functions: Array<{ name: string; lines: number }>
  classes: Array<{ name: string; methods: string[] }>
  dependencies: string[]
}

function analyzeTypeScript(content: string): CodeStructure {
  const imports: string[] = []
  const exports: string[] = []
  const functions: Array<{ name: string; lines: number }> = []
  const classes: Array<{ name: string; methods: string[] }> = []
  const dependencies = new Set<string>()

  // Extract imports
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*)?)+\s+from\s+['"]([^'"]+)['"]/g
  let importMatch
  while ((importMatch = importRegex.exec(content)) !== null) {
    imports.push(importMatch[1])
    dependencies.add(importMatch[1])
  }

  // Extract exports
  const exportRegex = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g
  let exportMatch
  while ((exportMatch = exportRegex.exec(content)) !== null) {
    exports.push(exportMatch[1])
  }

  // Extract functions
  const functionRegex = /(?:async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(/g
  let funcMatch
  while ((funcMatch = functionRegex.exec(content)) !== null) {
    const name = funcMatch[1] || funcMatch[2]
    functions.push({ name, lines: 0 })
  }

  // Extract classes
  const classRegex = /class\s+(\w+)/g
  let classMatch
  while ((classMatch = classRegex.exec(content)) !== null) {
    const methods = []
    const classContent = content.substring(classMatch.index)
    const methodRegex = /^\s+(?:async\s+)?(\w+)\s*\(/gm
    let methodMatch
    while ((methodMatch = methodRegex.exec(classContent)) !== null) {
      if (methodMatch.index > 1000) break // Limit search
      methods.push(methodMatch[1])
    }
    classes.push({ name: classMatch[1], methods })
  }

  return {
    imports,
    exports,
    functions,
    classes,
    dependencies: Array.from(dependencies),
  }
}

function calculateComplexity(content: string): number {
  let complexity = 0

  // Count conditionals
  complexity += (content.match(/\bif\b|\belse\b|\bswitch\b|\bcase\b/g) || []).length
  // Count loops
  complexity += (content.match(/\bfor\b|\bwhile\b|\bdo\b/g) || []).length
  // Count function calls
  complexity += Math.floor((content.match(/\w+\s*\(/g) || []).length / 5)

  return complexity
}

export const codeAnalyzerTool = createTool(
  'code-analyzer',
  'Analyze code structure, dependencies, and complexity',
  z.object({
    filePath: z.string().describe('Path to the code file'),
    language: z.enum(['typescript', 'javascript', 'python', 'go']).optional(),
    complexity: z.boolean().optional().describe('Calculate complexity metrics'),
  }),
  async ({ filePath, language = 'typescript', complexity = true }) => {
    try {
      const content = await readFile(filePath, 'utf-8')

      let analysis: Record<string, unknown> = {
        file: filePath,
        language,
        totalLines: content.split('\n').length,
        totalCharacters: content.length,
      }

      if (language === 'typescript' || language === 'javascript') {
        const structure = analyzeTypeScript(content)
        analysis = {
          ...analysis,
          structure,
          complexity: complexity ? calculateComplexity(content) : undefined,
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing code: ${message}`,
          },
        ],
      }
    }
  }
)

export const codeAnalyzerSchema = z.object({
  filePath: z.string(),
  language: z.enum(['typescript', 'javascript', 'python', 'go']).optional(),
  complexity: z.boolean().optional(),
})
