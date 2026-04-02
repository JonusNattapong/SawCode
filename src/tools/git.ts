import { createTool } from './index.js'
import { z } from 'zod'
import { execSync } from 'child_process'

export const gitStatusSchema = z.object({
  porcelain: z.boolean().optional().default(false)
})

export const gitStatusTool = createTool(
  'git-status',
  'Get current git status with branch, changes, and tracking info',
  gitStatusSchema,
  async ({ porcelain }) => {
    try {
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
  staged: z.boolean().optional().default(false),
  file: z.string().optional()
})

export const gitDiffTool = createTool(
  'git-diff',
  'Show git diff for changes (staged or unstaged)',
  gitDiffSchema,
  async ({ staged, file }) => {
    try {
      const flag = staged ? '--staged' : ''
      const target = file ? ` ${file}` : ''
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
  count: z.number().optional().default(10),
  oneline: z.boolean().optional().default(true),
  author: z.string().optional()
})

export const gitLogTool = createTool(
  'git-log',
  'Show git commit history with optional filter',
  gitLogSchema,
  async ({ count, oneline, author }) => {
    try {
      const format = oneline ? '--oneline' : ''
      const authorFilter = author ? `--author="${author}"` : ''
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
  remote: z.boolean().optional().default(false)
})

export const gitBranchTool = createTool(
  'git-branch',
  'List or manage git branches',
  gitBranchSchema,
  async ({ list: _list, remote }) => {
    try {
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
  all: z.boolean().optional().default(false)
})

export const gitAddTool = createTool(
  'git-add',
  'Stage files for commit',
  gitAddSchema,
  async ({ files, all }) => {
    try {
      if (all) {
        execSync('git add .', { encoding: 'utf-8' })
        return {
          content: [{
            type: 'text',
            text: 'All changes staged'
          }]
        }
      }
      
      if (files && files.length > 0) {
        execSync(`git add ${files.join(' ')}`, { encoding: 'utf-8' })
        return {
          content: [{
            type: 'text',
            text: `Staged: ${files.join(', ')}`
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
  amend: z.boolean().optional().default(false)
})

export const gitCommitTool = createTool(
  'git-commit',
  'Create a commit with message',
  gitCommitSchema,
  async ({ message, amend }) => {
    try {
      const flag = amend ? '--amend' : ''
      const result = execSync(`git commit -m "${message}" ${flag}`, { encoding: 'utf-8' })
      
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
