/**
 * Phase 8: Search & Navigation Tools Example
 *
 * Demonstrates the new search (grep), find, and tree tools for code exploration
 * Built for Claude Code-like workflows: searching code, finding files, viewing structure
 *
 * Run with: bun examples/phase8-search-tools.ts
 */

import { Agent, grepTool, findTool, treeTool } from '../src/index.js'

/**
 * Example 1: Using grep tool to search for patterns
 */
async function demoGrep() {
  console.log('\n' + '='.repeat(60))
  console.log('📋 GREP EXAMPLE - Text Pattern Search')
  console.log('='.repeat(60))

  const agent = new Agent({
    model: 'claude-3-5-sonnet-20241022',
    tools: [grepTool],
  })

  // Example 1a: Search for TypeScript interfaces
  console.log('\n1️⃣ Finding all TypeScript interfaces...')
  const result1 = await grepTool.handler({
    pattern: '^\\s*interface',
    path: './src',
    recursive: true,
    ignoreCase: false,
    maxResults: 5,
  })

  if (result1.content[0].type === 'text') {
    console.log(result1.content[0].text)
  }

  // Example 1b: Case-insensitive search
  console.log('\n2️⃣ Finding export statements (case-insensitive)...')
  const result2 = await grepTool.handler({
    pattern: 'export',
    path: './src',
    recursive: true,
    ignoreCase: true,
    maxResults: 3,
  })

  if (result2.content[0].type === 'text') {
    console.log(result2.content[0].text)
  }
}

/**
 * Example 2: Using find tool to locate files
 */
async function demoFind() {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 FIND EXAMPLE - File Search with Wildcards')
  console.log('='.repeat(60))

  const agent = new Agent({
    model: 'claude-3-5-sonnet-20241022',
    tools: [findTool],
  })

  // Example 2a: Find all TypeScript files
  console.log('\n1️⃣ Finding all TypeScript files...')
  const result1 = await findTool.handler({
    name: '*.ts',
    path: './src',
    type: 'file',
    maxResults: 10,
  })

  if (result1.content[0].type === 'text') {
    console.log(result1.content[0].text)
  }

  // Example 2b: Find specific tool files
  console.log('\n2️⃣ Finding specific pattern (Phase 8 tools)...')
  const result2 = await findTool.handler({
    name: '{grep,find,tree}.ts',
    path: './src/tools',
    type: 'file',
    maxResults: 10,
  })

  if (result2.content[0].type === 'text') {
    console.log(result2.content[0].text)
  }

  // Example 2c: Find directories
  console.log('\n3️⃣ Finding directories in src...')
  const result3 = await findTool.handler({
    name: '*',
    path: './src',
    type: 'dir',
    maxResults: 20,
  })

  if (result3.content[0].type === 'text') {
    console.log(result3.content[0].text)
  }
}

/**
 * Example 3: Using tree tool for project visualization
 */
async function demoTree() {
  console.log('\n' + '='.repeat(60))
  console.log('🌳 TREE EXAMPLE - Project Structure Visualization')
  console.log('='.repeat(60))

  const agent = new Agent({
    model: 'claude-3-5-sonnet-20241022',
    tools: [treeTool],
  })

  // Example 3a: Show project root structure
  console.log('\n1️⃣ Project root structure (depth 2)...')
  const result1 = await treeTool.handler({
    path: '.',
    depth: 2,
  })

  if (result1.content[0].type === 'text') {
    console.log(result1.content[0].text)
  }

  // Example 3b: Show src structure
  console.log('\n2️⃣ Source code structure (depth 3)...')
  const result2 = await treeTool.handler({
    path: './src',
    depth: 3,
  })

  if (result2.content[0].type === 'text') {
    console.log(result2.content[0].text)
  }

  // Example 3c: Show tools subdirectory
  console.log('\n3️⃣ Tools subdirectory (depth 1)...')
  const result3 = await treeTool.handler({
    path: './src/tools',
    depth: 1,
  })

  if (result3.content[0].type === 'text') {
    console.log(result3.content[0].text)
  }
}

/**
 * Example 4: Combined workflow - Search + Find + Tree
 */
async function demoWorkflow() {
  console.log('\n' + '='.repeat(60))
  console.log('🚀 INTEGRATED WORKFLOW - Code Exploration')
  console.log('='.repeat(60))

  const agent = new Agent({
    model: 'claude-3-5-sonnet-20241022',
    tools: [grepTool, findTool, treeTool],
    systemPrompt: `You are a code exploration assistant. Help users understand project structure and find code patterns.`,
  })

  // Step 1: Show structure
  console.log('\n📂 Step 1: Understanding project structure...')
  const treeResult = await treeTool.handler({ path: '.', depth: 2 })
  if (treeResult.content[0].type === 'text') {
    const output = treeResult.content[0].text
    console.log(output.substring(0, 300) + '...')
  }

  // Step 2: Find Phase 8 tools
  console.log('\n🔍 Step 2: Locating Phase 8 tools...')
  const findResult = await findTool.handler({
    name: '*{grep,find,tree}*',
    path: './src',
    type: 'file',
  })
  if (findResult.content[0].type === 'text') {
    console.log(findResult.content[0].text)
  }

  // Step 3: Search for tool export patterns
  console.log('\n🔎 Step 3: Finding tool exports in code...')
  const grepResult = await grepTool.handler({
    pattern: 'export const.*Tool',
    path: './src/tools',
    recursive: false,
    maxResults: 10,
  })
  if (grepResult.content[0].type === 'text') {
    console.log(grepResult.content[0].text)
  }
}

/**
 * Example 5: CLI-style queries
 */
async function demoQueries() {
  console.log('\n' + '='.repeat(60))
  console.log('💬 AGENT QUERIES - Natural Language Search')
  console.log('='.repeat(60))

  const agent = new Agent({
    model: 'claude-3-5-sonnet-20241022',
    tools: [grepTool, findTool, treeTool],
  })

  console.log('\n1️⃣ Query: "Show me the project structure"')
  const result1 = await agent.query('Show me the src directory structure')
  console.log(result1.response)

  console.log('\n2️⃣ Query: "Find all test files"')
  const result2 = await agent.query('Find all test files in the project')
  console.log(result2.response)
}

/**
 * Main - run all examples
 */
async function main() {
  try {
    console.log('\n🚀 SawCode Phase 8 - Search & Navigation Tools\n')

    // Skip demos if we want to focus on one
    const demoMode = process.argv[2] || 'all'

    if (demoMode === 'all' || demoMode === 'grep') {
      await demoGrep()
    }

    if (demoMode === 'all' || demoMode === 'find') {
      await demoFind()
    }

    if (demoMode === 'all' || demoMode === 'tree') {
      await demoTree()
    }

    if (demoMode === 'all' || demoMode === 'workflow') {
      await demoWorkflow()
    }

    if (demoMode === 'all' || demoMode === 'queries') {
      await demoQueries()
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Phase 8 Examples Complete!')
    console.log('='.repeat(60) + '\n')

    process.exit(0)
  } catch (error) {
    console.error('Error running examples:', error)
    process.exit(1)
  }
}

main()
