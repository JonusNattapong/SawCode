/**
 * Phase 18: Optimizations Suggester Tool
 * Suggest performance optimizations and best practices
 *
 * Features:
 * - Identify performance bottlenecks
 * - Suggest algorithm improvements
 * - Recommend caching strategies
 * - Provide async/concurrency tips
 */

import { z } from 'zod'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { createTool } from './index.js'

export const optimizationSuggesterSchema = z.object({
  code: z.string().describe('Code snippet to optimize'),
  language: z.enum(['typescript', 'javascript', 'python', 'bash']).default('typescript').describe('Programming language'),
  targetMetric: z.enum(['speed', 'memory', 'reliability', 'maintainability', 'all']).default('all').describe('Optimization target'),
  includeBeforeAfter: z.boolean().default(true).describe('Show before/after code examples'),
  prioritizeBy: z.enum(['impact', 'difficulty', 'effort']).default('impact').describe('How to prioritize suggestions'),
})

export type OptimizationSuggesterInput = z.infer<typeof optimizationSuggesterSchema>

interface OptimizationSuggestion {
  title: string
  impact: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'hard'
  metrics: {
    speed?: string
    memory?: string
    reliability?: string
    maintainability?: string
  }
  explanation: string
  before?: string
  after?: string
}

/**
 * Extract function structure from code
 */
function analyzeCodeStructure(code: string): {
  hasLoops: boolean
  hasNesting: number
  hasAsync: boolean
  hasErrors: boolean
  size: number
} {
  return {
    hasLoops: /\b(for|while|forEach|map|filter)\b/.test(code),
    hasNesting: (code.match(/{/g) || []).length,
    hasAsync: /\b(async|await|Promise|\.then)\b/.test(code),
    hasErrors: /\b(try|catch|throw|Error)\b/.test(code),
    size: code.length,
  }
}

/**
 * Generate optimization suggestions
 */
function generateSuggestions(code: string, _language?: string): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []
  const analysis = analyzeCodeStructure(code)

  // Speed optimizations
  if (analysis.hasLoops && code.includes('JSON.stringify')) {
    suggestions.push({
      title: 'Move JSON.stringify outside loop',
      impact: 'high',
      difficulty: 'easy',
      metrics: { speed: '10-50x faster' },
      explanation: 'JSON.stringify is expensive. Avoid calling in loops.',
      before: 'for (const item of items) {\n  const json = JSON.stringify(item)\n}',
      after: 'const jsonItems = items.map(JSON.stringify)',
    })
  }

  if (analysis.hasLoops && !code.includes('break')) {
    suggestions.push({
      title: 'Consider early exit in loops',
      impact: 'medium',
      difficulty: 'easy',
      metrics: { speed: 'Variable (data-dependent)' },
      explanation: 'Add conditions to exit loops early when possible.',
      before: 'for (const item of items) {\n  if (condition) { /* process */ }\n}',
      after: 'for (const item of items) {\n  if (!condition) continue\n  /* process */\n}',
    })
  }

  if (analysis.hasAsync && code.includes('await') && code.includes('await')) {
    suggestions.push({
      title: 'Use Promise.all for concurrent operations',
      impact: 'high',
      difficulty: 'medium',
      metrics: { speed: 'N times faster (N = number of operations)' },
      explanation: 'Sequential awaits can be parallelized with Promise.all.',
      before: 'await operation1()\nawait operation2()\nawait operation3()',
      after: 'await Promise.all([\n  operation1(),\n  operation2(),\n  operation3()\n])',
    })
  }

  // Memory optimizations
  if (code.includes('new Array') || code.includes('[]')) {
    suggestions.push({
      title: 'Use generators for large collections',
      impact: 'high',
      difficulty: 'medium',
      metrics: { memory: '10-100x less memory' },
      explanation: 'Generators produce values lazily, reducing memory overhead.',
      before: 'const results = []\nfor (const item of largeArray) {\n  results.push(process(item))\n}',
      after: 'function* process() {\n  for (const item of largeArray) {\n    yield process(item)\n  }\n}',
    })
  }

  // Reliability optimizations
  if (analysis.hasAsync && !analysis.hasErrors) {
    suggestions.push({
      title: 'Add error handling to async operations',
      impact: 'high',
      difficulty: 'easy',
      metrics: { reliability: 'Prevents unhandled rejections' },
      explanation: 'Always wrap async operations in try-catch.',
      before: 'const result = await someAsyncFunction()',
      after: 'try {\n  const result = await someAsyncFunction()\n} catch (error) {\n  console.error(error)\n}',
    })
  }

  // Maintainability optimizations
  if (analysis.hasNesting > 4) {
    suggestions.push({
      title: 'Reduce nesting depth',
      impact: 'medium',
      difficulty: 'medium',
      metrics: { maintainability: 'Easier to understand' },
      explanation: 'Extract nested logic into separate functions.',
      before: 'function outer() {\n  if (a) {\n    if (b) {\n      if (c) {\n        /* logic */\n      }\n    }\n  }\n}',
      after: 'function outer() {\n  if (!a) return\n  if (!b) return\n  if (!c) return\n  /* logic */\n}',
    })
  }

  // Caching strategies
  if (analysis.hasLoops) {
    suggestions.push({
      title: 'Implement memoization for expensive operations',
      impact: 'medium',
      difficulty: 'medium',
      metrics: { speed: '2-100x faster (with cache hits)' },
      explanation: 'Cache results of expensive computations.',
      before: 'for (const item of items) {\n  const result = expensiveComputation(item)\n}',
      after: 'const cache = new Map()\nfor (const item of items) {\n  const result = cache.get(item) || expensiveComputation(item)\n  cache.set(item, result)\n}',
    })
  }

  return suggestions
}

/**
 * Sort suggestions based on priority
 */
function sortSuggestions(
  suggestions: OptimizationSuggestion[],
  prioritizeBy: 'impact' | 'difficulty' | 'effort',
): OptimizationSuggestion[] {
  const impactScore = { high: 3, medium: 2, low: 1 }
  const difficultyScore = { easy: 3, medium: 2, hard: 1 }

  return suggestions.sort((a, b) => {
    if (prioritizeBy === 'impact') {
      return impactScore[b.impact] - impactScore[a.impact]
    }
    if (prioritizeBy === 'difficulty') {
      return difficultyScore[b.difficulty] - difficultyScore[a.difficulty]
    }
    // effort: impact/difficulty ratio
    const effortA = impactScore[a.impact] / difficultyScore[a.difficulty]
    const effortB = impactScore[b.impact] / difficultyScore[b.difficulty]
    return effortB - effortA
  })
}

/**
 * Main optimization suggester handler
 */
async function handleOptimizationSuggestions(input: OptimizationSuggesterInput): Promise<CallToolResult> {
  try {
    // Generate suggestions
    let suggestions = generateSuggestions(input.code, input.language)

    // Filter by metric if specified
    if (input.targetMetric !== 'all') {
      suggestions = suggestions.filter(s => Object.keys(s.metrics).includes(input.targetMetric))
    }

    // Sort by priority
    suggestions = sortSuggestions(suggestions, input.prioritizeBy)

    // Format output
    let output = `# Optimization Suggestions\n\n**Language**: ${input.language}\n**Target**: ${input.targetMetric}\n**Priority**: ${input.prioritizeBy}\n**Suggestions**: ${suggestions.length}\n\n`

    if (suggestions.length === 0) {
      output += 'No optimization suggestions at this time. Code is well-optimized!\n'
    } else {
      suggestions.forEach((suggestion, index) => {
        output += `## ${index + 1}. ${suggestion.title}\n\n`

        output += `**Impact**: ${suggestion.impact.toUpperCase()} | **Difficulty**: ${suggestion.difficulty.toUpperCase()}\n\n`

        output += `**Expected Gains**:\n`
        Object.entries(suggestion.metrics).forEach(([metric, value]) => {
          output += `- ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${value}\n`
        })
        output += '\n'

        output += `**Explanation**: ${suggestion.explanation}\n\n`

        if (input.includeBeforeAfter) {
          if (suggestion.before) {
            output += `### Before\n\`\`\`${input.language}\n${suggestion.before}\n\`\`\`\n\n`
          }
          if (suggestion.after) {
            output += `### After\n\`\`\`${input.language}\n${suggestion.after}\n\`\`\`\n\n`
          }
        }

        output += '---\n\n'
      })
    }

    output += `## Implementation Priority\n\n1. **Quick Wins**: Look for "easy" difficulty items with "high" or "medium" impact\n2. **Effort ROI**: Focus on suggestions that offer best effort-to-impact ratio\n3. **Test Impact**: Measure actual performance before and after changes\n\n`

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
          text: `Error generating optimization suggestions: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Optimization Suggester Tool
 * Suggest performance optimizations and best practices
 */
export const optimizationSuggesterTool = createTool(
  'optimization-suggester',
  'Suggest performance optimizations, algorithm improvements, caching strategies, and best practices for code. Provides before/after examples and impact analysis.',
  optimizationSuggesterSchema,
  handleOptimizationSuggestions,
)
