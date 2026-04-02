import { createTool } from './index.js'
import { z } from 'zod'

export const githubPRHelperSchema = z.object({
  title: z.string(),
  description: z.string(),
  labels: z.array(z.string()).optional(),
  draft: z.boolean().optional().default(false)
})

export const githubPRHelperTool = createTool(
  'github-pr-helper',
  'Generate PR template and checklist',
  githubPRHelperSchema,
  async ({ title, description, labels, draft }) => {
    const labelList = labels?.join(', ') || 'enhancement, docs'
    const draftPrefix = draft ? '[DRAFT] ' : ''
    
    const template = `# ${draftPrefix}${title}

## Description
${description}

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have documented my changes
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests passed locally

## Related Issues
Closes: #

## Labels
${labelList}
`
    
    return {
      content: [{
        type: 'text',
        text: template
      }]
    }
  }
)

export const githubIssueTemplateSchema = z.object({
  type: z.enum(['bug', 'feature', 'docs', 'discussion']),
  title: z.string(),
  details: z.string()
})

export const githubIssueTemplateTool = createTool(
  'github-issue-template',
  'Generate GitHub issue template',
  githubIssueTemplateSchema,
  async ({ type, title, details }) => {
    const templates: Record<string, string> = {
      bug: `## Bug Report
### Describe the bug
${details}

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior


### Actual Behavior


### Environment
- OS:
- Version:
- Node/Bun:
`,
      feature: `## Feature Request
### Description
${details}

### Motivation
Why should this feature be implemented?

### Proposed Solution


### Alternatives
Any alternative solutions?

### Additional Context
`,
      docs: `## Documentation Update
### What needs documenting?
${details}

### Current State


### Proposed Changes


### Related Issues
`,
      discussion: `## Discussion
### Topic
${details}

### Context


### Questions
`
    }
    
    return {
      content: [{
        type: 'text',
        text: `# ${type.toUpperCase()}: ${title}\n\n${templates[type]}`
      }]
    }
  }
)

export const githubReleaseSchema = z.object({
  version: z.string(),
  changes: z.array(z.string()),
  date: z.string().optional()
})

export const githubReleaseTool = createTool(
  'github-release',
  'Generate release notes',
  githubReleaseSchema,
  async ({ version, changes, date }) => {
    const releaseDate = date || new Date().toISOString().split('T')[0]
    
    const releaseNotes = `# Release v${version}

**Released**: ${releaseDate}

## Changes

${changes.map(change => `- ${change}`).join('\n')}

## Installation

\`\`\`bash
bun add sawcode@${version}
\`\`\`

## Breaking Changes
None

## Known Issues
None

## Thanks
Thanks to the community for contributions and feedback!
`
    
    return {
      content: [{
        type: 'text',
        text: releaseNotes
      }]
    }
  }
)

export const githubWorkflowSchema = z.object({
  name: z.string(),
  trigger: z.enum(['push', 'pull_request', 'schedule']),
  jobs: z.array(z.object({
    name: z.string(),
    steps: z.array(z.string())
  }))
})

export const githubWorkflowTool = createTool(
  'github-workflow',
  'Generate GitHub Actions workflow',
  githubWorkflowSchema,
  async ({ name, trigger, jobs }) => {
    const triggers: Record<string, string> = {
      push: `on:
  push:
    branches: [main, develop]`,
      pull_request: `on:
  pull_request:
    branches: [main, develop]`,
      schedule: `on:
  schedule:
    - cron: '0 0 * * *'`
    }
    
    const jobsYaml = jobs.map(job => `
  ${job.name.replace(/\s+/g, '_')}:
    runs-on: ubuntu-latest
    steps:
${job.steps.map(step => `      - run: ${step}`).join('\n')}
`).join('\n')
    
    const workflow = `name: ${name}

${triggers[trigger]}

jobs:${jobsYaml}
`
    
    return {
      content: [{
        type: 'text',
        text: workflow
      }]
    }
  }
)

export const githubSchema = {
  githubPRHelper: githubPRHelperSchema,
  githubIssueTemplate: githubIssueTemplateSchema,
  githubRelease: githubReleaseSchema,
  githubWorkflow: githubWorkflowSchema
}
