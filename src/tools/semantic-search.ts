/**
 * Phase 18: Semantic Search Tool
 * Find semantically similar code patterns and implementations
 *
 * Features:
 * - Search by intent/description
 * - Find similar code patterns
 * - Locate reusable implementations
 * - Suggest refactoring opportunities
 */

import { z } from 'zod'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { createTool } from './index.js'

export const semanticSearchSchema = z.object({
  query: z.string().describe('What to search for (e.g., "error handling", "async retry pattern")'),
  scope: z.enum(['all', 'functions', 'classes', 'patterns', 'tests']).default('all').describe('Type of code to search for'),
  language: z.enum(['typescript', 'javascript', 'python', 'all']).default('all').describe('Programming language filter'),
  threshold: z.number().min(0).max(1).default(0.7).describe('Similarity threshold (0-1)'),
  limit: z.number().min(1).max(50).default(10).describe('Maximum results to return'),
})

export type SemanticSearchInput = z.infer<typeof semanticSearchSchema>

/**
 * Calculate simple semantic similarity between two strings
 * In production, this would use embeddings (e.g., OpenAI, Cohere)
 */
function calculateSimilarity(query: string, target: string): number {
  const queryWords = query.toLowerCase().split(/\s+/)
  const targetWords = target.toLowerCase().split(/\s+/)

  // Count matching words
  const matches = queryWords.filter(word => targetWords.some(tw => tw.includes(word) || word.includes(tw)))

  // Calculate similarity score (0-1)
  const maxLength = Math.max(queryWords.length, targetWords.length)
  if (maxLength === 0) return 0

  return matches.length / maxLength
}

/**
 * Mock code pattern database
 */
const codePatterns = [
  {
    name: 'Error Handling Wrapper',
    description: 'Wrap function with try-catch error handling',
    scope: 'pattern',
    language: 'typescript',
    code: `export const withErrorHandling = async <T>(fn: () => Promise<T>): Promise<T | null> => {
  try {
    return await fn()
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}`,
  },
  {
    name: 'Retry Pattern',
    description: 'Retry failed async operations with exponential backoff',
    scope: 'pattern',
    language: 'typescript',
    code: `export const retry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
    }
  }
  throw new Error('Max retries exceeded')
}`,
  },
  {
    name: 'Async Queue',
    description: 'Queue for managing async operations sequentially',
    scope: 'class',
    language: 'typescript',
    code: `export class AsyncQueue {
  private queue: Array<() => Promise<void>> = []
  private running = false

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await fn())
        } catch (error) {
          reject(error)
        }
      })
      this.process()
    })
  }

  private async process() {
    if (this.running || this.queue.length === 0) return
    this.running = true
    while (this.queue.length > 0) {
      const fn = this.queue.shift()
      if (fn) await fn()
    }
    this.running = false
  }
}`,
  },
  {
    name: 'Memoization Cache',
    description: 'Cache function results for performance',
    scope: 'function',
    language: 'typescript',
    code: `export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, any>()
  return ((...args: any[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}`,
  },
  {
    name: 'Event Emitter',
    description: 'Simple event emitter implementation',
    scope: 'class',
    language: 'typescript',
    code: `export class EventEmitter<T extends Record<string, any>> {
  private listeners: Map<keyof T, Array<(data: any) => void>> = new Map()

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(listener)
  }

  emit<K extends keyof T>(event: K, data: T[K]) {
    this.listeners.get(event)?.forEach(listener => listener(data))
  }
}`,
  },
  {
    name: 'Debounce Function',
    description: 'Debounce rapid function calls',
    scope: 'function',
    language: 'typescript',
    code: `export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): T => {
  let timeoutId: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}`,
  },
]

/**
 * Main semantic search handler
 */
async function handleSemanticSearch(input: SemanticSearchInput): Promise<CallToolResult> {
  try {
    // Filter patterns by scope and language
    let filtered = codePatterns.filter(pattern => {
      if (input.scope !== 'all' && pattern.scope !== input.scope) return false
      if (input.language !== 'all' && pattern.language !== input.language) return false
      return true
    })

    // Calculate similarity scores
    const results = filtered
      .map(pattern => ({
        ...pattern,
        similarity: calculateSimilarity(input.query, pattern.description),
      }))
      .filter(r => r.similarity >= input.threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, input.limit)

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `# No Results\n\nNo semantic matches found for: "${input.query}"\n\nTry:\n- Broader search terms\n- Lowering threshold (current: ${input.threshold})\n- Removing scope filters`,
          },
        ],
      }
    }

    // Format results
    let output = `# Semantic Search Results\n\n**Query**: "${input.query}"\n**Matches**: ${results.length}\n\n`

    results.forEach((result, index) => {
      output += `## ${index + 1}. ${result.name}\n\n`
      output += `**Similarity**: ${(result.similarity * 100).toFixed(1)}%\n`
      output += `**Type**: ${result.scope}\n`
      output += `**Language**: ${result.language}\n`
      output += `**Description**: ${result.description}\n\n`
      output += `\`\`\`${result.language}\n${result.code}\n\`\`\`\n\n`
    })

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
          text: `Error in semantic search: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Semantic Search Tool
 * Find semantically similar code patterns and implementations
 */
export const semanticSearchTool = createTool(
  'semantic-search',
  'Search for semantically similar code patterns and implementations. Find reusable patterns, identify similar function implementations, and locate refactoring opportunities.',
  semanticSearchSchema,
  handleSemanticSearch,
)
