/**
 * Phase 7: Code Writing Enhancement Examples
 * 
 * Demonstrates:
 * - Markdown parsing
 * - Syntax highlighting
 * - Code block formatting
 * - Streaming support
 * - Enhanced TUI display
 */

import { Agent } from '../src/index.js'
import {
  parseMarkdown,
  formatCodeBlock,
  formatError,
  formatSuccess,
  formatInfo,
  formatDiff,
  formatList,
  createBox,
} from '../src/utils/index.js'
import { highlight } from '../src/utils/syntax-highlighter.js'

// Example 1: Markdown Parsing
console.log('\n=== Example 1: Markdown Parsing ===\n')

const markdownText = `
Here's a simple function:

\`\`\`typescript
function hello(name: string): string {
  return \`Hello, \${name}!\`
}
\`\`\`

And here's how to use it:

\`\`\`bash
const message = hello("World")
console.log(message)
\`\`\`
`

const parsed = parseMarkdown(markdownText)
console.log('Parsed content:')
console.log(`- Has code: ${parsed.hasCode}`)
console.log(`- Code blocks: ${parsed.blocks.length}`)
for (const block of parsed.blocks) {
  console.log(`  * ${block.language} at line ${block.lineStart}`)
}

// Example 2: Syntax Highlighting
console.log('\n=== Example 2: Syntax Highlighting ===\n')

const tsCode = `
const greeting = "Hello, World!"
const numbers = [1, 2, 3, 4, 5]
const isReady = true

function processData(items: string[]): void {
  items.forEach(item => console.log(item))
}
`

const highlighted = highlight(tsCode, 'typescript')
console.log('TypeScript code highlighted:')
console.log(highlighted)

// Example 3: Code Block Formatting
console.log('\n=== Example 3: Code Block Formatting ===\n')

const bashCode = `
#!/bin/bash
# Build the project

echo "Building..."
bun run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
fi
`

const formatted = formatCodeBlock(
  { language: 'bash', code: bashCode, lineStart: 0 },
  { lineNumbers: true, highlight: true }
)
console.log(formatted)

// Example 4: Error/Success Messages
console.log('\n=== Example 4: Formatted Messages ===\n')

console.log(formatSuccess('Compilation complete', 'All 42 files compiled successfully'))
console.log('\n')
console.log(formatError('Syntax Error', 'Unexpected token at line 15, column 5'))
console.log('\n')
console.log(formatInfo('Building project', 'Starting TypeScript compilation...'))

// Example 5: Diff Formatting
console.log('\n=== Example 5: Diff Formatting ===\n')

const diff = formatDiff(
  ['  const oldName = "value"', '  console.log("old")'],
  ['  const newName = "value"', '  console.log("new")'],
  ['// context line 1', '// context line 2']
)
console.log(diff)

// Example 6: List Formatting
console.log('\n=== Example 6: List Formatting ===\n')

const toolsList = formatList('Available Tools', [
  'bash - Execute shell commands',
  'webfetch - Fetch web content',
  'fileread - Read file contents',
  'filewrite - Write to files',
  'listdir - List directory contents',
])
console.log(toolsList)

// Example 7: Integration with Agent
console.log('\n=== Example 7: Agent with Enhanced Display ===\n')

async function demonstrateEnhancedAgent() {
  const agent = new Agent({
    tools: [],
  })

  // Add a test message
  console.log(formatInfo(
    'Demo Agent',
    'Ready to display formatted code and streaming output'
  ))

  // Simulate code block detection and formatting
  const sampleResponse = `
Here's a TypeScript utility function:

\`\`\`typescript
function parseJSON<T>(json: string): T {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    console.error('Parse error:', error)
    throw error
  }
}
\`\`\`

Usage example:

\`\`\`bash
const data = parseJSON<User>(jsonString)
\`\`\`
  `

  const parsed = parseMarkdown(sampleResponse)
  console.log(parsed.text)

  if (parsed.blocks.length > 0) {
    console.log('\n📝 Code blocks found:')
    for (const [idx, block] of parsed.blocks.entries()) {
      console.log(`\n[Block ${idx + 1}/${parsed.blocks.length}]`)
      const formatted = formatCodeBlock(block, {
        lineNumbers: true,
        highlight: true,
      })
      console.log(formatted)
    }
  }
}

// Run the demo
demonstrateEnhancedAgent().catch(console.error)

console.log('\n=== Phase 7 Demo Complete ===\n')
console.log('Features demonstrated:')
console.log('✓ Markdown parsing')
console.log('✓ Syntax highlighting')
console.log('✓ Code block formatting')
console.log('✓ Enhanced messages (info, success, error)')
console.log('✓ Diff and list formatting')
console.log('✓ Agent integration')
