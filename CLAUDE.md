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

## Project Phases

**Completed Phases:**
- ✅ **Phase 1**: Core Agent Framework + state persistence
- ✅ **Phase 2**: Tool Ecosystem (fileread, filewrite, listdir)
- ✅ **Phase 3**: Advanced Features (error classes, feature flags, logging)
- ✅ **Phase 4**: CLI Integration + feature flags
- ✅ **Phase 5**: Documentation organization (GitHub Pages)
- ✅ **Phase 6**: CI/CD Infrastructure + landing page website
- ✅ **Phase 7**: Code Writing Enhancement (markdown parsing, syntax highlighting, streaming)
- ✅ **Phase 8**: Search & Navigation Tools (grep, find, tree for code exploration)
- ✅ **Phase 9**: Git & GitHub Integration (status, diff, PR helper, branch management)
- ✅ **Phase 10**: Context Extraction (file/directory context, code analysis, git history)
- ✅ **Phase 11**: Code Review (automated review, suggestions, compliance checking)

**Current Status:** Production-ready with code review and compliance checking

**Latest Addition (Phase 10):**
Context extraction tools for AI understanding: contextExtractor (file/directory context), codeAnalyzer (structure analysis), gitHistoryAnalyzer (development patterns).

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

## Phase 7: Code Display & Streaming Utilities

**Phase 7** adds professional code display capabilities for writing code with syntax highlighting, streaming, and markdown parsing.

### Markdown Parser (src/utils/markdown-parser.ts)
- `parseMarkdown()` - Extract code blocks from markdown
- `formatCodeBlockSimple()` - Basic code block formatting
- `detectLanguage()` - Guess language from code
- `extractAllCode()` - Get all code concatenated
- `hasCodeContent()` - Check if markdown has code
- `getCodeBlockCount()` - Count code blocks
- `formatInlineCode()` - Inline code formatting

Usage:
```typescript
const { parseMarkdown } = await import('@sawcode/agent')
const parsed = parseMarkdown(response)
// parsed.blocks - Array of CodeBlock objects
// parsed.hasCode - Boolean
// parsed.text - Prose without code
```

### Syntax Highlighter (src/utils/syntax-highlighter.ts)
- `highlight()` - Apply ANSI color highlighting
- `colorize()` - Wrap text with color codes
- `createBox()` - Create bordered colored box
- `getTokenColor()` - Get color for token type
- `colors` - Export all ANSI codes

Supported Languages: typescript, javascript, bash, python, json, yaml, plaintext

Token Types (automatically colored):
- Keywords (magenta, bold)
- Strings (green)
- Numbers (yellow)
- Comments (dim)
- Functions (bright blue)

### Code Formatter (src/utils/code-formatter.ts)
- `formatCodeBlock()` - Code with line numbers + syntax highlighting
- `formatCodeBlocks()` - Multiple code blocks indexed
- `formatInlineCode()` - Inline code snippet
- `formatError()` - Error message box
- `formatWarning()` - Warning message box
- `formatInfo()` - Info message box
- `formatSuccess()` - Success message box
- `formatToolResult()` - Tool execution display
- `formatDiff()` - Diff viewer (removed/added/context)
- `formatList()` - Bullet list with title
- `formatKeyValue()` - Key-value pairs display
- `formatTable()` - Formatted table
- `formatStreaming()` - Progress indicator

### Streaming Handler (src/handlers/streaming.ts)
- `streamQuery()` - Async generator yielding stream events
- `collectStream()` - Collect all chunks into final string
- `streamWithProgress()` - Stream with progress callback
- `streamLines()` - Stream with line-by-line processing
- `streamFormatted()` - Stream with markdown detection

Stream Event Types:
- `'start'` - Stream beginning
- `'text'` - Text chunk received
- `'tool_use'` - Tool being invoked
- `'end'` - Stream complete
- `'error'` - Error occurred

Usage:
```typescript
for await (const event of streamQuery(state, prompt)) {
  if (event.type === 'text') {
    process.stdout.write(event.delta || '')  // Real-time output
  }
}
```

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

## Phase 7 Files

### Phase 7 Core Utilities

**src/utils/markdown-parser.ts** (147 lines)
- Parse markdown responses and extract code blocks
- Detect language from ```typescript markers
- Separate prose content from code

**src/utils/syntax-highlighter.ts** (222 lines)
- ANSI terminal color codes
- Language-specific token highlighting
- Colored box and formatting helpers

**src/utils/code-formatter.ts** (307 lines)
- Professional code display with line numbers
- 11+ message formatting functions
- Streaming progress indicators

**src/handlers/streaming.ts** (267 lines)
- Real-time streaming from Claude API
- Event-based stream processing
- Progress callbacks and formatted output

### Phase 7 Example

**examples/phase7-code-writing.ts** (220+ lines)
- 7 comprehensive examples
- Demonstrates all Phase 7 features
- Run with: `bun examples/phase7-code-writing.ts`

### Phase 7 Documentation

**docs/PHASE7.md** (300+ lines)
- Complete Phase 7 feature overview
- Usage examples for each module
- Before/after comparison
- Integration checklist

## Phase 8 Files

### Phase 8 Core Tools

**src/tools/grep.ts** (172 lines)
- Text/regex pattern search in files
- Recursive directory traversal
- Binary file detection
- Case-insensitive matching option

**src/tools/find.ts** (148 lines)
- File search with wildcard support (* and ?)
- Type filtering (file/dir/any)
- Recursive traversal with result limit
- Pattern-to-regex conversion

**src/tools/tree.ts** (159 lines)
- Project structure visualization with ASCII tree
- 15+ file type emoji icons
- Depth-limited traversal
- Smart ignore patterns (node_modules, dist, .git, etc.)

### Phase 8 Integration

**src/utils/feature-flags.ts** (UPDATED)
- Added: ENABLE_GREP_TOOL, ENABLE_FIND_TOOL, ENABLE_TREE_TOOL flags
- All Phase 8 tools enabled by default
- Feature flags: SAWCODE_ENABLE_*_TOOL environment variables

**src/cli.ts** (UPDATED)
- Imported Phase 8 tools (grepTool, findTool, treeTool)
- Updated buildToolsFromFlags() to conditionally add Phase 8 tools
- Feature flag integration for selective tool loading

**src/index.ts** (UPDATED)
- Added exports: grepTool, grepSchema
- Added exports: findTool, findSchema
- Added exports: treeTool, treeSchema

### Phase 8 Example

**examples/phase8-search-tools.ts** (154 lines)
- 5 comprehensive examples: grep, find, tree, workflow, queries
- Demonstrates all Phase 8 tool capabilities
- Combined workflow showing code exploration pattern
- Run with: `bun examples/phase8-search-tools.ts`

### Phase 8 Documentation

**docs/PHASE8.md** (comprehensive guide)
- Complete Phase 8 feature overview
- Individual tool reference with APIs
- Wildcard patterns and emoji icon guide
- Integration patterns and performance tips
- Future enhancement suggestions (Phase 9+)

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
- **SUMMARY.md** - Complete project overview (all 7 phases)
- **PHASE7_SUMMARY.md** - Phase 7 completion status
- **docs/PHASE7.md** - Code writing enhancement documentation
- **docs/ENV.md** - Environment configuration details
- **docs/TUI.md** - Interactive TUI user guide
- **docs/KILOCODE.md** - KiloCode API integration guide
- **.reference/claudecode/** - Official Claude Code reference (battle-tested patterns)

## Repository Structure

Key files to understand the codebase:
- `src/index.ts` - Agent class definition
- `src/types.ts` - Core type definitions (read first)
- `src/handlers/query.ts` - Query processing logic
- `src/handlers/streaming.ts` - Streaming response handling (Phase 7)
- `src/tools/index.ts` - Tool factory and registry
- `src/utils/` - Foundation utilities from Claude Code reference
- `src/utils/markdown-parser.ts` - Markdown parsing (Phase 7)
- `src/utils/syntax-highlighter.ts` - Syntax highlighting (Phase 7)
- `src/utils/code-formatter.ts` - Code formatting (Phase 7)
- `src/tui/REPL.tsx` - Interactive TUI with code display (updated in Phase 7)
- `tsconfig.json` - TypeScript configuration (strict mode enabled)
- `package.json` - Scripts, dependencies, ESM exports

Excluded from build: `examples/`, `tests/`, `dist/`, `node_modules/`

---

**Last Updated**: April 2, 2026  
**Status**: ✅ Complete (8 phases, production-ready)
**Framework**: Bun + TypeScript (ESM, Strict Mode)
**Primary Utilities**: From Claude Code Reference (battle-tested)
