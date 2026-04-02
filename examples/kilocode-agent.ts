/**
 * KiloCode Agent Example
 *
 * Demonstrates how to use KiloCode API provider with SawCode Agent
 *
 * Run with:
 *   bun examples/kilocode-agent.ts
 *
 * Make sure to set KILOCODE_TOKEN in .env first!
 */

import { Agent, createKiloCodeTool, kilocode, validateEnv } from '../src/index.js'

async function main() {
  console.log('🚀 SawCode Agent with KiloCode Integration\n')

  // Validate KiloCode is configured
  try {
    validateEnv(['KILOCODE_TOKEN'])
  } catch {
    console.error('❌ KILOCODE_TOKEN not set in .env')
    console.error('📝 Copy .env.example to .env and add your KiloCode token')
    process.exit(1)
  }

  // Example 1: Direct KiloCode API calls
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Example 1: Direct KiloCode API Calls')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const userResponse = await kilocode.getUser()

    if (userResponse.success) {
      console.log('✅ Current User:')
      console.log(JSON.stringify(userResponse.data, null, 2))
    } else {
      console.log('❌ Error:', userResponse.error)
    }
  } catch (error) {
    console.error('❌ Failed:', error)
  }

  console.log('')

  // Example 2: List projects
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Example 2: List KiloCode Projects')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const projectsResponse = await kilocode.listProjects()

    if (projectsResponse.success && projectsResponse.data) {
      console.log(`✅ Found ${projectsResponse.data.length} projects:`)
      projectsResponse.data.forEach((project, idx) => {
        console.log(`   ${idx + 1}. ${project.name} (ID: ${project.id})`)
      })
    } else {
      console.log('❌ Error:', projectsResponse.error)
    }
  } catch (error) {
    console.error('❌ Failed:', error)
  }

  console.log('')

  // Example 3: Using with Agent
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Example 3: Agent with KiloCode Tool')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Create agent with KiloCode tool
    const agent = new Agent({
      model: 'claude-opus-4-6',
      tools: [createKiloCodeTool()],
      systemPrompt: 'You are an AI assistant that can access KiloCode API to help manage projects and user data.',
    })

    console.log('🤖 Agent created with KiloCode tool')
    console.log('📍 Available tools:', agent.getConfig().tools?.map(t => t.name).join(', '))
    console.log('')

    // Query agent
    const result = await agent.query('Get my KiloCode user information')

    console.log('📝 Agent Response:')
    console.log(result.response)
  } catch (error) {
    console.error('❌ Agent error:', error)
  }

  console.log('')

  // Example 4: Client configuration
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Example 4: Client Configuration')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const client = kilocode.client()

    console.log('✅ KiloCode Client Configuration:')
    console.log(`   API URL: ${client.getApiUrl()}`)
    console.log(`   Authenticated: ${client.isAuthenticated() ? '✅' : '❌'}`)
    console.log('')
  } catch (error) {
    console.error('❌ Failed:', error)
  }

  // Example 5: Custom API calls
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Example 5: Custom API Calls')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Make a custom API call
    const response = await kilocode.call('GET', '/api/v1/users/me')

    if (response.success) {
      console.log('✅ Custom API Call Success:')
      console.log(`   User ID: ${response.data?.id || 'N/A'}`)
      console.log(`   Endpoint: /api/v1/users/me`)
    } else {
      console.log('❌ Error:', response.error)
    }
  } catch (error) {
    console.error('❌ Failed:', error)
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ KiloCode integration examples complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
