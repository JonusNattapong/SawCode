# Development Guide

This guide explains how to develop and extend the SawCode Claude Code Agent/Skill.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Agent (Main Entry Point)        │
│    - Message Management                 │
│    - Tool Registry                      │
│    - Configuration                      │
└──────────────┬──────────────────────────┘
               │
       ┌───────┼───────┐
       │       │       │
       ▼       ▼       ▼
    Tools   Handlers  Types
    │         │        │
    ├─bash   ├─query  ├─AgentMessage
    ├─web    └─tools  ├─ToolDefinition
    └─...             ├─AgentConfig
                      └─QueryResult
```

## File Structure

### Core Files

- **`src/index.ts`** - Main Agent class and factory function
- **`src/types.ts`** - TypeScript type definitions
- **`src/tools/index.ts`** - Tool registry and factory utilities
- **`src/handlers/query.ts`** - Message and tool call processing

### Tool Implementation

- **`src/tools/bash.ts`** - Execute shell commands
- **`src/tools/webfetch.ts`** - Fetch HTTP resources

### Documentation

- **`README.md`** - User-facing documentation
- **`DEVELOPMENT.md`** - This file
- **`.reference/claudecode`** - Reference implementation

## Development Workflow

### 1. Setting Up Development Environment

```bash
# Install dependencies
bun install

# Start watch mode
bun run dev

# In another terminal, run tests
bun test --watch
```

### 2. Creating a New Tool

Tools are the primary extension point. Here's the process:

#### Step 1: Define Tool Schema

```typescript
// src/tools/calculator.ts
import { z } from 'zod'

export const calculatorSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number(),
})
```

#### Step 2: Implement Tool Handler

```typescript
import { createTool } from './index.js'

export const calculatorTool = createTool(
  'calculator',
  'Perform basic mathematical operations on two numbers',
  calculatorSchema,
  async ({ operation, a, b }) => {
    let result: number

    switch (operation) {
      case 'add':
        result = a + b
        break
      case 'subtract':
        result = a - b
        break
      case 'multiply':
        result = a * b
        break
      case 'divide':
        if (b === 0) {
          return {
            type: 'text',
            text: 'Error: Division by zero',
            isError: true,
          }
        }
        result = a / b
        break
    }

    return {
      type: 'text',
      text: `${a} ${operation} ${b} = ${result}`,
    }
  },
)
```

#### Step 3: Export from Registry

```typescript
// src/tools/index.ts
export * from './calculator.js'
```

#### Step 4: Test the Tool

```typescript
// src/tools/calculator.test.ts
import { describe, it, expect } from 'bun:test'
import { calculatorTool } from './calculator.js'

describe('calculatorTool', () => {
  it('should add numbers', async () => {
    const result = await calculatorTool.handler({
      operation: 'add',
      a: 2,
      b: 3,
    })

    expect(result.type).toBe('text')
    expect(result.text).toContain('5')
  })
})
```

#### Step 5: Use in Agent

```typescript
import { Agent, calculatorTool } from '@sawcode/agent'

const agent = new Agent({
  tools: [calculatorTool],
})

const result = await agent.query('What is 5 + 3?')
```

### 3. Extending the Agent

#### Custom Configuration

```typescript
const agent = new Agent({
  model: 'claude-opus-4-6',
  temperature: 0.5,
  maxTokens: 1024,
  systemPrompt: 'You are a helpful math tutor.',
  tools: [calculatorTool],
})
```

#### Message Processing

```typescript
// Add custom message processing
agent.on('message', (message) => {
  console.log(`[${message.type}] ${message.content}`)
})
```

#### State Management

```typescript
// Export agent state for persistence
const state = agent.exportState()
fs.writeFileSync('agent-state.json', JSON.stringify(state))

// Resume later
const savedState = JSON.parse(fs.readFileSync('agent-state.json', 'utf-8'))
agent.importState(savedState)
```

### 4. Advanced Tool Features

#### Tool Annotations

```typescript
export const customTool = createTool(
  'custom',
  'A custom tool',
  customSchema,
  async args => {
    return { type: 'text', text: 'result' }
  },
  {
    annotations: {
      userFacing: true,
      toolUseDescription: 'Custom tool for advanced operations',
    },
    searchHint: 'advanced operations',
    alwaysLoad: true,
  },
)
```

#### Async Operations

```typescript
export const fetchDataTool = createTool(
  'fetch-data',
  'Fetch data from an API with retry logic',
  z.object({ url: z.string().url() }),
  async ({ url }) => {
    const maxRetries = 3
    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, {
          timeout: 5000,
        })
        return {
          type: 'text',
          text: await response.text(),
        }
      } catch (error) {
        lastError = error as Error
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }

    return {
      type: 'text',
      text: `Error after ${maxRetries} retries: ${lastError!.message}`,
      isError: true,
    }
  },
)
```

## Testing

### Unit Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/tools/calculator.test.ts

# Watch mode
bun test --watch

# With coverage
bun test --coverage
```

### Example Test

```typescript
import { describe, it, expect } from 'bun:test'
import { Agent } from './index.js'

describe('Agent Integration', () => {
  it('should handle tool calls', async () => {
    const agent = new Agent({ tools: [calculatorTool] })
    const result = await agent.query('Calculate 10 + 5')

    expect(result.response).toBeDefined()
    expect(result.messages.length).toBeGreaterThan(0)
  })
})
```

## Building & Deployment

### Development Build

```bash
bun run build
```

### Production Build

```bash
# Build with optimizations
bun build --minify src/index.ts --outdir dist/

# Or use the standard build
bun run build
```

### Type Checking

```bash
# Check types without compiling
bun run type-check

# Generate types only
tsc --emitDeclarationOnly --outDir dist/
```

## Code Style

### Formatting

```bash
# Check formatting
bun run format

# Auto-fix formatting
bun run format:fix
```

### Linting

```bash
# Lint code
bun run lint

# Fix linting issues
bun run lint:fix
```

### TypeScript Guidelines

- Use strict mode (enforced in `tsconfig.json`)
- Avoid `any` - use proper types
- Use generics for reusable code
- Document public APIs with JSDoc

## Common Patterns

### Error Handling

```typescript
async function safeTool(args: Args): Promise<CallToolResult> {
  try {
    // Tool implementation
    return { type: 'text', text: 'success' }
  } catch (error) {
    return {
      type: 'text',
      text: error instanceof Error ? error.message : 'Unknown error',
      isError: true,
    }
  }
}
```

### Validation

```typescript
const safeSchema = z.object({
  input: z.string().min(1).max(1000),
  timeout: z.number().positive().default(5000),
})
```

### Logging

```typescript
function log(context: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [${context}] ${message}`)
  if (data) console.log(JSON.stringify(data, null, 2))
}
```

## Debugging

### Enable Logging

```bash
DEBUG=sawcode:* bun run example
```

### VSCode Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/examples/simple-agent.ts",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["run"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Performance Optimization

### Lazy Loading Tools

```typescript
const agent = new Agent()

// Add tools dynamically
setTimeout(() => {
  agent.addTool(heavyTool)
}, 1000)
```

### Caching Results

```typescript
const cache = new Map<string, CallToolResult>()

export const cachedTool = createTool(
  'cached',
  'A cached tool',
  schema,
  async args => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = {
      type: 'text' as const,
      text: 'result',
    }

    cache.set(key, result)
    return result
  },
)
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v0.2.0`
4. Build: `bun run build`
5. Publish to npm: `bun publish`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Resources

- [Claude Code Documentation](https://claude.com/claude-code)
- [Zod Documentation](https://zod.dev)
- [MCP SDK Docs](https://modelcontextprotocol.io)
- [Bun Documentation](https://bun.sh/docs)
