# SawCode CLI: New Features & Enhancements

## Overview

The SawCode CLI has been enhanced with powerful new commands for state management, tool discovery, and conversation export. All features now include **automatic state persistence** across CLI invocations.

---

## ✨ New Commands

### 1. **export** - Export Conversation History

Export your conversation in multiple formats:

```bash
# JSON format (default)
bun src/cli.ts export json

# Markdown format (readable)
bun src/cli.ts export md > conversation.md

# CSV format (spreadsheet-friendly)
bun src/cli.ts export csv > conversation.csv
```

**Output Example (Markdown):**
```markdown
# SawCode Conversation Export

## 1. 👤 USER
What is 2+2?

## 2. 🤖 ASSISTANT
2 + 2 = 4
```

---

### 2. **tools** - List Available Tools

Discover all available tools with their descriptions and input schemas:

```bash
bun src/cli.ts tools
```

**Output:**
```
🔧 Available Tools (2):

1. bash
   Execute bash commands in the shell. Returns stdout/stderr output.

2. webfetch
   Fetch content from a URL. Supports GET/POST/PUT/DELETE requests.
```

---

### 3. **config** - Show Configuration

Display current agent configuration including model, temperature, API status, and enabled tools:

```bash
bun src/cli.ts config
```

**Output:**
```
⚙️  Current Configuration:

Model: qwen3-coder-next:cloud
Temperature: 0.7
Max Tokens: 4096
API: ✅ Configured
DEBUG: sawcode:*
NODE_ENV: development

Tools:
  - bash
  - webfetch
```

---

### 4. **reset** - Clear History

Clear all conversation history and remove the state file:

```bash
bun src/cli.ts reset
```

**Output:**
```
✅ Conversation history cleared
```

---

### 5. **help** - Updated Help

Help text now includes all new commands with examples:

```bash
bun src/cli.ts help
```

---

## 🔄 Automatic State Persistence

**Key Feature:** Conversation state is now automatically saved after each query and loaded on startup.

### How It Works

1. After each `query` command, the conversation state is saved to `.sawcode-state.json`
2. All subsequent `query` commands load the previous state first
3. This means multi-turn conversations work across CLI invocations!

### Example Multi-Turn Conversation

```bash
# First query
$ bun src/cli.ts query "What is 2+2?"
📝 Query: What is 2+2?
🤖 Response: 2 + 2 = 4

# Second query - context is preserved!
$ bun src/cli.ts query "Multiply by 5"
📝 Query: Multiply by 5
🤖 Response: 4 × 5 = 20

# View full history
$ bun src/cli.ts history
📜 Message History (4 messages):
1. [user] What is 2+2?...
2. [assistant] 2 + 2 = 4...
3. [user] Multiply by 5...
4. [assistant] 4 × 5 = 20...
```

### State File Location

By default, state is saved to `.sawcode-state.json` in the current working directory.

To use a custom location, set the `STATE_DIR` environment variable:

```bash
export STATE_DIR=./state
bun src/cli.ts query "Hello"
# State saved to ./state/agent-state.json
```

---

## 📋 Complete Command Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `query <msg>` | Send a query to the agent | `bun src/cli.ts query "Hello"` |
| `history` | Show message history | `bun src/cli.ts history` |
| `export [fmt]` | Export history (json\|md\|csv) | `bun src/cli.ts export md` |
| `tools` | List available tools | `bun src/cli.ts tools` |
| `config` | Show current configuration | `bun src/cli.ts config` |
| `reset` | Clear all history | `bun src/cli.ts reset` |
| `tui` | Start interactive TUI | `bun src/cli.ts tui` |
| `help` | Show help message | `bun src/cli.ts help` |

---

## 🎯 Use Cases

### 1. Scripting & Automation
```bash
#!/bin/bash
# Multi-step workflow
bun src/cli.ts reset
bun src/cli.ts query "What is Docker?"
bun src/cli.ts query "Explain containers?"
bun src/cli.ts export md > docker-notes.md
```

### 2. Integration with CI/CD
```bash
# GitHub Actions example
- run: bun src/cli.ts query "Summarize the files in src/"
- run: bun src/cli.ts export json > report.json
- run: echo "Summary:" && bun src/cli.ts history
```

### 3. Documentation Generation
```bash
bun src/cli.ts reset
for topic in "REST APIs" "GraphQL" "WebSockets"; do
  bun src/cli.ts query "Explain $topic in detail"
done
bun src/cli.ts export md > api-guide.md
```

### 4. Interactive Analysis
```bash
# Start with a dataset question
bun src/cli.ts query "What columns do we have in the users table?"

# Follow up questions maintain context
bun src/cli.ts query "Show me the distribution of user ages"
bun src/cli.ts query "What's the trend over time?"

# Export final analysis
bun src/cli.ts export json > analysis.json
```

---

## 🛠️ Implementation Details

### State Persistence Architecture

```
CLI Invocation
    ↓
├─ Load state from .sawcode-state.json (if exists)
├─ Create/Update Agent with loaded messages
├─ Execute command (query/export/reset)
├─ Save state to .sawcode-state.json
└─ Exit
```

### Supported Export Formats

| Format | Use Case | Output |
|--------|----------|--------|
| **JSON** | Programmatic processing, APIs | Full structured data |
| **Markdown** | Documentation, readability | Formatted headers + content |
| **CSV** | Spreadsheet analysis | Tabular with Index, Type, Content |

---

## 🔐 Configuration via Environment

```bash
# Set model
export CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Set temperature (0-2)
export AGENT_TEMPERATURE=0.5

# Set max tokens
export AGENT_MAX_TOKENS=8000

# Storage location
export STATE_DIR=./state

# Enable debug output
export DEBUG=sawcode:*

# Then run commands
bun src/cli.ts query "What is AI?"
```

---

## 📝 Examples

### Export a conversation for sharing
```bash
bun src/cli.ts export md > team-discussion.md
cat team-discussion.md
```

### Batch query multiple questions
```bash
for q in "What is Docker?" "What is Kubernetes?" "What is Helm?"; do
  bun src/cli.ts query "$q"
done
bun src/cli.ts export json | jq '.messages' > k8s-knowledge.json
```

### Check agent readiness
```bash
bun src/cli.ts config
bun src/cli.ts tools
```

### Reset and start fresh
```bash
bun src/cli.ts reset
bun src/cli.ts query "First message in new session"
```

---

## 🚀 Next Steps

These CLI enhancements enable:
- ✅ Automated workflows and scripting
- ✅ Multi-turn conversations across sessions
- ✅ Easy data export and analysis
- ✅ Better tool discovery
- ✅ Configuration verification

**Ready to build with SawCode!**
