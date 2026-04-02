# Refactoring Plan - Align with Reference Patterns

Based on analysis of `.reference/claudecode`, here's how to refactor our SawCode agent to follow established patterns.

## 🎯 Phase 1: Type Organization (PRIORITY: HIGH)

### Current State
```
src/types.ts              # All types in one file
```

### Target State
```
src/types/
├── index.ts              # Re-exports all types
├── agent.ts              # Agent-related types
├── messages.ts           # Message types (user, assistant, tool)
├── tools.ts              # Tool definition and execution types
├── permissions.ts        # Permission checking types
├── ids.ts                # Branded string types (AgentId, SessionId, etc.)
├── errors.ts             # Error types
└── utils.ts              # Utility types (DeepImmutable, etc.)
```

### Why
- Reduces circular import issues
- Matches reference patterns exactly
- Easier to find related types
- Better scalability as project grows

---

## 🎯 Phase 2: Service Architecture (PRIORITY: HIGH)

### Current State
```
src/
├── tools/
├── handlers/
├── providers/
└── utils/
```

### Target State
```
src/
├── types/                # Phase 1
├── services/
│   ├── index.ts
│   ├── agents/           # Agent management
│   │   ├── agentRegistry.ts
│   │   ├── agentLoader.ts
│   │   └── sessionManager.ts
│   ├── tools/            # Tool execution
│   │   ├── toolRegistry.ts
│   │   ├── toolExecutor.ts
│   │   └── toolValidator.ts
│   ├── config/           # Configuration
│   │   └── configLoader.ts
│   ├── providers/        # External integrations (KiloCode, etc.)
│   │   ├── kilocode.ts
│   │   └── index.ts
│   └── logging/          # Logging and diagnostics
│       ├── logger.ts
│       └── diagnostics.ts
├── utils/
│   ├── env.ts
│   ├── config.ts
│   ├── errors.ts
│   ├── logger.ts
│   └── ...
├── cli/                  # CLI interface
├── tui/                  # Terminal UI
└── commands.ts           # Command registry
```

### Why
- Scales better than flat structure
- Clear separation of concerns
- Easier to test services independently
- Matches reference organization

---

## 🎯 Phase 3: Setup & Initialization (PRIORITY: HIGH)

### Create `src/setup.ts`

```typescript
// Replaces current initialization logic
// Should handle:
// - Feature detection (Bun vs Node)
// - Configuration loading
// - Service initialization
// - Permission system setup
// - Logging initialization
// - Version checking
```

### Create `src/bootstrap/`

```typescript
bootstrap/
├── state.ts              # Global application state
├── config.ts             # Config initialization
└── features.ts           # Feature detection
```

---

## 🎯 Phase 4: Configuration System (PRIORITY: MEDIUM)

### Create `src/utils/config.ts`

```typescript
// Centralized config loading:
// - Environment variables
// - .env file parsing
// - CLAUDE.md project config
// - Runtime configuration merging
// - Config validation
```

### Update `.env.example` and `.env`

```env
# Follow reference pattern with organized sections
```

---

## 🎯 Phase 5: Command System (PRIORITY: MEDIUM)

### Refactor `src/commands.ts`

```typescript
// Central command registry:
// - Define all commands with metadata
// - Permission requirements
// - Help text
// - Handler functions
// - Progress tracking

export const COMMANDS = {
  // CLI commands
  'gateway': { ... },
  'agent': { ... },
  'tui': { ... },
  // REPL commands
  'help': { ... },
  'history': { ... },
  'clear': { ... },
  // etc.
}
```

---

## 🎯 Phase 6: Error Handling (PRIORITY: MEDIUM)

### Create `src/utils/errors.ts`

```typescript
// Centralized error utilities:
// - Custom error classes
// - Error formatting
// - Error codes
// - Recovery suggestions
```

### Create `src/utils/log.ts`

```typescript
// Logging with colors and formatting:
// - logError()
// - logWarn()
// - logInfo()
// - logSuccess()
// - logDebug()
// - logForDiagnosticsNoPII()
```

---

## 🎯 Phase 7: ID System (PRIORITY: LOW)

### Create `src/types/ids.ts`

```typescript
// Branded string types (from reference):
// - AgentId (unique string type)
// - SessionId
// - ToolId
// - CommandId
// - etc.

type AgentId = string & { readonly __brand: 'AgentId' }
export const asAgentId = (id: string): AgentId => id as AgentId
```

---

## 🎯 Phase 8: Feature Detection (PRIORITY: LOW)

### Create `src/utils/runtime.ts`

```typescript
// Feature detection:
// - isBun()
// - isNode()
// - getNodeVersion()
// - hasTerminalSupport()
// - getShellType()
```

---

## 📋 Refactoring Checklist

### Phase 1: Type Organization
- [ ] Create `src/types/` directory
- [ ] Split types across subfiles
- [ ] Create `src/types/index.ts` with re-exports
- [ ] Update imports throughout codebase
- [ ] Fix circular dependencies

### Phase 2: Service Architecture
- [ ] Create `src/services/` directory
- [ ] Move tools logic to `services/tools/`
- [ ] Move agents logic to `services/agents/`
- [ ] Move providers to `services/providers/`
- [ ] Create service layer abstraction

### Phase 3: Setup & Initialization
- [ ] Create `src/setup.ts`
- [ ] Create `src/bootstrap/state.ts`
- [ ] Create `src/bootstrap/config.ts`
- [ ] Update main entry point to use setup()
- [ ] Add feature detection

### Phase 4: Configuration
- [ ] Create `src/utils/config.ts`
- [ ] Add config merging logic
- [ ] Support CLAUDE.md loading
- [ ] Add environment validation

### Phase 5: Commands
- [ ] Create `src/commands.ts` registry
- [ ] Move CLI commands to registry
- [ ] Add command metadata
- [ ] Implement command dispatcher

### Phase 6: Error Handling
- [ ] Create `src/utils/errors.ts`
- [ ] Create `src/utils/log.ts`
- [ ] Update all error handling
- [ ] Add diagnostic logging

### Phase 7: IDs
- [ ] Create branded ID types
- [ ] Add type guards
- [ ] Update all ID usage

### Phase 8: Features
- [ ] Create `src/utils/runtime.ts`
- [ ] Add feature detection
- [ ] Update initialization logic

---

## 🚀 Estimated Effort

| Phase | Effort | Impact | Priority |
|-------|--------|--------|----------|
| 1: Types | 2 hours | HIGH | HIGH |
| 2: Services | 3 hours | HIGH | HIGH |
| 3: Setup | 2 hours | MEDIUM | HIGH |
| 4: Config | 1 hour | MEDIUM | MEDIUM |
| 5: Commands | 2 hours | MEDIUM | MEDIUM |
| 6: Errors | 1 hour | MEDIUM | MEDIUM |
| 7: IDs | 1 hour | LOW | LOW |
| 8: Features | 1 hour | LOW | LOW |

**Total: ~13 hours (spread across sessions)**

---

## 📝 Starting Point

1. **Start with Phase 1** (Types) - foundation for everything
2. **Then Phase 2** (Services) - improves organization
3. **Then Phase 3** (Setup) - better initialization
4. Rest as time permits - nice-to-haves

---

## ✅ Success Criteria

- [ ] Code structure matches reference patterns
- [ ] All tests still pass
- [ ] No circular imports
- [ ] Better separation of concerns
- [ ] Easier to add new features
- [ ] Aligns with Claude Code conventions
