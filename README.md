# SawCode: Claude Code Agent/Skill

A **Bun + TypeScript** based agent framework for building Claude Code skills and extensions.

## 🚀 Quick Start

### Prerequisites
- **Bun** 1.0+ ([install](https://bun.sh))
- **Node.js** 20+ (for compatibility)

### Installation

```bash
# Install dependencies
bun install

# Type check
bun run type-check

# Build
bun run build
```

### Running Examples

```bash
# Run simple agent example
bun run example

# Watch mode (development)
bun run dev

# Run tests
bun test
```

## 📦 Project Structure

```
src/
├── index.ts              # Main Agent class
├── types.ts              # Type definitions
├── tools/
│   ├── index.ts          # Tool registry & factory
│   ├── bash.ts           # Bash execution tool
│   └── webfetch.ts       # HTTP request tool
├── handlers/
│   └── query.ts          # Message & tool handling
└── utils/
    └── logger.ts         # Logging utilities

examples/
└── simple-agent.ts       # Usage example

dist/                     # Built output (generated)
```

## 💡 Usage

### Basic Agent

```typescript
import { Agent, bashTool, webfetchTool } from '@sawcode/agent'

const agent = new Agent({
  model: 'claude-opus-4-6',
  tools: [bashTool, webfetchTool],
})

const result = await agent.query('What time is it?')
console.log(result.response)
```

### Custom Tools

```typescript
import { createTool } from '@sawcode/agent'
import { z } from 'zod'

const calculatorTool = createTool(
  'calculator',
  'Add two numbers together',
  z.object({
    a: z.number(),
    b: z.number(),
  }),
  async ({ a, b }) => ({
    type: 'text',
    text: `${a} + ${b} = ${a + b}`,
  })
)

agent.addTool(calculatorTool)
```

### Message History

```typescript
// Get all messages
const messages = agent.getMessages()

// Clear history
agent.clearHistory()

// Export/Import state
const state = agent.exportState()
agent.importState(state)
```

## 🛠️ Development

### Available Scripts

| Script | Purpose |
|--------|---------|
| `bun run dev` | Watch mode with auto-reload |
| `bun run build` | TypeScript compilation |
| `bun run type-check` | Type checking only |
| `bun run lint` | Lint with Biome |
| `bun run format` | Format code with Biome |
| `bun test` | Run tests with Bun |
| `bun run example` | Run example agent |
| `bun run clean` | Clean dist & node_modules |

### Adding New Tools

1. Create a new file in `src/tools/`:
```typescript
// src/tools/myTool.ts
import { z } from 'zod'
import { createTool } from './index.js'

export const myToolSchema = z.object({
  input: z.string(),
})

export const myTool = createTool(
  'my-tool',
  'Description of what the tool does',
  myToolSchema,
  async ({ input }) => ({
    type: 'text',
    text: `Processed: ${input}`,
  })
)
```

2. Export from `src/tools/index.ts`:
```typescript
export * from './myTool.js'
```

3. Use in agent:
```typescript
import { myTool } from '@sawcode/agent'

agent.addTool(myTool)
```

## 🧪 Testing

```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# With coverage
bun test --coverage
```

## 🔧 Configuration

### Environment Variables

```bash
# Logging
DEBUG=sawcode:* bun run example

# API Keys (if using real Claude API)
ANTHROPIC_API_KEY=your-key-here
```

### TypeScript Configuration

Modify `tsconfig.json` to adjust compiler options:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "strict": true
  }
}
```

## 📚 API Reference

### Agent Class

#### Constructor

```typescript
new Agent(config?: AgentConfig)
```

#### Methods

- `query(message: string, options?: QueryOptions): Promise<QueryResult>`
- `processToolResult(toolUseId: string, toolName: string, toolArgs: Record<string, unknown>): Promise<QueryResult>`
- `addTool(tool: ToolDefinition): void`
- `getMessages(): AgentMessage[]`
- `clearHistory(): void`
- `getConfig(): AgentConfig`
- `updateConfig(config: Partial<AgentConfig>): void`
- `exportState(): AgentState`
- `importState(state: AgentState): void`

### Tool Factory

```typescript
createTool<Schema extends ToolSchema>(
  name: string,
  description: string,
  inputSchema: z.ZodObject<Schema>,
  handler: (args: InferSchema<Schema>) => Promise<CallToolResult>
): ToolDefinition<Schema>
```

## 🚢 Deployment

### As Claude Code Skill

1. Build the project:
```bash
bun run build
```

2. Package the `dist/` directory

3. Register with Claude Code SDK:
```typescript
import { createSdkMcpServer } from '@claudecode/sdk'
import { Agent, bashTool } from '@sawcode/agent'

const agent = new Agent({ tools: [bashTool] })

export default createSdkMcpServer({
  name: 'SawCode Agent',
  tools: [/* your tools */],
})
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM oven/bun:latest

WORKDIR /app
COPY . .

RUN bun install
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "example"]
```

Build and run:
```bash
docker build -t sawcode .
docker run -it sawcode
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- 📖 [Claude Code Documentation](https://claude.com/claude-code)
- 🐛 [Report Issues](https://github.com/anthropics/claude-code/issues)
- 💬 [Discussions](https://github.com/anthropics/claude-code/discussions)

---

**Built with ❤️ using Bun + TypeScript**
