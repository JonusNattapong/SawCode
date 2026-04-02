# Getting Started with SawCode

Welcome to **SawCode** - A powerful Bun + TypeScript agent framework with an Ink-based Claude Code-style Terminal UI.

## 🚀 Quick Start (60 seconds)

### 1. Install Dependencies
```bash
bun install
```

### 2. Set Up Environment
Create a `.env` file (copy from `.env.example` if available):
```bash
ANTHROPIC_API_KEY=sk-ant-...your-key...
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### 3. Launch Interactive TUI
```bash
bun src/cli.ts
```

You'll see:
```
┌──────────────────────────────────────────────────────┐
│ 🤖 SawCode Agent (Claude Code-style TUI)             │
└──────────────────────────────────────────────────────┘

❯ 
```

Type `/help` to see all commands!

---

## 💻 Usage Examples

### Interactive Chat (TUI)
```bash
bun src/cli.ts
```

Then type:
```
❯ /help                    # Show commands
❯ What is 2+2?            # Ask a question
❯ /tools                  # List available tools
❯ /history                # See conversation history
❯ /exit                   # Quit
```

### Single Query
```bash
# Math question
bun src/cli.ts query "What is the capital of France?"

# Run shell commands
bun src/cli.ts query "run: pwd"

# Fetch web content
bun src/cli.ts query "Fetch https://httpbin.org/ip"
```

### Programmatic Usage
```typescript
import { Agent, bashTool, webfetchTool } from './src/index'

const agent = new Agent({
  tools: [bashTool, webfetchTool]
})

const result = await agent.query('What is 2+2?')
console.log(result.response)  // "2 + 2 = 4"
```

---

## 🎯 Key Features

✅ **Real Agent Logic** - Powered by Claude 3.5 Sonnet  
✅ **Tool Execution** - Bash commands & web fetching  
✅ **Interactive TUI** - Claude Code-inspired interface  
✅ **Color-Coded Messages** - User (green), Agent (blue), Tools (yellow)  
✅ **Real-Time Thinking** - Animated spinner during processing  
✅ **Command System** - `/help`, `/history`, `/tools`, `/clear`, `/exit`  
✅ **State Management** - Export/import conversations  

---

## 📁 Project Structure

```
src/
├── index.ts                 # Agent class & exports
├── types.ts                 # Type definitions
├── cli.ts                   # CLI entry point
├── handlers/
│   └── query.ts            # Query processing & API calls
├── tools/
│   ├── index.ts            # Tool registry
│   ├── bash.ts             # Shell command execution
│   └── webfetch.ts         # HTTP requests
├── tui/
│   ├── index.ts            # TUI launcher
│   └── REPL.tsx            # Ink-based React TUI component
├── utils/
│   ├── zod-to-json.ts      # Schema conversion
│   ├── error-classes.ts    # Custom errors
│   └── logger.ts           # Logging utilities
└── providers/
    └── kilocode.ts         # KiloCode API client
```

---

## 📚 Available Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/tools` | List available AI tools |
| `/history` | View conversation history |
| `/clear` | Clear message history |
| `/exit` or `/quit` | Exit the TUI |
| `Esc` or `Ctrl+C` | Quick exit |

---

## 🔧 Development

```bash
# Type checking
bun run type-check

# Build TypeScript
bun run build

# Run tests
bun test
bun test --watch

# Lint code
bun run lint

# Format code
bun run format
```

---

## 🛠 Available Tools

### **Bash Tool** 
Execute shell commands on your system:
```
❯ run: ls -la
❯ run: pwd
❯ run: npm list
```

### **Webfetch Tool**
Fetch content from the web:
```
❯ Fetch https://api.github.com/users/octocat
❯ Get weather data from api.weather.com
```

---

## ⚙️ Configuration (`.env`)

```dotenv
# Claude API
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Agent Settings
AGENT_TEMPERATURE=0.7        # 0=deterministic, 1=creative
AGENT_MAX_TOKENS=4096        # Max response length

# TUI Settings
TUI_PROMPT=🤖 SawCode>
TUI_SHOW_WELCOME=true
TUI_SHOW_HELP=true

# Tools
ENABLE_BASH_TOOL=true
ENABLE_WEBFETCH_TOOL=true
BASH_TIMEOUT=30000           # ms
HTTP_TIMEOUT=5000            # ms

# Development
NODE_ENV=development
DEBUG=sawcode:*
```

---

## 📊 Example Interactions

### Example 1: Code Explanation
```
❯ Explain what a closure is in JavaScript

🤖 A closure is a function that has access to variables from its outer scope...
```

### Example 2: File Operations
```
❯ run: cat README.md

🤖 [Shows file contents]
```

### Example 3: Web Integration
```
❯ Fetch https://httpbin.org/json and parse the response

🤖 [Retrieves and analyzes JSON data]
```

---

## 🚨 Troubleshooting

### Issue: "Model not found" error
**Solution:** Check your `.env` file has a valid `ANTHROPIC_API_KEY`

### Issue: Tools not executing
**Solution:** Verify tools are enabled in `.env`:
```dotenv
ENABLE_BASH_TOOL=true
ENABLE_WEBFETCH_TOOL=true
```

### Issue: TypeScript errors
**Solution:** Run type checker:
```bash
bun run type-check
```

---

## 🎓 Advanced Usage

### Creating a Custom Tool
```typescript
import { createTool } from './src/tools/index'
import { z } from 'zod'

const customTool = createTool(
  'greet',
  'Greets someone by name',
  z.object({ name: z.string() }),
  async ({ name }) => ({
    content: [{ type: 'text', text: `Hello, ${name}!` }]
  })
)

agent.addTool(customTool)
```

### Saving Conversations
```typescript
// Export state
const state = agent.exportState()
fs.writeFileSync('conversation.json', JSON.stringify(state, null, 2))

// Resume later
const saved = JSON.parse(fs.readFileSync('conversation.json', 'utf8'))
newAgent.importState(saved)
```

---

## 📖 For More Details

See [DEVELOPMENT.md](DEVELOPMENT.md) for:
- Architecture overview
- API reference
- Tool creation guide
- State management
- Full examples

---

## ✨ Next Steps

1. **Explore**: Try different queries and commands
2. **Experiment**: Create custom tools
3. **Build**: Integrate into your projects
4. **Extend**: Add specialized agents

---

**Happy coding! 🚀**
