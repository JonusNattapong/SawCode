import { createTool } from './index.js'
import { z } from 'zod'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export const filereadSchema = z.object({
  path: z.string().describe('File path to read'),
  encoding: z.enum(['utf-8', 'ascii', 'base64']).optional().describe('File encoding (default: utf-8)'),
})

export const filereadTool = createTool(
  'fileread',
  'Read file contents from disk. Supports text and binary files.',
  filereadSchema,
  async ({ path, encoding = 'utf-8' }) => {
    try {
      const fullPath = resolve(path)
      const content = readFileSync(fullPath, encoding as BufferEncoding)
      return {
        content: [
          {
            type: 'text',
            text: `File contents of ${path}:\n\n${content}`,
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: 'text',
            text: `Error reading file: ${message}`,
          },
        ],
      }
    }
  },
)
