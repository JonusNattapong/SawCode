import { Agent } from '../src/index.js'
import { 
  gitStatusTool, 
  gitDiffTool, 
  gitLogTool, 
  gitBranchTool,
  gitAddTool,
  gitCommitTool
} from '../src/tools/git.js'
import { 
  githubPRHelperTool,
  githubIssueTemplateTool,
  githubReleaseTool,
  githubWorkflowTool
} from '../src/tools/github.js'

const agent = new Agent({
  name: 'git-github-agent',
  model: 'claude-3-5-sonnet-20241022'
})

// Add Git tools
agent.addTool(gitStatusTool)
agent.addTool(gitDiffTool)
agent.addTool(gitLogTool)
agent.addTool(gitBranchTool)
agent.addTool(gitAddTool)
agent.addTool(gitCommitTool)

// Add GitHub tools
agent.addTool(githubPRHelperTool)
agent.addTool(githubIssueTemplateTool)
agent.addTool(githubReleaseTool)
agent.addTool(githubWorkflowTool)

async function runExamples() {
  console.log('=== Phase 9: Git & GitHub Tools ===\n')
  
  // Example 1: Check git status
  console.log('📊 Example 1: Check Git Status')
  const statusResult = await agent.query('Check the current git status')
  console.log(statusResult.response)
  console.log('\n---\n')
  
  // Example 2: View recent commits
  console.log('📜 Example 2: View Commit History')
  const logResult = await agent.query('Show the last 5 commits')
  console.log(logResult.response)
  console.log('\n---\n')
  
  // Example 3: Generate PR template
  console.log('📝 Example 3: Generate PR Template')
  const prResult = await agent.query(
    'Create a pull request template for "Add Phase 9 Git Tools" feature'
  )
  console.log(prResult.response)
  console.log('\n---\n')
  
  // Example 4: Generate issue template
  console.log('🐛 Example 4: Generate Issue Template')
  const issueResult = await agent.query(
    'Create a bug report template for a critical issue'
  )
  console.log(issueResult.response)
  console.log('\n---\n')
  
  // Example 5: Generate release notes
  console.log('🚀 Example 5: Generate Release Notes')
  const releaseResult = await agent.query(
    'Create release notes for version 0.9.0 with features: Git tools, GitHub tools, PR templates'
  )
  console.log(releaseResult.response)
  console.log('\n---\n')
  
  // Example 6: Generate GitHub Actions workflow
  console.log('⚙️  Example 6: Generate GitHub Actions Workflow')
  const workflowResult = await agent.query(
    'Create a GitHub Actions workflow for testing and building on push'
  )
  console.log(workflowResult.response)
  console.log('\n---\n')
  
  // Example 7: Git diff command
  console.log('📋 Example 7: View Changes')
  const diffResult = await agent.query(
    'Show me the git diff for unstaged changes'
  )
  console.log(diffResult.response)
  console.log('\n---\n')
  
  // Example 8: Workflow - Create and commit
  console.log('🔄 Example 8: Workflow - Stage and Commit')
  const workflowMsg = await agent.query(
    'Stage all changes and create a commit with message "feat: Phase 9 complete"'
  )
  console.log(workflowMsg.response)
  console.log('\n---\n')
  
  console.log('✅ Phase 9 examples complete!')
}

runExamples().catch(console.error)

  const prResult = await prHelperTool.handler({
    action: 'status',
    branch: 'main',
  })

  if (prResult.content[0].type === 'text') {
    console.log(prResult.content[0].text)
  }

  // Show example commands
  console.log('\n2️⃣ PR workflow examples (requires gh CLI):')
  console.log('  - pr-helper --action list')
  console.log('  - pr-helper --action status --branch feature/new-feature')
  console.log('  - pr-helper --action check-ci --branch feature/new-feature')
  console.log('  - pr-helper --action create --title "Feature" --body "Description"')
}

/**
 * Example 5: Agent workflow - Automated git checks
 */
async function demoAgentWorkflow() {
  console.log('\n' + '='.repeat(60))
  console.log('🤖 AGENT WORKFLOW - Automated Git Checks')
  console.log('='.repeat(60))

  const agent = new Agent({
    model: 'claude-3-5-sonnet-20241022',
    tools: [gitStatusTool, gitDiffTool, branchHelperTool, prHelperTool],
    systemPrompt: `You are a Git workflow assistant. Help users manage repositories, check status, and automate PR workflows.`,
  })

  console.log('\n1️⃣ Query: "Show me the current git status"')
  const status = await agent.query('Show me the current repository status')
  console.log(status.response)

  console.log('\n2️⃣ Query: "What changes are staged?"')
  const diff = await agent.query('Show me what changes are staged for commit')
  console.log(diff.response)

  console.log('\n3️⃣ Query: "List all branches"')
  const branches = await agent.query('List all git branches in this repository')
  console.log(branches.response)
}

/**
 * Example 6: Complex workflow - PR creation simulation
 */
async function demoComplexWorkflow() {
  console.log('\n' + '='.repeat(60))
  console.log('⚙️ COMPLEX WORKFLOW - PR Creation Flow')
  console.log('='.repeat(60))

  console.log(`
Typical Phase 9 Workflow:

1. Check current status
   → gitStatusTool shows branch, uncommitted changes

2. Create feature branch
   → branchHelperTool creates 'feature/my-feature' from 'main'

3. Make commits and check diff
   → gitDiffTool shows what changed

4. Create PR
   → prHelperTool creates PR via GitHub API

5. Monitor CI checks
   → prHelperTool checks CI status

6. Merge and clean up
   → branchHelperTool deletes feature branch

All automated via agent commands!
  `.trim())
}

/**
 * Main - run all examples
 */
async function main() {
  try {
    console.log('\n🚀 SawCode Phase 9 - Git & GitHub Integration\n')

    const demoMode = process.argv[2] || 'all'

    if (demoMode === 'all' || demoMode === 'status') {
      await demoGitStatus()
    }

    if (demoMode === 'all' || demoMode === 'diff') {
      await demoGitDiff()
    }

    if (demoMode === 'all' || demoMode === 'branch') {
      await demoBranchHelper()
    }

    if (demoMode === 'all' || demoMode === 'pr') {
      await demoPRHelper()
    }

    if (demoMode === 'all' || demoMode === 'agent') {
      await demoAgentWorkflow()
    }

    if (demoMode === 'all' || demoMode === 'workflow') {
      await demoComplexWorkflow()
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Phase 9 Examples Complete!')
    console.log('='.repeat(60) + '\n')

    process.exit(0)
  } catch (error) {
    console.error('Error running examples:', error)
    process.exit(1)
  }
}

main()
