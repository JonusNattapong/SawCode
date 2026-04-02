import { z } from 'zod'
import { createTool } from './index.js'
import { readFileSync } from 'fs'

/**
 * Speech-to-Text Tool - Convert audio files to text transcriptions
 *
 * Supports: MP3, WAV, OGG, M4A, FLAC, WEBM
 * Uses mock transcription for demonstration
 * In production, integrate with: OpenAI Whisper, Google Cloud Speech, or Azure Speech Services
 *
 * @example
 * const tool = speechToTextTool
 * const result = await tool.handler({
 *   audioPath: '/path/to/audio.mp3',
 *   language: 'en-US'
 * })
 */

export const speechToTextSchema = z.object({
  audioPath: z.string().describe('Path to audio file (mp3, wav, ogg, m4a, flac, webm)'),
  language: z.enum(['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN']).optional().describe('Language code for transcription'),
  includeTimestamps: z.boolean().optional().describe('Include word-level timestamps (default: false)'),
  punctuate: z.boolean().optional().describe('Auto-add punctuation (default: true)'),
})

export type SpeechToTextInput = z.infer<typeof speechToTextSchema>

interface TranscriptionWord {
  word: string
  startTime: number
  endTime: number
  confidence: number
}

interface TranscriptionResult {
  text: string
  words?: TranscriptionWord[]
  duration: number
  language: string
  confidence: number
}

export const speechToTextTool = createTool(
  'speech-to-text',
  'Convert audio files to text transcription. Supports MP3, WAV, OGG, M4A, FLAC, WEBM formats.',
  speechToTextSchema,
  async ({ audioPath, language = 'en-US', includeTimestamps = false, punctuate = true }): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
    try {
      // Validate audio file exists
      const stats = readFileSync(audioPath)
      if (!stats.length) {
        throw new Error(`Audio file empty: ${audioPath}`)
      }

      // Extract file extension
      const ext = audioPath.split('.').pop()?.toLowerCase()
      const validFormats = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'webm']
      if (!validFormats.includes(ext || '')) {
        throw new Error(`Unsupported format: ${ext}. Supported: ${validFormats.join(', ')}`)
      }

      // Mock transcription (in production, call actual speech-to-text API)
      const mockTranscriptions: Record<string, string> = {
        'sample.mp3': 'Hello, this is a test transcription of the audio file.',
        'test-audio.wav': 'The quick brown fox jumps over the lazy dog.',
        'intro.ogg': 'Welcome to the Phase 12 voice and audio demonstration.',
      }

      const filename = audioPath.split('/').pop()?.split('\\').pop() || 'audio'
      const transcription = mockTranscriptions[filename] || `Transcription of ${filename}: This is a mock transcription result. In production, this would be the actual speech-to-text output.`

      // Build result
      const result: TranscriptionResult = {
        text: punctuate ? transcription : transcription.toLowerCase(),
        duration: 2.5 + Math.random() * 3, // Mock duration
        language,
        confidence: 0.92 + Math.random() * 0.08,
      }

      if (includeTimestamps) {
        const words = transcription.split(' ')
        result.words = words.map((word, index) => ({
          word,
          startTime: index * 0.5,
          endTime: (index + 1) * 0.5,
          confidence: 0.85 + Math.random() * 0.15,
        }))
      }

      return {
        content: [
          {
            type: 'text',
            text: `Speech-to-Text Result:

Transcription:
"${result.text}"

Metadata:
- Language: ${result.language}
- Duration: ${result.duration.toFixed(2)}s
- Confidence: ${(result.confidence * 100).toFixed(1)}%
${result.words ? `- Words: ${result.words.length}` : ''}

${
  result.words
    ? `Top Words with Confidence:\n${result.words
        .slice(0, 5)
        .map((w) => `  - "${w.word}": ${(w.confidence * 100).toFixed(1)}% (${w.startTime.toFixed(2)}s - ${w.endTime.toFixed(2)}s)`)
        .join('\n')}`
    : ''
}`,
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [
          {
            type: 'text',
            text: `Speech-to-Text Error: ${message}`,
          },
        ],
      }
    }
  }
)
