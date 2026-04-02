# SawCode: Claude Code Agent Framework

A **Bun + TypeScript** agent framework for building Claude Code skills with an interactive terminal UI.

> 📚 **Full Documentation at [SawCode Pages](https://github.com/JonusNattapong/SawCode/blob/main/docs/index.md)**

## ✨ Quick Features

- **🤖 Real Claude Agent** - Powered by Claude 3.5 Sonnet
- **🔧 5 Built-in Tools** - bash, webfetch, fileread, filewrite, listdir  
- **🚩 Feature Flags** - Control tools via `SAWCODE_*` environment variables
- **📝 Structured Logging** - Debug with component-based logging
- **💾 State Management** - Save and resume conversations
- **⚡ Fast** - Bun runtime with TypeScript

## 🚀 Getting Started

### Prerequisites

```bash
# Bun 1.0+ (https://bun.sh)
# Anthropic API Key (https://console.anthropic.com/account/keys)
```

### Setup

```bash
# Install
bun install

# Configure
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env

# Run
bun src/cli.ts                      # Interactive TUI
bun src/cli.ts query "hello"        # Single query
bun src/cli.ts tools                # List tools
```

## 📖 Documentation

All documentation is in the `/docs` folder:

| Document | Purpose |
|----------|---------|
| **[docs/index.md](docs/index.md)** | Main documentation hub |
| **[docs/guides/advanced-features.md](docs/guides/advanced-features.md)** | Feature flags, logging, conditional loading |
| **[docs/guides/quick-reference.md](docs/guides/quick-reference.md)** | CLI commands reference |

## 🧪 Try Examples

```bash
# Test feature flags
bun docs/examples/test-feature-flags.ts

# Interactive guide
bun docs/examples/feature-flags-guide.ts

# Integration test
bun docs/examples/integration-test.ts
```

## 🔧 CLI Commands

```bash
# Interactive
bun src/cli.ts

# Query
bun src/cli.ts query "what is 5+3?"

# Tools
bun src/cli.ts tools

# History/Export
bun src/cli.ts history
bun src/cli.ts export json

# State
bun src/cli.ts reset
bun src/cli.ts config

# Help
bun src/cli.ts help
```

## 🚩 Feature Flags

Control tools and features via environment variables:

```bash
# Disable file tools
SAWCODE_ENABLE_FILE_TOOLS=false bun src/cli.ts tools

# Show debug logs
DEBUG=query-handler bun src/cli.ts query "test"

# Disable bash
SAWCODE_ENABLE_BASH_TOOL=false bun src/cli.ts tools
```

**→ See [Advanced Features Guide](docs/guides/advanced-features.md) for all 13 flags**

## 🛠 Development

```bash
bun run type-check    # Type checking
bun run build         # Build to dist/
bun run lint          # Lint code
bun run format        # Format code
bun test              # Run tests
```

## 📦 Tools Available

| Tool | Enabled | Flag |
|------|---------|------|
| bash | ✅ | `SAWCODE_ENABLE_BASH_TOOL` |
| webfetch | ✅ | `SAWCODE_ENABLE_WEBFETCH_TOOL` |
| fileread | ✅ | `SAWCODE_ENABLE_FILE_TOOLS` |
| filewrite | ✅ | `SAWCODE_ENABLE_FILE_TOOLS` |
| listdir | ✅ | `SAWCODE_ENABLE_FILE_TOOLS` |

## 💻 Programmatic Usage

```typescript
import { Agent, bashTool, webfetchTool } from './src/index.js'

const agent = new Agent({
  model: 'claude-3-5-sonnet-20241022',
  tools: [bashTool, webfetchTool],
})

const result = await agent.query('What time is it?')
console.log(result.response)
```

## 📂 Project Structure

```
SawCode/
├── docs/                    # 📚 All documentation (GitHub Pages)
│   ├── index.md            # Main documentation
│   ├── guides/             # Full guides
│   └── examples/           # Example scripts
├── src/                    # TypeScript source
│   ├── index.ts            # Main Agent
│   ├── cli.ts              # CLI entry
│   ├── tools/              # Built-in tools
│   ├── handlers/           # Message/tool handling
│   └── utils/              # Utilities (flags, logging)
├── examples/               # TypeScript examples
└── dist/                   # Compiled output
```

## ✅ What's Included in Phase 4

- ✅ Feature flags system (13 configurable flags)
- ✅ Conditional tool loading based on flags
- ✅ Structured logging with timestamps and context
- ✅ Advanced error classes from Claude Code
- ✅ Full documentation and examples
- ✅ Integration test suite

## 🤝 Contributing

Pull requests welcome! Please:
- Run `bun run format` before submitting
- Ensure `bun run type-check` passes
- Update docs if adding features

## 📄 License

MIT - See LICENSE file

---

**Build Status:** ✅ Production Ready  
**Last Updated:** April 2, 2026  
**Framework:** Bun + TypeScript (ESM, Strict Mode)

**→ [Full Documentation](docs/index.md) | [Quick Reference](docs/guides/quick-reference.md) | [Examples](docs/examples/)**
