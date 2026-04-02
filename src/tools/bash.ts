/**
 * Bash execution tool
 */

import { spawn } from 'node:child_process'
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
    return new Promise(resolve => {
      try {
        const { command, cwd } = args

        console.log(`[bash] Running: ${command}`)
        const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash'
        const shellArgs = process.platform === 'win32' ? ['-Command', command] : ['-c', command]

        const child = spawn(shell, shellArgs, {
          cwd: cwd || process.cwd(),
          env: process.env,
        })

        let stdout = ''
        let stderr = ''

        child.stdout.on('data', data => {
          stdout += data.toString()
        })

        child.stderr.on('data', data => {
          stderr += data.toString()
        })

        child.on('close', code => {
          const output = []
          if (stdout) output.push(stdout)
          if (stderr) output.push(stderr)

          resolve({
            content: [
              {
                type: 'text' as const,
                text: output.join('\n') || (code === 0 ? 'Success' : `Exited with code ${code}`),
              },
            ],
            isError: code !== 0,
          })
        })

        child.on('error', err => {
          resolve({
            content: [
              {
                type: 'text' as const,
                text: `Spawn error: ${err.message}`,
              },
            ],
            isError: true,
          })
        })
      } catch (error) {
        resolve({
          content: [
            {
              type: 'text' as const,
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        })
      }
    })
  },
)
