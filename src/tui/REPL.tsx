/**
 * Unified REPL Implementation
 * 
 * Single component supporting both 'classic' and 'enhanced' variants:
 * - Classic: Feature-rich with Buddy companion system
 * - Enhanced: Component-based with menu navigation and history
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Box, Text, useInput, useApp } from 'ink'
import Spinner from 'ink-spinner'
import TextInput from 'ink-text-input'
import type { Agent } from '../index.js'
import { isFeatureEnabled } from '../utils/feature-flags.js'
import {
  type Companion,
  hatchCompanion,
  getCompanion,
  CompanionSprite,
  companionQuip,
  formatCompanionCard,
} from '../buddy/index.js'

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool' | 'help' | 'info' | 'code' | 'streaming' | 'buddy' | 'error'
  content: string
  isStreaming?: boolean
  timestamp?: number
}

export interface REPLProps {
  agent: Agent
  variant?: 'classic' | 'enhanced'
}

/**
 * Classic REPL: Feature-rich with Buddy companion
 */
const ClassicREPL: React.FC<{ agent: Agent }> = ({ agent }) => {
  const { exit } = useApp()
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buddy state
  const [companion, setCompanion] = useState<Companion | undefined>()
  const [buddyReaction, setBuddyReaction] = useState<string | undefined>()
  const [petAt, setPetAt] = useState<number | undefined>()

  const buddyEnabled = isFeatureEnabled('ENABLE_BUDDY')

  // Initialize buddy
  useEffect(() => {
    if (!buddyEnabled) return
    const userId = process.env.USER || process.env.USERNAME || 'sawcode-user'
    const comp = getCompanion(userId, undefined) || hatchCompanion(userId)
    setCompanion(comp)
  }, [buddyEnabled])

  // Buddy quip on events
  const buddySay = useCallback((text: string) => {
    if (!buddyEnabled) return
    setBuddyReaction(text)
    setTimeout(() => setBuddyReaction(undefined), 10000)
  }, [buddyEnabled])

  // Load initial history
  useEffect(() => {
    const history = agent.getMessages().map((msg: any) => ({
      role: msg.role as any,
      content: msg.content,
    }))
    setMessages(history)

    setMessages((prev) => [
      ...prev,
      {
        role: 'info',
        content: '🤖 SawCode Agent (Classic) - Type /help for commands',
      },
    ])

    // Buddy welcome
    if (buddyEnabled && companion) {
      setTimeout(() => {
        buddySay(companionQuip(companion))
      }, 1000)
    }
  }, [agent, buddyEnabled, companion])

  const handleCommand = (cmd: string): boolean => {
    const parts = cmd.trim().split(/\s+/)
    const command = parts[0].toLowerCase()

    switch (command) {
      case '/help':
      case '/h':
        setMessages((prev) => [
          ...prev,
          {
            role: 'help',
            content: `Available Commands:
  /help, /h           Show this help message
  /history            Show conversation history
  /clear              Clear conversation history
  /tools              List available tools
  /buddy              Show companion card
  /exit, /quit        Exit the TUI
  
Just type your message to chat with the agent!`,
          },
        ])
        return true

      case '/history':
        const history = agent.getMessages()
        if (history.length === 0) {
          setMessages((prev) => [...prev, { role: 'info', content: '📭 No messages in history' }])
        } else {
          const historyText = history
            .map((msg: any, i: number) => `${i + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`)
            .join('\n')
          setMessages((prev) => [
            ...prev,
            { role: 'info', content: `📜 History (${history.length} messages):\n${historyText}` },
          ])
        }
        return true

      case '/clear':
        agent.clearHistory()
        setMessages([{ role: 'info', content: '✅ History cleared' }])
        return true

      case '/tools':
        const tools = agent.getTools()
        if (tools.length === 0) {
          setMessages((prev) => [...prev, { role: 'info', content: '🔧 No tools available' }])
        } else {
          const toolsText = tools
            .map((tool: any) => `• ${tool.name || 'unnamed'}: ${tool.description || 'No description'}`)
            .join('\n')
          setMessages((prev) => [
            ...prev,
            { role: 'info', content: `🔧 Available Tools:\n${toolsText}` },
          ])
        }
        return true

      case '/buddy':
        if (!buddyEnabled || !companion) {
          setMessages((prev) => [
            ...prev,
            { role: 'info', content: '❌ Buddy system is disabled. Set ENABLE_BUDDY=true to enable.' },
          ])
          return true
        }
        const subCmd = parts[1]?.toLowerCase()
        if (subCmd === 'pet') {
          setPetAt(Date.now())
          setMessages((prev) => [...prev, { role: 'buddy', content: `You petted ${companion.name}! ♥` }])
          buddySay('♥ ♥ ♥')
        } else {
          setMessages((prev) => [...prev, { role: 'buddy', content: formatCompanionCard(companion) }])
        }
        return true

      case '/exit':
      case '/quit':
        exit()
        return true

      default:
        return false
    }
  }

  const handleSubmit = async (userQuery: string) => {
    if (!userQuery.trim()) return

    // Handle commands
    if (userQuery.startsWith('/')) {
      if (handleCommand(userQuery)) {
        setQuery('')
        return
      }
    }

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }])
    setQuery('')
    setIsProcessing(true)
    setError(null)

    try {
      const result = await agent.query(userQuery)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.response,
        },
      ])

      // Buddy reaction
      if (buddyEnabled) {
        buddySay('✨ Great question!')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      setMessages((prev) => [...prev, { role: 'error', content: errorMsg }])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box flexDirection="column" width={100}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          🤖 SawCode Agent (Classic)
        </Text>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" marginBottom={1} borderStyle="round" borderColor="gray">
        {messages.slice(-10).map((msg, i) => (
          <Box key={i} marginBottom={1}>
            <Text
              color={
                msg.role === 'error'
                  ? 'red'
                  : msg.role === 'help'
                    ? 'yellow'
                    : msg.role === 'buddy'
                      ? 'magenta'
                      : 'white'
              }
            >
              <Text bold>[{msg.role.toUpperCase()}]</Text> {msg.content}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Input area */}
      <Box marginBottom={1}>
        <Box width="12">
          <Text color="blue">{isProcessing ? <Spinner /> : '💬'}</Text>
        </Box>
        <TextInput
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          placeholder="Type message or /help..."
        />
      </Box>

      {/* Buddy companion */}
      {buddyEnabled && companion && (
        <Box marginTop={1}>
          <CompanionSprite companion={companion} petAt={petAt} />
          {buddyReaction && <Text color="magenta">{buddyReaction}</Text>}
        </Box>
      )}

      {error && (
        <Box marginTop={1}>
          <Text color="red">❌ {error}</Text>
        </Box>
      )}
    </Box>
  )
}

/**
 * Enhanced REPL: Component-based with menu navigation
 */
const EnhancedREPL: React.FC<{ agent: Agent }> = ({ agent }) => {
  const { exit } = useApp()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [menuIndex, setMenuIndex] = useState(0)
  const [historyIndex, setHistoryIndex] = useState(0)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const menuItems = ['Chat', 'Tools', 'History', 'Help', 'Exit']

  useInput((input = '', key) => {
    if (key.leftArrow && menuIndex > 0) {
      setMenuIndex(menuIndex - 1)
    } else if (key.rightArrow && menuIndex < menuItems.length - 1) {
      setMenuIndex(menuIndex + 1)
    } else if (key.upArrow && historyIndex < commandHistory.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setQuery(commandHistory[commandHistory.length - 1 - (historyIndex + 1)] || '')
    } else if (key.downArrow && historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setQuery(commandHistory[commandHistory.length - 1 - (historyIndex - 1)] || '')
    } else if (key.return) {
      handleMenuSelect(menuItems[menuIndex])
    } else if (input.trim()) {
      setQuery((prev) => prev + input)
    }

    if (key.backspace) {
      setQuery((prev) => prev.slice(0, -1))
    }

    if (key.escape) {
      exit()
    }
  })

  const handleMenuSelect = async (item: string) => {
    switch (item) {
      case 'Chat':
        if (query.trim()) {
          setCommandHistory((prev) => [...prev, query])
          setHistoryIndex(0)
          setMessages((prev) => [...prev, { role: 'user', content: query, timestamp: Date.now() }])
          setQuery('')
          setIsProcessing(true)

          try {
            const result = await agent.query(query)
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: result.response, timestamp: Date.now() },
            ])
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error'
            setMessages((prev) => [...prev, { role: 'error', content: errorMsg, timestamp: Date.now() }])
          } finally {
            setIsProcessing(false)
          }
        }
        break

      case 'Tools':
        const tools = agent.getTools()
        if (tools.length > 0) {
          const toolsText = tools
            .map((tool: any) => `• ${tool.name || 'unnamed'}`)
            .join(', ')
          setMessages((prev) => [...prev, { role: 'info', content: `🔧 Tools: ${toolsText}`, timestamp: Date.now() }])
          setSelectedTool(selectedTool === null ? tools[0]?.name : null)
        }
        break

      case 'History':
        const hist = commandHistory.slice(-5).reverse()
        setMessages((prev) => [
          ...prev,
          {
            role: 'info',
            content: `📜 Recent:\n${hist.map((h) => `  • ${h}`).join('\n')}`,
            timestamp: Date.now(),
          },
        ])
        break

      case 'Help':
        setMessages((prev) => [
          ...prev,
          {
            role: 'help',
            content: 'Navigation:\n→/← Menu | ↑/↓ History | Enter Submit | Esc Exit',
            timestamp: Date.now(),
          },
        ])
        break

      case 'Exit':
        exit()
        break
    }
  }

  return (
    <Box flexDirection="column" width={100}>
      <Box marginBottom={1} borderStyle="round" borderColor="cyan">
        <Text color="cyan" bold>
          ✨ SawCode Agent (Enhanced)
        </Text>
      </Box>

      {/* Menu bar */}
      <Box marginBottom={1}>
        {menuItems.map((item, idx) => (
          <Box key={item} marginRight={2}>
            <Text color={idx === menuIndex ? 'cyan' : 'gray'} bold={idx === menuIndex}>
              [{item}]
            </Text>
          </Box>
        ))}
      </Box>

      {/* Messages */}
      <Box flexDirection="column" marginBottom={1} borderStyle="round" borderColor="gray">
        {messages.slice(-8).map((msg, i) => (
          <Box key={i} marginBottom={1}>
            <Text
              color={
                msg.role === 'error'
                  ? 'red'
                  : msg.role === 'help'
                    ? 'yellow'
                    : msg.role === 'assistant'
                      ? 'green'
                      : 'white'
              }
            >
              <Text bold>[{msg.role}]</Text> {msg.content.substring(0, 80)}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Input */}
      <Box>
        <Box width="12">
          <Text color="blue">{isProcessing ? <Spinner /> : '>'}</Text>
        </Box>
        <TextInput
          value={query}
          onChange={setQuery}
          placeholder="Enter query... (← → navigate, ↑ ↓ history)"
        />
      </Box>

      {/* Tool selector */}
      {selectedTool && (
        <Box marginTop={1}>
          <Text color="magenta">🔧 {selectedTool}</Text>
        </Box>
      )}
    </Box>
  )
}

/**
 * Main Unified REPL Component
 */
const REPL: React.FC<REPLProps> = ({ agent, variant = 'classic' }) => {
  return variant === 'enhanced' ? <EnhancedREPL agent={agent} /> : <ClassicREPL agent={agent} />
}

export default REPL
