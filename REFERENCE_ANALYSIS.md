# Reference Code Analysis

Analysis of `.reference/claudecode` patterns and conventions to align our implementation.

## 📁 Directory Structure Observed

```
.reference/claudecode/
├── assistant/              # Assistant/conversation logic
├── bootstrap/              # Initialization and state
├── bridge/                 # Bridge protocol & communication
├── buddy/                  # UI companion features
├── cli/                    # CLI handlers and utilities
├── commands/               # Command implementations
├── components/             # React/UI components
├── constants/              # Constants and configuration
├── context/                # Context providers
├── coordinator/            # Coordination logic
├── entrypoints/            # SDK types and entry points
│   └── sdk/               # SDK schema definitions
├── hooks/                  # React hooks
├── ink/                    # Terminal UI with Ink
├── keybindings/            # Keyboard shortcuts
├── memdir/                 # Memory/storage
├── migrations/             # Database migrations
├── native-ts/              # Native TypeScript
├── services/               # Services (analytics, MCP, etc.)
├── tools/                  # Tool implementations
├── types/                  # Type definitions
└── utils/                  # Utility functions

Key files:
- setup.ts              # Initialization with feature detection
- commands.ts           # Command registry
- Tool.ts               # Tool type definitions
- tools.ts              # Tool utilities
- QueryEngine.ts        # Query processing engine
- query.ts              # Query implementation
```

## 🎯 Key Patterns Observed

### 1. **Setup & Initialization**
```typescript
// Single setup() function that:
// - Validates runtime (Node.js version check)
// - Initializes state
// - Configures environment
// - Sets up analytics/logging
// - Detects git repo, project config
// - Initializes session memory
// - Sets up file watchers
```

### 2. **Type Organization**
```typescript
// Centralized in types/ directory:
// - types/message.ts       (message types)
// - types/tools.ts         (tool types and progress)
// - types/permissions.ts   (permission types)
// - types/hooks.ts         (hook types)
// - types/ids.ts           (ID types with branded strings)
// - types/utils.ts         (utility types)

// Avoids circular imports by centralizing types
```

### 3. **Configuration System**
```typescript
// Uses Utils for config:
// - utils/config.js        (getCurrentProjectConfig)
// - utils/env.js           (Environment variables)
// - utils/envDynamic.js    (Dynamic env loading)
// - utils/envUtils.js      (Utility functions)
// - CLAUDE.md files        (Project-specific config)
```

### 4. **Services Architecture**
```typescript
// Organized services:
services/
├── analytics/            # Event tracking
├── SessionMemory/        # Session state
├── mcp/                  # MCP server integration
├── tools/                # Tool execution
└── AgentSummary/         # Agent summarization
```

### 5. **Tool System**
```typescript
// Tool definition includes:
// - name, description
// - input schema (JSON Schema)
// - handler function
// - annotations (optional)
// - progress tracking

// Tool execution pipeline:
// 1. Validation against schema
// 2. Permission checking
// 3. Execution with streaming
// 4. Result processing
```

### 6. **Command Pattern**
```typescript
// Commands have:
// - handler function
// - permission requirements
// - progress tracking
// - error handling
// - logging

// Registered in commands.ts with metadata
```

### 7. **Error Handling**
```typescript
// Centralized error utilities:
// - utils/errors.js       (Error formatting)
// - utils/log.js          (Logging with colors)
// - logForDiagnosticsNoPII (Diagnostic logging)
```

### 8. **Feature Detection**
```typescript
// Uses feature detection:
// - bun:bundle for Bun features
// - Git detection
// - Terminal type detection
// - OS-specific features (iTerm, Apple Terminal)
```

## 🔧 Patterns to Adopt in Our Code

### ✅ DO:

1. **Centralize Types**
   - All types in `src/types/` subdirectory
   - Break circular imports by centralizing

2. **Setup Function**
   - Single async setup() for initialization
   - Feature detection
   - State initialization

3. **Service Architecture**
   - Organize related functionality in services
   - Clear separation of concerns
   - Each service has specific responsibility

4. **Configuration**
   - Use utils/config for runtime configuration
   - Support project-level CLAUDE.md
   - Environment-based configuration

5. **Error Handling**
   - Centralized error utilities
   - Formatted output
   - Diagnostic logging

6. **Command Registry**
   - Central commands.ts with metadata
   - Permission checking
   - Progress tracking

### ❌ DON'T:

1. **Don't scatter types across files** - Centralize them
2. **Don't skip setup/initialization** - Use proper setup function
3. **Don't mix services** - Keep clear separation
4. **Don't ignore permissions** - Check early
5. **Don't forget logging** - Use structured logging

## 📝 Implementation Checklist

For our SawCode agent to align with reference patterns:

- [ ] Reorganize types into `src/types/` subdirectory
- [ ] Create `src/services/` for major features
- [ ] Create `setup.ts` for initialization
- [ ] Create `src/commands.ts` registry
- [ ] Centralize configuration in `src/utils/config.ts`
- [ ] Add diagnostic logging
- [ ] Add feature detection (Bun vs Node)
- [ ] Use branded string types for IDs
- [ ] Add permission checking system
- [ ] Create agents loader similar to AgentTool

## 🎨 Code Style Observations

```typescript
// They use:
// - ESM modules exclusively
// - Strict TypeScript (noImplicitAny, strict mode)
// - Zod for schema validation
// - Chalk for colored output
// - Branded types for IDs
// - Exhaustive switch statements
// - No loose equality (===)
// - Custom eslint rules

// Comments use:
// - Biome-ignore lint comments
// - JSDoc for public APIs
// - Section dividers (long dashes)
```

## 🚀 Next Steps

1. Study `src/types/ids.ts` pattern (branded strings)
2. Look at `src/services/` organization
3. Examine `src/utils/config.ts` implementation
4. Review `setup.ts` initialization pattern
5. Check `commands.ts` command registry
6. Study tool execution in QueryEngine.ts

---

This analysis helps us align our implementation with established Claude Code patterns.
