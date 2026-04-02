/**
 * Syntax Highlighter for terminal output
 * Provides simple but effective syntax highlighting for common languages
 */

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
}

export type SupportedLanguage = 'typescript' | 'javascript' | 'bash' | 'python' | 'json' | 'yaml' | 'plaintext'

interface TokenPattern {
  pattern: RegExp
  color: string
  bold?: boolean
}

/**
 * Highlight TypeScript/JavaScript code
 */
function highlightTypeScript(code: string): string {
  const patterns: TokenPattern[] = [
    // Keywords
    { pattern: /\b(const|let|var|function|async|await|return|if|else|for|while|switch|case|break|continue|try|catch|finally|throw|class|interface|type|import|export|from|default|extends|implements)\b/g, color: colors.magenta, bold: true },
    // Types and interfaces
    { pattern: /\b(string|number|boolean|any|void|unknown|never|object|Array|Record|Promise|Map|Set)\b/g, color: colors.cyan },
    // Strings (single, double, backtick)
    { pattern: /(['"`])(?:(?=(\\?))\2.)*?\1/g, color: colors.green },
    // Numbers
    { pattern: /\b\d+\.?\d*\b/g, color: colors.yellow },
    // Comments
    { pattern: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, color: colors.dim },
    // Functions
    { pattern: /\b([a-zA-Z_]\w*)\s*(?=\()/g, color: colors.brightBlue },
  ]

  return applyHighlight(code, patterns)
}

/**
 * Highlight JavaScript code
 */
function highlightJavaScript(code: string): string {
  // Same as TypeScript for now
  return highlightTypeScript(code)
}

/**
 * Highlight Bash/Shell code
 */
function highlightBash(code: string): string {
  const patterns: TokenPattern[] = [
    // Keywords
    { pattern: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|in|echo|export|return|exit)\b/g, color: colors.magenta, bold: true },
    // Variables
    { pattern: /\$\{?[A-Za-z_]\w*\}?/g, color: colors.cyan },
    // Strings
    { pattern: /(['"`])(?:(?=(\\?))\2.)*?\1/g, color: colors.green },
    // Commands (first word)
    { pattern: /^(\s*)([a-z\-]+)(?=\s)/gm, color: colors.brightBlue },
    // Comments
    { pattern: /(#.*$)/gm, color: colors.dim },
    // Pipes and redirects
    { pattern: /[|&><;]/g, color: colors.yellow },
  ]

  return applyHighlight(code, patterns)
}

/**
 * Highlight Python code
 */
function highlightPython(code: string): string {
  const patterns: TokenPattern[] = [
    // Keywords
    { pattern: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|yield|assert|del|pass|break|continue|raise|and|or|not|in|is)\b/g, color: colors.magenta, bold: true },
    // Built-ins
    { pattern: /\b(print|len|range|list|dict|set|str|int|float|bool|type|open|input|map|filter|zip|enumerate)\b/g, color: colors.cyan },
    // Strings
    { pattern: /(['"`])(?:(?=(\\?))\2.)*?\1/g, color: colors.green },
    // Numbers
    { pattern: /\b\d+\.?\d*\b/g, color: colors.yellow },
    // Comments
    { pattern: /(#.*$)/gm, color: colors.dim },
  ]

  return applyHighlight(code, patterns)
}

/**
 * Highlight JSON code
 */
function highlightJSON(code: string): string {
  const patterns: TokenPattern[] = [
    // Keys
    { pattern: /"([^"]*)"(?=\s*:)/g, color: colors.cyan },
    // Strings
    { pattern: /:\s*"([^"]*)"/g, color: colors.green },
    // Numbers
    { pattern: /:\s*(-?\d+\.?\d*)/g, color: colors.yellow },
    // Booleans
    { pattern: /:\s*(true|false)/g, color: colors.magenta },
    // Null
    { pattern: /:\s*(null)/g, color: colors.brightRed },
  ]

  return applyHighlight(code, patterns)
}

/**
 * Highlight YAML code
 */
function highlightYAML(code: string): string {
  const patterns: TokenPattern[] = [
    // Keys
    { pattern: /^(\s*)([a-zA-Z_]\w*):/gm, color: colors.cyan },
    // Values (strings)
    { pattern: /:\s*([^\s#,]+)/g, color: colors.green },
    // Comments
    { pattern: /(#.*$)/gm, color: colors.dim },
  ]

  return applyHighlight(code, patterns)
}

/**
 * Apply highlight patterns to code
 */
function applyHighlight(code: string, patterns: TokenPattern[]): string {
  let highlighted = code

  for (const { pattern, color, bold } of patterns) {
    highlighted = highlighted.replace(pattern, match => {
      const prefix = bold ? colors.bold : ''
      return `${prefix}${color}${match}${colors.reset}`
    })
  }

  return highlighted
}

/**
 * Main highlight function - dispatches to language-specific highlighter
 */
export function highlight(code: string, language: SupportedLanguage = 'plaintext'): string {
  switch (language) {
    case 'typescript':
      return highlightTypeScript(code)
    case 'javascript':
      return highlightJavaScript(code)
    case 'bash':
      return highlightBash(code)
    case 'python':
      return highlightPython(code)
    case 'json':
      return highlightJSON(code)
    case 'yaml':
      return highlightYAML(code)
    default:
      return code
  }
}

/**
 * Get color for a token type
 */
export function getTokenColor(tokenType: 'keyword' | 'string' | 'number' | 'comment' | 'function'): string {
  const colorMap: Record<string, string> = {
    keyword: colors.magenta,
    string: colors.green,
    number: colors.yellow,
    comment: colors.dim,
    function: colors.brightBlue,
  }
  return colorMap[tokenType] || colors.reset
}

/**
 * Wrap text with color and reset
 */
export function colorize(text: string, color: string, bold = false): string {
  const prefix = bold ? colors.bold : ''
  return `${prefix}${color}${text}${colors.reset}`
}

/**
 * Create a colored box for output
 */
export function createBox(title: string, content: string, color = colors.cyan): string {
  const lines = content.split('\n')
  const maxWidth = Math.max(title.length, ...lines.map(l => l.length))

  const top = `${color}┌─ ${title} ${'─'.repeat(maxWidth - title.length - 1)}${colors.reset}`
  const middle = lines.map(line => `${color}│${colors.reset} ${line}`).join('\n')
  const bottom = `${color}└─${'─'.repeat(maxWidth + 2)}${colors.reset}`

  return `${top}\n${middle}\n${bottom}`
}

/**
 * Export all colors for external use
 */
export { colors }
