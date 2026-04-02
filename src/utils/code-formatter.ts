/**
 * Code Block Formatter - Format code for TUI display
 * Handles line numbers, syntax highlighting, and line wrapping
 */

import type { CodeBlock } from './markdown-parser.js'
import { highlight, colorize, createBox, colors } from './syntax-highlighter.js'
import type { SupportedLanguage } from './syntax-highlighter.js'

export interface FormattingOptions {
  lineNumbers?: boolean
  lineLength?: number
  highlight?: boolean
  maxLines?: number
  truncate?: boolean
}

const defaultOptions: Required<FormattingOptions> = {
  lineNumbers: true,
  lineLength: 120,
  highlight: true,
  maxLines: 50,
  truncate: true,
}

/**
 * Format a single code block for display
 */
export function formatCodeBlock(
  block: CodeBlock,
  options: FormattingOptions = {}
): string {
  const opts = { ...defaultOptions, ...options }
  const lines = block.code.split('\n')

  // Truncate if needed
  const displayLines = opts.truncate && lines.length > opts.maxLines
    ? [...lines.slice(0, opts.maxLines), `... (${lines.length - opts.maxLines} more lines)`]
    : lines

  // Format content
  let content = formatLines(displayLines, block.language as SupportedLanguage, opts)

  // Create box
  const title = block.language.toUpperCase() || 'CODE'
  return createBox(title, content, colors.cyan)
}

/**
 * Format multiple code blocks for display
 */
export function formatCodeBlocks(
  blocks: CodeBlock[],
  options: FormattingOptions = {}
): string {
  return blocks
    .map((block, idx) => {
      const numbered = blocks.length > 1 ? `${colorize(`[${idx + 1}/${blocks.length}]`, colors.yellow)} ` : ''
      return numbered + formatCodeBlock(block, options)
    })
    .join('\n\n')
}

/**
 * Format lines with optional line numbers and highlighting
 */
function formatLines(
  lines: string[],
  language: SupportedLanguage,
  options: Required<FormattingOptions>
): string {
  const numWidth = lines.length.toString().length
  const formatted: string[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Truncate to line length if needed
    if (line.length > options.lineLength) {
      line = line.substring(0, options.lineLength - 3) + '...'
    }

    // Apply syntax highlighting
    if (options.highlight) {
      line = highlight(line, language)
    }

    // Add line number
    if (options.lineNumbers) {
      const num = colorize(String(i + 1).padStart(numWidth, ' '), colors.dim)
      formatted.push(`${num} │ ${line}`)
    } else {
      formatted.push(line)
    }
  }

  return formatted.join('\n')
}

/**
 * Format inline code snippets
 */
export function formatInlineCode(code: string, language: SupportedLanguage = 'plaintext'): string {
  const highlighted = highlight(code, language)
  return colorize(highlighted, colors.cyan, false)
}

/**
 * Format error output with syntax highlighting
 */
export function formatError(message: string, details?: string): string {
  let content = colorize(message, colors.brightRed, true)
  if (details) {
    content += '\n' + details
  }
  return createBox('ERROR', content, colors.red)
}

/**
 * Format warning output
 */
export function formatWarning(message: string, details?: string): string {
  let content = colorize(message, colors.brightYellow, true)
  if (details) {
    content += '\n' + details
  }
  return createBox('WARNING', content, colors.yellow)
}

/**
 * Format info output
 */
export function formatInfo(message: string, details?: string): string {
  let content = colorize(message, colors.brightBlue, true)
  if (details) {
    content += '\n' + details
  }
  return createBox('INFO', content, colors.blue)
}

/**
 * Format success output
 */
export function formatSuccess(message: string, details?: string): string {
  let content = colorize(message, colors.brightGreen, true)
  if (details) {
    content += '\n' + details
  }
  return createBox('SUCCESS', content, colors.green)
}

/**
 * Format tool execution result
 */
export function formatToolResult(
  toolName: string,
  result: string,
  success = true,
  options?: FormattingOptions
): string {
  const header = success
    ? colorize(`✓ ${toolName}`, colors.brightGreen, true)
    : colorize(`✗ ${toolName}`, colors.brightRed, true)

  // Check if result looks like code
  if (result.includes('\n') && (result.length > 50 || result.split('\n').length > 3)) {
    // Format as code block
    const codeBlock: CodeBlock = {
      language: 'plaintext',
      code: result,
      lineStart: 0,
    }
    return header + '\n' + formatCodeBlock(codeBlock, options)
  }

  // Format as plain text
  return createBox(header, result, success ? colors.green : colors.red)
}

/**
 * Format diff-like output (for file changes)
 */
export function formatDiff(
  removed: string[],
  added: string[],
  context: string[] = []
): string {
  const lines: string[] = []

  // Context lines
  for (const line of context) {
    lines.push(`  ${colorize(line, colors.dim)}`)
  }

  // Removed lines
  for (const line of removed) {
    lines.push(`${colorize('-', colors.red)} ${colorize(line, colors.brightRed)}`)
  }

  // Added lines
  for (const line of added) {
    lines.push(`${colorize('+', colors.green)} ${colorize(line, colors.brightGreen)}`)
  }

  return createBox('DIFF', lines.join('\n'), colors.yellow)
}

/**
 * Format a list of items
 */
export function formatList(title: string, items: string[], color = colors.cyan): string {
  const content = items.map(item => `• ${item}`).join('\n')
  return createBox(title, content, color)
}

/**
 * Format key-value pairs (like config output)
 */
export function formatKeyValue(
  data: Record<string, string | number | boolean>,
  title = 'DATA'
): string {
  const maxKeyLen = Math.max(...Object.keys(data).map(k => k.length))
  const lines = Object.entries(data)
    .map(([key, value]) => {
      const paddedKey = colorize(key.padEnd(maxKeyLen), colors.cyan)
      return `${paddedKey} : ${value}`
    })
    .join('\n')

  return createBox(title, lines, colors.blue)
}

/**
 * Format streaming progress indicator
 */
export function formatStreaming(position: number, total?: number): string {
  const indicator = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'][position % 10]
  const text = total ? `${position}/${total}` : `${position}`
  return `${colorize(indicator, colors.cyan)} ${colorize(text, colors.dim)}`
}

/**
 * Format a table
 */
export function formatTable(
  headers: string[],
  rows: string[][],
  title?: string
): string {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] || '').length))
  )

  const formatRow = (cells: string[]) =>
    cells
      .map((cell, i) => (cell || '').padEnd(colWidths[i]))
      .join(' │ ')

  const lines = [
    colorize(formatRow(headers), colors.cyan, true),
    colorize('─'.repeat(colWidths.reduce((a, b) => a + b + 3, 0)), colors.dim),
    ...rows.map(row => formatRow(row)),
  ]

  const content = lines.join('\n')
  return title ? createBox(title, content, colors.cyan) : content
}
