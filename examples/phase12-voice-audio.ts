#!/usr/bin/env bun

/**
 * Phase 12: Voice & Audio - Speech-to-text, text-to-speech, and audio processing
 *
 * This example demonstrates all Phase 12 capabilities:
 * - Speech-to-Text: Convert audio files to transcriptions
 * - Text-to-Speech: Convert text to audio files
 * - Audio Processor: Extract info, convert formats, trim, merge audio files
 */

import { Agent } from '../src/index.js'
import { speechToTextTool, textToSpeechTool, audioProcessorTool } from '../src/index.js'

// Example 1: Basic speech-to-text transcription
async function example1_BasicTranscription() {
  console.log('\n=== Example 1: Basic Speech-to-Text ===\n')

  const agent = new Agent({ name: 'audio-transcriber' })
  agent.addTool(speechToTextTool)

  const result = await agent.query(
    `Transcribe this audio file to text:\n\`\`\`\naudioPath: /tmp/meeting-recording.mp3\nlanguage: en-US\n\`\`\``
  )

  console.log('Transcription:', result.response)
}

// Example 2: Transcription with timestamps
async function example2_TranscriptionWithTimestamps() {
  console.log('\n=== Example 2: Transcription with Timestamps ===\n')

  const agent = new Agent({ name: 'audio-analyzer' })
  agent.addTool(speechToTextTool)

  const result = await agent.query(
    `Transcribe with word-level timestamps:\n\`\`\`\naudioPath: /tmp/sample.wav\nincludeTimestamps: true\nlanguage: en-US\n\`\`\``
  )

  console.log('Detailed Transcription:', result.response)
}

// Example 3: Multi-language transcription
async function example3_MultiLanguageTranscription() {
  console.log('\n=== Example 3: Multi-Language Transcription ===\n')

  const agent = new Agent({ name: 'multilingual-transcriber' })
  agent.addTool(speechToTextTool)

  const result = await agent.query(
    `Transcribe Spanish audio:\n\`\`\`\naudioPath: /tmp/spanish-lesson.ogg\nlanguage: es-ES\npunctuate: true\n\`\`\``
  )

  console.log('Spanish Transcription:', result.response)
}

// Example 4: Basic text-to-speech conversion
async function example4_BasicTextToSpeech() {
  console.log('\n=== Example 4: Basic Text-to-Speech ===\n')

  const agent = new Agent({ name: 'voice-generator' })
  agent.addTool(textToSpeechTool)

  const result = await agent.query(
    `Convert this text to speech:\n\`\`\`\ntext: "Welcome to Phase 12 voice and audio demonstrations. This is a text-to-speech example."\nvoice: neural-en-us-female\nlanguage: en-US\noutputFormat: mp3\n\`\`\``
  )

  console.log('Generated Audio:', result.response)
}

// Example 5: Text-to-speech with custom voice and speed
async function example5_CustomVoiceAndSpeed() {
  console.log('\n=== Example 5: Custom Voice & Speed ===\n')

  const agent = new Agent({ name: 'custom-voice' })
  agent.addTool(textToSpeechTool)

  const result = await agent.query(
    `Create audio with natural voice and faster speed:\n\`\`\`\ntext: "The quick brown fox jumps over the lazy dog."\nvoice: expressive\nspeed: 1.5\npitch: 5\noutputFormat: wav\n\`\`\``
  )

  console.log('Custom Audio Generation:', result.response)
}

// Example 6: Audio file information extraction
async function example6_AudioFileInfo() {
  console.log('\n=== Example 6: Audio File Information ===\n')

  const agent = new Agent({ name: 'audio-inspector' })
  agent.addTool(audioProcessorTool)

  const result = await agent.query(
    `Get information about this audio file:\n\`\`\`\noperation: info\naudioPath: /tmp/music.mp3\n\`\`\``
  )

  console.log('Audio Info:', result.response)
}

// Example 7: Audio format conversion
async function example7_AudioFormatConversion() {
  console.log('\n=== Example 7: Audio Format Conversion ===\n')

  const agent = new Agent({ name: 'audio-converter' })
  agent.addTool(audioProcessorTool)

  const result = await agent.query(
    `Convert audio from MP3 to WAV:\n\`\`\`\noperation: convert\naudioPath: /tmp/song.mp3\noutputFormat: wav\n\`\`\``
  )

  console.log('Format Conversion:', result.response)
}

// Example 8: Audio trimming
async function example8_AudioTrimming() {
  console.log('\n=== Example 8: Audio Trimming ===\n')

  const agent = new Agent({ name: 'audio-trimmer' })
  agent.addTool(audioProcessorTool)

  const result = await agent.query(
    `Trim audio from 10 seconds to 45 seconds:\n\`\`\`\noperation: trim\naudioPath: /tmp/recording.mp3\nstartTime: 10\nendTime: 45\n\`\`\``
  )

  console.log('Trimmed Audio:', result.response)
}

// Example 9: Merging multiple audio files
async function example9_AudioMerging() {
  console.log('\n=== Example 9: Audio File Merging ===\n')

  const agent = new Agent({ name: 'audio-mixer' })
  agent.addTool(audioProcessorTool)

  const result = await agent.query(
    `Merge these audio files into one:\n\`\`\`\noperation: merge\nfilePaths: ["/tmp/intro.mp3", "/tmp/content.mp3", "/tmp/outro.mp3"]\noutputFormat: mp3\n\`\`\``
  )

  console.log('Merged Audio:', result.response)
}

// Example 10: Language detection from audio
async function example10_LanguageDetection() {
  console.log('\n=== Example 10: Language Detection ===\n')

  const agent = new Agent({ name: 'language-detector' })
  agent.addTool(audioProcessorTool)

  const result = await agent.query(
    `Detect the language in this audio:\n\`\`\`\noperation: detect-language\naudioPath: /tmp/unknown-language.m4a\n\`\`\``
  )

  console.log('Language Detection:', result.response)
}

// Example 11: End-to-end workflow - transcribe, modify, and regenerate
async function example11_VoiceWorkflow() {
  console.log('\n=== Example 11: Complete Voice Workflow ===\n')

  const agent = new Agent({ name: 'voice-workflow' })
  agent.addTool(speechToTextTool)
  agent.addTool(textToSpeechTool)
  agent.addTool(audioProcessorTool)

  const result = await agent.query(
    `Complete voice workflow:
1. Transcribe the recording
2. Analyze and modify the text
3. Generate new audio with different voice
4. Get audio file information

Recording: /tmp/original-voice.mp3
New voice: neural-en-us-male
Output format: ogg`
  )

  console.log('Voice Workflow:', result.response)
}

// Example 12: Batch audio processing
async function example12_BatchProcessing() {
  console.log('\n=== Example 12: Batch Audio Processing ===\n')

  const agent = new Agent({ name: 'batch-processor' })
  agent.addTool(audioProcessorTool)

  const result = await agent.query(
    `Process multiple audio files:
1. Get info for all files
2. Convert formats where needed
3. Merge compatible files

Files:
- /tmp/clip1.mp3
- /tmp/clip2.wav
- /tmp/clip3.ogg`
  )

  console.log('Batch Processing:', result.response)
}

// Example 13: Voice command interpretation
async function example13_VoiceCommand() {
  console.log('\n=== Example 13: Voice Command Interpretation ===\n')

  const agent = new Agent({ name: 'voice-assistant' })
  agent.addTool(speechToTextTool)

  const result = await agent.query(
    `Transcribe and interpret voice command:\n\`\`\`\naudioPath: /tmp/voice-command.wav\nlanguage: en-US\n\`\`\``
  )

  console.log('Voice Command:', result.response)
}

// Example 14: Audio pipeline with quality control
async function example14_QualityControlPipeline() {
  console.log('\n=== Example 14: Audio Quality Pipeline ===\n')

  const agent = new Agent({ name: 'quality-controller' })
  agent.addTool(audioProcessorTool)
  agent.addTool(speechToTextTool)

  const result = await agent.query(
    `Quality control pipeline:
1. Extract audio information
2. Check quality metrics
3. Convert to optimized format if needed
4. Generate report

Source: /tmp/podcast-episode.mp3
Target quality: high-fidelity
Output format: m4a`
  )

  console.log('Quality Pipeline:', result.response)
}

// Main execution
async function main() {
  console.log('🎙️  Phase 12: Voice & Audio Examples')
  console.log('='.repeat(50))

  try {
    await example1_BasicTranscription()
    await example2_TranscriptionWithTimestamps()
    await example3_MultiLanguageTranscription()
    await example4_BasicTextToSpeech()
    await example5_CustomVoiceAndSpeed()
    await example6_AudioFileInfo()
    await example7_AudioFormatConversion()
    await example8_AudioTrimming()
    await example9_AudioMerging()
    await example10_LanguageDetection()
    await example11_VoiceWorkflow()
    await example12_BatchProcessing()
    await example13_VoiceCommand()
    await example14_QualityControlPipeline()

    console.log('\n' + '='.repeat(50))
    console.log('✅ All Phase 12 examples completed!')
  } catch (error) {
    console.error('Error running examples:', error)
    process.exit(1)
  }
}

main()
