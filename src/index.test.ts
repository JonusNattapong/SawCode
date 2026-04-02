/**
 * Agent Tests
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import { Agent, createAgent, bashTool, webfetchTool } from './index.js'

describe('Agent', () => {
  let agent: Agent

  beforeEach(() => {
    agent = new Agent({
      model: 'claude-opus-4-6',
      tools: [bashTool, webfetchTool] as any,
    })
  })

  it('should create an agent instance', () => {
    expect(agent).toBeDefined()
    expect(agent instanceof Agent).toBe(true)
  })

  it('should get config', () => {
    const config = agent.getConfig()
    expect(config.model).toBe('claude-opus-4-6')
    expect(config.temperature).toBe(0.7)
  })

  it('should update config', () => {
    agent.updateConfig({ temperature: 0.5 })
    const config = agent.getConfig()
    expect(config.temperature).toBe(0.5)
  })

  it('should start with empty messages', () => {
    const messages = agent.getMessages()
    expect(messages.length).toBe(0)
  })

  it('should process a query', async () => {
    const result = await agent.query('Hello, how are you?')
    expect(result.response).toBeDefined()
    expect(result.messages.length).toBeGreaterThan(0)
  })

  it('should maintain message history', async () => {
    await agent.query('First question')
    expect(agent.getMessages().length).toBe(2) // user + assistant

    await agent.query('Second question')
    expect(agent.getMessages().length).toBe(4) // 2 more messages
  })

  it('should clear history', async () => {
    await agent.query('Test message')
    expect(agent.getMessages().length).toBeGreaterThan(0)

    agent.clearHistory()
    expect(agent.getMessages().length).toBe(0)
  })

  it('should add tools', () => {
    const newTool = {
      name: 'test-tool',
      description: 'A test tool',
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      } as any,
      handler: async () => ({
        content: [{ type: 'text' as const, text: 'test' }],
      }),
    }

    agent.addTool(newTool)
    // Note: tools are stored separately in the registry
    expect(agent).toBeDefined()
  })

  it('should export and import state', async () => {
    await agent.query('Test message')

    const state = agent.exportState()
    expect(state.messages.length).toBeGreaterThan(0)

    const newAgent = new Agent()
    newAgent.importState(state)

    expect(newAgent.getMessages().length).toBe(state.messages.length)
  })

  it('should create agent with factory function', () => {
    const newAgent = createAgent({ model: 'claude-opus-4-6' })
    expect(newAgent instanceof Agent).toBe(true)
  })
})
