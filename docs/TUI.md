# TUI (Terminal User Interface) Guide

The SawCode agent includes an interactive Terminal User Interface (TUI) for real-time interaction with your agent.

## 🚀 Quick Start

### Start the TUI

```bash
# Using npm script (recommended)
bun run tui

# Or run directly
bun src/cli.ts tui

# Or use the example
bun examples/tui-example.ts
```

## 📋 Commands

Once the TUI is running, you can use these commands:

| Command | Description |
|---------|-------------|
| `help` | Show help message |
| `history` | Display message history |
| `clear` | Clear all messages |
| `tools` | List available tools |
| `config` | Show agent configuration |
| `export [file]` | Export state to JSON file |
| `import [file]` | Import state from JSON file |
| `exit` / `quit` | Exit the TUI |
| *anything else* | Send query to the agent |

## 💬 Usage Examples

### Basic Query

```
🤖 SawCode> What is the weather like?
⏳ Processing...

🤖 Agent Response:
──────────────────────────────────────────────────
I can help you check the weather. However, I need
more information. Could you please specify:
1. Your location
2. Your preferred time frame (today, tomorrow, week)
──────────────────────────────────────────────────
```

### Check Available Tools

```
🤖 SawCode> tools

🔧 Available Tools (2):
──────────────────────────────────────────────────
  • bash
    Execute bash commands in the shell. Returns stdout/stderr output.
  • webfetch
    Fetch content from a URL. Supports GET/POST/PUT/DELETE requests.
──────────────────────────────────────────────────
```

### View Configuration

```
🤖 SawCode> config

⚙️  Configuration:
──────────────────────────────────────────────────
  Model:        claude-opus-4-6
  Temperature:  0.7
  Max Tokens:   2048
  Tools:        2
  System:       You are a helpful AI assistant...
──────────────────────────────────────────────────
```

### Export and Save State

```
🤖 SawCode> export my-conversation.json
✅ State exported to my-conversation.json
   15 messages saved
```

### Import Previous Conversation

```
🤖 SawCode> import my-conversation.json
✅ State imported from my-conversation.json
   15 messages loaded
```

### View Message History

```
🤖 SawCode> history

📜 Message History (10 messages):
──────────────────────────────────────────────────
1. [user] What is TypeScript?
2. [assistant] TypeScript is a programming language...
3. [user] Can I use it with Bun?
4. [assistant] Yes, absolutely! Bun has excellent...
──────────────────────────────────────────────────
```

## 🛠️ Programmatic Usage

You can also use the TUI programmatically in your code:

### Basic TUI Launch

```typescript
import { Agent, launchTUI } from '@sawcode/agent'

const agent = new Agent({
  model: 'claude-opus-4-6',
  tools: [/* your tools */],
})

await launchTUI(agent)
```

### With Custom Configuration

```typescript
import { Agent, launchTUI } from '@sawcode/agent'

const agent = new Agent({
  model: 'claude-opus-4-6',
})

await launchTUI(agent, {
  prompt: '> ',           // Custom prompt
  showWelcome: true,      // Show welcome banner
  showHelp: true,         // Show help on startup
  maxHistoryLines: 100,   // Max lines to show in history
})
```

### Using AgentTUI Class Directly

```typescript
import { Agent, AgentTUI } from '@sawcode/agent'

const agent = new Agent()
const tui = new AgentTUI(agent, {
  prompt: '🤖 Agent> ',
  showWelcome: true,
})

await tui.start()
tui.stop()
```

## ⚙️ Configuration Options

### TUIConfig

```typescript
interface TUIConfig {
  // Custom input prompt
  prompt?: string

  // Show welcome banner on startup
  showWelcome?: boolean

  // Show help on startup
  showHelp?: boolean

  // Max lines to show in history
  maxHistoryLines?: number
}
```

## 🎨 Features

### Interactive Prompts
- Read-Eval-Print-Loop (REPL) style interface
- Real-time input and output
- Formatted output with icons and separators

### Message Management
- View full conversation history
- Clear history with `clear` command
- Export/import state for persistence

### Tool Inspection
- List all available tools
- View tool descriptions
- Understand agent capabilities

### State Persistence
- Export state to JSON file
- Import previous conversations
- Resume conversations anytime

### Configuration Viewing
- Check current model
- View temperature and token settings
- See system prompt
- Count available tools

## 📝 State Export Format

When you export state, it's saved as JSON:

```json
{
  "messages": [
    {
      "type": "user",
      "content": "Hello, how are you?"
    },
    {
      "type": "assistant",
      "content": "I'm doing well, thank you for asking!"
    }
  ],
  "config": {
    "model": "claude-opus-4-6",
    "temperature": 0.7,
    "maxTokens": 2048,
    "systemPrompt": "You are helpful..."
  },
  "toolRegistry": {}
}
```

## 🔌 CLI Integration

The TUI is also accessible through the CLI:

```bash
# Start TUI
bun src/cli.ts tui

# Send single query
bun src/cli.ts query "What is Bun?"

# View history
bun src/cli.ts history

# Get help
bun src/cli.ts help
```

## 🚀 Advanced Usage

### Custom Tool Loading

```typescript
import { Agent, AgentTUI, myCustomTool } from '@sawcode/agent'

const agent = new Agent()
agent.addTool(myCustomTool)

await launchTUI(agent)
```

### Post-Session Analysis

```typescript
const agent = new Agent()
await launchTUI(agent)

// After user exits TUI
const finalState = agent.exportState()
console.log(`Total messages: ${finalState.messages.length}`)
console.log(`Final config: `, finalState.config)
```

### Error Handling

```typescript
try {
  const agent = new Agent()
  await launchTUI(agent)
} catch (error) {
  console.error('TUI error:', error)
  // Handle gracefully
}
```

## 🐛 Troubleshooting

### TUI not starting

```bash
# Check if Node/Bun is working
bun --version

# Try running with debug
DEBUG=* bun src/cli.ts tui
```

### Import/Export not working

```bash
# Check file exists
ls agent-state.json

# Check permissions
chmod 644 agent-state.json

# Try with full path
bun src/cli.ts import /path/to/agent-state.json
```

### Input not being read

- Make sure terminal is in interactive mode
- Try running with different terminal
- Check if TTY is available

## 📖 See Also

- [README.md](../README.md) - Main documentation
- [DEVELOPMENT.md](../DEVELOPMENT.md) - Development guide
- [examples/](../examples/) - Code examples

---

**Tip:** Use `help` command anytime in the TUI to see available commands!
