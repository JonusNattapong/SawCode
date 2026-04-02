# 🚀 SawCode: Getting Started Index

**Welcome to SawCode** - A production-ready AI agent framework built with Bun + TypeScript.

## 📚 Documentation Map

Start here based on your needs:

### 🏃 I just want to get started (60 seconds)
→ Read: **[QUICKSTART.md](QUICKSTART.md)**
- Installation
- First run
- Basic commands
- Example interactions

### 🛠 I want to understand the architecture
→ Read: **[DEVELOPMENT.md](DEVELOPMENT.md)**
- Architecture overview
- API reference
- How tools work
- State management
- Code examples

### 📖 I want to see what's been built
→ Read: **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)**
- What was implemented
- Testing results
- Project structure
- Features checklist

### 💻 I want to run code examples
→ Check: **[examples/](examples/)**
- `basic-query.ts` - Simple math queries
- `tool-usage.ts` - Using bash and webfetch
- `state-persistence.ts` - Save/resume conversations

### ⚙️ I need configuration help
→ Check: **[.env.example](.env.example)**
- All configuration options explained
- Default values
- Optional settings

---

## 🎯 Quick Reference

### Running the Agent

```bash
# Interactive mode (recommended)
bun src/cli.ts

# Quick query
bun src/cli.ts query "What is 2+2?"

# Run an example
bun examples/basic-query.ts
```

### Available Commands (in TUI)

```
/help          Show all commands
/tools         List available tools
/history       View conversation
/clear         Clear history
/exit          Exit the TUI
```

---

## 🗺 Repository Structure

```
SawCode/
│
├── 📖 Documentation
│   ├── README.md                 ← Project overview
│   ├── QUICKSTART.md             ← 60-second guide (START HERE!)
│   ├── DEVELOPMENT.md            ← Architecture & API reference
│   ├── COMPLETION_SUMMARY.md     ← What was built
│   └── INDEX.md                  ← This file
│
├── 💻 Source Code
│   └── src/
│       ├── index.ts              ← Agent class
│       ├── cli.ts                ← CLI entry point
│       ├── handlers/query.ts     ← API orchestration
│       ├── tools/                ← Bash & webfetch tools
│       ├── tui/REPL.tsx          ← Interactive UI
│       └── utils/                ← Helpers & utilities
│
├── 📝 Examples
│   └── examples/
│       ├── basic-query.ts
│       ├── tool-usage.ts
│       └── state-persistence.ts
│
├── 🔨 Scripts
│   └── scripts/
│       ├── setup.sh
│       ├── build.sh
│       └── dev.sh
│
├── ⚙️ Configuration
│   └── .env.example              ← Copy to .env and fill in
│
└── 📦 Package
    └── package.json              ← Scripts and dependencies
```

---

## 🚀 First-Time Setup

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Create configuration**
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

3. **Launch the agent**
   ```bash
   bun src/cli.ts
   ```

Done! You're ready to start. Type `/help` for commands.

---

## 💡 Common Tasks

### Ask the AI a question
```bash
bun src/cli.ts query "What is the capital of France?"
```

### Execute a shell command
```bash
bun src/cli.ts query "run: pwd"
```

### Fetch web content
```bash
bun src/cli.ts query "Fetch https://httpbin.org/json"
```

### Programmatic usage
```typescript
import { Agent } from './src/index'
const agent = new Agent()
const result = await agent.query('Hello!')
console.log(result.response)
```

---

## 🎓 Learning Path

1. **Beginner**: Read [QUICKSTART.md](QUICKSTART.md) and run examples
2. **Intermediate**: Read [DEVELOPMENT.md](DEVELOPMENT.md) and explore `src/`
3. **Advanced**: Modify code, create custom tools, extend functionality

---

## ❓ FAQ

**Q: Where do I get an API key?**  
A: https://console.anthropic.com/account/keys

**Q: Can I use a different model?**  
A: Yes, set `CLAUDE_MODEL` in `.env`

**Q: How do I create custom tools?**  
A: See [DEVELOPMENT.md](DEVELOPMENT.md) "Creating Custom Tools" section

**Q: Can I save conversations?**  
A: Yes, use `agent.exportState()` or see `examples/state-persistence.ts`

**Q: What if something doesn't work?**  
A: Check [DEVELOPMENT.md](DEVELOPMENT.md) "Troubleshooting" section

---

## 🎯 What to Try Next

1. **Launch the interactive TUI**: `bun src/cli.ts`
2. **Ask a complex question**: "What are the top 3 programming languages in 2026?"
3. **Use a tool**: "Run `ls -la` and tell me what files you see"
4. **Check tools**: Type `/tools` in the TUI
5. **View history**: Type `/history` in the TUI

---

## 📞 Need Help?

- **Quick questions**: Check [QUICKSTART.md](QUICKSTART.md)
- **Architecture questions**: Check [DEVELOPMENT.md](DEVELOPMENT.md)
- **Code examples**: Check [examples/](examples/)
- **Configuration issues**: Check [.env.example](.env.example)
- **Problems**: Check [DEVELOPMENT.md](DEVELOPMENT.md) troubleshooting section

---

## ✨ Features Overview

✅ **Real AI Agent** - Powered by Claude 3.5 Sonnet  
✅ **Interactive TUI** - Beautiful terminal interface  
✅ **Multiple Commands** - /help, /tools, /history, /clear, /exit  
✅ **Tool Support** - Execute bash commands and fetch web content  
✅ **State Persistence** - Save and resume conversations  
✅ **Full Source** - Read, modify, extend  
✅ **TypeScript** - Type-safe, no `any`  
✅ **Examples** - Three working examples included  

---

## 🎉 Ready to Go!

You've got everything you need to build amazing AI agents.

**Next step**: [Read QUICKSTART.md](QUICKSTART.md) →

```bash
bun src/cli.ts
```

Happy coding! 🚀
