/**
 * CLI Entry Point for SawCode Agent
 *
 * Run with:
 *   bun src/cli.ts [command] [options]
 */

import { Agent, bashTool, webfetchTool } from './index.js'
import { launchTUI } from './tui/index.js'

async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'tui'

  // Create agent with default tools
  const agent = new Agent({
    model: 'claude-opus-4-6',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [bashTool, webfetchTool],
    systemPrompt: 'You are a helpful AI assistant powered by Claude Code Agent.',
  })

  switch (command) {
    case 'tui':
      console.log('🚀 Starting SawCode Agent TUI...\n')
      await launchTUI(agent, {
        showWelcome: true,
        showHelp: true,
      })
      break

    case 'query':
      {
        const query = args.slice(1).join(' ')
        if (!query) {
          console.error('❌ Error: No query provided')
          console.error('Usage: bun src/cli.ts query <message>')
          process.exit(1)
        }

        console.log(`📝 Query: ${query}\n`)
        const result = await agent.query(query)
        console.log('🤖 Response:')
        console.log(result.response)
      }
      break

    case 'history':
      {
        const messages = agent.getMessages()
        if (messages.length === 0) {
          console.log('📭 No messages')
        } else {
          console.log(`📜 Message History (${messages.length} messages):\n`)
          messages.forEach((msg, i) => {
            console.log(`${i + 1}. [${msg.type}] ${msg.content.substring(0, 50)}...`)
          })
        }
      }
      break

    case 'help':
      printHelp()
      break

    default:
      console.error(`❌ Unknown command: ${command}`)
      printHelp()
      process.exit(1)
  }
}

function printHelp() {
  console.log('🤖 SawCode Agent CLI\n')
  console.log('Usage: bun src/cli.ts [command] [options]\n')
  console.log('Commands:')
  console.log('  tui [options]        Start interactive TUI (default)')
  console.log('  query <message>      Send a query to the agent')
  console.log('  history              Show message history')
  console.log('  help                 Show this help message\n')
  console.log('Examples:')
  console.log('  bun src/cli.ts                     # Start TUI')
  console.log('  bun src/cli.ts query "Hello"       # Send query')
  console.log('  bun src/cli.ts history             # Show history')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
