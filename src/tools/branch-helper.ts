/**
 * Branch Helper Tool - Git branch operations
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { execSync } from 'child_process'

const branchHelperSchema = z.object({
  action: z.enum(['list', 'create', 'switch', 'delete', 'rename']).describe('Action'),
  name: z.string().optional().describe('Branch name'),
  from: z.string().optional().describe('Base branch (for create)'),
  newName: z.string().optional().describe('New branch name (for rename)'),
  path: z.string().optional().describe('Repository path'),
})

type BranchHelperArgs = z.infer<typeof branchHelperSchema>

export const branchHelperTool = createTool(
  'branch-helper',
  'Git branch operations - create, switch, delete branches',
  branchHelperSchema,
  async (args: BranchHelperArgs) => {
    try {
      const cwd = args.path || '.'

      switch (args.action) {
        case 'list': {
          const output = execSync('git branch -a --format=%(refname:short)', {
            cwd,
            encoding: 'utf-8',
          })

          const branches = output
            .trim()
            .split('\n')
            .map((b) => (b.startsWith('remotes/') ? `  ${b}` : `* ${b}`))
            .join('\n')

          return {
            content: [
              {
                type: 'text',
                text: `Branches:\n${branches}`,
              },
            ],
          }
        }

        case 'create': {
          if (!args.name) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Error: --name required',
                },
              ],
            }
          }

          const base = args.from || 'main'
          execSync(`git checkout -b ${args.name} ${base}`, { cwd })

          return {
            content: [
              {
                type: 'text',
                text: `✅ Branch created: ${args.name} (from ${base})`,
              },
            ],
          }
        }

        case 'switch': {
          if (!args.name) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Error: --name required',
                },
              ],
            }
          }

          execSync(`git checkout ${args.name}`, { cwd })

          return {
            content: [
              {
                type: 'text',
                text: `✅ Switched to ${args.name}`,
              },
            ],
          }
        }

        case 'delete': {
          if (!args.name) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Error: --name required',
                },
              ],
            }
          }

          execSync(`git branch -d ${args.name}`, { cwd })

          return {
            content: [
              {
                type: 'text',
                text: `✅ Branch deleted: ${args.name}`,
              },
            ],
          }
        }

        case 'rename': {
          if (!args.name || !args.newName) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Error: --name and --newName required',
                },
              ],
            }
          }

          execSync(`git branch -m ${args.name} ${args.newName}`, { cwd })

          return {
            content: [
              {
                type: 'text',
                text: `✅ Branch renamed: ${args.name} → ${args.newName}`,
              },
            ],
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

export { branchHelperSchema }
