/**
 * Voice Recording Service
 *
 * Live microphone capture with platform-specific backends:
 * - Windows: ffmpeg (dshow) or PowerShell fallback
 * - macOS: sox (rec) or ffmpeg
 * - Linux: arecord (ALSA) or sox
 *
 * Supports push-to-talk and silence-detection modes.
 * Based on Claude Code's services/voice.ts architecture.
 */

import { spawn, type ChildProcess, spawnSync } from 'child_process'

const RECORDING_SAMPLE_RATE = 16000
const RECORDING_CHANNELS = 1
const SILENCE_DURATION_SECS = '2.0'
const SILENCE_THRESHOLD = '3%'

let activeRecorder: ChildProcess | null = null
let recordingStartTime = 0

// ─── Dependency Detection ──────────────────────────────────────────

function hasCommand(cmd: string): boolean {
  const result = spawnSync(cmd, ['--version'], {
    stdio: 'ignore',
    timeout: 3000,
    shell: process.platform === 'win32',
  })
  return result.error === undefined
}

export type RecordingBackend = 'sox' | 'arecord' | 'ffmpeg' | 'none'

export function detectRecordingBackend(): RecordingBackend {
  if (process.platform === 'win32') {
    if (hasCommand('ffmpeg')) return 'ffmpeg'
    return 'none'
  }
  if (hasCommand('rec')) return 'sox'
  if (process.platform === 'linux' && hasCommand('arecord')) return 'arecord'
  if (hasCommand('ffmpeg')) return 'ffmpeg'
  return 'none'
}

export function getInstallHint(): string {
  switch (process.platform) {
    case 'win32':
      return 'winget install ffmpeg'
    case 'darwin':
      return 'brew install sox'
    case 'linux':
      return 'sudo apt-get install sox  OR  sudo dnf install sox'
    default:
      return 'Install sox or ffmpeg'
  }
}

// ─── Recording Availability ────────────────────────────────────────

export type RecordingAvailability = {
  available: boolean
  backend: RecordingBackend
  reason: string | null
}

export function checkRecordingAvailability(): RecordingAvailability {
  const backend = detectRecordingBackend()
  if (backend === 'none') {
    return {
      available: false,
      backend,
      reason: `No audio recording backend found. Install with: ${getInstallHint()}`,
    }
  }
  return { available: true, backend, reason: null }
}

// ─── Microphone Permission (macOS TCC) ─────────────────────────────

export async function requestMicrophonePermission(): Promise<boolean> {
  if (process.platform !== 'darwin') return true

  // Probe-record for 100ms to trigger TCC dialog
  return new Promise(resolve => {
    const child = spawn('rec', [
      '-q', '--buffer', '1024',
      '-t', 'raw', '-r', String(RECORDING_SAMPLE_RATE),
      '-e', 'signed', '-b', '16',
      '-c', String(RECORDING_CHANNELS),
      '-', 'trim', '0', '0.1',
    ], { stdio: ['pipe', 'pipe', 'pipe'] })

    let gotData = false
    child.stdout?.on('data', () => { gotData = true })
    child.on('close', () => resolve(gotData))
    child.on('error', () => resolve(false))
    setTimeout(() => { child.kill('SIGTERM') }, 500)
  })
}

// ─── Recording Start/Stop ──────────────────────────────────────────

export type RecordingOptions = {
  silenceDetection?: boolean
  maxDurationMs?: number
}

export type RecordingCallbacks = {
  onData: (chunk: Buffer) => void
  onEnd: () => void
  onError?: (error: string) => void
}

export function startRecording(
  callbacks: RecordingCallbacks,
  options?: RecordingOptions,
): boolean {
  const backend = detectRecordingBackend()
  const useSilence = options?.silenceDetection !== false

  if (activeRecorder) {
    stopRecording()
  }

  let child: ChildProcess | null = null

  switch (backend) {
    case 'sox':
      child = startSoxRecording(useSilence)
      break
    case 'arecord':
      child = startArecordRecording()
      break
    case 'ffmpeg':
      child = startFfmpegRecording()
      break
    default:
      callbacks.onError?.('No recording backend available')
      return false
  }

  if (!child) return false

  activeRecorder = child
  recordingStartTime = Date.now()

  child.stdout?.on('data', (chunk: Buffer) => callbacks.onData(chunk))
  child.stderr?.on('data', () => {})
  child.on('close', () => {
    activeRecorder = null
    callbacks.onEnd()
  })
  child.on('error', (err) => {
    activeRecorder = null
    callbacks.onError?.(err.message)
    callbacks.onEnd()
  })

  // Auto-stop after maxDuration
  if (options?.maxDurationMs) {
    setTimeout(() => {
      if (activeRecorder === child) stopRecording()
    }, options.maxDurationMs)
  }

  return true
}

function startSoxRecording(silenceDetection: boolean): ChildProcess {
  const args = [
    '-q', '--buffer', '1024',
    '-t', 'raw',
    '-r', String(RECORDING_SAMPLE_RATE),
    '-e', 'signed', '-b', '16',
    '-c', String(RECORDING_CHANNELS),
    '-',
  ]

  if (silenceDetection) {
    args.push(
      'silence', '1', '0.1', SILENCE_THRESHOLD,
      '1', SILENCE_DURATION_SECS, SILENCE_THRESHOLD,
    )
  }

  return spawn('rec', args, { stdio: ['pipe', 'pipe', 'pipe'] })
}

function startArecordRecording(): ChildProcess {
  return spawn('arecord', [
    '-f', 'S16_LE',
    '-r', String(RECORDING_SAMPLE_RATE),
    '-c', String(RECORDING_CHANNELS),
    '-t', 'raw', '-q', '-',
  ], { stdio: ['pipe', 'pipe', 'pipe'] })
}

function startFfmpegRecording(): ChildProcess {
  const input = process.platform === 'win32' ? 'dshow'
    : process.platform === 'darwin' ? 'avfoundation'
    : 'alsa'
  const device = process.platform === 'win32' ? 'audio="default"'
    : process.platform === 'darwin' ? ':default'
    : 'default'

  return spawn('ffmpeg', [
    '-f', input, '-i', device,
    '-ar', String(RECORDING_SAMPLE_RATE),
    '-ac', String(RECORDING_CHANNELS),
    '-f', 's16le', '-acodec', 'pcm_s16le',
    '-loglevel', 'quiet',
    'pipe:1',
  ], { stdio: ['pipe', 'pipe', 'pipe'] })
}

export function stopRecording(): void {
  if (activeRecorder) {
    activeRecorder.kill('SIGTERM')
    activeRecorder = null
  }
}

export function isRecording(): boolean {
  return activeRecorder !== null
}

export function getRecordingDurationMs(): number {
  if (!recordingStartTime) return 0
  return Date.now() - recordingStartTime
}
