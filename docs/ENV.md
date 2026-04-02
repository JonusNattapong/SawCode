# Environment Configuration Guide

The SawCode Agent uses environment variables for configuration management. This guide explains how to set up and use `.env` files.

## 🚀 Quick Start

### 1. Copy the Example File

```bash
cp .env.example .env
```

### 2. Edit .env with Your Settings

```bash
# Edit the file
nano .env
# or
code .env
# or
vim .env
```

### 3. Fill in Your Values

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
CLAUDE_MODEL=claude-opus-4-6
AGENT_TEMPERATURE=0.7
```

### 4. Use in Your Application

The environment variables are automatically loaded when your app starts.

## 📋 Environment Variables Reference

### 🔐 API Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | - | Your Anthropic API key (required for real API calls) |
| `CLAUDE_MODEL` | `claude-opus-4-6` | Claude model to use |

**Example:**
```env
ANTHROPIC_API_KEY=sk-ant-abc123xyz789
CLAUDE_MODEL=claude-opus-4-6
```

### 🤖 Agent Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_TEMPERATURE` | `0.7` | Creativity level (0.0 - 1.0) |
| `AGENT_MAX_TOKENS` | `2048` | Maximum response length |
| `AGENT_SYSTEM_PROMPT` | - | Custom system prompt |

**Example:**
```env
AGENT_TEMPERATURE=0.5
AGENT_MAX_TOKENS=4096
AGENT_SYSTEM_PROMPT=You are a helpful coding assistant.
```

### 💬 TUI Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `TUI_PROMPT` | `> ` | Custom prompt text |
| `TUI_SHOW_WELCOME` | `true` | Show welcome banner |
| `TUI_SHOW_HELP` | `true` | Show help on startup |
| `TUI_MAX_HISTORY` | `100` | Max history lines to display |

**Example:**
```env
TUI_PROMPT=🤖 Agent>
TUI_SHOW_WELCOME=true
TUI_SHOW_HELP=true
TUI_MAX_HISTORY=50
```

### 🔧 Tool Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_BASH_TOOL` | `true` | Enable bash execution tool |
| `ENABLE_WEBFETCH_TOOL` | `true` | Enable HTTP fetch tool |
| `BASH_TIMEOUT` | `30000` | Bash command timeout (ms) |
| `HTTP_TIMEOUT` | `5000` | HTTP request timeout (ms) |

**Example:**
```env
ENABLE_BASH_TOOL=true
ENABLE_WEBFETCH_TOOL=true
BASH_TIMEOUT=60000
HTTP_TIMEOUT=10000
```

### 🛠️ Development & Debugging

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment (`development` or `production`) |
| `DEBUG` | `` | Debug namespace (e.g., `sawcode:*`) |
| `VERBOSE` | `false` | Enable verbose logging |

**Example:**
```env
NODE_ENV=development
DEBUG=sawcode:*
VERBOSE=true
```

### 💾 Storage & Persistence

| Variable | Default | Description |
|----------|---------|-------------|
| `STATE_DIR` | `./state` | Directory for saving agent state |
| `AUTO_SAVE_INTERVAL` | `0` | Auto-save interval (ms, 0 = disabled) |

**Example:**
```env
STATE_DIR=./agent-state
AUTO_SAVE_INTERVAL=5000
```

### 🔌 Advanced Options

| Variable | Default | Description |
|----------|---------|-------------|
| `KILOCODE_API_URL` | - | Custom KiloCode API endpoint |
| `KILOCODE_API_KEY` | - | KiloCode API key |
| `KILOCODE_TOKEN` | - | KiloCode authentication token |

**Example:**
```env
KILOCODE_API_URL=https://api.kilocode.com
KILOCODE_API_KEY=your-key-here
KILOCODE_TOKEN=your-token-here
```

## 📝 Complete Example .env File

```env
# === Claude API ===
ANTHROPIC_API_KEY=sk-ant-abc123xyz789
CLAUDE_MODEL=claude-opus-4-6

# === Agent Settings ===
AGENT_TEMPERATURE=0.7
AGENT_MAX_TOKENS=2048
AGENT_SYSTEM_PROMPT=You are a helpful AI assistant.

# === TUI Settings ===
TUI_PROMPT=🤖 SawCode>
TUI_SHOW_WELCOME=true
TUI_SHOW_HELP=true
TUI_MAX_HISTORY=100

# === Tools ===
ENABLE_BASH_TOOL=true
ENABLE_WEBFETCH_TOOL=true
BASH_TIMEOUT=30000
HTTP_TIMEOUT=5000

# === Development ===
NODE_ENV=development
DEBUG=sawcode:*
VERBOSE=false

# === Storage ===
STATE_DIR=./state
AUTO_SAVE_INTERVAL=0
```

## 🔒 Security Best Practices

### 1. **Never Commit .env**

```bash
# ✅ GOOD - .env is in .gitignore
git status  # .env should NOT appear

# ❌ BAD - Don't do this
git add .env
git commit -m "Add secrets"
```

### 2. **Keep Secrets Secret**

```env
# ✅ GOOD - Use strong API keys
ANTHROPIC_API_KEY=sk-ant-very-long-random-key-that-is-hard-to-guess

# ❌ BAD - Don't use weak or shared keys
ANTHROPIC_API_KEY=test123
```

### 3. **Use .env.example for Templates**

```bash
# .env.example is safe to commit
git add .env.example
git commit -m "Add env example"

# .env is NOT committed (in .gitignore)
```

### 4. **Rotate Keys Regularly**

```bash
# If a key is compromised:
# 1. Generate a new key from the API provider
# 2. Update your .env file
# 3. Delete the old key from the provider
```

## 🚀 Usage in Code

### Load Environment Configuration

```typescript
import { loadEnvConfig, printEnvConfig } from '@sawcode/agent'

const config = loadEnvConfig()
console.log(config.claudeModel)  // claude-opus-4-6
console.log(config.agentTemperature)  // 0.7
```

### Validate Required Variables

```typescript
import { validateEnv } from '@sawcode/agent'

// This will error if ANTHROPIC_API_KEY is not set
validateEnv(['ANTHROPIC_API_KEY'])
```

### Create Logger

```typescript
import { createLogger } from '@sawcode/agent'

const log = createLogger('my-module')
log.info('Application started')
log.debug('Debug info', { data: 'value' })
```

### Print Configuration (Masked)

```typescript
import { loadEnvConfig, printEnvConfig } from '@sawcode/agent'

const config = loadEnvConfig()
printEnvConfig(config)
// Output:
// ⚙️  Configuration:
// ──────────────────────────────────────
//   Model:        claude-opus-4-6
//   Temperature:  0.7
//   API Key:      ***
```

## 🔍 Debugging Environment Issues

### Check What Variables Are Loaded

```bash
# Enable debug mode
DEBUG=sawcode:* bun run example

# Check current environment
bun -e "console.log(process.env)"
```

### Validate .env File

```bash
# Check if .env exists
ls -la .env

# Check if values are set
grep ANTHROPIC_API_KEY .env

# Validate as JSON (if using JSON format)
jq -R 'split("\n") | map(select(length > 0))' .env
```

### Common Issues

**Issue: Variables not loading**
- Solution: Make sure `.env` exists in project root
- Check that variable names are spelled correctly
- Restart your application

**Issue: API key not working**
- Solution: Verify the key is correct
- Check for extra whitespace: `ANTHROPIC_API_KEY=sk-...` (no spaces)
- Confirm the key hasn't been revoked

**Issue: Wrong values being used**
- Solution: Environment variables override `.env`
- Check: `echo $ANTHROPIC_API_KEY`
- Use `printEnvConfig()` to verify what's loaded

## 📚 Related Files

- [`.env.example`](../.env.example) - Template with all available variables
- [`.env`](.../.env) - Your local configuration (NOT committed)
- [`.gitignore`](../.gitignore) - Ensures `.env` is not committed
- [`src/utils/env.ts`](../src/utils/env.ts) - Environment loading code

## ✅ Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in `ANTHROPIC_API_KEY`
- [ ] Set `CLAUDE_MODEL` if needed
- [ ] Configure `AGENT_TEMPERATURE` if needed
- [ ] Configure TUI settings (optional)
- [ ] Verify `.env` is in `.gitignore`
- [ ] Test with `bun run tui`
- [ ] Run `bun run example`

---

**📖 See Also:** [README.md](../README.md), [DEVELOPMENT.md](../DEVELOPMENT.md)
