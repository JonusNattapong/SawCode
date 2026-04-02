/**
 * Project Analyzer Tool - Intelligent project structure analysis
 * Detects project type, analyzes dependencies, metrics
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const projectAnalyzerSchema = z.object({
  path: z.string().optional().describe('Project root path'),
  depth: z.number().optional().describe('Directory traversal depth'),
})

type ProjectAnalyzerArgs = z.infer<typeof projectAnalyzerSchema>

/**
 * Detect project type from files
 */
function detectProjectType(rootPath: string): string {
  const files = readdirSync(rootPath)
  const fileSet = new Set(files.map(f => f.toLowerCase()))

  // Monorepo indicators
  if (fileSet.has('pnpm-workspace.yaml') || fileSet.has('lerna.json')) {
    return 'monorepo'
  }

  // Framework indicators
  if (fileSet.has('next.config.js') || fileSet.has('next.config.ts')) return 'next.js'
  if (fileSet.has('nuxt.config.ts') || fileSet.has('nuxt.config.js')) return 'nuxt'
  if (fileSet.has('vite.config.ts')) return 'vite'
  if (fileSet.has('tsup.config.ts')) return 'tsup-library'
  if (fileSet.has('springboot') || fileSet.has('pom.xml')) return 'spring-boot'
  if (fileSet.has('build.gradle')) return 'gradle'

  // Language indicators
  if (fileSet.has('go.mod')) return 'go-module'
  if (fileSet.has('cargo.toml')) return 'rust-crate'
  if (fileSet.has('setup.py') || fileSet.has('pyproject.toml')) return 'python'
  if (fileSet.has('gemfile')) return 'ruby'

  // Default to TypeScript/Node app
  if (fileSet.has('package.json')) {
    return 'node-app'
  }

  return 'unknown'
}

/**
 * Parse package.json for dependencies
 */
function getDependencies(rootPath: string) {
  const pkgPath = join(rootPath, 'package.json')
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    return {
      dependencies: Object.keys(pkg.dependencies || {}).length,
      devDependencies: Object.keys(pkg.devDependencies || {}).length,
      peerDependencies: Object.keys(pkg.peerDependencies || {}).length,
      scripts: Object.keys(pkg.scripts || {}),
    }
  } catch {
    return null
  }
}

/**
 * Calculate project metrics
 */
function calculateMetrics(rootPath: string, depth: number = 3): any {
  let fileCount = 0
  let dirCount = 0
  let totalSize = 0
  const extensions: Record<string, number> = {}

  function traverse(currentPath: string, currentDepth: number) {
    if (currentDepth > depth) return

    try {
      const entries = readdirSync(currentPath)

      for (const entry of entries) {
        if (entry.startsWith('.') || entry === 'node_modules' || entry === '.git') continue

        const fullPath = join(currentPath, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          dirCount++
          traverse(fullPath, currentDepth + 1)
        } else {
          fileCount++
          totalSize += stat.size

          const ext = entry.split('.').pop() || 'none'
          extensions[ext] = (extensions[ext] || 0) + 1
        }
      }
    } catch {
      // Permission denied or other error
    }
  }

  traverse(rootPath, 0)

  return { fileCount, dirCount, totalSize, extensions }
}

export const projectAnalyzerTool = createTool(
  'project-analyzer',
  'Analyze project structure, type, dependencies, and metrics',
  projectAnalyzerSchema,
  async (args: ProjectAnalyzerArgs) => {
    try {
      const rootPath = args.path || '.'
      const depth = args.depth || 3

      // Verify it's a directory
      const stat = statSync(rootPath)
      if (!stat.isDirectory()) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${rootPath} is not a directory`,
            },
          ],
        }
      }

      // Detect project type
      const projectType = detectProjectType(rootPath)

      // Get dependencies
      const deps = getDependencies(rootPath)

      // Calculate metrics
      const metrics = calculateMetrics(rootPath, depth)

      // Get top 5 file types
      const topExt = Object.entries(metrics.extensions as Record<string, number>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([ext, count]) => `${ext} (${count})`)
        .join(', ')

      const summary = `
📦 Project Analysis
├─ Type: ${projectType}
├─ Files: ${metrics.fileCount}
├─ Directories: ${metrics.dirCount}
├─ Size: ${(metrics.totalSize / 1024 / 1024).toFixed(2)} MB
├─ Top Types: ${topExt}
${deps ? `├─ Dependencies: ${deps.dependencies}
├─ DevDependencies: ${deps.devDependencies}
└─ Scripts: ${deps.scripts.join(', ')}` : '└─ No package.json found'}
`.trim()

      return {
        content: [
          {
            type: 'text',
            text: summary,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }
    }
  }
)

export { projectAnalyzerSchema }
