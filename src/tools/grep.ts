/**
 * Grep Tool - Search for text patterns in files
 * Mimics Unix grep command
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const grepSchema = z.object({
  pattern: z.string().describe('Text or regex pattern to search for'),
  path: z.string().optional().describe('File or directory to search in (default: current directory)'),
  recursive: z.boolean().optional().describe('Search recursively in directories'),
  ignoreCase: z.boolean().optional().describe('Ignore case when searching'),
  maxResults: z.number().optional().describe('Maximum number of results to return'),
})

type GrepArgs = z.infer<typeof grepSchema>

/**
 * Recursively search files in a directory
 */
function searchDirectory(dir: string, pattern: string, options: GrepArgs): Array<{ file: string; line: number; text: string }> {
  const results: Array<{ file: string; line: number; text: string }> = []
  const flags = (options.ignoreCase ? 'i' : '') + 'g'
  const regex = new RegExp(pattern, flags)
  const maxResults = options.maxResults || 100

  try {
    const entries = readdirSync(dir)

    for (const entry of entries) {
      if (results.length >= maxResults) break

      const fullPath = join(dir, entry)

      try {
        const stat = statSync(fullPath)

        if (stat.isDirectory() && options.recursive) {
          const subResults = searchDirectory(fullPath, pattern, options)
          results.push(...subResults.slice(0, maxResults - results.length))
        } else if (stat.isFile()) {
          // Skip binary files
          const ext = extname(entry).toLowerCase()
          const isBinary = ['.bin', '.exe', '.dll', '.so', '.dylib', '.png', '.jpg', '.gif', '.zip'].includes(ext)
          if (!isBinary) {
            try {
              const content = readFileSync(fullPath, 'utf-8')
              const lines = content.split('\n')

              lines.forEach((line, idx) => {
                if (results.length < maxResults && regex.test(line)) {
                  results.push({
                    file: fullPath,
                    line: idx + 1,
                    text: line.trim(),
                  })
                }
              })
            } catch {
              // Skip files that can't be read as text
            }
          }
        }
      } catch {
        // Skip entries that can't be stat'd
      }
    }
  } catch {
    // Directory can't be read
  }

  return results
}

/**
 * Search a single file
 */
function searchFile(filePath: string, pattern: string, options: GrepArgs): Array<{ file: string; line: number; text: string }> {
  const results: Array<{ file: string; line: number; text: string }> = []
  const flags = (options.ignoreCase ? 'i' : '') + 'g'
  const regex = new RegExp(pattern, flags)
  const maxResults = options.maxResults || 100

  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    lines.forEach((line, idx) => {
      if (results.length < maxResults && regex.test(line)) {
        results.push({
          file: filePath,
          line: idx + 1,
          text: line.trim(),
        })
      }
    })
  } catch (error) {
    return [
      {
        file: filePath,
        line: 0,
        text: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
    ]
  }

  return results
}

export const grepTool = createTool(
  'grep',
  'Search for text patterns in files (like Unix grep)',
  grepSchema,
  async (args: GrepArgs) => {
    const searchPath = args.path || '.'
    let results: Array<{ file: string; line: number; text: string }> = []

    try {
      const stat = statSync(searchPath)

      if (stat.isDirectory()) {
        results = searchDirectory(searchPath, args.pattern, args)
      } else {
        results = searchFile(searchPath, args.pattern, args)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMsg}`,
          },
        ],
      }
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No matches found for pattern "${args.pattern}" in ${searchPath}`,
          },
        ],
      }
    }

    // Format results
    const formatted = results
      .map(r => `${r.file}:${r.line} - ${r.text}`)
      .join('\n')

    const summary = `Found ${results.length} match${results.length !== 1 ? 'es' : ''}:\n\n${formatted}`

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

export { grepSchema }
