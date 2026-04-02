# SawCode Documentation

Welcome to **SawCode** - A Bun + TypeScript agent framework for Claude Code skills and extensions.

## 📚 Getting Started

- **[Quick Reference](guides/quick-reference.md)** - Fast lookup for common commands
- **[Advanced Features](guides/advanced-features.md)** - Feature flags, logging, and conditional loading

## 🚀 Quick Start

```bash
# Install and setup
bun install
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env

# Run the agent
bun src/cli.ts                   # Interactive TUI
bun src/cli.ts query "hello"     # Quick query
```

## 🎯 Main Features

- **Agent Framework**: Real Claude 3.5 Sonnet conversations
- **5 Built-in Tools**: bash, webfetch, fileread, filewrite, listdir
- **Feature Flags**: Control tools via `SAWCODE_*` environment variables
- **Structured Logging**: Component-based logging with timestamps and context
- **State Management**: Save and resume conversations
- **TypeScript**: Strict type safety with ESM modules

## 📖 Guides

### Feature Flags System
Control tool availability and system features without code changes.

```bash
# Disable file tools
SAWCODE_ENABLE_FILE_TOOLS=false bun src/cli.ts tools

# Enable debug logging
DEBUG=query-handler bun src/cli.ts query "test"
```

**→ See [Advanced Features Guide](guides/advanced-features.md)**

### Available Tools

| Tool | Description | Enabled by Default |
|------|-------------|-------------------|
| bash | Execute shell commands | ✅ |
| webfetch | Fetch HTTP content | ✅ |
| fileread | Read files from disk | ✅ |
| filewrite | Write files to disk | ✅ |
| listdir | List directory contents | ✅ |

## 🧪 Testing & Examples

Interactive examples to explore features:

```bash
# Show all feature flags
bun examples/test-feature-flags.ts

# Interactive feature flags guide
bun examples/feature-flags-guide.ts

# Full integration test
bun examples/integration-test.ts
```

**→ See [Examples Directory](examples/)**

## 🛠 CLI Commands

```bash
bun src/cli.ts tools               # List available tools
bun src/cli.ts query "prompt"      # Run a single query
bun src/cli.ts history             # Show conversation history
bun src/cli.ts export json         # Export conversation
bun src/cli.ts config              # Show configuration
bun src/cli.ts reset               # Clear history
bun src/cli.ts help                # Show help
```

## 🔧 Development

```bash
bun run type-check    # Type checking
bun run build         # Build to dist/
bun run dev           # Watch mode
bun run lint          # Lint with Biome
bun run format        # Format code
```

## 📋 Project Structure

```
SawCode/
├── src/
│   ├── index.ts              # Main Agent class
│   ├── cli.ts                # CLI entry point  
│   ├── types.ts              # TypeScript types
│   ├── tools/                # Built-in tools
│   │   ├── bash.ts
│   │   ├── webfetch.ts
│   │   ├── fileread.ts
│   │   ├── filewrite.ts
│   │   └── listdir.ts
│   ├── handlers/
│   │   └── query.ts          # Message & tool handling
│   ├── utils/
│   │   ├── feature-flags.ts   # 13 configurable flags
│   │   ├── advanced-errors.ts # Error classes
│   │   └── advanced-logging.ts # Structured Logger
│   └── tui/
│       └── index.ts           # Terminal UI
├── docs/
│   ├── index.md              # This file!
│   ├── guides/               # Documentation
│   │   ├── advanced-features.md
│   │   └── quick-reference.md
│   └── examples/             # Example scripts
├── examples/                 # TypeScript examples
├── dist/                     # Compiled output
└── package.json
```

## 🚀 Advanced Topics

### Feature Flags (13 Available)

**Tool Controls:**
- `SAWCODE_ENABLE_BASH_TOOL` - Shell execution
- `SAWCODE_ENABLE_WEBFETCH_TOOL` - HTTP requests
- `SAWCODE_ENABLE_FILE_TOOLS` - File operations
- `SAWCODE_ENABLE_GREP_TOOL` - Text search (future)
- `SAWCODE_ENABLE_WEB_SEARCH_TOOL` - Web search (future)

**System Controls:**
- `SAWCODE_DEBUG_MODE` - Debug output
- `SAWCODE_VERBOSE_LOGGING` - Verbose logs
- And 6 more...

### Structured Logging

```typescript
import { createLogger } from '@sawcode/agent'

const logger = createLogger('my-component')
logger.debug('Debug info', { data: 'value' })
logger.info('Important event')
logger.warn('Warning', { issue: 'description' })
logger.error('Error occurred', error)
```

Enable with: `DEBUG=my-component bun src/cli.ts query "..."`

### Conditional Tool Loading

```typescript
import { getAvailableTools } from '@sawcode/agent'

const tools = []
const available = getAvailableTools()

if (available.bash) tools.push(bashTool)
if (available.webfetch) tools.push(webfetchTool)
// ... etc

const agent = new Agent({ tools })
```

## ❓ FAQ

**Q: How do I disable bash for security?**
```bash
SAWCODE_ENABLE_BASH_TOOL=false bun src/cli.ts
```

**Q: How do I see debug logs?**
```bash
DEBUG=query-handler bun src/cli.ts query "test"
```

**Q: Where's the feature flags guide?**
See [Advanced Features Guide](guides/advanced-features.md) or run `bun examples/feature-flags-guide.ts`

**Q: Can I add custom tools?**
Yes! See the main README.md for examples.

## 📞 Support

- 📖 Check the guides in `/docs/guides/`
- 🧪 Run examples in `/docs/examples/`
- 💡 See tool documentation in main `README.md`

## 📄 License

See LICENSE file in project root.

---

**SawCode Phase 4** - Production Ready  
*Last Updated: April 2, 2026*
