import { describe, it, expect } from 'vitest'
import { gitStatusTool, gitLogTool, gitDiffTool, gitBranchTool, gitAddTool, gitCommitTool } from './git'

describe('Git Tools', () => {
  it('gitStatusTool should have correct schema', () => {
    expect(gitStatusTool.name).toBe('git-status')
    expect(gitStatusTool.description).toContain('git status')
  })

  it('gitDiffTool should have correct schema', () => {
    expect(gitDiffTool.name).toBe('git-diff')
    expect(gitDiffTool.description).toContain('git diff')
  })

  it('gitLogTool should have correct schema', () => {
    expect(gitLogTool.name).toBe('git-log')
    expect(gitLogTool.description).toContain('git commit')
  })

  it('gitBranchTool should have correct schema', () => {
    expect(gitBranchTool.name).toBe('git-branch')
    expect(gitBranchTool.description).toContain('git branches')
  })

  it('gitAddTool should have correct schema', () => {
    expect(gitAddTool.name).toBe('git-add')
    expect(gitAddTool.description).toContain('Stage')
  })

  it('gitCommitTool should have correct schema', () => {
    expect(gitCommitTool.name).toBe('git-commit')
    expect(gitCommitTool.description).toContain('commit')
  })

  it('tools should have MCP-compatible format', async () => {
    const result = await gitStatusTool.handler({ porcelain: false })
    expect(result).toHaveProperty('content')
    expect(Array.isArray(result.content)).toBe(true)
    expect(result.content[0]).toHaveProperty('type')
    expect(result.content[0].type).toBe('text')
  })
})
