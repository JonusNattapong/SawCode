/**
 * Project Tree Tool - Display project structure as a tree
 * Shows files and directories in a nice hierarchical format
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const treeSchema = z.object({
  path: z.string().optional().describe('Directory to display (default: current directory)'),
  depth: z.number().optional().describe('Maximum depth to traverse (default: 3)'),
  ignorePattern: z.string().optional().describe('Patterns to ignore (comma-separated, e.g., node_modules,dist,.git)'),
})

type TreeArgs = z.infer<typeof treeSchema>

/**
 * Check if path should be ignored
 */
function shouldIgnore(name: string, ignorePattern: string[]): boolean {
  return ignorePattern.some(pattern => {
    if (pattern.startsWith('.')) {
      return name === pattern || name.startsWith(pattern + '/')
    }
    return name === pattern || name.includes(pattern)
  })
}

/**
 * Generate tree structure
 */
function generateTree(dir: string, prefix: string = '', depth: number, maxDepth: number, ignoreList: string[]): string[] {
  const lines: string[] = []

  if (depth > maxDepth) return lines

  try {
    const entries = readdirSync(dir).sort()

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]

      if (shouldIgnore(entry, ignoreList)) continue

      const fullPath = join(dir, entry)
      const isLast = i === entries.length - 1
      const connector = isLast ? '└── ' : '├── '
      const extension = isLast ? '    ' : '│   '

      try {
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          lines.push(`${prefix}${connector}📁 ${entry}/`)

          if (depth < maxDepth) {
            const subLines = generateTree(fullPath, prefix + extension, depth + 1, maxDepth, ignoreList)
            lines.push(...subLines)
          } else {
            lines.push(`${prefix}${extension}...`)
          }
        } else {
          // File with icon based on type
          const icon = getFileIcon(entry)
          lines.push(`${prefix}${connector}${icon} ${entry}`)
        }
      } catch {
        // Skip entries that can't be stat'd
      }
    }
  } catch {
    lines.push(`${prefix}└── [Error reading directory]`)
  }

  return lines
}

/**
 * Get icon for file type
 */
function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  const icons: Record<string, string> = {
    ts: '🔷',
    tsx: '⚛️',
    js: '🟨',
    jsx: '⚛️',
    json: '📋',
    yaml: '📝',
    yml: '📝',
    md: '📖',
    txt: '📄',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    py: '🐍',
    sh: '🔧',
    bash: '🔧',
    dockerfile: '🐳',
    lock: '🔒',
    test: '🧪',
    spec: '🧪',
  }

  return icons[ext] || '📄'
}

export const treeTool = createTool(
  'tree',
  'Display project structure as a tree. Shows files and directories hierarchically.',
  treeSchema,
  async (args: TreeArgs) => {
    const searchDir = args.path || '.'
    const maxDepth = args.depth || 3
    const ignoreList = args.ignorePattern
      ? args.ignorePattern.split(',').map(s => s.trim())
      : ['node_modules', 'dist', '.git', '.env', 'build', 'target', '.next', 'out']

    try {
      const stat = statSync(searchDir)
      if (!stat.isDirectory()) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${searchDir} is not a directory`,
            },
          ],
        }
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Directory not found - ${searchDir}`,
          },
        ],
      }
    }

    const lines = generateTree(searchDir, '', 1, maxDepth, ignoreList)

    // Add header
    const header = `📂 ${searchDir}/`
    const output = [header, ...lines].join('\n')

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    }
  }
)

export { treeSchema }
