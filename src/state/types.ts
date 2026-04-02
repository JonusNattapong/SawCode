import type { Companion } from '../buddy/index.js'
import type { BridgeSessionRuntimeState } from '../bridge/types.js'
import type { Task } from '../task/index.js'
import type { AgentState } from '../types.js'

export type TUIMessageRole =
  | 'user'
  | 'assistant'
  | 'system'
  | 'tool'
  | 'help'
  | 'info'
  | 'code'
  | 'streaming'
  | 'buddy'
  | 'error'

export type TUIMessage = {
  role: TUIMessageRole
  content: string
  isStreaming?: boolean
  timestamp?: number
}

export type TUIVariant = 'classic' | 'enhanced'

export type TUIState = {
  variant: TUIVariant
  query: string
  messages: TUIMessage[]
  isProcessing: boolean
  error: string | null
  selectedTool: string | null
  menuIndex: number
  historyIndex: number
  commandHistory: string[]
  companion?: Companion
  buddyReaction?: string
  petAt?: number
}

export type SawCodeAppState = {
  agent: AgentState
  tui: TUIState
  tasks: Task[]
  bridge: BridgeSessionRuntimeState
  sessionId: string
}

export function createDefaultTUIState(
  variant: TUIVariant = 'enhanced',
): TUIState {
  return {
    variant,
    query: '',
    messages: [],
    isProcessing: false,
    error: null,
    selectedTool: null,
    menuIndex: 0,
    historyIndex: 0,
    commandHistory: [],
    companion: undefined,
    buddyReaction: undefined,
    petAt: undefined,
  }
}

export function createDefaultBridgeState(): BridgeSessionRuntimeState {
  return {
    status: 'idle',
    sessionId: undefined,
    transportState: 'disconnected',
    lastError: undefined,
    lastActivityAt: undefined,
    recentActivities: [],
  }
}
