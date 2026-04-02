/**
 * Suggestion Engine Tool
 *
 * Generates actionable improvement suggestions based on code analysis.
 * Provides refactoring hints, optimization opportunities, and best practices.
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readFile } from 'fs/promises'

interface Suggestion {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  line?: number
  beforeCode?: string
  afterCode?: string
  reasoning?: string
}

const REFACTORING_SUGGESTIONS: Array<{ pattern: RegExp; suggestion: Suggestion }> = [
  {
    pattern: /const\s+\w+\s*=\s*\{\s*[^}]+\}\s*;?\s*if\s*\(.*\w+\.length/,
    suggestion: {
      id: 'early-return',
      priority: 'medium',
      category: 'refactor',
      title: 'Use early return pattern',
      description: 'Consider using early return to reduce nesting and improve readability',
      reasoning: 'Reduces cognitive complexity and improves code flow clarity',
    },
  },
  {
    pattern: /\.filter\s*\([^)]+\)\.map\s*\([^)]+\)/,
    suggestion: {
      id: 'optimize-chain',
      priority: 'low',
      category: 'performance',
      title: 'Consider array method optimization',
      description: 'Multiple array method calls can be optimized with reduce()',
      beforeCode: 'items.filter(x => x > 0).map(x => x * 2)',
      afterCode: 'items.reduce((acc, x) => x > 0 ? [...acc, x * 2] : acc, [])',
      reasoning: 'Reduces number of iterations from 2N to N',
    },
  },
]

const BEST_PRACTICES: Suggestion[] = [
  {
    id: 'type-annotations',
    priority: 'high',
    category: 'best-practice',
    title: 'Add type annotations',
    description: 'Function parameters and return types should be explicitly typed',
    reasoning: 'Improved type safety and better IDE support',
  },
  {
    id: 'error-handling',
    priority: 'high',
    category: 'reliability',
    title: 'Add error handling',
    description: 'Async functions should have try-catch blocks',
    reasoning: 'Prevents unhandled promise rejections',
  },
  {
    id: 'unit-tests',
    priority: 'medium',
    category: 'testing',
    title: 'Add unit tests',
    description: 'Critical functions should have comprehensive test coverage',
    reasoning: 'Improves reliability and prevents regressions',
  },
  {
    id: 'documentation',
    priority: 'low',
    category: 'maintenance',
    title: 'Add JSDoc comments',
    description: 'Public APIs should have documentation comments',
    reasoning: 'Improves developer experience and IDE support',
  },
]

function generateSuggestions(content: string): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Check for missing error handling
  if (/async\s+function|await\s+/ .test(content) && !/try\s*{/.test(content)) {
    suggestions.push(BEST_PRACTICES.find((s) => s.id === 'error-handling')!)
  }

  // Check for type annotations
  if (/function\s+\w+\s*\([^)]*\)\s*{/.test(content) && !/:/.test(content)) {
    suggestions.push(BEST_PRACTICES.find((s) => s.id === 'type-annotations')!)
  }

  // Check for tests
  if (!content.includes('.test.') && !content.includes('describe(') && content.length > 500) {
    suggestions.push(BEST_PRACTICES.find((s) => s.id === 'unit-tests')!)
  }

  // Check for documentation
  if (!/\/\*\*|\/\/\s*[A-Z]/.test(content) && /export\s+(function|class|const)/.test(content)) {
    suggestions.push(BEST_PRACTICES.find((s) => s.id === 'documentation')!)
  }

  // Check refactoring patterns
  for (const { pattern, suggestion: sug } of REFACTORING_SUGGESTIONS) {
    if (pattern.test(content)) {
      suggestions.push(sug)
    }
  }

  return suggestions
}

export const suggestionEngineTool = createTool(
  'suggestion-engine',
  'Generate improvement suggestions for code',
  z.object({
    filePath: z.string().describe('Path to file to analyze'),
    categories: z.array(z.string()).optional().describe('Filter by categories'),
    priority: z.enum(['high', 'medium', 'low']).optional().describe('Minimum priority'),
  }),
  async ({ filePath, categories, priority = 'low' }) => {
    try {
      const content = await readFile(filePath, 'utf-8')
      let suggestions = generateSuggestions(content)

      // Filter by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      suggestions = suggestions.filter((s) => priorityOrder[s.priority] <= priorityOrder[priority])

      // Filter by categories if specified
      if (categories && categories.length > 0) {
        suggestions = suggestions.filter((s) => categories.includes(s.category))
      }

      const report = `
💡 Code Suggestions: ${filePath}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Found ${suggestions.length} suggestions

${suggestions
  .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  .map(
    (s, i) => `
${i + 1}. ${s.title} [${s.priority.toUpperCase()}]
   Category: ${s.category}
   ${s.description}
   Reasoning: ${s.reasoning || 'Improves code quality'}
   ${s.beforeCode ? `Before: ${s.beforeCode}` : ''}
   ${s.afterCode ? `After:  ${s.afterCode}` : ''}
`
  )
  .join('\n')}
`

      return {
        content: [
          {
            type: 'text',
            text: report,
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [
          {
            type: 'text',
            text: `Error generating suggestions: ${message}`,
          },
        ],
      }
    }
  }
)

export const suggestionEngineSchema = z.object({
  filePath: z.string(),
  categories: z.array(z.string()).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
})
