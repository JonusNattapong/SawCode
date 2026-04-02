/**
 * Find Tool - Search for files by name/pattern
 * Mimics Unix find command with basic features
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const findSchema = z.object({
  name: z.string().describe('File name or pattern to search for (supports * and ? wildcards)'),
  path: z.string().optional().describe('Directory to search in (default: current directory)'),
  type: z.enum(['file', 'dir', 'any']).optional().describe('Type of item to find (file, dir, or any)'),
  maxResults: z.number().optional().describe('Maximum number of results to return'),
})

type FindArgs = z.infer<typeof findSchema>

/**
 * Convert simple wildcard pattern to regex
 */
function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
  return new RegExp(`^${escaped}$`, 'i')
}

/**
 * Recursively find files matching pattern
 */
function findFiles(dir: string, pattern: RegExp, options: FindArgs): string[] {
  const results: string[] = []
  const maxResults = options.maxResults || 100
  const typeFilter = options.type || 'any'

  function traverse(currentDir: string) {
    if (results.length >= maxResults) return

    try {
      const entries = readdirSync(currentDir)

      for (const entry of entries) {
        if (results.length >= maxResults) break

        const fullPath = join(currentDir, entry)

        try {
          const stat = statSync(fullPath)

          // Check name pattern match
          if (pattern.test(entry)) {
            // Check type filter
            const isFile = stat.isFile()
            const isDir = stat.isDirectory()

            if (
              (typeFilter === 'file' && isFile) ||
              (typeFilter === 'dir' && isDir) ||
              typeFilter === 'any'
            ) {
              results.push(fullPath)
            }
          }

          // Recursively search directories
          if (stat.isDirectory()) {
            traverse(fullPath)
          }
        } catch {
          // Skip entries that can't be stat'd
        }
      }
    } catch {
      // Directory can't be read
    }
  }

  traverse(dir)
  return results
}

export const findTool = createTool(
  'find',
  'Find files by name or pattern (supports * and ? wildcards)',
  findSchema,
  async (args: FindArgs) => {
    const searchDir = args.path || '.'
    const pattern = patternToRegex(args.name)

    try {
      const stat = statSync(searchDir)
      if (!stat.isDirectory()) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${searchDir} is not a directory`,
            },
          ],
        }
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Directory not found - ${searchDir}`,
          },
        ],
      }
    }

    const results = findFiles(searchDir, pattern, args)

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No files found matching pattern "${args.name}" in ${searchDir}`,
          },
        ],
      }
    }

    // Format results
    const formatted = results
      .map((r, idx) => `${idx + 1}. ${r}`)
      .join('\n')

    const typeInfo = args.type ? ` (${args.type}s)` : ''
    const summary = `Found ${results.length} match${results.length !== 1 ? 'es' : ''}${typeInfo}:\n\n${formatted}`

    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
    }
  }
)

export { findSchema }
