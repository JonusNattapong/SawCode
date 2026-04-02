import { describe, it, expect } from 'vitest'
import { 
  githubPRHelperTool, 
  githubIssueTemplateTool, 
  githubReleaseTool,
  githubWorkflowTool
} from '../src/tools/github'

describe('GitHub Tools', () => {
  it('githubPRHelperTool should have correct schema', () => {
    expect(githubPRHelperTool.name).toBe('github-pr-helper')
    expect(githubPRHelperTool.description).toContain('PR')
  })

  it('githubIssueTemplateTool should have correct schema', () => {
    expect(githubIssueTemplateTool.name).toBe('github-issue-template')
    expect(githubIssueTemplateTool.description).toContain('issue')
  })

  it('githubReleaseTool should have correct schema', () => {
    expect(githubReleaseTool.name).toBe('github-release')
    expect(githubReleaseTool.description).toContain('release')
  })

  it('githubWorkflowTool should have correct schema', () => {
    expect(githubWorkflowTool.name).toBe('github-workflow')
    expect(githubWorkflowTool.description).toContain('workflow')
  })

  it('PR helper should return MCP format', async () => {
    const result = await githubPRHelperTool.handler({
      title: 'Test PR',
      description: 'Test description'
    })
    expect(result).toHaveProperty('content')
    expect(result.content[0].type).toBe('text')
    expect(result.content[0].text).toContain('Test PR')
  })

  it('Issue template should handle different types', async () => {
    const bugResult = await githubIssueTemplateTool.handler({
      type: 'bug',
      title: 'Critical Bug',
      details: 'Something is broken'
    })
    expect(bugResult.content[0].text).toContain('Bug Report')
    expect(bugResult.content[0].text).toContain('Steps to Reproduce')

    const featureResult = await githubIssueTemplateTool.handler({
      type: 'feature',
      title: 'New Feature',
      details: 'Add this feature'
    })
    expect(featureResult.content[0].text).toContain('Feature Request')
  })

  it('Release tool should format version correctly', async () => {
    const result = await githubReleaseTool.handler({
      version: '1.0.0',
      changes: ['Feature 1', 'Bug fix 2']
    })
    expect(result.content[0].text).toContain('v1.0.0')
    expect(result.content[0].text).toContain('Feature 1')
    expect(result.content[0].text).toContain('Bug fix 2')
  })

  it('Workflow tool should generate valid YAML', async () => {
    const result = await githubWorkflowTool.handler({
      name: 'Test Workflow',
      trigger: 'push',
      jobs: [
        {
          name: 'Build',
          steps: ['npm install', 'npm run build']
        }
      ]
    })
    expect(result.content[0].text).toContain('name: Test Workflow')
    expect(result.content[0].text).toContain('on:')
    expect(result.content[0].text).toContain('push')
    expect(result.content[0].text).toContain('npm install')
  })
})
