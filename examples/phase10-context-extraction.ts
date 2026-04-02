/**
 * Phase 10: Context Extraction Examples
 *
 * Demonstrates extracting and analyzing code context from files,
 * directories, and git history for better AI understanding.
 *
 * Run with: bun examples/phase10-context-extraction.ts
 */

import {
  Agent,
  contextExtractorTool,
  codeAnalyzerTool,
  gitHistoryAnalyzerTool,
  formatCodeBlock,
  formatTable,
  formatSuccess,
} from '../src/index.js'

/**
 * Example 1: Extract file context
 */
async function demoFileContext() {
  console.log(formatSuccess('\n📄 EXAMPLE 1: Extract File Context'))
  console.log('=''.repeat(60))

  const result = await contextExtractorTool.handler({
    path: 'src/index.ts',
    includeContent: true,
    maxSize: 1000,
  })

  if (result.content[0].type === 'text') {
    const content = JSON.parse(result.content[0].text)
    console.log(JSON.stringify(content, null, 2).substring(0, 500))
  }
}

/**
 * Example 2: Extract directory context
 */
async function demoDirectoryContext() {
  console.log(formatSuccess('\n📁 EXAMPLE 2: Extract Directory Context'))
  console.log('='.repeat(60))

  const result = await contextExtractorTool.handler({
    path: 'src',
    depth: 2,
  })

  if (result.content[0].type === 'text') {
    const content = JSON.parse(result.content[0].text)
    console.log(`\nDirectory: ${content.path}`)
    console.log(`Total Files: ${content.totalFiles}`)
    console.log(`Estimated Lines: ${content.estimatedLines}`)
    console.log('\nFile Types:')
    Object.entries(content.filesByType).forEach(([ext, count]) => {
      console.log(`  ${ext}: ${count}`)
    })
  }
}

/**
 * Example 3: Analyze code structure
 */
async function demoCodeAnalysis() {
  console.log(formatSuccess('\n🔍 EXAMPLE 3: Analyze Code Structure'))
  console.log('='.repeat(60))

  const result = await codeAnalyzerTool.handler({
    filePath: 'src/index.ts',
    language: 'typescript',
    complexity: true,
  })

  if (result.content[0].type === 'text') {
    const analysis = JSON.parse(result.content[0].text)
    console.log(`\nFile: ${analysis.file}`)
    console.log(`Lines: ${analysis.totalLines}`)
    console.log(`Complexity: ${analysis.complexity}`)

    if (analysis.structure) {
      console.log(`\nImports: ${analysis.structure.imports.length}`)
      console.log(`Exports: ${analysis.structure.exports.length}`)
      console.log(`Functions: ${analysis.structure.functions.length}`)
      console.log(`Classes: ${analysis.structure.classes.length}`)
    }
  }
}

/**
 * Example 4: Analyze git history
 */
async function demoGitHistory() {
  console.log(formatSuccess('\n📊 EXAMPLE 4: Analyze Git History'))
  console.log('='.repeat(60))

  const result = await gitHistoryAnalyzerTool.handler({
    path: '.',
    limit: 20,
    stats: true,
  })

  if (result.content[0].type === 'text') {
    const history = JSON.parse(result.content[0].text)
    console.log(`\nTotal Commits: ${history.totalCommits}`)
    console.log(`Timespan: ${history.timespan}`)
    console.log(`Avg Files Changed: ${history.averageFilesChanged}`)

    if (history.topAuthors.length > 0) {
      console.log(`\nTop Authors:`)
      ;(history.topAuthors as [string, number][]).forEach(([author, count]) => {
        console.log(`  ${author}: ${count} commits`)
      })
    }
  }
}

/**
 * Example 5: Integrated workflow - Full project analysis
 */
async function demoFullProjectAnalysis() {
  console.log(formatSuccess('\n🎯 EXAMPLE 5: Full Project Analysis Workflow'))
  console.log('='.repeat(60))

  const agent = new Agent({
    model: 'claude-opus-4-6',
    tools: [contextExtractorTool, codeAnalyzerTool, gitHistoryAnalyzerTool],
  })

  console.log('\n1️⃣ Step 1: Get project structure...')
  const contextResult = await contextExtractorTool.handler({
    path: '.',
    depth: 1,
  })

  if (contextResult.content[0].type === 'text') {
    const context = JSON.parse(contextResult.content[0].text)
    console.log(`   📦 Found ${context.totalFiles} files`)
    console.log(`   📈 ${context.estimatedLines} total lines of code`)
  }

  console.log('\n2️⃣Step 2: Analyze main entry point...')
  const analysisResult = await codeAnalyzerTool.handler({
    filePath: 'src/index.ts',
    complexity: true,
  })

  if (analysisResult.content[0].type === 'text') {
    const analysis = JSON.parse(analysisResult.content[0].text)
    console.log(`   🔧 Main agent class with ${analysis.structure.exports.length} exports`)
    console.log(`   ⚙️  Complexity score: ${analysis.complexity}`)
  }

  console.log('\n3️⃣ Step 3: Review development history...')
  const historyResult = await gitHistoryAnalyzerTool.handler({
    path: '.',
    limit: 10,
  })

  if (historyResult.content[0].type === 'text') {
    const history = JSON.parse(historyResult.content[0].text)
    console.log(`   📅 ${history.totalCommits} commits analyzed`)
    console.log(`   👥 ${history.topAuthors.length} active contributors`)
  }

  console.log('\n✅ Full project analysis complete!')
}

/**
 * Example 6: Context extraction with agent query
 */
async function demoAgentQuery() {
  console.log(formatSuccess('\n🤖 EXAMPLE 6: Agent Query with Context Extraction'))
  console.log('='.repeat(60))

  const agent = new Agent({
    model: 'claude-opus-4-6',
    tools: [contextExtractorTool, codeAnalyzerTool, gitHistoryAnalyzerTool],
  })

  // Simulate an agent query that uses context extraction
  console.log('\n🔍 Query: "Analyze the SawCode project structure"')
  console.log('\nAgent would:')
  console.log('  1. Use contextExtractorTool to get project overview')
  console.log('  2. Use codeAnalyzerTool to understand key files')
  console.log('  3. Use gitHistoryAnalyzerTool to review development')
  console.log('  4. Provide comprehensive project insights')

  // Show available tools
  console.log('\n📚 Available Tools:')
  agent.getTools().forEach((tool) => {
    console.log(`  • ${tool.name}: ${tool.description}`)
  })
}

/**
 * Run all examples
 */
async function main() {
  console.log('\n' + '🚀 '.repeat(20))
  console.log('PHASE 10: CONTEXT EXTRACTION')
  console.log('🚀 '.repeat(20))

  try {
    await demoFileContext()
    await demoDirectoryContext()
    await demoCodeAnalysis()
    await demoGitHistory()
    await demoFullProjectAnalysis()
    await demoAgentQuery()

    console.log('\n' + formatSuccess('✨ All Phase 10 examples completed!'))
    console.log('\n📖 Key Learnings:')
    console.log('  • contextExtractorTool: Extract file/directory context')
    console.log('  • codeAnalyzerTool: Analyze code structure & complexity')
    console.log('  • gitHistoryAnalyzerTool: Review development patterns')
    console.log('  • Use together for comprehensive project understanding')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
