/**
 * CLI Entry Point for SawCode Agent
 *
 * Run with:
 *   bun src/cli.ts [command] [options]
 */

import { Agent, bashTool, webfetchTool, filereadTool, filewriteTool, listdirTool, grepTool, findTool, treeTool } from './index.js'
import { launchTUI } from './tui/index.js'
import { getAvailableTools } from './utils/feature-flags.js'
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const STATE_FILE = process.env.STATE_DIR ? join(process.env.STATE_DIR, 'agent-state.json') : '.sawcode-state.json'

function loadAgentState(agent: Agent) {
  if (existsSync(STATE_FILE)) {
    try {
      const data = readFileSync(STATE_FILE, 'utf-8')
      const state = JSON.parse(data)
      // Restore messages only - don't overwrite tool registry
      if (state.messages && Array.isArray(state.messages)) {
        // Get current state and only update messages
        const currentState = agent.exportState()
        currentState.messages = state.messages
        agent.importState(currentState)
      }
    } catch (_error) {
      // Silently ignore state load errors
    }
  }
}

function saveAgentState(agent: Agent) {
  try {
    // Create directory if needed
    const dir = dirname(STATE_FILE)
    if (!existsSync(dir) && dir !== '.') {
      mkdirSync(dir, { recursive: true })
    }
    
    const state = agent.exportState()
    // Only save messages and config, not toolRegistry (which has function refs)
    const serializable = {
      messages: state.messages,
      config: state.config,
    }
    writeFileSync(STATE_FILE, JSON.stringify(serializable, null, 2), 'utf-8')
  } catch (error) {
    // Silently ignore save errors
    if (process.env.DEBUG) {
      console.error('Failed to save state:', error)
    }
  }
}

/**
 * Build tools array based on feature flags
 * Only includes tools that are enabled via environment variables
 */
function buildToolsFromFlags(): any[] {
  const tools: any[] = []
  const availableTools = getAvailableTools()

  if (availableTools.bash) {
    tools.push(bashTool)
  }
  if (availableTools.webfetch) {
    tools.push(webfetchTool)
  }
  if (availableTools.fileread) {
    tools.push(filereadTool)
  }
  if (availableTools.filewrite) {
    tools.push(filewriteTool)
  }
  if (availableTools.listdir) {
    tools.push(listdirTool)
  }
  if (availableTools.grep) {
    tools.push(grepTool)
  }
  if (availableTools.find) {
    tools.push(findTool)
  }
  if (availableTools.tree) {
    tools.push(treeTool)
  }
  // Git tools commented out until schemas are fixed in phase 9
  // if (availableTools.gitStatus) {
  //   tools.push(gitStatusTool)
  // }

  return tools
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'tui'

  // Create agent with default tools
  // Use CLAUDE_MODEL as primary, fallback to KILOCODE_MODEL
  const model = process.env.CLAUDE_MODEL || process.env.KILOCODE_MODEL || 'claude-3-5-sonnet-20241022'
  
  // Build tools array based on feature flags
  const tools = buildToolsFromFlags()
  
  const agent = new Agent({
    model,
    temperature: Number(process.env.AGENT_TEMPERATURE) || 0.7,
    maxTokens: Number(process.env.AGENT_MAX_TOKENS) || 4096,
    tools: tools as any,
    systemPrompt: 'You are a helpful AI assistant powered by Claude Code Agent.',
  })

  // Load previous state for all commands except 'reset'
  if (command !== 'reset') {
    loadAgentState(agent)
  }

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
        saveAgentState(agent)
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

    case 'export':
      {
        const format = args[1] || 'json'
        const messages = agent.getMessages()
        
        if (messages.length === 0) {
          console.error('❌ No messages to export')
          process.exit(1)
        }

        if (format === 'json') {
          const state = agent.exportState()
          console.log(JSON.stringify(state, null, 2))
        } else if (format === 'markdown' || format === 'md') {
          console.log('# SawCode Conversation Export\n')
          messages.forEach((msg, i) => {
            const emoji = msg.type === 'user' ? '👤' : msg.type === 'assistant' ? '🤖' : '🔧'
            console.log(`## ${i + 1}. ${emoji} ${msg.type.toUpperCase()}\n`)
            console.log(msg.content + '\n')
          })
        } else if (format === 'csv') {
          console.log('Index,Type,Content')
          messages.forEach((msg, i) => {
            const escaped = msg.content.replace(/"/g, '""')
            console.log(`${i + 1},"${msg.type}","${escaped}"`)
          })
        } else {
          console.error(`❌ Unknown format: ${format}`)
          console.error('Supported: json, markdown (md), csv')
          process.exit(1)
        }
      }
      break

    case 'tools':
      {
        const tools = agent.getTools()
        if (tools.length === 0) {
          console.log('🔧 No tools available')
        } else {
          console.log(`🔧 Available Tools (${tools.length}):\n`)
          tools.forEach((tool, i) => {
            console.log(`${i + 1}. ${tool.name}`)
            console.log(`   ${tool.description}`)
            console.log(`   Input: ${JSON.stringify(tool.inputSchema.shape || {})}`)
            console.log()
          })
        }
      }
      break

    case 'config':
      {
        console.log('⚙️  Current Configuration:\n')
        console.log(`Model: ${model}`)
        console.log(`Temperature: ${Number(process.env.AGENT_TEMPERATURE) || 0.7}`)
        console.log(`Max Tokens: ${Number(process.env.AGENT_MAX_TOKENS) || 4096}`)
        console.log(`API: ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Missing'}`)
        console.log(`DEBUG: ${process.env.DEBUG || 'off'}`)
        console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
        console.log()
        console.log('Tools:')
        agent.getTools().forEach(t => console.log(`  - ${t.name}`))
      }
      break

    case 'reset':
      {
        agent.clearHistory()
        if (existsSync(STATE_FILE)) {
          try {
            unlinkSync(STATE_FILE)
          } catch (_e) {}
        }
        console.log('✅ Conversation history cleared')
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
  console.log('  export [format]      Export history (json|md|csv)')
  console.log('  tools                List available tools')
  console.log('  config               Show current configuration')
  console.log('  reset                Clear conversation history')
  console.log('  help                 Show this help message\n')
  console.log('Examples:')
  console.log('  bun src/cli.ts                               # Start TUI')
  console.log('  bun src/cli.ts query "Hello"                 # Send query')
  console.log('  bun src/cli.ts history                       # Show history')
  console.log('  bun src/cli.ts export json                   # Export as JSON')
  console.log('  bun src/cli.ts export md > conversation.md   # Export as Markdown')
  console.log('  bun src/cli.ts tools                         # List tools')
  console.log('  bun src/cli.ts config                        # Show config')
  console.log('  bun src/cli.ts reset                         # Clear history')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
