# SawCode Quick Reference

## Basic Commands

```bash
# View available tools
bun src/cli.ts tools

# Run a query
bun src/cli.ts query "your question here"

# Show message history
bun src/cli.ts history

# Clear history
bun src/cli.ts reset

# Export conversation
bun src/cli.ts export json                    # JSON format
bun src/cli.ts export markdown                # Markdown format
bun src/cli.ts export csv                     # CSV format

# Show help
bun src/cli.ts help

# Show configuration
bun src/cli.ts config
```

## Feature Flags (SAWCODE_* variables)

### Common Patterns

```bash
# Disable file tools (file read/write/listdir)
SAWCODE_ENABLE_FILE_TOOLS=false bun src/cli.ts tools

# Disable bash tool  
SAWCODE_ENABLE_BASH_TOOL=false bun src/cli.ts tools

# Disable webfetch
SAWCODE_ENABLE_WEBFETCH_TOOL=false bun src/cli.ts tools

# Enable debug logging
DEBUG=query-handler bun src/cli.ts query "test"

# Enable all debug
DEBUG=* bun src/cli.ts query "test"

# Verbose logging
SAWCODE_VERBOSE_LOGGING=true bun src/cli.ts query "test"
```

### All Flags

**Tool Flags:**
- `SAWCODE_ENABLE_BASH_TOOL` (default: true)
- `SAWCODE_ENABLE_WEBFETCH_TOOL` (default: true)
- `SAWCODE_ENABLE_FILE_TOOLS` (default: true)
- `SAWCODE_ENABLE_GREP_TOOL` (default: false)
- `SAWCODE_ENABLE_WEB_SEARCH_TOOL` (default: false)

**Execution Flags:**
- `SAWCODE_ENABLE_STREAMING` (default: false)
- `SAWCODE_ENABLE_MULTI_TURN` (default: true)
- `SAWCODE_ENABLE_CACHING` (default: false)

**System Flags:**
- `SAWCODE_ADVANCED_ERRORS` (default: true)
- `SAWCODE_FEATURE_FLAGS` (default: true)
- `SAWCODE_STRUCTURED_LOGGING` (default: true)
- `SAWCODE_DEBUG_MODE` (default: true)
- `SAWCODE_VERBOSE_LOGGING` (default: false)

## Testing

```bash
# Test feature flags
bun test-feature-flags.ts

# Interactive feature flags guide
bun FEATURE_FLAGS_GUIDE.ts

# Full integration test
bun integration-test.ts

# Type checking
bun run type-check

# Build
bun run build

# Run all tests
bun test

# Format code
bun run format
```

## File Operations Examples

```bash
# List files in current directory
bun src/cli.ts query "List the files in the current directory"

# Create a file
bun src/cli.ts query "Create a file called test.txt with content 'Hello World'"

# Read a file  
bun src/cli.ts query "Read the file test.txt"

# Append to file
bun src/cli.ts query "Create a file called log.txt and append 'New line' to it"
```

## Web Requests Examples

```bash
# GET request
bun src/cli.ts query "Fetch https://example.com and show me the headers"

# POST request (if tool can do it)
bun src/cli.ts query "Send a POST request to https://api.example.com/endpoint"
```

## Advanced Usage

```typescript
// Programmatic usage
import { Agent, bashTool, webfetchTool, filereadTool, filewriteTool, listdirTool } from './src/index.js'
import { getAvailableTools } from './src/utils/feature-flags.js'

// Only load enabled tools
const availableTools = getAvailableTools()
const tools = []
if (availableTools.bash) tools.push(bashTool)
if (availableTools.webfetch) tools.push(webfetchTool)
// etc...

const agent = new Agent({ tools })
const result = await agent.query('your prompt')
console.log(result.response)
```

## Documentation

- `README.md` - Main documentation
- `ADVANCED_FEATURES.md` - Feature flags, logging, conditional loading
- `FEATURE_FLAGS_GUIDE.ts` - Interactive feature flag guide (run it!)
- `integration-test.ts` - Integration test examples (run it!)
- `DEVELOPMENT.md` - Development guide
- `setup.md` - Setup instructions

## Tools Available

| Tool | Description | Flag |
|------|-------------|------|
| **bash** | Execute shell commands | `SAWCODE_ENABLE_BASH_TOOL` |
| **webfetch** | Fetch HTTP content | `SAWCODE_ENABLE_WEBFETCH_TOOL` |
| **fileread** | Read files from disk | `SAWCODE_ENABLE_FILE_TOOLS` |
| **filewrite** | Write files to disk | `SAWCODE_ENABLE_FILE_TOOLS` |
| **listdir** | List directory contents | `SAWCODE_ENABLE_FILE_TOOLS` |

## Logging

All queries automatically log:
- Query start with input length and model
- Tool execution with names and arguments
- Tool success/failure with result details
- Query completion with response length and tool count

Enable with: `DEBUG=query-handler bun src/cli.ts query "..."`

## Quick Troubleshooting

**"Tool not found"?**
→ Check `bun src/cli.ts tools` - tool may be disabled via feature flag

**No debug output?**
→ Run: `DEBUG=query-handler bun src/cli.ts query "test"`

**Want to see all flags?**
→ Run: `bun test-feature-flags.ts`

**Confused about feature flags?**
→ Run: `bun FEATURE_FLAGS_GUIDE.ts`

**Need examples?**
→ Read: `ADVANCED_FEATURES.md`

---

**SawCode Phase 4** - Ready for production! 🚀
