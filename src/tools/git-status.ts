/**
 * Git Status Tool - Get current repository status
 * Shows branch, changes, conflicts, etc.
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { execSync } from 'child_process'

const gitStatusSchema = z.object({
  path: z.string().optional().describe('Repository path (default: current directory)'),
  verbose: z.boolean().optional().describe('Show detailed status'),
})

type GitStatusArgs = z.infer<typeof gitStatusSchema>

/**
 * Parse git status output
 */
function parseGitStatus(output: string) {
  const lines = output.trim().split('\n')
  const status = {
    branch: 'unknown',
    ahead: 0,
    behind: 0,
    staged: 0,
    unstaged: 0,
    untracked: 0,
    conflicts: 0,
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      const branchLine = line.substring(3)
      const match = branchLine.match(/^(\S+?)(?:\.\.\.)/)
      if (match) status.branch = match[1]

      if (branchLine.includes('ahead')) {
        const aheadMatch = branchLine.match(/ahead (\d+)/)
        status.ahead = aheadMatch ? parseInt(aheadMatch[1]) : 0
      }
      if (branchLine.includes('behind')) {
        const behindMatch = branchLine.match(/behind (\d+)/)
        status.behind = behindMatch ? parseInt(behindMatch[1]) : 0
      }
    }

    if (line.startsWith('M ') || line.startsWith('D ') || line.startsWith('A ')) {
      status.staged++
    } else if (line.startsWith(' M') || line.startsWith(' D')) {
      status.unstaged++
    } else if (line.startsWith('??')) {
      status.untracked++
    } else if (line.startsWith('UU') || line.startsWith('AA') || line.startsWith('DD')) {
      status.conflicts++
    }
  }

  return status
}

export const gitStatusTool = createTool(
  'git-status',
  'Get current git repository status (branch, changes, conflicts)',
  gitStatusSchema,
  async (args: GitStatusArgs) => {
    try {
      const cwd = args.path || '.'
      const output = execSync('git status --porcelain --branch', {
        cwd,
        encoding: 'utf-8',
      })

      const status = parseGitStatus(output)

      // Get additional info
      let remoteStatus = 'N/A'
      try {
        remoteStatus = execSync('git remote -v', {
          cwd,
          encoding: 'utf-8',
        })
          .split('\n')[0]
          ?.split(/\s+/)[1] || 'N/A'
      } catch {
        // No remote configured
      }

      let lastCommit = 'N/A'
      try {
        lastCommit = execSync('git log -1 --format=%s', {
          cwd,
          encoding: 'utf-8',
        }).trim()
      } catch {
        // No commits yet
      }

      const summary = `
📊 Git Status
├─ Branch: ${status.branch}
├─ Remote: ${remoteStatus}
├─ Ahead: ${status.ahead} | Behind: ${status.behind}
├─ Staged: ${status.staged} | Unstaged: ${status.unstaged}
├─ Untracked: ${status.untracked}
├─ Conflicts: ${status.conflicts}
└─ Last Commit: ${lastCommit}
`.trim()

      return {
        content: [
          {
            type: 'text',
            text: summary,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Not a git repository'}`,
          },
        ],
      }
    }
  }
)

export { gitStatusSchema }
