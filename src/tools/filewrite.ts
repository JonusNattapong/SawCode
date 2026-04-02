import { createTool } from './index.js'
import { z } from 'zod'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'

export const filewriteSchema = z.object({
  path: z.string().describe('File path to write to'),
  content: z.string().describe('Content to write to file'),
  append: z.boolean().optional().describe('Append to file instead of overwriting (default: false)'),
})

export const filewriteTool = createTool(
  'filewrite',
  'Write content to a file on disk. Creates parent directories and overwrites by default.',
  filewriteSchema,
  async ({ path, content, append = false }) => {
    try {
      const fullPath = resolve(path)
      const dir = dirname(fullPath)

      // Create directory if needed
      try {
        mkdirSync(dir, { recursive: true })
      } catch (_e) {
        // Directory may already exist
      }

      if (append) {
        // For appending, we need to read existing content first if it exists
        try {
          const { readFileSync } = await import('fs')
          const existing = readFileSync(fullPath, 'utf-8')
          writeFileSync(fullPath, existing + content, 'utf-8')
        } catch (_e) {
          // File doesn't exist yet, just write it
          writeFileSync(fullPath, content, 'utf-8')
        }
      } else {
        writeFileSync(fullPath, content, 'utf-8')
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully wrote ${content.length} bytes to ${path}`,
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: 'text',
            text: `Error writing file: ${message}`,
          },
        ],
      }
    }
  },
)
