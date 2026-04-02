/**
 * Voice Stream STT Client
 *
 * WebSocket-based real-time speech-to-text.
 * Sends binary audio chunks, receives transcript events.
 *
 * Wire protocol:
 *   Client → Server: binary PCM 16kHz 16-bit mono frames
 *   Client → Server: JSON { type: "KeepAlive" }
 *   Client → Server: JSON { type: "CloseStream" }
 *   Server → Client: JSON { type: "TranscriptText", data: "..." }
 *   Server → Client: JSON { type: "TranscriptEndpoint" }
 *   Server → Client: JSON { type: "TranscriptError", error_code: "...", description: "..." }
 *
 * Based on Claude Code's services/voiceStreamSTT.ts architecture.
 */

// @ts-ignore
import WebSocket from 'ws'

// ─── Types ─────────────────────────────────────────────────────────

export type VoiceStreamCallbacks = {
  onTranscript: (text: string, isFinal: boolean) => void
  onError: (error: string, opts?: { fatal?: boolean }) => void
  onClose: () => void
  onReady: (connection: VoiceStreamConnection) => void
}

export type VoiceStreamConnection = {
  send: (audioChunk: Buffer) => void
  finalize: () => Promise<FinalizeSource>
  close: () => void
  isConnected: () => boolean
}

export type FinalizeSource =
  | 'transcript_endpoint'
  | 'no_data_timeout'
  | 'safety_timeout'
  | 'ws_close'
  | 'ws_already_closed'

export type VoiceStreamOptions = {
  url: string
  apiKey?: string
  language?: string
  sampleRate?: number
  channels?: number
  endpointingMs?: number
  utteranceEndMs?: number
  keyterms?: string[]
}

// ─── Constants ─────────────────────────────────────────────────────

const KEEPALIVE_INTERVAL_MS = 8_000
const FINALIZE_SAFETY_MS = 5_000
const FINALIZE_NO_DATA_MS = 1_500

// ─── Connection ────────────────────────────────────────────────────

export function createVoiceStream(
  callbacks: VoiceStreamCallbacks,
  options: VoiceStreamOptions,
): Promise<VoiceStreamConnection | null> {
  if (!options.url) {
    callbacks.onError('No voice stream URL provided', { fatal: true })
    return Promise.resolve(null)
  }

  const params = new URLSearchParams({
    encoding: 'linear16',
    sample_rate: String(options.sampleRate ?? 16000),
    channels: String(options.channels ?? 1),
    endpointing_ms: String(options.endpointingMs ?? 300),
    utterance_end_ms: String(options.utteranceEndMs ?? 1000),
    language: options.language ?? 'en',
  })

  if (options.keyterms?.length) {
    for (const term of options.keyterms) {
      params.append('keyterms', term)
    }
  }

  const wsUrl = `${options.url}?${params.toString()}`
  const headers: Record<string, string> = {}

  if (options.apiKey) {
    headers['Authorization'] = `Bearer ${options.apiKey}`
  }

  return new Promise(resolve => {
    let ws: WebSocket
    let keepaliveTimer: ReturnType<typeof setInterval> | null = null
    let connected = false
    let finalized = false
    let finalizing = false
    let lastTranscriptText = ''
    let resolveFinalize: ((source: FinalizeSource) => void) | null = null
    let cancelNoDataTimer: (() => void) | null = null

    try {
      ws = new WebSocket(wsUrl, { headers })
    } catch (err) {
      callbacks.onError(`WebSocket failed: ${err instanceof Error ? err.message : String(err)}`, { fatal: true })
      resolve(null)
      return
    }

    const connection: VoiceStreamConnection = {
      send(audioChunk: Buffer): void {
        if (ws.readyState !== WebSocket.OPEN || finalized) return
        ws.send(Buffer.from(audioChunk))
      },

      finalize(): Promise<FinalizeSource> {
        if (finalizing || finalized) {
          return Promise.resolve('ws_already_closed')
        }
        finalizing = true

        return new Promise<FinalizeSource>(resolvePromise => {
          const safetyTimer = setTimeout(
            () => resolveFinalize?.('safety_timeout'),
            FINALIZE_SAFETY_MS,
          )
          const noDataTimer = setTimeout(
            () => resolveFinalize?.('no_data_timeout'),
            FINALIZE_NO_DATA_MS,
          )
          cancelNoDataTimer = () => {
            clearTimeout(noDataTimer)
            cancelNoDataTimer = null
          }

          resolveFinalize = (source: FinalizeSource) => {
            clearTimeout(safetyTimer)
            clearTimeout(noDataTimer)
            resolveFinalize = null
            cancelNoDataTimer = null

            // Promote any remaining interim to final
            if (lastTranscriptText) {
              const t = lastTranscriptText
              lastTranscriptText = ''
              callbacks.onTranscript(t, true)
            }
            resolvePromise(source)
          }

          if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
            resolveFinalize('ws_already_closed')
            return
          }

          // Defer CloseStream to flush any queued audio
          setTimeout(() => {
            finalized = true
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'CloseStream' }))
            }
          }, 0)
        })
      },

      close(): void {
        finalized = true
        if (keepaliveTimer) {
          clearInterval(keepaliveTimer)
          keepaliveTimer = null
        }
        connected = false
        if (ws.readyState === WebSocket.OPEN) ws.close()
      },

      isConnected(): boolean {
        return connected && ws.readyState === WebSocket.OPEN
      },
    }

    // ─── Event Handlers ────────────────────────────────────────────

    ws.on('open', () => {
      connected = true
      ws.send(JSON.stringify({ type: 'KeepAlive' }))

      keepaliveTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'KeepAlive' }))
        }
      }, KEEPALIVE_INTERVAL_MS)

      callbacks.onReady(connection)
    })

    ws.on('message', (raw: Buffer | string) => {
      let msg: Record<string, unknown>
      try {
        msg = JSON.parse(raw.toString())
      } catch {
        return
      }

      switch (msg.type) {
        case 'TranscriptText': {
          const transcript = msg.data as string | undefined
          if (finalized) cancelNoDataTimer?.()

          if (transcript) {
            // Auto-finalize on new segment detection (non-cumulative)
            if (lastTranscriptText) {
              const prev = lastTranscriptText.trimStart()
              const next = transcript.trimStart()
              if (prev && next && !next.startsWith(prev) && !prev.startsWith(next)) {
                callbacks.onTranscript(lastTranscriptText, true)
              }
            }
            lastTranscriptText = transcript
            callbacks.onTranscript(transcript, false)
          }
          break
        }

        case 'TranscriptEndpoint': {
          const finalText = lastTranscriptText
          lastTranscriptText = ''
          if (finalText) {
            callbacks.onTranscript(finalText, true)
          }
          if (finalized) {
            resolveFinalize?.('transcript_endpoint')
          }
          break
        }

        case 'TranscriptError': {
          const desc = (msg.description as string) ?? (msg.error_code as string) ?? 'Unknown error'
          if (!finalizing) callbacks.onError(desc)
          break
        }

        case 'error': {
          const detail = (msg.message as string) ?? 'Unknown server error'
          if (!finalizing) callbacks.onError(detail)
          break
        }
      }
    })

    ws.on('close', () => {
      connected = false
      if (keepaliveTimer) {
        clearInterval(keepaliveTimer)
        keepaliveTimer = null
      }
      // Promote remaining interim on unexpected close
      if (lastTranscriptText) {
        const t = lastTranscriptText
        lastTranscriptText = ''
        callbacks.onTranscript(t, true)
      }
      resolveFinalize?.('ws_close')
      callbacks.onClose()
    })

    ws.on('error', (err: Error) => {
      connected = false
      if (!finalizing) {
        callbacks.onError(`Voice stream error: ${err.message}`)
      }
    })
  })
}
