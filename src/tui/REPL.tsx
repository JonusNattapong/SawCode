import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import type { Agent } from '../index.js';
import { parseMarkdown } from '../utils/markdown-parser.js';
import { formatCodeBlock, formatError } from '../utils/code-formatter.js';
import { isFeatureEnabled } from '../utils/feature-flags.js';
import {
  type Companion,
  hatchCompanion,
  getCompanion,
  CompanionSprite,
  companionQuip,
  formatCompanionCard,
} from '../buddy/index.js';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool' | 'help' | 'info' | 'code' | 'streaming' | 'buddy';
  content: string;
  isStreaming?: boolean;
}

interface AppProps {
  agent: Agent;
}

const REPL: React.FC<AppProps> = ({ agent }: AppProps) => {
  const { exit } = useApp();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buddy state
  const [companion, setCompanion] = useState<Companion | undefined>();
  const [buddyReaction, setBuddyReaction] = useState<string | undefined>();
  const [petAt, setPetAt] = useState<number | undefined>();

  const buddyEnabled = isFeatureEnabled('ENABLE_BUDDY');

  // Initialize buddy
  useEffect(() => {
    if (!buddyEnabled) return;
    const userId = process.env.USER || process.env.USERNAME || 'sawcode-user';
    const stored = undefined;
    const comp = getCompanion(userId, stored) || hatchCompanion(userId);
    setCompanion(comp);
  }, [buddyEnabled]);

  // Buddy quip on events
  const buddySay = useCallback((text: string) => {
    if (!buddyEnabled) return;
    setBuddyReaction(text);
    setTimeout(() => setBuddyReaction(undefined), 10000);
  }, [buddyEnabled]);

  // Load initial history
  useEffect(() => {
    const history = agent.getMessages().map((msg: any) => ({
      role: msg.role as any,
      content: msg.content
    }));
    setMessages(history);
    
    setMessages(prev => [
      ...prev,
      {
        role: 'info',
        content: '🤖 SawCode Agent - Type /help for commands',
      }
    ]);

    // Buddy welcome
    if (buddyEnabled && companion) {
      setTimeout(() => {
        buddySay(companionQuip(companion));
      }, 1000);
    }
  }, [agent]);

  const handleCommand = (cmd: string): boolean => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();

    switch (command) {
      case '/help':
      case '/h':
        setMessages(prev => [
          ...prev,
          {
            role: 'help',
            content: `Available Commands:
  /help, /h           Show this help message
  /history            Show conversation history
  /clear              Clear conversation history
  /tools              List available tools
  /buddy              Show companion card
  /buddy pet          Pet your companion
  /buddy quip         Make companion say something
  /exit, /quit        Exit the TUI
  
Just type your message to chat with the agent!`,
          }
        ]);
        return true;

      case '/history':
        const history = agent.getMessages();
        if (history.length === 0) {
          setMessages(prev => [
            ...prev,
            { role: 'info', content: '📭 No messages in history' }
          ]);
        } else {
          const historyText = history
            .map((msg: any, i: number) => `${i + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`)
            .join('\n');
          setMessages(prev => [
            ...prev,
            { role: 'info', content: `📜 History (${history.length} messages):\n${historyText}` }
          ]);
        }
        return true;

      case '/clear':
        agent.clearHistory();
        setMessages([{
          role: 'info',
          content: '✅ History cleared'
        }]);
        return true;

      case '/tools':
        const tools = agent.getTools();
        if (tools.length === 0) {
          setMessages(prev => [
            ...prev,
            { role: 'info', content: '🔧 No tools available' }
          ]);
        } else {
          const toolsText = tools
            .map((tool: any) => `• ${tool.name || 'unnamed'}: ${tool.description || 'No description'}`)
            .join('\n');
          setMessages(prev => [
            ...prev,
            { role: 'info', content: `🔧 Available Tools:\n${toolsText}` }
          ]);
        }
        return true;

      case '/buddy':
        if (!buddyEnabled || !companion) {
          setMessages(prev => [
            ...prev,
            { role: 'info', content: '❌ Buddy system is disabled. Set ENABLE_BUDDY=true to enable.' }
          ]);
          return true;
        }
        const subCmd = parts[1]?.toLowerCase();
        if (subCmd === 'pet') {
          setPetAt(Date.now());
          setMessages(prev => [
            ...prev,
            { role: 'buddy', content: `You petted ${companion.name}! ♥` }
          ]);
          buddySay('♥ ♥ ♥');
        } else if (subCmd === 'quip') {
          buddySay(companionQuip(companion));
        } else {
          setMessages(prev => [
            ...prev,
            { role: 'buddy', content: formatCompanionCard(companion) }
          ]);
        }
        return true;

      case '/exit':
      case '/quit':
        exit();
        return true;

      default:
        return false;
    }
  };

  const handleSubmit = async (value: string) => {
    if (!value.trim()) return;
    
    const userMsg: Message = { role: 'user', content: value };
    setMessages((prev: Message[]) => [...prev, userMsg]);
    setQuery('');

    if (value.startsWith('/')) {
      if (handleCommand(value)) {
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    // Buddy reacts to user input
    if (buddyEnabled && companion && Math.random() < 0.3) {
      buddySay(companionQuip(companion));
    }

    try {
      const streamingMsg: Message = { role: 'streaming', content: '⠋ Streaming response...', isStreaming: true };
      setMessages((prev: Message[]) => [...prev, streamingMsg]);

      let fullResponse = '';
      const result = await agent.query(value);
      fullResponse = result.response;

      const parsed = parseMarkdown(fullResponse);
      
      setMessages((prev: Message[]) => prev.slice(0, -1));

      const assistantMsg: Message = { 
        role: parsed.hasCode ? 'code' : 'assistant', 
        content: fullResponse 
      };
      setMessages((prev: Message[]) => [...prev, assistantMsg]);

      if (parsed.blocks.length > 0) {
        for (let i = 0; i < parsed.blocks.length; i++) {
          const codeMsg: Message = {
            role: 'code',
            content: formatCodeBlock(parsed.blocks[i])
          };
          setMessages((prev: Message[]) => [...prev, codeMsg]);
        }
      }

      // Buddy reacts to response
      if (buddyEnabled && companion && Math.random() < 0.2) {
        setTimeout(() => buddySay(companionQuip(companion)), 2000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setMessages((prev: Message[]) => prev.slice(0, -1));
      setMessages((prev: Message[]) => [
        ...prev,
        { role: 'tool', content: formatError('Error', errorMsg) }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'c')) {
      exit();
    }
  });

  return (
    <Box flexDirection="column" padding={1} width={120}>
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
        <Text bold color="cyan">🤖 SawCode Agent (Claude Code-style TUI)</Text>
        {buddyEnabled && companion && (
          <Text color="gray"> • 🐾 {companion.name} ({companion.species})</Text>
        )}
      </Box>

      {/* Buddy sprite area */}
      {buddyEnabled && companion && (
        <Box marginBottom={1} flexDirection="row" alignItems="flex-end">
          <CompanionSprite
            companion={companion}
            reaction={buddyReaction}
            petAt={petAt}
            compact={false}
          />
        </Box>
      )}

      {/* Messages */}
      <Box flexDirection="column" marginBottom={1} width="100%">
        {messages.map((msg: Message, i: number) => {
          let msgColor = 'white';
          let prefix = '';

          switch (msg.role) {
            case 'user':
              msgColor = 'green';
              prefix = '› ';
              break;
            case 'assistant':
              msgColor = 'blueBright';
              prefix = '🤖 ';
              break;
            case 'code':
              msgColor = 'gray';
              prefix = '📝 ';
              break;
            case 'streaming':
              msgColor = 'yellow';
              prefix = '⏳ ';
              break;
            case 'tool':
              msgColor = 'yellow';
              prefix = '🔧 ';
              break;
            case 'help':
              msgColor = 'cyanBright';
              prefix = 'ℹ️  ';
              break;
            case 'info':
              msgColor = 'gray';
              prefix = 'ℹ️  ';
              break;
            case 'buddy':
              msgColor = 'magenta';
              prefix = '🐾 ';
              break;
            default:
              msgColor = 'white';
              prefix = '• ';
          }

          if (msg.role === 'code') {
            return (
              <Box key={i} marginBottom={1} flexDirection="column" width="100%">
                <Text color="cyan" wrap="wrap">
                  {msg.content}
                </Text>
              </Box>
            );
          }

          return (
            <Box key={i} marginBottom={0.5} flexDirection="column" width="100%">
              <Box>
                <Text bold color={msgColor as any}>
                  {prefix}
                </Text>
                <Text color={msgColor as any} wrap="wrap">
                  {msg.content}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Processing indicator */}
      {isProcessing && (
        <Box marginBottom={1}>
          <Text color="yellow">
            <Spinner type="dots" /> Thinking...
          </Text>
        </Box>
      )}

      {/* Error indicator */}
      {error && (
        <Box marginBottom={1}>
          <Text color="red">❌ {error}</Text>
        </Box>
      )}

      {/* Input */}
      <Box marginBottom={1}>
        <Text color="cyan" bold>
          ❯ 
        </Text>
        <TextInput
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          placeholder="Type /help for commands or ask anything..."
        />
      </Box>

      {/* Footer */}
      <Box>
        <Text color="gray" dimColor>
          Esc or Ctrl+C to exit • /help for commands
          {buddyEnabled && companion && ` • /buddy for ${companion.name}`}
        </Text>
      </Box>
    </Box>
  );
};

export default REPL;
