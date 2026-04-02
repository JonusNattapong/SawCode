import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import type { Agent } from '../index.js';
import { parseMarkdown } from '../utils/markdown-parser.js';
import { formatCodeBlock, formatError } from '../utils/code-formatter.js';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool' | 'help' | 'info' | 'code' | 'streaming';
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

  // Load initial history
  useEffect(() => {
    const history = agent.getMessages().map((msg: any) => ({
      role: msg.role as any,
      content: msg.content
    }));
    setMessages(history);
    
    // Show welcome
    setMessages(prev => [
      ...prev,
      {
        role: 'info',
        content: '🤖 SawCode Agent - Type /help for commands',
      }
    ]);
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
    
    // Add user message
    const userMsg: Message = { role: 'user', content: value };
    setMessages((prev: Message[]) => [...prev, userMsg]);
    setQuery('');

    // Check for commands
    if (value.startsWith('/')) {
      if (handleCommand(value)) {
        return;
      }
    }

    // Process as query
    setIsProcessing(true);
    setError(null);

    try {
      // Add streaming indicator
      const streamingMsg: Message = { role: 'streaming', content: '⠋ Streaming response...', isStreaming: true };
      setMessages((prev: Message[]) => [...prev, streamingMsg]);

      // Collect streaming result
      let fullResponse = '';

      // Simulate streaming for now (until we integrate real streaming)
      const result = await agent.query(value);
      fullResponse = result.response;

      // Parse markdown to detect code blocks
      const parsed = parseMarkdown(fullResponse);
      
      // Remove streaming indicator
      setMessages((prev: Message[]) => prev.slice(0, -1));

      // Add formatted response
      const assistantMsg: Message = { 
        role: parsed.hasCode ? 'code' : 'assistant', 
        content: fullResponse 
      };
      setMessages((prev: Message[]) => [...prev, assistantMsg]);

      // If there are code blocks, add them separately
      if (parsed.blocks.length > 0) {
        for (let i = 0; i < parsed.blocks.length; i++) {
          const codeMsg: Message = {
            role: 'code',
            content: formatCodeBlock(parsed.blocks[i])
          };
          setMessages((prev: Message[]) => [...prev, codeMsg]);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);

      // Remove streaming indicator
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
      </Box>

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
            default:
              msgColor = 'white';
              prefix = '• ';
          }

          // Format code blocks specially
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
                <Text bold color={msgColor}>
                  {prefix}
                </Text>
                <Text color={msgColor} wrap="wrap">
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
        </Text>
      </Box>
    </Box>
  );
};

export default REPL;
