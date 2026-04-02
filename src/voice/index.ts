/**
 * Voice Module — Live Recording + Streaming STT
 *
 * Extends Phase 12 Voice & Audio tools with:
 * - Live microphone capture (platform-specific backends)
 * - WebSocket streaming speech-to-text
 * - Domain-specific keyterms for coding vocabulary
 * - Feature flag gating for voice mode
 *
 * Usage:
 *   import { startRecording, stopRecording, createVoiceStream } from './voice/index.js'
 */

// Recording
export {
  type RecordingBackend,
  type RecordingAvailability,
  type RecordingOptions,
  type RecordingCallbacks,
  detectRecordingBackend,
  checkRecordingAvailability,
  getInstallHint,
  requestMicrophonePermission,
  startRecording,
  stopRecording,
  isRecording,
  getRecordingDurationMs,
} from './voiceRecording.js'

// Streaming STT
export {
  type VoiceStreamCallbacks,
  type VoiceStreamConnection,
  type VoiceStreamOptions,
  type FinalizeSource,
  createVoiceStream,
} from './voiceStreamSTT.js'

// Keyterms
export {
  getVoiceKeyterms,
  splitIdentifier,
} from './voiceKeyterms.js'

// Feature flags
export {
  isVoiceFeatureEnabled,
  isVoiceStreamEnabled,
  isVoiceModeEnabled,
  getVoiceModeStatus,
} from './voiceModeEnabled.js'
