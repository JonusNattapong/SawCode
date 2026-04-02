/**
 * TUI Example - Interactive Agent Interface
 *
 * This example demonstrates how to use the AgentTUI for an interactive
 * command-line interface with an agent.
 *
 * Run with:
 *   bun examples/tui-example.ts
 */

import { Agent, bashTool, webfetchTool, launchTUI } from '../src/index.js'

async function main() {
  // Create agent with tools
  const agent = new Agent({
    model: 'claude-opus-4-6',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [bashTool, webfetchTool],
    systemPrompt:
      'You are a helpful AI assistant that can execute bash commands and fetch web content. Be helpful and provide clear responses.',
  })

  // Launch interactive TUI
  await launchTUI(agent, {
    prompt: '🤖 SawCode> ',
    showWelcome: true,
    showHelp: true,
    maxHistoryLines: 100,
  })
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
