/**
 * Simple Agent Example
 *
 * This example demonstrates how to use the Claude Code Agent/Skill
 * with custom tools.
 *
 * Run with:
 *   bun examples/simple-agent.ts
 */

import { Agent, bashTool, webfetchTool } from '../src/index.js'

async function main() {
  // Create agent with tools
  const agent = new Agent({
    model: 'claude-opus-4-6',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [bashTool, webfetchTool],
    systemPrompt: 'You are a helpful AI assistant that can execute bash commands and fetch web content.',
  })

  console.log('🤖 Claude Code Agent initialized')
  console.log(`📦 Available tools: bash, webfetch`)
  console.log('')

  // Example 1: Simple query
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Example 1: Simple Query')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const result1 = await agent.query('What are the top 5 programming languages?')
  console.log('📝 Response:', result1.response)
  console.log('')

  // Example 2: Tool execution
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Example 2: Using Bash Tool')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const result2 = await agent.query('Run the command: echo "Hello from Bun Agent"')
  console.log('📝 Response:', result2.response)
  console.log('')

  // Example 3: Message history
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Example 3: Message History')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const messages = agent.getMessages()
  console.log(`📊 Total messages: ${messages.length}`)
  messages.forEach((msg, idx) => {
    console.log(`  ${idx + 1}. [${msg.type}] ${msg.content.substring(0, 50)}...`)
  })
  console.log('')

  // Example 4: Configuration
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Example 4: Agent Configuration')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const config = agent.getConfig()
  console.log('📋 Current Configuration:')
  console.log(`   Model: ${config.model}`)
  console.log(`   Temperature: ${config.temperature}`)
  console.log(`   Max Tokens: ${config.maxTokens}`)
  console.log('')

  console.log('✅ Agent examples completed!')
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
