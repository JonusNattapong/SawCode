import { createTool } from './index.js'
import { z } from 'zod'
import { readdirSync, statSync } from 'fs'
import { resolve } from 'path'

export const listdirSchema = z.object({
  path: z.string().optional().describe('Directory path to list (default: current directory)'),
})

export const listdirTool = createTool(
  'listdir',
  'List files and directories in a given path.',
  listdirSchema,
  async ({ path = '.' }) => {
    try {
      const fullPath = resolve(path)
      const entries = readdirSync(fullPath)

      const formatted = entries
        .map((entry) => {
          try {
            const stats = statSync(`${fullPath}/${entry}`)
            const type = stats.isDirectory() ? 'DIR' : 'FILE'
            const size = stats.isDirectory() ? '-' : `${stats.size}B`
            return `${type.padEnd(4)} ${entry.padEnd(40)} ${size}`
          } catch (_e) {
            return `? ${entry}`
          }
        })
        .join('\n')

      return {
        content: [
          {
            type: 'text',
            text: `Directory listing for ${path}:\n\n${formatted}`,
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: 'text',
            text: `Error listing directory: ${message}`,
          },
        ],
      }
    }
  },
)
