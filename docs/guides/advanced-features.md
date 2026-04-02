# SawCode: Advanced Features Documentation

## Overview

SawCode now includes three advanced Claude Code integration systems:

1. **Feature Flags** - Control tool availability and system features via environment variables
2. **Tool Conditional Loading** - Dynamically load only enabled tools at runtime
3. **Structured Logging** - Track query execution with component-based logging

---

## Feature Flags System

### What Are Feature Flags?

Feature flags allow you to enable/disable tools and features without code changes, using environment variables. This is useful for:

- **Security:** Disable dangerous tools in untrusted environments
- **Testing:** Enable/disable experimental features
- **Debugging:** Add structured logging for troubleshooting
- **Performance:** Reduce memory by disabling unused tools

### Available Flags

#### Tool Control Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `SAWCODE_ENABLE_BASH_TOOL` | ✅ true | Execute shell commands |
| `SAWCODE_ENABLE_WEBFETCH_TOOL` | ✅ true | Fetch HTTP URLs |
| `SAWCODE_ENABLE_FILE_TOOLS` | ✅ true | Read/write files & list directories |
| `SAWCODE_ENABLE_GREP_TOOL` | ❌ false | Text search (future) |
| `SAWCODE_ENABLE_WEB_SEARCH_TOOL` | ❌ false | Web search (future) |

#### Execution Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `SAWCODE_ENABLE_STREAMING` | ❌ false | Stream responses (future) |
| `SAWCODE_ENABLE_MULTI_TURN` | ✅ true | Multi-turn conversations |
| `SAWCODE_ENABLE_CACHING` | ❌ false | Cache responses (future) |

#### System Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `SAWCODE_ADVANCED_ERRORS` | ✅ true | Use advanced error classes |
| `SAWCODE_FEATURE_FLAGS` | ✅ true | Feature flag system enabled |
| `SAWCODE_STRUCTURED_LOGGING` | ✅ true | Structured logging enabled |
| `SAWCODE_DEBUG_MODE` | ✅ true | Debug output enabled |
| `SAWCODE_VERBOSE_LOGGING` | ❌ false | Verbose logging |

### Usage Examples

#### Default: All Tools Enabled
```bash
bun src/cli.ts tools
# Shows: bash, webfetch, fileread, filewrite, listdir (5 tools)
```

#### Disable File Tools
```bash
SAWCODE_ENABLE_FILE_TOOLS=false bun src/cli.ts tools
# Shows: bash, webfetch (2 tools)
```

#### Disable Bash Tool
```bash
SAWCODE_ENABLE_BASH_TOOL=false bun src/cli.ts tools
# Shows: webfetch, fileread, filewrite, listdir (4 tools)
```

#### Enable Debug Mode
```bash
SAWCODE_DEBUG_MODE=true bun src/cli.ts query "your query"
# Outputs debug-level logs
```

#### Multiple Flags
```bash
SAWCODE_ENABLE_BASH_TOOL=false \
SAWCODE_ENABLE_FILE_TOOLS=false \
SAWCODE_DEBUG_MODE=true \
bun src/cli.ts query "Fetch from API"
# Only webfetch tool available, with debug logging
```

### Accepted Values

Feature flags accept these values (case-insensitive):

**True:** `true`, `1`, `yes`, `on`  
**False:** `false`, `0`, `no`, `off`

### Using Feature Flags in Code

```typescript
import { getFeatureFlags, isFeatureEnabled, getAvailableTools } from '@sawcode/agent'

// Get all flagsconst flags = getFeatureFlags()
console.log(flags.ENABLE_BASH_TOOL) // true/false

// Check individual flag
if (isFeatureEnabled('DEBUG_MODE')) {
  console.log('Debug mode is enabled')
}

// Get available tools  
const tools = getAvailableTools()
console.log(tools.bash) // true/false
console.log(tools.fileread) // true/false

// Conditionally load tools
const toolsToLoad = []
if (tools.bash) toolsToLoad.push(bashTool)
if (tools.webfetch) toolsToLoad.push(webfetchTool)
if (tools.fileread) toolsToLoad.push(filereadTool)
```

---

## Tool Conditional Loading

### What Is It?

The CLI automatically loads only enabled tools based on feature flags. This means:

1. Tools are checked at agent initialization
2. Disabled tools won't appear in the tool registry
3. Agent can't call disabled tools even if it tries
4. Reduces memory footprint for unused tools

### How It Works

```typescript
// src/cli.ts
import { getAvailableTools } from './utils/feature-flags.js'

function buildToolsFromFlags(): any[] {
  const tools: any[] = []
  const availableTools = getAvailableTools()

  if (availableTools.bash) tools.push(bashTool)
  if (availableTools.webfetch) tools.push(webfetchTool)
  if (availableTools.fileread) tools.push(filereadTool)
  if (availableTools.filewrite) tools.push(filewriteTool)
  if (availableTools.listdir) tools.push(listdirTool)

  return tools
}

// In main():
const tools = buildToolsFromFlags()
const agent = new Agent({ tools })
```

### Example: Sandboxed Environment

For a restrictive sandbox where only safe tools are available:

```bash
SAWCODE_ENABLE_BASH_TOOL=false \
SAWCODE_ENABLE_WEBFETCH_TOOL=false \
bun src/cli.ts
# Only file tools available
```

---

## Structured Logging

### What Is Structured Logging?

Structured logging captures:
- **Timestamp** - When the event occurred (ISO 8601)
- **Level** - Severity (DEBUG, INFO, WARN, ERROR)
- **Component** - What part of the system logged it
- **Message** - Human-readable description
- **Context** - Additional structured data (JSON)

### Log Levels

| Level | Use Case | Output |
|-------|----------|--------|
| `DEBUG` | Development information | Minimal, only if DEBUG mode enabled |
| `INFO` | Important events | Query completion, state changes |
| `WARN` | Unexpected situations | Tool not found, fallback behavior |
| `ERROR` | Failures requiring attention | Tool execution failed, API errors |

### Example Log Output

```
[2026-04-02T12:36:14.401Z] [DEBUG] query-handler: Query started {"userInputLength":24,"model":"claude-3-5-sonnet"}
[2026-04-02T12:36:15.123Z] [DEBUG] query-handler: Executing tool {"toolName":"fileread","argsCount":1}
[2026-04-02T12:36:15.234Z] [DEBUG] query-handler: Tool executed successfully {"toolName":"fileread","resultLength":145}
[2026-04-02T12:36:16.456Z] [INFO] query-handler: Query completed {"responseLength":250,"messageCount":3,"toolCallsExecuted":1}
```

### Using Structured Logging in Code

```typescript
import { createLogger } from '@sawcode/agent'

// Create a logger for your component
const logger = createLogger('my-component')

// Log different levels
logger.debug('Debug message', { data: 'value' })
logger.info('Query completed', { type: 'success' })
logger.warn('Tool not found', { toolName: 'grep' })
logger.error('Connection failed', error)
```

### Enabling Debug Output

```bash
# All components
DEBUG=* bun src/cli.ts query "test"

# Specific component
DEBUG=query-handler bun src/cli.ts query "test"

# Multiple components
DEBUG=query-handler,cli bun src/cli.ts query "test"
```

---

## Integration Points

### In the CLI (src/cli.ts)

```typescript
import { getAvailableTools } from './utils/feature-flags.js'

// Tools are conditionally loaded based on flags
const tools = buildToolsFromFlags()
const agent = new Agent({ tools })
```

### In Query Handler (src/handlers/query.ts)

```typescript
import { createLogger } from '../utils/advanced-logging.js'

const logger = createLogger('query-handler')

// Logs query execution with timestamps and context
logger.debug('Query started', { userInputLength: userInput.length })
logger.info('Query completed', { responseLength, messageCount })
```

### In Tools (src/tools/*.ts)

```typescript
// Tools can check feature flags to enable conditional behavior
import { isFeatureEnabled } from '../utils/feature-flags.js'

if (isFeatureEnabled('DEBUG_MODE')) {
  console.log('Tool execution details...')
}
```

---

## Testing

### Feature Flags Test

runs comprehensive feature flag tests:

```bash
bun test-feature-flags.ts
```

Output shows:
- All 13 flags and their current values
- Available tools based on flags
- Individual flag checks
- Environment variables

### Integration Test

Comprehensive integration test of all advanced systems:

```bash
bun integration-test.ts
```

Tests:
- Feature flag loading
- Tool availability checking
- Conditional tool loading
- Structured logging output
- Query execution (if API key available)
- Tool registry state management

### Feature Flags Guide

Interactive guide showing all feature flags and usage examples:

```bash
bun FEATURE_FLAGS_GUIDE.ts
```

---

## Architecture

### File Structure

```
src/
├── utils/
│   ├── feature-flags.ts         # Feature flag system (13 flags)
│   ├── advanced-errors.ts       # Advanced error classes
│   ├── advanced-logging.ts      # Structured Logger class
│   └── index.ts                 # Exports all utilities
├── handlers/
│   └── query.ts                 # Uses structured logging
└── cli.ts                        # Uses feature flags for tool loading

Tests:
├── test-feature-flags.ts        # Feature flags test
├── FEATURE_FLAGS_GUIDE.ts       # Interactive guide
└── integration-test.ts          # Full integration test
```

### Data Flow

```
Environment Variables
    ↓
feature-flags.ts (getFeatureFlags)
    ↓
cli.ts (buildToolsFromFlags)
    ↓
Agent (conditional tools)
    ├→ Query Handler
    │    ↓
    │ Handler uses createLogger
    │    ↓
    │ Structured logging output
    │
    └→ Only enabled tools available
```

---

## Best Practices

### 1. Use Feature Flags for Security

```bash
# Secure environment - no shell access
SAWCODE_ENABLE_BASH_TOOL=false bun src/cli.ts
```

### 2. Use Feature Flags for Debugging

```bash
# Debug specific component
DEBUG=query-handler bun src/cli.ts query "problematic query"
```

### 3. Check Feature Flags Before Critical Operations

```typescript
import { isFeatureEnabled } from '@sawcode/agent'

if (!isFeatureEnabled('ENABLE_BASH_TOOL')) {
  throw new Error('Bash tool is disabled')
}
```

### 4. Use Structured Logging for Observability

```typescript
import { createLogger } from '@sawcode/agent'

const logger = createLogger('critical-operation')
logger.info('Starting critical operation', { operationId: id })
// ... do work ...
logger.info('Critical operation completed', { result })
```

---

## Troubleshooting

### "Tool not found" errors

Check if tool is enabled:
```bash
bun src/cli.ts tools  # See what's available
```

### No debug output appearing

Enable DEBUG mode:
```bash
DEBUG=query-handler bun src/cli.ts query "test"
```

### Still no output?

Check feature flag status:
```bash
bun test-feature-flags.ts
```

### Only specific tools showing

Feature flags are active. Reset with:
```bash
# Unset all SAWCODE_ variables
SAWCODE_ENABLE_BASH_TOOL= \
SAWCODE_ENABLE_FILE_TOOLS= \
bun src/cli.ts tools
```

---

## What's Next?

Future feature flags to implement:

- `ENABLE_GREP_TOOL` - Text search tool
- `ENABLE_WEB_SEARCH_TOOL` - Web search tool
- `ENABLE_STREAMING` - Stream responses
- `ENABLE_CACHING` - Response caching
- Custom feature flags per deployment

---

**Last Updated:** April 2, 2026  
**Version:** SawCode Phase 4  
**Status:** ✅ Production Ready
