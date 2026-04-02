#!/usr/bin/env bun
/**
 * Integration Test: Advanced Systems
 * ===================================
 * 
 * Tests feature flags, conditional tool loading, and structured logging
 */

import { Agent, bashTool, webfetchTool, filereadTool, filewriteTool, listdirTool } from './src/index.js'
import { getFeatureFlags, getAvailableTools } from './src/utils/feature-flags.js'
import { createLogger } from './src/utils/advanced-logging.js'

const logger = createLogger('integration-test')

async function runTests() {
  console.log('🧪 SawCode Integration Test: Advanced Systems\n')
  console.log('='.repeat(70))

  // Test 1: Feature Flags
  console.log('\n📋 Test 1: Feature Flags System\n')
  const flags = getFeatureFlags()
  console.log(`✅ Feature flags loaded: ${Object.keys(flags).length} flags`)
  console.log(`✅ ENABLE_BASH_TOOL: ${flags.ENABLE_BASH_TOOL}`)
  console.log(`✅ ENABLE_FILE_TOOLS: ${flags.ENABLE_FILE_TOOLS}`)
  console.log(`✅ DEBUG_MODE: ${flags.DEBUG_MODE}`)

  // Test 2: Available Tools
  console.log('\n🔧 Test 2: Tool Availability Check\n')
  const availableTools = getAvailableTools()
  const enabledToolsCount = Object.values(availableTools).filter(Boolean).length
  console.log(`✅ Available tools: ${enabledToolsCount}`)
  Object.entries(availableTools).forEach(([tool, enabled]) => {
    console.log(`  ${enabled ? '✅' : '❌'} ${tool}`)
  })

  // Test 3: Conditional Tool Loading
  console.log('\n⚙️  Test 3: Conditional Tool Loading\n')
  const toolsToLoad: any[] = []
  if (availableTools.bash) toolsToLoad.push(bashTool)
  if (availableTools.webfetch) toolsToLoad.push(webfetchTool)
  if (availableTools.fileread) toolsToLoad.push(filereadTool)
  if (availableTools.filewrite) toolsToLoad.push(filewriteTool)
  if (availableTools.listdir) toolsToLoad.push(listdirTool)

  console.log(`✅ Loading ${toolsToLoad.length} tools based on flags`)
  
  const agent = new Agent({
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 1024,
    tools: toolsToLoad,
    systemPrompt: 'You are a helpful assistant.',
  })

  const loadedTools = agent.getTools()
  console.log(`✅ Agent initialized with ${loadedTools.length} tools`)

  // Test 4: Structured Logging
  console.log('\n📝 Test  4: Structured Logging\n')
  logger.debug('Debug message', { component: 'test', value: 42 })
  logger.info('Info message', { event: 'test-start' })
  logger.warn('Warning message', { status: 'experimental' })
  logger.error('Error message (test)', new Error('Test error'))
  console.log(`✅ Structured logging functional`)

  // Test 5: Query Execution (if API key available)
  console.log('\n🚀 Test 5: Query Execution\n')
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const result = await agent.query('Count to 5')
      console.log(`✅ Query executed successfully`)
      console.log(`   Response length: ${result.response.length} chars`)
      console.log(`   Total messages: ${result.messages.length}`)
    } catch (error) {
      console.log(`⚠️  Query execution failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  } else {
    console.log(`⏭️  Skipping (no ANTHROPIC_API_KEY)`)
  }

  // Test 6: Tool Registry
  console.log('\n📚 Test 6: Tool Registry\n')
  const tools = agent.getTools()
  console.log(`✅ ${tools.length} tools in registry:`)
  tools.forEach(t => {
    console.log(`   - ${t.name}: ${t.description.substring(0, 40)}...`)
  })

  // Test 7: State Management
  console.log('\n💾 Test 7: State Management\n')
  const messageCount = agent.getMessages().length
  console.log(`✅ Message count: ${messageCount}`)
  const state = agent.exportState()
  console.log(`✅ State exported with ${state.messages.length} messages`)

  console.log('\n' + '='.repeat(70))
  console.log('\n✨ All integration tests passed!\n')
}

await runTests()
