# SawCode Setup Guide

## ✅ Project Created Successfully!

Your Claude Code Agent/Skill with **Bun + TypeScript** is ready to go.

## 📦 What's Been Created

### Configuration Files
- ✅ `package.json` - Project metadata and scripts
- ✅ `tsconfig.json` - TypeScript configuration (strict mode)
- ✅ `bunfig.toml` - Bun-specific configuration
- ✅ `biome.json` - Code linting and formatting config
- ✅ `.gitignore` - Git ignore rules

### Source Code
- ✅ `src/index.ts` - Main Agent class and exports
- ✅ `src/types.ts` - Type definitions (messages, tools, config)
- ✅ `src/tools/index.ts` - Tool registry and factory
- ✅ `src/tools/bash.ts` - Example bash execution tool
- ✅ `src/tools/webfetch.ts` - Example HTTP fetch tool
- ✅ `src/handlers/query.ts` - Message and tool handling

### Testing
- ✅ `src/index.test.ts` - Agent unit tests

### Examples
- ✅ `examples/simple-agent.ts` - Usage example

### Documentation
- ✅ `README.md` - User guide and API reference
- ✅ `DEVELOPMENT.md` - Development guide and patterns
- ✅ `SETUP.md` - This file

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd D:\Projects\Github\SawCode
bun install
```

### 2. Run Tests

```bash
bun test
```

### 3. Type Check

```bash
bun run type-check
```

### 4. Run Example

```bash
bun run example
```

### 5. Watch Mode (Development)

```bash
bun run dev
```

## 📁 Project Structure

```
SawCode/
├── src/                          # Source code
│   ├── index.ts                 # Main Agent class
│   ├── types.ts                 # Type definitions
│   ├── index.test.ts            # Tests
│   ├── tools/                   # Tool implementations
│   │   ├── index.ts            # Tool registry
│   │   ├── bash.ts             # Bash tool
│   │   └── webfetch.ts         # HTTP fetch tool
│   └── handlers/                # Message/tool handlers
│       └── query.ts            # Query processing
│
├── examples/                     # Usage examples
│   └── simple-agent.ts         # Basic agent example
│
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript config
├── bunfig.toml                 # Bun config
├── biome.json                  # Linting/formatting config
├── README.md                   # User documentation
├── DEVELOPMENT.md              # Dev guide
└── SETUP.md                    # This file
```

## 🛠️ Available Commands

| Command | Purpose |
|---------|---------|
| `bun install` | Install dependencies |
| `bun run dev` | Watch mode development |
| `bun run build` | Build TypeScript to dist/ |
| `bun run type-check` | TypeScript type checking |
| `bun test` | Run test suite |
| `bun test --watch` | Watch mode testing |
| `bun run example` | Run simple example |
| `bun run lint` | Lint code |
| `bun run format` | Format code |
| `bun run clean` | Clean dist & node_modules |

## 💡 Key Features

### 1. **Type-Safe Agent Framework**
- Full TypeScript with strict mode
- Zod schemas for tool validation
- Clear type definitions for all APIs

### 2. **Built-in Tools**
- Bash execution tool
- Web fetch tool (HTTP client)
- Tool registry for managing multiple tools

### 3. **Message Management**
- Track conversation history
- Support for user/assistant/tool messages
- State export/import for persistence

### 4. **Configuration**
- Per-agent configuration (model, temperature, max tokens)
- System prompts
- Dynamic tool registration

### 5. **Testing**
- Unit tests with Bun test runner
- Mock handlers for development
- Test utilities included

### 6. **Development Ready**
- Auto-reload with watch mode
- Biome linting and formatting
- ESM modules with proper tree-shaking

## 📚 Next Steps

### 1. Create Your First Tool

Create a file `src/tools/myTool.ts`:

```typescript
import { z } from 'zod'
import { createTool } from './index.js'

export const myTool = createTool(
  'my-tool',
  'Description of what the tool does',
  z.object({ input: z.string() }),
  async ({ input }) => ({
    type: 'text',
    text: `Processed: ${input}`,
  })
)
```

Export from `src/tools/index.ts`:
```typescript
export * from './myTool.js'
```

### 2. Use the Tool in an Agent

```typescript
import { Agent, myTool } from '@sawcode/agent'

const agent = new Agent({ tools: [myTool] })
const result = await agent.query('Use my tool')
```

### 3. Build and Deploy

```bash
bun run build
# Package dist/ for deployment
```

## 🔗 Integration with Claude Code

To use this as a Claude Code skill:

1. Build the project: `bun run build`
2. Register with Claude Code SDK
3. Expose tools via MCP protocol
4. Deploy as agent/skill

See `DEVELOPMENT.md` for deployment details.

## 📖 Documentation

- **User Guide**: See `README.md`
- **API Reference**: See `README.md` API section
- **Development Guide**: See `DEVELOPMENT.md`
- **Reference Code**: Check `.reference/claudecode/`

## 🧪 Testing Your Code

```bash
# Run all tests
bun test

# Run specific test
bun test src/index.test.ts

# Watch mode
bun test --watch

# With coverage
bun test --coverage
```

## ⚙️ Configuration

### TypeScript
- Target: ES2022
- Strict mode: enabled
- Module: ESNext
- Module resolution: bundler

### Bun
- Latest version (1.0+)
- Node.js compatibility mode

### Biome (Linting)
- Recommended rules enabled
- Single quotes
- 2-space indentation
- 100-char line width

## 🐛 Troubleshooting

### Dependencies not installing
```bash
bun install --force
rm bun.lock
bun install
```

### Type errors
```bash
bun run type-check  # See detailed errors
```

### Build errors
```bash
bun run clean       # Clean build
bun run build       # Rebuild
```

### Test failures
```bash
bun test --reporter=verbose
```

## 📝 Project Commands Summary

```bash
# Development workflow
bun run dev              # Start watch mode
bun test --watch       # Watch tests
bun run type-check     # Check types

# Building
bun run build          # Build project
bun run clean          # Clean build artifacts

# Code quality
bun run lint           # Check code style
bun run format         # Format code

# Examples and testing
bun run example        # Run simple example
bun test               # Run all tests
```

## 🎯 What to Do First

1. **Verify Installation**
   ```bash
   bun run type-check
   bun test
   ```

2. **Run the Example**
   ```bash
   bun run example
   ```

3. **Read the Docs**
   - `README.md` - Overview and usage
   - `DEVELOPMENT.md` - Architecture and patterns

4. **Create Your First Tool**
   - Follow the "Creating a New Tool" section in `DEVELOPMENT.md`

5. **Build and Deploy**
   - Run `bun run build`
   - Package the `dist/` directory

## ✨ Next Features to Add

Consider implementing:

- [ ] Persistent state storage (JSON/DB)
- [ ] Tool annotations and metadata
- [ ] Custom error handling
- [ ] Logging system
- [ ] Performance metrics
- [ ] Tool caching
- [ ] Session management
- [ ] Rate limiting

## 🤝 Contributing

The project is set up for collaboration:

- Code style: Biome (linting + formatting)
- Tests: Bun test runner with coverage
- TypeScript: Strict mode enforced
- Git: `.gitignore` configured

## 📞 Support

For help with:

- **Claude Code**: https://claude.com/claude-code
- **Bun**: https://bun.sh/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

**🎉 Your SawCode Agent is ready! Happy coding!**
