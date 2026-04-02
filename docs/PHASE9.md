# Phase 9: Git & GitHub Integration

**Status**: ✅ Complete  
**Release Date**: April 2, 2026  
**Files Added**: `src/tools/git.ts`, `src/tools/github.ts`  
**Example**: `examples/phase9-git-workflows.ts`

## Overview

Phase 9 adds comprehensive Git and GitHub integration capabilities to SawCode, enabling automated git operations, workflow management, and GitHub-specific tasks like PR templates, issue tracking, and CI/CD workflows.

## Features

### Git Tools
- ✅ Current branch detection
- ✅ Tracking status (ahead/behind remote)
- ✅ Change counts (staged, unstaged, untracked)
- ✅ Conflict detection
- ✅ Last commit message

---

## 2. Git Diff Tool

### Purpose
Show differences between commits, branches, or working tree. Useful for reviewing changes before commit/push.

### API

```typescript
import { gitDiffTool } from '@sawcode/agent'

const result = await gitDiffTool.handler({
  path?: string,        // Repository path
  from?: string,        // Start commit/branch (default: HEAD)
  to?: string,          // End commit/branch (default: working tree)
  staged?: boolean,     // Show staged changes only
  stat?: boolean,       // Show stat summary only
})
```

### Examples

#### Show all changes (summary)
```typescript
await gitDiffTool.handler({
  stat: true,
})
```

#### Show staged changes
```typescript
await gitDiffTool.handler({
  staged: true,
})
```

#### Show diff between branches
```typescript
await gitDiffTool.handler({
  from: 'main',
  to: 'feature/new-feature',
})
```

### Features
- ✅ Unified diff format
- ✅ Stat-only mode (quick review)
- ✅ Staged vs unstaged
- ✅ Branch-to-branch diffs
- ✅ Configurable output limits

---

## 3. Branch Helper Tool

### Purpose
Manage Git branches: create, switch, delete, rename with safe operations.

### API

```typescript
import { branchHelperTool } from '@sawcode/agent'

const result = await branchHelperTool.handler({
  action: 'list' | 'create' | 'switch' | 'delete' | 'rename',
  name?: string,        // Branch name
  from?: string,        // Base branch for create
  newName?: string,     // New name for rename
  path?: string,        // Repository path
})
```

### Examples

#### List all branches
```typescript
await branchHelperTool.handler({
  action: 'list',
})
```

#### Create feature branch
```typescript
await branchHelperTool.handler({
  action: 'create',
  name: 'feature/user-auth',
  from: 'main',
})
```

#### Switch branch
```typescript
await branchHelperTool.handler({
  action: 'switch',
  name: 'feature/user-auth',
})
```

#### Delete branch
```typescript
await branchHelperTool.handler({
  action: 'delete',
  name: 'old-feature',
})
```

#### Rename branch
```typescript
await branchHelperTool.handler({
  action: 'rename',
  name: 'old-name',
  newName: 'new-name',
})
```

### Features
- ✅ List local and remote branches
- ✅ Create from specific base branch
- ✅ Safe branch switching
- ✅ Delete with confirmation
- ✅ Rename operations

---

## 4. PR Helper Tool

### Purpose
GitHub PR lifecycle automation: create, check status, list, monitor CI checks. Requires GitHub CLI (`gh`).

### API

```typescript
import { prHelperTool } from '@sawcode/agent'

const result = await prHelperTool.handler({
  action: 'status' | 'create' | 'list' | 'check-ci',
  repo?: string,        // owner/repo format
  branch?: string,      // Feature branch
  title?: string,       // PR title
  body?: string,        // PR description
  base?: string,        // Base branch (default: main)
})
```

### Examples

#### Check PR status
```typescript
await prHelperTool.handler({
  action: 'status',
  branch: 'feature/new-feature',
})
```

#### Create PR
```typescript
await prHelperTool.handler({
  action: 'create',
  title: 'Add user authentication',
  body: 'Implements OAuth2 login flow',
  branch: 'feature/user-auth',
  base: 'main',
})
```

#### List open PRs
```typescript
await prHelperTool.handler({
  action: 'list',
})
```

#### Check CI status
```typescript
await prHelperTool.handler({
  action: 'check-ci',
  branch: 'feature/new-feature',
})
```

### Features
- ✅ PR creation with templates
- ✅ Status checking (reviews, state)
- ✅ CI check monitoring
- ✅ Auto-detect repository
- ✅ Requires: `gh` CLI installed

### Setup: GitHub CLI

```bash
# macOS
brew install gh

# Windows
winget install GitHub.CLI

# Linux
sudo apt install gh

# Then login
gh auth login
```

---

## Integration with CLI

### Feature Flags

Phase 9 tools enabled by default:

```bash
SAWCODE_ENABLE_GIT_STATUS_TOOL=true
SAWCODE_ENABLE_GIT_DIFF_TOOL=true
SAWCODE_ENABLE_PR_HELPER_TOOL=true
SAWCODE_ENABLE_BRANCH_HELPER_TOOL=true
```

Disable if needed:
```bash
SAWCODE_ENABLE_GIT_STATUS_TOOL=false bun src/cli.ts tui
```

### Agent Usage

```typescript
import { Agent, gitStatusTool, gitDiffTool, branchHelperTool, prHelperTool } from '@sawcode/agent'

const agent = new Agent({
  tools: [gitStatusTool, gitDiffTool, branchHelperTool, prHelperTool],
})

await agent.query('Show git status and staged changes')
```

---

## Typical Workflows

### Workflow 1: Feature Branch Creation & PR

```
1. Check status
   gitStatusTool → see current branch and changes

2. Create feature branch
   branchHelperTool --action create --name feature/xyz --from main

3. Make changes and commits
   (in editor or CLI)

4. Review changes
   gitDiffTool --staged true

5. Create PR
   prHelperTool --action create --title "Feature XYZ"

6. Monitor CI
   prHelperTool --action check-ci --branch feature/xyz

7. Merge via GitHub (or gh pr merge)

8. Clean up
   branchHelperTool --action delete --name feature/xyz
```

### Workflow 2: Conflict Resolution

```
1. Check status
   gitStatusTool → see conflicts

2. View conflicting diffs
   gitDiffTool → understand changes

3. Resolve conflicts manually

4. Stage resolved files
   (CLI: git add .)

5. Verify status
   gitStatusTool → verify resolved

6. Commit
   git commit -m "Resolve conflicts"
```

### Workflow 3: Code Review

```
1. List PRs
   prHelperTool --action list

2. Check specific PR
   prHelperTool --action status --branch feature/xyz

3. Review diff
   gitDiffTool --from main --to feature/xyz

4. Check CI
   prHelperTool --action check-ci --branch feature/xyz

5. Post comments
   (via GitHub Web UI or gh pr comment)
```

---

## Implementation Details

### git-status.ts (150 lines)
- Parse `git status --porcelain` output
- Extract branch from `git status --branch`
- Count staged, unstaged, untracked, conflicts
- Get remote URL and last commit message

### git-diff.ts (90 lines)
- Run `git diff` with configurable flags
- Support `--stat`, `--cached`, commit ranges
- Limit output to 100 lines preview
- Format as markdown code block

### branch-helper.ts (170 lines)
- Git branch operations via `git branch` commands
- List with `git branch -a --format`
- Create with `git checkout -b`
- Switch, delete, rename via standard git commands

### pr-helper.ts (180 lines)
- GitHub CLI (`gh`) integration
- Auto-detect owner/repo from git remote
- Support create, list, status, check-ci actions
- Graceful fallback if gh CLI not installed

---

## Usage Patterns

### Pattern 1: Daily Stand-up Status

```typescript
// Quick check at start of day
const status = await gitStatusTool.handler({ path: '.' })
// Shows: branch, ahead/behind, uncommitted changes
```

### Pattern 2: Pre-commit Review

```typescript
// Review what will be committed
const diffs = await gitDiffTool.handler({ staged: true })
// Shows: all staged changes
```

### Pattern 3: Feature Branch Workflow

```typescript
// Create and track feature
await branchHelperTool.handler({
  action: 'create',
  name: 'feature/user-profile',
  from: 'main'
})

// ... make changes ...

// Create PR
await prHelperTool.handler({
  action: 'create',
  title: 'Add user profile page',
  branch: 'feature/user-profile'
})
```

### Pattern 4: CI Monitoring

```typescript
// Check CI status periodically
while (true) {
  const checks = await prHelperTool.handler({
    action: 'check-ci',
    branch: 'feature/xyz'
  })
  // Wait, then repeat
}
```

---

## Performance & Limitations

### Known Limitations

- **PR Helper**: Requires `gh` CLI installed and authenticated
- **Diff Output**: Limited to 100 lines preview (configurable)
- **Branch Operations**: Local only (no direct remote operations yet)
- **Conflict Detection**: Basic (counts AA, dd, UU patterns)

### Optimization Tips

1. Use `--stat` flag for large diffs
2. Use `--staged` to check only staged changes
3. Check branch existence before switching
4. Cache PR list if querying frequently

---

## Error Handling

All tools gracefully handle errors:

```typescript
// Not a git repository
{
  content: [{
    type: 'text',
    text: 'Error: Not a git repository'
  }]
}

// gh CLI not installed
{
  content: [{
    type: 'text',
    text: '[PR Tool needs gh CLI installed]'
  }]
}
```

---

## Testing

### Run Examples

```bash
# All examples
bun examples/phase9-git-workflows.ts

# Specific demo
bun examples/phase9-git-workflows.ts status
bun examples/phase9-git-workflows.ts branch
bun examples/phase9-git-workflows.ts pr
bun examples/phase9-git-workflows.ts agent
bun examples/phase9-git-workflows.ts workflow
```

### Manual Testing

```bash
# Test git-status
bun -e "
import { gitStatusTool } from './src/index.js'
const r = await gitStatusTool.handler({ path: '.' })
console.log(r.content[0].text)
"

# Test branches
bun -e "
import { branchHelperTool } from './src/index.js'
const r = await branchHelperTool.handler({ action: 'list' })
console.log(r.content[0].text)
"
```

---

## Future Enhancements (Phase 10+)

- Commit message templates
- Automatic changelog generation
- Conflict auto-resolution suggestions
- Code review automation (with AI)
- Merge conflict visualization
- Branch protection rule checks
- Automatic dependency updates

---

## Completion Checklist

- ✅ git-status.ts (150 lines)
- ✅ git-diff.ts (90 lines)
- ✅ branch-helper.ts (170 lines)
- ✅ pr-helper.ts (180 lines)
- ✅ Feature flags integration
- ✅ CLI integration
- ✅ Tool exports and integration
- ✅ Type-check & build passed
- ✅ Examples (600+ lines)
- ✅ Documentation (this file)

---

**Phase 9 Status:** ✅ COMPLETE - Production Ready  
**Lines of Code:** 590 (tools) + 600 (examples) + docs  
**Dependencies:** git (local), gh (optional for PR features)  
**Next Phase:** Phase 10 - Context Extraction
