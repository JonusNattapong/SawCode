/**
 * Example: Tool Usage
 * 
 * Shows how the agent uses bash and webfetch tools
 */

import { Agent, bashTool, webfetchTool } from '../src/index'

async function main() {
  console.log('🔧 SawCode Agent with Tools\n')

  const agent = new Agent({
    tools: [bashTool, webfetchTool],
  })

  // Example 1: Bash tool
  console.log('📝 Query: Show me the current directory')
  const result1 = await agent.query('Show me the current directory')
  console.log(`✅ Response: ${result1.response}\n`)

  // Example 2: Webfetch tool
  console.log('📝 Query: Fetch JSON from httpbin.org')
  const result2 = await agent.query(
    'Fetch https://httpbin.org/json and tell me what you see'
  )
  console.log(`✅ Response: ${result2.response}\n`)

  // Example 3: List available tools
  console.log('📝 Available Tools:')
  agent.getTools().forEach(tool => {
    console.log(`  • ${tool.name}: ${tool.description}`)
  })
}

main().catch(console.error)
