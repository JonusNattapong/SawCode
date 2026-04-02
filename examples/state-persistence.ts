/**
 * Example: State Persistence
 * 
 * Shows how to save and resume agent conversation state
 */

import { Agent } from '../src/index'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const STATE_FILE = join(process.cwd(), 'conversation-state.json')

async function main() {
  console.log('💾 Agent State Management\n')

  // Check if we have a saved state
  let agent: Agent
  let isResuming = false

  if (existsSync(STATE_FILE)) {
    console.log('📂 Found saved conversation state, resuming...\n')
    const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'))
    agent = new Agent()
    agent.importState(state)
    isResuming = true
  } else {
    console.log('✨ Creating new agent\n')
    agent = new Agent()
  }

  // Get or display history
  const messages = agent.getMessages()
  if (isResuming) {
    console.log(`📜 Conversation History (${messages.length} messages):`)
    messages.slice(-4).forEach(msg => {
      console.log(`  • [${msg.type}] ${msg.content.substring(0, 50)}...`)
    })
    console.log('')
  }

  // Have a conversation
  console.log('📝 New Query: What is your favorite programming language?')
  const result = await agent.query(
    'What is your favorite programming language?'
  )
  console.log(`✅ Response: ${result.response}\n`)

  // Save state
  const state = agent.exportState()
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
  console.log(`💾 State saved to ${STATE_FILE}`)
  console.log('Run this script again to resume the conversation!')
}

main().catch(console.error)
