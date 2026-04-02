# SawCode Complete Phase Roadmap

**Goal**: Build from current state → Full-featured Claude Code-inspired framework

**Reference Base**: Claude Code (~800+ files, ~100K lines) analyzed and distilled into SawCode phases  
**Target**: Production-ready agent framework with Git, Review, Voice, and advanced features

---

## Current State (Phase 18 Complete)
- ✅ Core Agent + 18+ tools (bash, webfetch, fileread, filewrite, listdir, grep, find, tree, git-*, github-*, etc.)
- ✅ CLI + TUI with state persistence
- ✅ Feature flags system (13 flags)
- ✅ Code display (syntax highlighting, markdown parsing, streaming)
- ✅ Git & GitHub Integration (status, diff, branch, add, commit, PR helper)
- ✅ Context Extraction (file/directory context, code analysis, git history)
- ✅ Code Review (automated review, suggestions, compliance checking)
- ✅ Voice & Audio (TTS, STT, audio processing)
- ✅ AI Features (code generator, semantic search, optimization suggester)
- ✅ GitHub Actions CI/CD (build, release, quality, security, deploy)
- ✅ v0.1.0 Released on GitHub
- **~17,000+ lines** of production code

---

## Claude Code Reference Architecture Analysis

The `.reference/claudecode/` directory contains the full Claude Code codebase (~800+ files). Here's a detailed breakdown of each folder and what patterns/architectures it implements:

### Root-Level Architecture (18 files)
| File | Purpose | SawCode Status |
|------|---------|----------------|
| `main.tsx` | CLI entry point, Commander.js, startup orchestration | ✅ Implemented (cli.ts) |
| `query.ts` | Core query loop, streaming, autocompact, token budgets | ⚠️ Partial (handlers/query.ts) |
| `QueryEngine.ts` | Query lifecycle, SDK wrapping, message persistence | ❌ Not implemented |
| `Tool.ts` | Tool type system, factory, permission context | ✅ Implemented (tools/index.ts) |
| `tools.ts` | Tool registry, MCP tools, deny rules, REPL mode | ✅ Implemented |
| `commands.ts` | Command registry, 60+ slash commands | ⚠️ Partial |
| `context.ts` | System context, Git status, CLAUDE.md loading | ⚠️ Partial |
| `cost-tracker.ts` | Cost tracking, token usage, USD cost | ❌ Not implemented |
| `history.ts` | Prompt history, JSONL persistence | ❌ Not implemented |
| `setup.ts` | Session setup, worktree, tmux, plugins | ❌ Not implemented |

### Key Folders & Patterns

#### 1. `assistant/` (1 file)
**Purpose**: Session history for the assistant (Kairos) mode
- `sessionHistory.ts` — Manages assistant session discovery and history
- **Pattern**: Session-based history with discovery

#### 2. `bootstrap/` (1 file)
**Purpose**: Application state initialization
- `state.ts` — Central mutable state store (session ID, project root, CWD, model, flags)
- **Pattern**: Global state singleton with typed mutations

#### 3. `bridge/` (31 files)
**Purpose**: Remote REPL Bridge — WebSocket control plane for remote/mobile sessions
- **Core**: `bridgeMain.ts`, `bridgeApi.ts`, `bridgeConfig.ts`, `replBridge.ts`
- **Transport**: `replBridgeTransport.ts`, `bridgeMessaging.ts`
- **Auth**: `jwtUtils.ts`, `trustedDevice.ts`, `workSecret.ts`
- **Session**: `createSession.ts`, `sessionRunner.ts`, `sessionIdCompat.ts`
- **Pattern**: WebSocket transport, JWT authentication, device trust, session isolation

#### 4. `buddy/` (6 files)
**Purpose**: AI Companion — Animated sprite companion with notifications
- `companion.ts`, `CompanionSprite.tsx`, `prompt.ts`, `sprites.ts`, `types.ts`, `useBuddyNotification.tsx`
- **Pattern**: React sprite renderer, notification hooks

#### 5. `cli/` (19 files)
**Purpose**: CLI entry point and transports
- **Handlers**: `auth.ts`, `agents.ts`, `mcp.tsx`, `plugins.ts`, `autoMode.ts`
- **Transports**: `WebSocketTransport.ts`, `SSETransport.ts`, `HybridTransport.ts`, `ccrClient.ts`, `SerialBatchEventUploader.ts`
- **IO**: `print.ts`, `structuredIO.ts`, `remoteIO.ts`, `ndjsonSafeStringify.ts`
- **Pattern**: Multiple transport strategies, structured output, NDJSON streaming

#### 6. `commands/` (~100+ files)
**Purpose**: Slash commands — Every `/command` available in the REPL
- Subdirectories: `clear/`, `compact/`, `config/`, `context/`, `cost/`, `diff/`, `doctor/`, `export/`, `help/`, `init/`, `memory/`, `model/`, `session/`, `skills/`, `status/`, `theme/`, `vim/`, `voice/`, etc.
- **Pattern**: Command objects with `type: 'prompt' | 'local' | 'local-jsx'`, description, handler

#### 7. `components/` (~150+ files)
**Purpose**: React/Ink UI components
- **Core**: `App.tsx`, `Messages.tsx`, `Message.tsx`, `Markdown.tsx`
- **Dialogs**: `ApproveApiKey.tsx`, `BypassPermissionsModeDialog.tsx`, `TrustDialog/`, `InvalidSettingsDialog.tsx`
- **Design System**: `design-system/` (ThemeProvider, ThemedBox, ThemedText, color)
- **Tool UI**: `FileEditToolDiff.tsx`, `FallbackToolUseErrorMessage.tsx`, `BashModeProgress.tsx`
- **Pattern**: React components rendered via Ink for terminal UI

#### 8. `constants/` (21 files)
**Purpose**: Application constants
- `apiLimits.ts` — Token/context window limits per model
- `tools.ts` — Tool disallow lists for agents
- `systemPromptSections.ts` — System prompt building blocks
- `prompts.ts`, `messages.ts` — Prompt templates
- `oauth.ts` — OAuth configuration
- `product.ts` — Product metadata
- `xml.ts` — XML tag constants for tool results

#### 9. `context/` (9 files)
**Purpose**: React context providers
- `stats.tsx`, `notifications.tsx`, `mailbox.tsx`, `modalContext.tsx`, `overlayContext.tsx`, `voice.tsx`, `fpsMetrics.tsx`
- **Pattern**: React context for global state

#### 10. `coordinator/` (1 file)
**Purpose**: Multi-agent orchestration
- `coordinatorMode.ts` — Coordinator mode for spawning/managing worker agents
- **Pattern**: Multi-agent coordination

#### 11. `entrypoints/` (8 files)
**Purpose**: Application entry points
- `cli.tsx`, `init.ts`, `mcp.ts`, `agentSdkTypes.ts`, `sdk/`, `sandboxTypes.ts`
- **Pattern**: Multiple entry points for different use cases

#### 12. `hooks/` (~100+ files)
**Purpose**: React hooks for the REPL
- **Input**: `useTextInput.ts`, `useVimInput.ts`, `usePasteHandler.ts`, `useArrowKeyHistory.tsx`
- **Keybindings**: `useCommandKeybindings.tsx`, `useGlobalKeybindings.tsx`
- **IDE**: `useIDEIntegration.tsx`, `useIdeConnectionStatus.ts`
- **Tools**: `useCanUseTool.tsx`, `useMergedTools.ts`
- **Voice**: `useVoice.ts`, `useVoiceIntegration.tsx`
- **Swarm**: `useSwarmInitialization.ts`, `useSwarmPermissionPoller.ts`
- **Notifications**: `notifs/` (17 notification hooks)
- **Permissions**: `toolPermission/` (permission handlers)
- **Pattern**: Custom React hooks for state management, side effects, UI interactions

#### 13. `ink/` (~95 files)
**Purpose**: Custom Ink implementation — Forked/extended Ink for terminal rendering
- **Core**: `root.ts`, `renderer.ts`, `reconciler.ts`, `dom.ts`, `output.ts`
- **Layout**: `layout/engine.ts`, `layout/yoga.ts` (Yoga layout engine)
- **Components**: `Box.tsx`, `Text.tsx`, `Button.tsx`, `ScrollBox.tsx`, `Link.tsx`
- **Events**: `events/` (click, input, keyboard, terminal focus)
- **Hooks**: `use-input.ts`, `use-app.ts`, `use-stdin.ts`, `use-animation-frame.ts`
- **Terminal I/O**: `termio/` (ANSI, CSI, DEC, OSC, SGR parsing)
- **Pattern**: React reconciler for terminal, Yoga flexbox layout, ANSI escape handling

#### 14. `keybindings/` (14 files)
**Purpose**: Keybinding system
- `defaultBindings.ts`, `parser.ts`, `match.ts`, `resolver.ts`, `validate.ts`, `loadUserBindings.ts`, `KeybindingContext.tsx`
- **Pattern**: Declarative keybinding configuration, conflict detection, user customization

#### 15. `memdir/` (8 files)
**Purpose**: Memory management — Storing and retrieving AI memories
- `memdir.ts`, `findRelevantMemories.ts`, `memoryScan.ts`, `teamMemPaths.ts`, `teamMemPrompts.ts`
- **Pattern**: File-based memory storage, relevance scoring, team sharing

#### 16. `migrations/` (11 files)
**Purpose**: Configuration migrations
- Model migrations: `migrateFennecToOpus.ts`, `migrateSonnet1mToSonnet45.ts`, `migrateOpusToOpus1m.ts`
- Settings migrations: `migrateAutoUpdatesToSettings.ts`, `migrateBypassPermissionsAcceptedToSettings.ts`
- **Pattern**: Versioned migrations run at startup, one-time config transformations

#### 17. `native-ts/` (4 files)
**Purpose**: Native TypeScript bindings
- `color-diff/`, `file-index/`, `yoga-layout/`
- **Pattern**: Native bindings for performance-critical operations

#### 18. `outputStyles/` (1 file)
**Purpose**: Output style loading
- `loadOutputStylesDir.ts` — Loads custom output style directories

#### 19. `plugins/` (2 files)
**Purpose**: Plugin system
- `builtinPlugins.ts`, `bundled/index.ts`
- **Pattern**: Built-in plugin registration

#### 20. `query/` (4 files)
**Purpose**: Query support modules
- `config.ts` — Query configuration (feature gates, session state)
- `deps.ts` — Dependency injection for query (callModel, microcompact, autocompact)
- `stopHooks.ts` — Stop hook execution after turns
- `tokenBudget.ts` — Token budget tracking and auto-continue

#### 21. `remote/` (4 files)
**Purpose**: Remote session management
- `RemoteSessionManager.ts`, `remotePermissionBridge.ts`, `sdkMessageAdapter.ts`, `SessionsWebSocket.ts`
- **Pattern**: Remote session lifecycle, permission forwarding

#### 22. `schemas/` (1 file)
**Purpose**: Schema definitions
- `hooks.ts` — Hook schema definitions

#### 23. `screens/` (3 files)
**Purpose**: Main application screens
- `REPL.tsx` — The main REPL interface (~3000+ lines)
- `Doctor.tsx` — Diagnostics screen
- `ResumeConversation.tsx` — Session resume picker

#### 24. `server/` (3 files)
**Purpose**: Direct connection server
- `createDirectConnectSession.ts`, `directConnectManager.ts`, `types.ts`
- **Pattern**: Direct connection management

#### 25. `services/` (~100+ files)
**Purpose**: Backend services
- `analytics/` — Analytics, GrowthBook feature flags, telemetry
- `compact/` — Context compaction (autocompact, reactive compact, snip, microcompact)
- `mcp/` — MCP client/server (23 files — config, approval, connectivity, official registry)
- `lsp/` — LSP server integration
- `oauth/` — OAuth flows
- `plugins/` — Plugin management
- `policyLimits/` — Policy enforcement
- `remoteManagedSettings/` — Enterprise settings
- `SessionMemory/` — Session memory persistence
- `settingsSync/` — Settings synchronization
- `teamMemorySync/` — Team memory synchronization
- `tips/` — Tip registry and suggestions
- `tools/` — Tool orchestration, streaming executor
- `toolUseSummary/` — Tool use summarization
- `voice/` — Voice processing, STT
- **Pattern**: Service-oriented architecture, async operations, hot-reload

#### 26. `skills/` (20 files)
**Purpose**: Skill system — Extensible command/skill framework
- `loadSkillsDir.ts`, `bundledSkills.ts`, `mcpSkillBuilders.ts`
- `bundled/` — 18 bundled skills (batch, API, debug, keybindings, scheduling, verification, etc.)
- **Pattern**: Directory-based skill loading, MCP integration, dynamic discovery

#### 27. `state/` (6 files)
**Purpose**: Application state management
- `AppStateStore.ts`, `AppState.tsx`, `store.ts`, `selectors.ts`, `onChangeAppState.ts`, `teammateViewHelpers.ts`
- **Pattern**: React context + reducer pattern, immutable state updates

#### 28. `tasks/` (12 files)
**Purpose**: Task implementations
- `LocalShellTask/`, `LocalAgentTask/`, `RemoteAgentTask/`, `DreamTask/`, `InProcessTeammateTask/`, `LocalMainSessionTask.ts`, `stopTask.ts`
- **Pattern**: Task lifecycle (pending → running → completed/failed/killed), output streaming

#### 29. `tools/` (~100+ files)
**Purpose**: Tool implementations — Every tool the AI can use
- **Core Tools**:
  - `BashTool/` (18 files) — Shell execution with security sandboxing
  - `FileReadTool/` (5 files) — File reading with image support
  - `FileEditTool/` (6 files) — File editing with diffs
  - `FileWriteTool/` — File writing
  - `GlobTool/` — File pattern matching
  - `GrepTool/` — Content search
  - `WebFetchTool/` (5 files) — URL fetching
  - `WebSearchTool/` (3 files) — Web searching
- **Agent Tools**:
  - `AgentTool/` (20 files) — Agent spawning, forking, memory, built-in agents
  - `SkillTool/` (4 files) — Skill execution
  - `TaskCreateTool/`, `TaskGetTool/`, `TaskUpdateTool/`, `TaskListTool/` — Task management
- **Specialized Tools**:
  - `NotebookEditTool/`, `EnterWorktreeTool/`, `ExitWorktreeTool/`, `ScheduleCronTool/`, `RemoteTriggerTool/`, `AskUserQuestionTool/`, `TodoWriteTool/`, `BriefTool/`, `ConfigTool/`, `MCPTool/`, `REPLTool/`, `ToolSearchTool/`, `SyntheticOutputTool/`
- **Pattern**: Tool interface with Zod schemas, permission checking, progress reporting, result rendering

#### 30. `types/` (11 files)
**Purpose**: TypeScript type definitions
- `command.ts`, `hooks.ts`, `ids.ts` (branded IDs), `permissions.ts`, `message.ts`, `plugin.ts`, `generated/`
- **Pattern**: Branded string types for type safety (SessionId, AgentId, etc.)

#### 31. `utils/` (~250+ files)
**Purpose**: Utility library — The largest module
- **Auth**: `auth.ts`, `authPortable.ts`, `billing.ts`
- **Bash**: `bash/` (23 files — parsing, AST, shell quoting)
- **Config**: `config.ts`, `settings/` (19 files)
- **Git**: `git.ts`, `git/` (3 files), `github/`
- **Hooks**: `hooks/` (17 files — async execution, skill hooks, SSRF guard)
- **Model**: `model/` (16 files — capabilities, providers, validation)
- **Permissions**: `permissions/` (24 files — classifiers, bypass, rules)
- **Plugins**: `plugins/` (44 files — loading, marketplace, MCP integration)
- **Shell**: `shell/` (10 files — bash, PowerShell providers)
- **Swarm**: `swarm/` (22 files — team backends, teammate management)
- **Telemetry**: `telemetry/` (9 files — tracing, events, BigQuery)
- **Settings**: `settings/` (19 files — validation, MDM, managed paths)
- **Deep Links**: `deepLink/` (6 files)
- **Computer Use**: `computerUse/` (15 files)
- **Secure Storage**: `secureStorage/` (6 files — keychain, fallback)
- **Pattern**: Pure functions, memoization, error handling, filesystem operations

#### 32. `vim/` (5 files)
**Purpose**: Vim mode — Modal editing in the REPL
- `motions.ts`, `operators.ts`, `textObjects.ts`, `transitions.ts`, `types.ts`
- **Pattern**: State machine for modal editing

#### 33. `voice/` (1 file)
**Purpose**: Voice mode feature flag
- `voiceModeEnabled.ts` — Checks if voice mode is enabled

---

## Future Phases (Based on Claude Code Reference)

### Phase 19: Query Engine & Autocompact

**Goal**: Production-grade query loop with autocompact and token budget management

**Reference**: `query.ts`, `QueryEngine.ts`, `query/` (4 files), `services/compact/`

**Features to Add**:
1. **Query Engine**
   - Query lifecycle management
   - SDK wrapping for headless usage
   - Message persistence with JSONL
   - Structured output support

2. **Autocompact System**
   - Automatic context compaction when approaching limits
   - Reactive compact on token budget exceeded
   - Microcompact for small reductions
   - Snip for removing old messages

3. **Token Budget**
   - Per-model token limits (`constants/apiLimits.ts`)
   - Budget tracking and auto-continue
   - Cost estimation before API calls

**Files**:
- `src/handlers/query-engine.ts` — Query lifecycle manager
- `src/handlers/autocompact.ts` — Context compaction
- `src/handlers/token-budget.ts` — Token budget tracking
- `src/utils/jsonl-persistence.ts` — JSONL message storage

**Estimated LOC**: 1,200 lines  
**Complexity**: High  
**Priority**: 🔴 Critical (core functionality)

---

### Phase 20: Memory & Learning System

**Goal**: Agent learns from sessions and improves over time

**Reference**: `memdir/` (8 files), `services/SessionMemory/`, `services/teamMemorySync/`

**Features to Add**:
1. **Memory Types**
   - Long-term (persistent across sessions)
   - Short-term (current session context)
   - Episodic (what happened when)
   - Semantic (facts about projects/patterns)

2. **Memory Storage**
   - File-based memory directory
   - Semantic search for relevant memories
   - Memory scanning and indexing
   - Team memory sharing

3. **Learning**
   - Error tracking and resolution patterns
   - Command usage frequency
   - Time-based context decay
   - User preference learning

**Files**:
- `src/memory/storage.ts` — Memory backend
- `src/memory/retrieval.ts` — Semantic search
- `src/memory/learning.ts` — Pattern detection
- `src/memory/team-sync.ts` — Team memory sharing

**Estimated LOC**: 900 lines  
**Complexity**: High  
**Priority**: 🟠 Medium

---

### Phase 21: Skills & Plugin System

**Goal**: Extensible skill marketplace, plugin loading

**Reference**: `skills/` (20 files), `plugins/` (2 files), `services/plugins/` (44 files)

**Features to Add**:
1. **Skill Registry**
   - Directory-based skill discovery
   - Versioning system
   - Dependency resolution
   - Auto-installation from registry

2. **Plugin Loader**
   - Dynamic code loading
   - Sandbox execution
   - Permission system
   - Hot reloading

3. **MCP Integration**
   - MCP skill builders
   - Official MCP registry connection
   - MCP tool execution

**Files**:
- `src/skills/registry.ts` — Skill discovery
- `src/skills/loader.ts` — Plugin loading
- `src/skills/validator.ts` — Permission checks
- `src/skills/mcp-integration.ts` — MCP skill support

**Estimated LOC**: 700 lines  
**Complexity**: Medium-High  
**Priority**: 🟠 Medium

---

### Phase 22: Multi-Agent Coordination

**Goal**: Multi-agent workflows, coordination, task distribution

**Reference**: `coordinator/` (1 file), `tasks/` (12 files), `tools/AgentTool/` (20 files), `utils/swarm/` (22 files)

**Features to Add**:
1. **Agent Registry**
   - Named agents with specializations
   - Communication protocol
   - Load balancing

2. **Task System**
   - Task lifecycle (pending → running → completed/failed/killed)
   - Task queues and pipelines
   - Error handling & retry
   - Result aggregation

3. **Swarm Management**
   - Team backends
   - Teammate management
   - Coordinator mode

**Files**:
- `src/teams/registry.ts` — Agent management
- `src/teams/coordinator.ts` — Task coordination
- `src/teams/messaging.ts` — Inter-agent comms
- `src/tasks/lifecycle.ts` — Task state machine

**Estimated LOC**: 800 lines  
**Complexity**: High  
**Priority**: 🟡 Low-Medium

---

### Phase 23: Bridge Protocol (Remote Sessions)

**Goal**: WebSocket control plane for remote/mobile sessions

**Reference**: `bridge/` (31 files), `remote/` (4 files), `server/` (3 files)

**Features to Add**:
1. **WebSocket Transport**
   - Bridge API and configuration
   - REPL bridge with transport layer
   - Messaging protocol

2. **Authentication**
   - JWT utilities
   - Device trust management
   - Work secret handling

3. **Session Management**
   - Remote session creation
   - Session runner
   - Session ID compatibility

**Files**:
- `src/bridge/main.ts` — Bridge entry point
- `src/bridge/transport.ts` — WebSocket transport
- `src/bridge/auth.ts` — JWT authentication
- `src/bridge/session.ts` — Session management

**Estimated LOC**: 1,000 lines  
**Complexity**: Very High  
**Priority**: 🟢 Low

---

### Phase 24: Vim Mode & Keybindings

**Goal**: Modal editing and advanced keybinding system

**Reference**: `vim/` (5 files), `keybindings/` (14 files)

**Features to Add**:
1. **Vim Mode**
   - Motions (w, b, h, j, k, l, etc.)
   - Operators (d, c, y, etc.)
   - Text objects (iw, aw, i", a", etc.)
   - State machine transitions

2. **Keybinding System**
   - Default key mappings
   - Keybinding expression parser
   - Conflict detection and resolution
   - User custom bindings

**Files**:
- `src/vim/motions.ts` — Vim motions
- `src/vim/operators.ts` — Vim operators
- `src/vim/textObjects.ts` — Text objects
- `src/keybindings/parser.ts` — Keybinding parser
- `src/keybindings/resolver.ts` — Conflict resolution

**Estimated LOC**: 600 lines  
**Complexity**: Medium  
**Priority**: 🟢 Low

---

### Phase 25: Configuration Migrations

**Goal**: Versioned configuration migrations

**Reference**: `migrations/` (11 files)

**Features to Add**:
1. **Migration Runner**
   - Version tracking
   - One-time migrations
   - Rollback support

2. **Model Migrations**
   - Model name changes
   - Provider switches
   - Settings migrations

**Files**:
- `src/migrations/runner.ts` — Migration execution
- `src/migrations/registry.ts` — Migration definitions
- `src/migrations/tracker.ts` — Version tracking

**Estimated LOC**: 400 lines  
**Complexity**: Medium  
**Priority**: 🟢 Low

---

### Phase 26: Analytics & Telemetry

**Goal**: Usage analytics, feature flags, telemetry

**Reference**: `services/analytics/`, `utils/telemetry/` (9 files)

**Features to Add**:
1. **Analytics**
   - Event tracking
   - GrowthBook feature flags
   - BigQuery integration

2. **Telemetry**
   - Distributed tracing
   - Performance metrics
   - Error reporting

**Files**:
- `src/analytics/tracker.ts` — Event tracking
- `src/analytics/feature-flags.ts` — Feature flag management
- `src/telemetry/tracing.ts` — Distributed tracing

**Estimated LOC**: 500 lines  
**Complexity**: Medium  
**Priority**: 🟢 Low

---

### Phase 27: MCP Client/Server

**Goal**: Full MCP protocol support

**Reference**: `services/mcp/` (23 files)

**Features to Add**:
1. **MCP Client**
   - Server connection management
   - Tool discovery and execution
   - Approval workflows

2. **MCP Server**
   - Tool exposure
   - Session management
   - Official registry integration

**Files**:
- `src/mcp/client.ts` — MCP client
- `src/mcp/server.ts` — MCP server
- `src/mcp/registry.ts` — MCP tool registry
- `src/mcp/approval.ts` — Approval workflows

**Estimated LOC**: 800 lines  
**Complexity**: High  
**Priority**: 🟠 Medium

---

### Phase 28: Desktop & Mobile Apps

**Goal**: Native UI for macOS, iOS, Android

**Reference**: Custom `ink/` implementation (95 files), `components/` (150+ files)

**Features**:
1. **macOS App**
   - Menu bar integration
   - Quick query UI
   - Persistent chat
   - Hotkey support

2. **iOS/Android**
   - Mobile-optimized UI
   - Voice command trigger
   - Push notifications
   - Offline caching

3. **Synchronization**
   - Cloud sync between devices
   - State persistence
   - Real-time updates

**Files**:
- `apps/macos/` — Swift UI
- `apps/ios/` — SwiftUI or React Native
- `apps/android/` — Kotlin or React Native
- `src/sync/cloud-sync.ts` — Sync engine

**Estimated LOC**: 3,000+ lines  
**Complexity**: Very High  
**Priority**: 🟢 Low

---

## Updated Implementation Timeline

| Phase | Name | LOC | Weeks | Priority | Status |
|-------|------|-----|-------|----------|--------|
| 1-18 | Current (Complete) | 17,000+ | - | - | ✅ Done |
| 19 | Query Engine & Autocompact | 1,200 | 2-3 | 🔴 Critical | ⬜ Not Started |
| 20 | Memory & Learning | 900 | 2 | 🟠 Medium | ⬜ Not Started |
| 21 | Skills & Plugins | 700 | 1-2 | 🟠 Medium | ⬜ Not Started |
| 22 | Multi-Agent Coordination | 800 | 2 | 🟡 Low-Med | ⬜ Not Started |
| 23 | Bridge Protocol | 1,000 | 3 | 🟢 Low | ⬜ Not Started |
| 24 | Vim Mode & Keybindings | 600 | 1 | 🟢 Low | ⬜ Not Started |
| 25 | Config Migrations | 400 | 1 | 🟢 Low | ⬜ Not Started |
| 26 | Analytics & Telemetry | 500 | 1 | 🟢 Low | ⬜ Not Started |
| 27 | MCP Client/Server | 800 | 2 | 🟠 Medium | ⬜ Not Started |
| 28 | Desktop & Mobile | 3,000+ | 4-6 | 🟢 Low | ⬜ Not Started |

**Total Remaining**: ~10,900 LOC / 18-24 weeks (full-time)

---

## Dependency Graph

```
Phase 1-18 (Complete) ✅
├── Phase 19 (Query Engine) ⬜ → independent
├── Phase 20 (Memory) ⬜ → requires Phase 19
├── Phase 21 (Skills) ⬜ → requires Phase 20
├── Phase 22 (Multi-Agent) ⬜ → requires Phases 19, 20
├── Phase 23 (Bridge) ⬜ → requires Phase 22
├── Phase 24 (Vim/Keybindings) ⬜ → independent
├── Phase 25 (Migrations) ⬜ → independent
├── Phase 26 (Analytics) ⬜ → independent
├── Phase 27 (MCP) ⬜ → requires Phase 21
└── Phase 28 (Apps) ⬜ → requires Phases 22, 23
```

---

## Recommended Starting Point

**For Production Readiness (4-6 weeks):**
1. **Phase 19** — Query Engine & Autocompact (core functionality)
2. **Phase 20** — Memory & Learning (improves all agents)
3. **Phase 27** — MCP Client/Server (ecosystem integration)

**For Full Parity with Claude Code (6+ months):**
- Follow timeline in order (19 → 20 → 21 → ...)
- Phase 28 (apps) can be parallel
- Phase 23 (bridge) optional for desktop-only use

---

## Feature Completeness vs Claude Code

| Feature | Phase | SawCode | Claude Code |
|---------|-------|---------|-------------|
| Core Agent | 1 | ✓ | ✓✓ |
| CLI Interface | 4 | ✓ | ✓✓✓ |
| Tools System | 2,8 | ✓✓ | ✓✓✓ |
| Code Display | 7 | ✓✓ | ✓✓ |
| Git/GitHub | 9 | ✓ | ✓✓✓ |
| Code Review | 11 | ✓ | ✓✓ |
| Voice & Audio | 12 | ✓ | ✓ |
| AI Features | 18 | ✓ | ✓✓ |
| Query Engine | 19 | ⬜ | ✓✓✓ |
| Memory System | 20 | ⬜ | ✓✓ |
| Skills | 21 | ⬜ | ✓✓ |
| Multi-Agent | 22 | ⬜ | ✓✓✓ |
| Bridge Protocol | 23 | ⬜ | ✓✓ |
| Vim Mode | 24 | ⬜ | ✓ |
| MCP | 27 | ⬜ | ✓✓✓ |
| Desktop App | 28 | ⬜ | ✓✓ |
| Mobile App | 28 | ⬜ | ✓ |

---

## Key Architectural Patterns from Claude Code

1. **Layered Architecture**: Types → Utils → Services → Tools → Components → Screens
2. **React/Ink TUI**: Custom Ink fork with Yoga layout for terminal rendering
3. **Tool System**: Zod-validated tools with permission checking, progress reporting, result rendering
4. **Query Loop**: Streaming API responses with autocompact, reactive compact, token budget management
5. **Feature Flags**: `feature()` function for dead code elimination of gated features
6. **Memoization**: Heavy use of `lodash-es/memoize` for expensive operations
7. **Dynamic Imports**: Lazy loading of heavy modules (dialogs, skills, plugins)
8. **State Management**: React context + immutable state updates
9. **Plugin/Skill System**: Directory-based discovery with MCP integration
10. **Multi-Agent**: Coordinator mode, subagents, team memory, swarm management

---

**Current Release**: v0.1.0 (Released 2026-04-02)  
**Next Milestone**: Phase 19 — Query Engine & Autocompact  
**Full Parity Target**: Phase 28 (6+ months)
