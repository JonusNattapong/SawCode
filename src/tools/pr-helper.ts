/**
 * PR Helper Tool - GitHub PR automation
 * Create, check status, and manage pull requests
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { execSync } from 'child_process'

const prHelperSchema = z.object({
  action: z.enum(['status', 'create', 'list', 'check-ci']).describe('Action to perform'),
  repo: z.string().optional().describe('Repository (owner/repo format)'),
  branch: z.string().optional().describe('Feature branch name'),
  title: z.string().optional().describe('PR title'),
  body: z.string().optional().describe('PR description'),
  base: z.string().optional().describe('Base branch (default: main)'),
})

type PRHelperArgs = z.infer<typeof prHelperSchema>

/**
 * Get current repository info from git
 */
function getRepoInfo() {
  try {
    const origin = execSync('git remote get-url origin', {
      encoding: 'utf-8',
    }).trim()

    // Parse "owner/repo" from git URL
    const match = origin.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/)
    if (match) {
      return { owner: match[1], repo: match[2] }
    }
  } catch {
    // No git repo
  }
  return null
}

export const prHelperTool = createTool(
  'pr-helper',
  'GitHub PR helper - create, check status, list PRs',
  prHelperSchema,
  async (args: PRHelperArgs) => {
    try {
      // Get repo info
      const repoInfo = getRepoInfo()
      if (!repoInfo && !args.repo) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Could not determine repository. Please provide --repo owner/repo',
            },
          ],
        }
      }

      const repo = args.repo || `${repoInfo?.owner}/${repoInfo?.repo}`

      switch (args.action) {
        case 'status': {
          // Show current branch PR status
          const branch = args.branch || 'HEAD'
          try {
            const prs = execSync(
              `gh pr list --head ${branch} --repo ${repo} --json number,title,state,reviews`,
              { encoding: 'utf-8' }
            )

            if (!prs.trim()) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `No open PRs found for branch ${branch}`,
                  },
                ],
              }
            }

            return {
              content: [
                {
                  type: 'text',
                  text: `PR Status:\n${prs}`,
                },
              ],
            }
          } catch {
            return {
              content: [
                {
                  type: 'text',
                  text: `[PR Tool needs 'gh' CLI installed]\nTry: brew install gh (macOS) or winget install GitHub.CLI (Windows)`,
                },
              ],
            }
          }
        }

        case 'create': {
          if (!args.title || !args.branch) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Error: --title and --branch required for PR creation',
                },
              ],
            }
          }

          try {
            const base = args.base || 'main'
            const cmd = `gh pr create --repo ${repo} --title "${args.title}" --body "${args.body || 'Auto-created PR'}" --head ${args.branch} --base ${base}`
            const result = execSync(cmd, { encoding: 'utf-8' })

            return {
              content: [
                {
                  type: 'text',
                  text: `✅ PR Created:\n${result}`,
                },
              ],
            }
          } catch (error) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Error creating PR: ${error instanceof Error ? error.message : 'Unknown'}`,
                },
              ],
            }
          }
        }

        case 'list': {
          try {
            const list = execSync(`gh pr list --repo ${repo} --json number,title,state,author`, {
              encoding: 'utf-8',
            })

            return {
              content: [
                {
                  type: 'text',
                  text: `Open PRs:\n${list}`,
                },
              ],
            }
          } catch (error) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Error listing PRs: Install gh CLI`,
                },
              ],
            }
          }
        }

        case 'check-ci': {
          if (!args.branch) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Error: --branch required',
                },
              ],
            }
          }

          try {
            const checks = execSync(
              `gh pr checks ${args.branch} --repo ${repo} --json name,status,conclusion`,
              { encoding: 'utf-8' }
            )

            return {
              content: [
                {
                  type: 'text',
                  text: `CI Status:\n${checks}`,
                },
              ],
            }
          } catch (error) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Error: Could not get CI status. Is this a PR branch?',
                },
              ],
            }
          }
        }

        default:
          return {
            content: [
              {
                type: 'text',
                text: 'Unknown action',
              },
            ],
          }
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }
    }
  }
)

export { prHelperSchema }
