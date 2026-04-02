/**
 * Voice Mode Enabled Checks
 *
 * Feature flag + backend availability checks for voice mode.
 * Based on Claude Code's voice/voiceModeEnabled.ts architecture.
 */

import { isFeatureEnabled } from '../utils/feature-flags.js'
import { checkRecordingAvailability } from './voiceRecording.js'

/**
 * Check if voice mode is enabled via feature flags.
 */
export function isVoiceFeatureEnabled(): boolean {
  return isFeatureEnabled('ENABLE_VOICE_LIVE')
}

/**
 * Check if voice streaming is enabled via feature flags.
 */
export function isVoiceStreamEnabled(): boolean {
  return isFeatureEnabled('ENABLE_VOICE_STREAM')
}

/**
 * Full runtime check: feature flag + recording backend availability.
 */
export function isVoiceModeEnabled(): boolean {
  if (!isVoiceFeatureEnabled()) return false
  const { available } = checkRecordingAvailability()
  return available
}

/**
 * Get voice mode status for display.
 */
export function getVoiceModeStatus(): {
  enabled: boolean
  featureFlag: boolean
  recordingAvailable: boolean
  streamEnabled: boolean
  backend: string
  installHint: string | null
} {
  const featureFlag = isVoiceFeatureEnabled()
  const streamEnabled = isVoiceStreamEnabled()
  const { available, backend, reason } = checkRecordingAvailability()

  return {
    enabled: featureFlag && available,
    featureFlag,
    recordingAvailable: available,
    streamEnabled,
    backend,
    installHint: reason,
  }
}
