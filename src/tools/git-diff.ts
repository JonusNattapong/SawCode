/**
 * Git Diff Tool - Show differences between commits/branches
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { execSync } from 'child_process'

const gitDiffSchema = z.object({
  path: z.string().optional().describe('Repository path'),
  from: z.string().optional().describe('Start commit/branch (default: HEAD)'),
  to: z.string().optional().describe('End commit/branch (default: working tree)'),
  staged: z.boolean().optional().describe('Show staged changes only'),
  stat: z.boolean().optional().describe('Show stat summary only'),
})

type GitDiffArgs = z.infer<typeof gitDiffSchema>

export const gitDiffTool = createTool(
  'git-diff',
  'Show git differences between commits or branches',
  gitDiffSchema,
  async (args: GitDiffArgs) => {
    try {
      const cwd = args.path || '.'
      let cmd = 'git diff'

      if (args.stat) cmd += ' --stat'
      if (args.staged) cmd += ' --cached'

      if (args.from && args.to) {
        cmd += ` ${args.from}..${args.to}`
      } else if (args.from) {
        cmd += ` ${args.from}`
      }

      const output = execSync(cmd, {
        cwd,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      })

      if (!output.trim()) {
        return {
          content: [
            {
              type: 'text',
              text: 'No differences found',
            },
          ],
        }
      }

      // Limit output for display
      const lines = output.split('\n')
      const preview = lines.slice(0, 100).join('\n')
      const truncated = lines.length > 100 ? `\n... (${lines.length - 100} more lines)` : ''

      return {
        content: [
          {
            type: 'text',
            text: `\`\`\`diff\n${preview}${truncated}\n\`\`\``,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Failed to get diff'}`,
          },
        ],
      }
    }
  }
)

export { gitDiffSchema }
