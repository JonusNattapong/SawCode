/**
 * Bash execution tool
 */

import { z } from 'zod'
import { createTool } from './index.js'

export const bashSchema = z.object({
  command: z.string().describe('Bash command to execute'),
  cwd: z.string().optional().describe('Current working directory'),
})

export const bashTool = createTool(
  'bash',
  'Execute bash commands in the shell. Returns stdout/stderr output.',
  bashSchema,
  async args => {
    try {
      const { command, cwd } = args

      // In a real implementation, you would execute the command
      // For now, return a mock response
      console.log(`[bash] Running: ${command}`)
      if (cwd) {
        console.log(`[bash] CWD: ${cwd}`)
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `Command executed: ${command}\n\nNote: This is a mock response. Implement actual bash execution as needed.`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      }
    }
  },
)
