/**
 * Markdown Parser - Extract and format code blocks from markdown text
 * Used for TUI display with syntax highlighting support
 */

export interface CodeBlock {
  language: string
  code: string
  lineStart: number
}

export interface ParsedContent {
  text: string
  blocks: CodeBlock[]
  hasCode: boolean
}

/**
 * Parse markdown content and extract code blocks
 * @param content Raw markdown content
 * @returns Parsed content with code blocks extracted
 */
export function parseMarkdown(content: string): ParsedContent {
  const blocks: CodeBlock[] = []
  const lines = content.split('\n')
  let text = ''
  let inCodeBlock = false
  let currentBlock: { language: string; code: string[]; lineStart: number } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check for code block start (``` or ~~~ with optional language)
    const codeBlockStart = /^(```|~~~)(\w*)/
    const codeBlockEnd = /^(```|~~~)$/

    if (!inCodeBlock && codeBlockStart.test(line)) {
      const match = line.match(codeBlockStart)
      inCodeBlock = true
      currentBlock = {
        language: match?.[2] || 'plaintext',
        code: [],
        lineStart: i,
      }
      text += '\n📋 [Code Block: ' + (match?.[2] || 'plain') + ']\n'
    } else if (inCodeBlock && codeBlockEnd.test(line)) {
      if (currentBlock) {
        blocks.push({
          language: currentBlock.language,
          code: currentBlock.code.join('\n'),
          lineStart: currentBlock.lineStart,
        })
        currentBlock = null
      }
      inCodeBlock = false
      text += '[/Code Block]\n\n'
    } else if (inCodeBlock && currentBlock) {
      currentBlock.code.push(line)
    } else {
      text += line + '\n'
    }
  }

  // Handle unclosed code block
  if (currentBlock) {
    blocks.push({
      language: currentBlock.language,
      code: currentBlock.code.join('\n'),
      lineStart: currentBlock.lineStart,
    })
  }

  return {
    text: text.trim(),
    blocks,
    hasCode: blocks.length > 0,
  }
}

/**
 * Format code block with line numbers and optional language indicator
 */
export function formatCodeBlockSimple(block: CodeBlock, withLineNumbers = true): string {
  const lines = block.code.split('\n')
  let formatted = `┌─ ${block.language.toUpperCase()}\n`

  if (withLineNumbers) {
    const maxLineNum = lines.length
    const numWidth = String(maxLineNum).length

    formatted += lines
      .map((line, idx) => {
        const lineNum = String(idx + 1).padStart(numWidth, ' ')
        return `│ ${lineNum} │ ${line}`
      })
      .join('\n')
  } else {
    formatted += lines.map(line => `│ ${line}`).join('\n')
  }

  formatted += '\n└─\n'
  return formatted
}

/**
 * Detect language from code block (useful for highlighting)
 */
export function detectLanguage(code: string): string {
  // Simple heuristics
  if (code.includes('import ') && code.includes('export ')) return 'typescript'
  if (code.includes('const ') || code.includes('function ')) return 'javascript'
  if (code.includes('#!/bin/bash') || code.includes('$')) return 'bash'
  if (code.includes('def ') || code.includes('import ')) return 'python'
  if (code.includes('fn ') || code.includes('let ')) return 'rust'

  return 'plaintext'
}

/**
 * Extract all code from markdown (concatenated)
 */
export function extractAllCode(content: string): string {
  const parsed = parseMarkdown(content)
  return parsed.blocks.map(block => block.code).join('\n\n')
}

/**
 * Check if content looks like it has code
 */
export function hasCodeContent(content: string): boolean {
  return /```|~~~/.test(content)
}

/**
 * Get code block count
 */
export function getCodeBlockCount(content: string): number {
  const parsed = parseMarkdown(content)
  return parsed.blocks.length
}

/**
 * Format inline code handling
 */
export function formatInlineCode(text: string): string {
  return text
    .replace(/`([^`]+)`/g, (_match, code) => {
      return `\x1b[36m${code}\x1b[0m` // Cyan inline code
    })
    .replace(/\*\*([^*]+)\*\*/g, (_match, bold) => {
      return `\x1b[1m${bold}\x1b[0m` // Bold
    })
    .replace(/\*([^*]+)\*/g, (_match, italic) => {
      return `\x1b[3m${italic}\x1b[0m` // Italic
    })
}
