import { createTool } from './index.js'
import { z } from 'zod'
import { execSync } from 'child_process'

export const gitStatusSchema = z.object({
  porcelain: z.boolean().optional()
})

export const gitStatusTool = createTool(
  'git-status',
  'Get current git status with branch, changes, and tracking info',
  gitStatusSchema,
  async (args) => {
    try {
      const porcelain = args.porcelain ?? false
      const format = porcelain ? 'porcelain' : 'short'
      const status = execSync(`git status --${format}`, { encoding: 'utf-8' })
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()

      return {
        content: [{
          type: 'text',
          text: `Branch: ${branch}\n\nStatus:\n${status}`
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error reading git status: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      }
    }
  }
)

export const gitDiffSchema = z.object({
  staged: z.boolean().optional(),
  file: z.string().optional()
})

export const gitDiffTool = createTool(
  'git-diff',
  'Show git diff for changes (staged or unstaged)',
  gitDiffSchema,
  async (args) => {
    try {
      const staged = args.staged ?? false
      const flag = staged ? '--staged' : ''
      const target = args.file ? ` ${args.file}` : ''
      const diff = execSync(`git diff ${flag}${target}`, { encoding: 'utf-8' })

      return {
        content: [{
          type: 'text',
          text: diff || 'No changes'
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error reading git diff: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      }
    }
  }
)

export const gitLogSchema = z.object({
  count: z.number().optional(),
  oneline: z.boolean().optional(),
  author: z.string().optional()
})

export const gitLogTool = createTool(
  'git-log',
  'Show git commit history with optional filter',
  gitLogSchema,
  async (args) => {
    try {
      const count = args.count ?? 10
      const oneline = args.oneline ?? true
      const format = oneline ? '--oneline' : ''
      const authorFilter = args.author ? `--author="${args.author}"` : ''
      const log = execSync(`git log -n ${count} ${format} ${authorFilter}`, { encoding: 'utf-8' })

      return {
        content: [{
          type: 'text',
          text: log
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error reading git log: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      }
    }
  }
)

export const gitBranchSchema = z.object({
  remote: z.boolean().optional()
})

export const gitBranchTool = createTool(
  'git-branch',
  'List or manage git branches',
  gitBranchSchema,
  async (args) => {
    try {
      const remote = args.remote ?? false
      const flag = remote ? '-r' : ''
      const branches = execSync(`git branch ${flag}`, { encoding: 'utf-8' })

      return {
        content: [{
          type: 'text',
          text: branches
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error reading branches: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      }
    }
  }
)

export const gitAddSchema = z.object({
  files: z.array(z.string()).optional(),
  all: z.boolean().optional()
})

export const gitAddTool = createTool(
  'git-add',
  'Stage files for commit',
  gitAddSchema,
  async (args) => {
    try {
      const all = args.all ?? false
      if (all) {
        execSync('git add .', { encoding: 'utf-8' })
        return {
          content: [{
            type: 'text',
            text: 'All changes staged'
          }]
        }
      }

      if (args.files && args.files.length > 0) {
        execSync(`git add ${args.files.join(' ')}`, { encoding: 'utf-8' })
        return {
          content: [{
            type: 'text',
            text: `Staged: ${args.files.join(', ')}`
          }]
        }
      }

      return {
        content: [{
          type: 'text',
          text: 'Specify files or use all: true'
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error staging files: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      }
    }
  }
)

export const gitCommitSchema = z.object({
  message: z.string(),
  amend: z.boolean().optional()
})

export const gitCommitTool = createTool(
  'git-commit',
  'Create a commit with message',
  gitCommitSchema,
  async (args) => {
    try {
      const amend = args.amend ?? false
      const flag = amend ? '--amend' : ''
      const result = execSync(`git commit -m "${args.message}" ${flag}`, { encoding: 'utf-8' })

      return {
        content: [{
          type: 'text',
          text: result
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error committing: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      }
    }
  }
)
