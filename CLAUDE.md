# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SawCode** is a Bun + TypeScript agent framework for building Claude Code skills and extensions. It provides:
- Layered architecture with Agent core, tool system, and utilities
- MCP (Model Context Protocol) compatible tool definitions
- Battle-tested utilities copied from Claude Code reference
- Interactive TUI and CLI interfaces
- Provider system for external API integrations (e.g., KiloCode)
- Type-safe TypeScript with strict mode enabled

Primary runtime: **Bun 1.0+** (preferred) or Node.js 20+
Build output: `dist/` directory
Module system: ESM (ES modules)

## Development Commands

### Essential Commands

```bash
# Install dependencies
bun install

# Type checking only (no compilation)
bun run type-check

# Build TypeScript to dist/
bun run build

# Development watch mode
bun run dev

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Lint code with Biome
bun run lint

# Format code with Biome (write changes)
bun run format

# Run example
bun run example

# Run KiloCode example
bun run example:kilocode

# Clean build artifacts and node_modules
bun run clean
```

### Single Test Execution

```bash
# Run one test file
bun test src/index.test.ts

# Run tests matching a pattern
bun test --preload-modules-only index

# Run with coverage
bun test --coverage
```

## High-Level Architecture

### Layered Design (Bottom-Up)

```
┌─────────────────────────────────────────────────┐
│ Layer 6: UI                                     │
│ - CLI (src/cli.ts): Direct command dispatch     │
│ - TUI (src/tui/index.ts): Interactive REPL      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ Layer 5: Provider System                        │
│ - External API integrations (src/providers/)    │
│ - KiloCode API client (src/providers/kilocode.ts)
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ Layer 4: Query Handler                          │
│ - Message routing (src/handlers/query.ts)       │
│ - Tool execution orchestration                  │
│ - Tool result processing                        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ Layer 3: Agent Core                             │
│ - Message history management                    │
│ - Tool registry                                 │
│ - Config management (src/index.ts)              │
│ - State import/export                           │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ Layer 2: Tool System                            │
│ - Tool factory: createTool() (src/tools/index.ts)
│ - Tool registry: Map-based lookup                │
│ - Built-in tools: bash, webfetch (src/tools/)   │
│ - MCP-compatible CallToolResult format          │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ Layer 1: Foundation (src/utils/)                │
│ - Error classes (from Claude Code reference)    │
│ - Deterministic IDs (agentName@teamName)        │
│ - Array utilities                               │
│ - Environment config (isEnvTruthy, parseEnvVars)│
│ - Structured logging (Logger with context)      │
└─────────────────────────────────────────────────┘
```

### Data Flow: Query Processing

```
User Input (string)
    │
    ▼
Agent.query(message)
    │
    ▼
handleQuery() - Message history management
    │
    ▼
Mock/Real Claude API call
    (Currently: mock responses in handlers/query.ts)
    │
    ├─ Tool calls detected
    │   │
    │   ▼
    │ getTool() → lookup in toolRegistry
    │   │
    │   ▼
    │ tool.handler(args) → CallToolResult
    │   │
    │   ▼
    │ Extract text from MCP result format
    │
    ▼
QueryResult { response, messages, toolCalls? }
```

## Key Design Patterns

### 1. Tool Definition Pattern

Tools are type-safe via Zod schemas and MCP-compatible:

```typescript
export const myTool = createTool(
  'tool-name',
  'Description',
  z.object({ param: z.string() }),
  async (args) => ({
    content: [{
      type: 'text',
      text: 'result'
    }]
  })
)
```

Key points:
- Input validation via Zod schema
- Return format: `CallToolResult` (MCP standard) with `content` array
- Handler is async; return format extracted in handleToolResult()

### 2. Deterministic ID System

Agent sessions and requests use branded string types for type safety:

```typescript
import { generateAgentId, generateSessionId, formatAgentId } from '@sawcode/agent'

const agentId = generateAgentId()        // agent-timestamp-random
const sessionId = generateSessionId()    // session-timestamp-random
const formatted = formatAgentId('my-agent', 'my-team')  // my-agent@my-team
```

These are copied from Claude Code reference and used for traceability.

### 3. Error Hierarchy

Use specific error classes for different failure modes (from Claude Code reference):

```typescript
import {
  ClaudeError,
  ConfigParseError,
  ShellError,
  AbortError,
  TelemetrySafeError,
  isAbortError
} from '@sawcode/agent'
```

Match the error type to the scenario for better error handling and recovery.

### 4. Environment Configuration

Environment variables are validated at startup:

```typescript
import { isEnvTruthy, loadEnvConfig, validateEnv } from '@sawcode/agent'

// Comprehensive config object
const config = loadEnvConfig()

// Check boolean env vars (handles '1', 'true', 'yes', 'on')
if (isEnvTruthy(process.env.DEBUG_MODE)) { ... }

// Validate required vars
validateEnv(['ANTHROPIC_API_KEY'])
```

These utilities are battle-tested from Claude Code reference.

### 5. Structured Logging

Use Logger with context for better debugging:

```typescript
import { createLogger } from '@sawcode/agent'

const logger = createLogger('component-name')
logger.debug('message', data)
logger.info('message')
logger.warn('message')
logger.error('message', data)
```

Respects `DEBUG` and `VERBOSE` env vars.

## Utilities from Claude Code Reference

These are production-tested utilities copied from the official Claude Code. Trust them over custom implementations:

### Array Utilities (src/utils/array.ts)
- `intersperse<A>()` - Insert separator between elements
- `count<T>()` - Count elements matching predicate
- `uniq<T>()` - Get unique items from iterable

### Error Classes (src/utils/error-classes.ts)
- `ClaudeError` - Base error class
- `AbortError` - Operation aborted
- `ConfigParseError` - Config file parsing failed
- `ShellError` - Shell command failed
- `TelemetrySafeError` - Telemetry-safe error messages
- `isAbortError()` - Check error type (handles minified code)
- `toError()`, `errorMessage()` - Error normalization

### ID System (src/utils/ids.ts)
- `formatAgentId()`, `parseAgentId()` - Format/parse `agentName@teamName`
- `generateRequestId()`, `parseRequestId()` - Deterministic request IDs
- `SessionId`, `AgentId` - Branded string types for type safety
- `generateSessionId()`, `generateAgentId()` - Generate unique IDs

### Environment Utilities (src/utils/env.ts)
- `isEnvTruthy()` - Check if env var is truthy ('1', 'true', 'yes', 'on')
- `isEnvDefinedFalsy()` - Check if env var is explicitly falsy
- `isBareMode()` - Check for `--bare` flag or `CLAUDE_CODE_SIMPLE`
- `parseEnvVars()` - Parse KEY=VALUE format with validation
- `getAWSRegion()` - Get AWS region with fallback
- `loadEnvConfig()` - Load all env config into typed object
- `validateEnv()` - Validate required env vars

## Important Files & Patterns

### src/types.ts

Defines core types for the entire framework:
- `AgentMessage` - Union of user/assistant/tool_result messages
- `ToolDefinition` - Tool schema and handler
- `AgentConfig` - Configuration options
- `QueryResult` - Return value of agent.query()

When adding features, check/update types here first.

### src/tools/index.ts

Tool factory and registry:
- `createTool()` - Create new tool with validation
- `createRegistry()` - Initialize tool map
- `getTool()` - Look up tool by name
- `listTools()` - Get all tool names

Adding new tools: Export from tool file, then add to registry during agent initialization.

### src/handlers/query.ts

Core query processing logic:
- `handleQuery()` - Process user message, add to history
- `handleToolResult()` - Execute tool, extract result, update history

**Current limitation**: Uses mock responses. Real implementation should call Claude API here.

### src/tui/index.ts

Interactive REPL for end users:
- `AgentTUI` class with readline interface
- Commands: help, history, clear, tools, config, export, import
- State persistence via exportState/importState
- Use for interactive agent testing and demos

### src/providers/kilocode.ts

Example provider for external API:
- `KilocodeClient` class
- Bearer token + API key authentication
- Demonstrates provider pattern for extensions

Copy this pattern when adding new providers.

## Testing & Validation

### Type Checking

```bash
# Must pass before commit
bun run type-check

# Running build also validates types
bun run build
```

Strict mode is enabled in tsconfig.json. All code must pass strict type checking.

### Running Tests

```bash
# All tests
bun test

# Watch during development
bun test --watch

# Specific test file
bun test src/index.test.ts
```

Test file suffix: `.test.ts`

### Linting

```bash
# Check with Biome
bun run lint

# Auto-fix
bun run format
```

Biome is configured via biomejs config (if exists). Fix all lint errors before committing.

## Common Development Tasks

### Adding a New Tool

1. Create `src/tools/myTool.ts`:
```typescript
import { createTool } from './index.js'
import { z } from 'zod'

export const myTool = createTool(
  'my-tool',
  'Description',
  z.object({ input: z.string() }),
  async ({ input }) => ({
    content: [{ type: 'text', text: `Result: ${input}` }]
  })
)
```

2. Export from `src/tools/index.ts`:
```typescript
export * from './myTool.js'
```

3. Use in agent or example:
```typescript
import { myTool } from '@sawcode/agent'
agent.addTool(myTool)
```

### Adding a New Provider

1. Create `src/providers/myProvider.ts`
2. Follow `KilocodeClient` pattern: class with methods, not static functions
3. Export from `src/providers/index.ts`
4. Add configuration to `.env.example`

### Integrating Real Claude API

Currently `src/handlers/query.ts` returns mock responses.

To integrate real API:
1. Add `ANTHROPIC_API_KEY` validation in env setup
2. Import Anthropic SDK in handlers/query.ts
3. Call API with messages + tool definitions
4. Parse responses and update message history

Reference: Look at `.reference/claudecode` examples for API integration patterns.

## Build & Deployment

### Local Development

```bash
# One-time setup
bun install

# Development loop
bun run dev        # Watch mode
bun test --watch   # Watch tests

# Before commit
bun run type-check
bun run lint
bun test
```

### Building for Distribution

```bash
bun run build
```

Outputs to `dist/`:
- Compiled JavaScript
- TypeScript declaration files (.d.ts)
- Source maps

ESM module exports are defined in package.json. Consumers can import:
```typescript
import { Agent, createTool } from '@sawcode/agent'
import { KiloCode } from '@sawcode/agent/providers'
```

## Troubleshooting

### Type Errors After Adding Code

Run `bun run type-check` to see full diagnostics. Common issues:
- Using `any` type (not allowed in strict mode)
- Missing type annotations on function parameters
- Mismatched return types

### Tool Results Not Processing Correctly

Check the MCP result format in the tool handler:
```typescript
// ✅ Correct: content array with objects
{ content: [{ type: 'text', text: '...' }] }

// ❌ Wrong: direct text property
{ type: 'text', text: '...' }
```

The `handleToolResult()` function expects MCP format and extracts text from it.

### Tests Failing After Changes

Common causes:
- Build artifacts out of date: `bun run clean && bun install && bun run build`
- Type issues preventing compilation: `bun run type-check`
- Race conditions in async tests: Add proper awaits

## References & Documentation

- **README.md** - Quick start, usage examples, API reference
- **DEVELOPMENT.md** - Extended development guide with tool examples
- **docs/ENV.md** - Environment configuration details
- **docs/TUI.md** - Interactive TUI user guide
- **docs/KILOCODE.md** - KiloCode API integration guide
- **.reference/claudecode/** - Official Claude Code reference (battle-tested patterns)

## Repository Structure

Key files to understand the codebase:
- `src/index.ts` - Agent class definition
- `src/types.ts` - Core type definitions (read first)
- `src/handlers/query.ts` - Query processing logic
- `src/tools/index.ts` - Tool factory and registry
- `src/utils/` - Foundation utilities from Claude Code reference
- `tsconfig.json` - TypeScript configuration (strict mode enabled)
- `package.json` - Scripts, dependencies, ESM exports

Excluded from build: `examples/`, `tests/`, `dist/`, `node_modules/`

---

**Last Updated**: April 2026
**Framework**: Bun + TypeScript (ESM, Strict Mode)
**Primary Utilities**: From Claude Code Reference (battle-tested)
