/**
 * Example: Basic Agent Query
 * 
 * Shows how to create an agent and ask simple questions
 */

import { Agent, bashTool, webfetchTool } from '../src/index'

async function main() {
  console.log('🤖 Creating SawCode Agent...\n')

  const agent = new Agent({
    model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    temperature: Number(process.env.AGENT_TEMPERATURE) || 0.7,
    maxTokens: Number(process.env.AGENT_MAX_TOKENS) || 4096,
    tools: [bashTool, webfetchTool],
  })

  // Example 1: Simple query
  console.log('📝 Query 1: What is 2 + 2?')
  const result1 = await agent.query('What is 2 + 2?')
  console.log(`✅ Response: ${result1.response}\n`)

  // Example 2: Follow-up query (maintains context)
  console.log('📝 Query 2: What is that multiplied by 3?')
  const result2 = await agent.query('What is that multiplied by 3?')
  console.log(`✅ Response: ${result2.response}\n`)

  // Example 3: Check message history
  console.log('📝 Message History:')
  const messages = agent.getMessages()
  messages.forEach((msg, i) => {
    console.log(`  ${i + 1}. [${msg.type}] ${msg.content.substring(0, 50)}...`)
  })
  console.log('')
}

main().catch(console.error)
