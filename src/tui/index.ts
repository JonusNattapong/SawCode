/**
 * TUI (Terminal User Interface) for SawCode Agent
 *
 * Interactive CLI interface for the agent with message history,
 * tool selection, and real-time output.
 */

import * as readline from 'readline'
import type { Agent } from '../index.js'
import type { ToolDefinition } from '../types.js'

export interface TUIConfig {
  prompt?: string
  showWelcome?: boolean
  showHelp?: boolean
  maxHistoryLines?: number
}

export class AgentTUI {
  private agent: Agent
  private rl: readline.Interface
  private running: boolean = false
  private config: Required<TUIConfig>

  constructor(agent: Agent, config: TUIConfig = {}) {
    this.agent = agent
    this.config = {
      prompt: '> ',
      showWelcome: true,
      showHelp: true,
      maxHistoryLines: 50,
      ...config,
    }

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    })
  }

  /**
   * Start the TUI
   */
  async start(): Promise<void> {
    this.running = true

    if (this.config.showWelcome) {
      this.printWelcome()
    }

    if (this.config.showHelp) {
      this.printHelp()
    }

    await this.mainLoop()
  }

  /**
   * Main REPL loop
   */
  private async mainLoop(): Promise<void> {
    while (this.running) {
      const input = await this.prompt(this.config.prompt)

      if (!input.trim()) {
        continue
      }

      await this.handleCommand(input)
    }
  }

  /**
   * Handle user commands
   */
  private async handleCommand(input: string): Promise<void> {
    const [command, ...args] = input.trim().split(/\s+/)

    switch (command.toLowerCase()) {
      case 'help':
        this.printHelp()
        break

      case 'history':
        this.printHistory()
        break

      case 'clear':
        this.agent.clearHistory()
        console.log('✅ History cleared')
        break

      case 'tools':
        this.printTools()
        break

      case 'config':
        this.printConfig()
        break

      case 'export':
        await this.exportState(args[0])
        break

      case 'import':
        await this.importState(args[0])
        break

      case 'exit':
      case 'quit':
        this.running = false
        console.log('👋 Goodbye!')
        break

      default:
        // Treat as a query to the agent
        await this.queryAgent(input)
    }
  }

  /**
   * Send query to agent
   */
  private async queryAgent(input: string): Promise<void> {
    try {
      console.log('\n⏳ Processing...\n')

      const result = await this.agent.query(input)

      console.log('🤖 Agent Response:')
      console.log('─'.repeat(50))
      console.log(result.response)
      console.log('─'.repeat(50))
      console.log('')
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error))
      console.log('')
    }
  }

  /**
   * Print welcome message
   */
  private printWelcome(): void {
    console.clear()
    console.log('╔═══════════════════════════════════════════════════════╗')
    console.log('║         🤖 SawCode Claude Agent - TUI Interface        ║')
    console.log('║                                                       ║')
    console.log('║  An interactive agent with custom tools and features ║')
    console.log('╚═══════════════════════════════════════════════════════╝')
    console.log('')
  }

  /**
   * Print help message
   */
  private printHelp(): void {
    console.log('📚 Available Commands:')
    console.log('  help       - Show this help message')
    console.log('  history    - Show message history')
    console.log('  clear      - Clear message history')
    console.log('  tools      - List available tools')
    console.log('  config     - Show current configuration')
    console.log('  export     - Export state to file')
    console.log('  import     - Import state from file')
    console.log('  exit/quit  - Exit the TUI')
    console.log('')
    console.log('💡 Tip: Type anything else to query the agent!')
    console.log('')
  }

  /**
   * Print message history
   */
  private printHistory(): void {
    const messages = this.agent.getMessages()

    if (messages.length === 0) {
      console.log('📭 No messages yet')
      console.log('')
      return
    }

    console.log(`\n📜 Message History (${messages.length} messages):`)
    console.log('─'.repeat(50))

    const start = Math.max(0, messages.length - this.config.maxHistoryLines)
    for (let i = start; i < messages.length; i++) {
      const msg = messages[i]
      const prefix =
        msg.type === 'user'
          ? '👤'
          : msg.type === 'assistant'
            ? '🤖'
            : msg.type === 'tool_result'
              ? '🔧'
              : '•'

      const content = msg.content.substring(0, 60)
      console.log(`${prefix} [${msg.type}] ${content}${msg.content.length > 60 ? '...' : ''}`)
    }

    console.log('─'.repeat(50))
    console.log('')
  }

  /**
   * Print available tools
   */
  private printTools(): void {
    const config = this.agent.getConfig()
    const tools = config.tools || []

    console.log(`\n🔧 Available Tools (${tools.length}):`)
    console.log('─'.repeat(50))

    if (tools.length === 0) {
      console.log('  (No tools configured)')
    } else {
      tools.forEach((tool: ToolDefinition) => {
        console.log(`  • ${tool.name}`)
        console.log(`    ${tool.description}`)
      })
    }

    console.log('─'.repeat(50))
    console.log('')
  }

  /**
   * Print configuration
   */
  private printConfig(): void {
    const config = this.agent.getConfig()

    console.log('\n⚙️  Configuration:')
    console.log('─'.repeat(50))
    console.log(`  Model:        ${config.model || 'not set'}`)
    console.log(`  Temperature:  ${config.temperature}`)
    console.log(`  Max Tokens:   ${config.maxTokens}`)
    console.log(`  Tools:        ${(config.tools || []).length}`)
    if (config.systemPrompt) {
      console.log(`  System:       ${config.systemPrompt.substring(0, 30)}...`)
    }
    console.log('─'.repeat(50))
    console.log('')
  }

  /**
   * Export state to file
   */
  private async exportState(filename?: string): Promise<void> {
    try {
      const state = this.agent.exportState()
      const file = filename || 'agent-state.json'

      const fs = await import('fs/promises')
      await fs.writeFile(file, JSON.stringify(state, null, 2), 'utf-8')

      console.log(`✅ State exported to ${file}`)
      console.log(`   ${state.messages.length} messages saved`)
      console.log('')
    } catch (error) {
      console.error('❌ Export failed:', error instanceof Error ? error.message : String(error))
      console.log('')
    }
  }

  /**
   * Import state from file
   */
  private async importState(filename?: string): Promise<void> {
    try {
      const file = filename || 'agent-state.json'
      const fs = await import('fs/promises')

      const data = await fs.readFile(file, 'utf-8')
      const state = JSON.parse(data)

      this.agent.importState(state)

      console.log(`✅ State imported from ${file}`)
      console.log(`   ${state.messages.length} messages loaded`)
      console.log('')
    } catch (error) {
      console.error('❌ Import failed:', error instanceof Error ? error.message : String(error))
      console.log('')
    }
  }

  /**
   * Prompt user for input
   */
  private prompt(question: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(question, resolve)
    })
  }

  /**
   * Stop the TUI
   */
  stop(): void {
    this.running = false
    this.rl.close()
  }
}

/**
 * Launch TUI with an agent
 */
export async function launchTUI(agent: Agent, config?: TUIConfig): Promise<void> {
  const tui = new AgentTUI(agent, config)
  await tui.start()
  tui.stop()
}
