/**
 * Dependency Graph Tool - Analyze project dependencies
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readFileSync } from 'fs'
import { join } from 'path'

const dependencyGraphSchema = z.object({
  path: z.string().optional().describe('Project path'),
  type: z.enum(['all', 'prod', 'dev', 'peer']).optional().describe('Dependency type'),
  depth: z.number().optional().describe('Graph depth'),
})

type DependencyGraphArgs = z.infer<typeof dependencyGraphSchema>

/**
 * Get dependencies from package.json
 */
function getDependencies(rootPath: string, type: string = 'all') {
  const pkgPath = join(rootPath, 'package.json')
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

    const deps: Record<string, string> = {}

    if (type === 'all' || type === 'prod') {
      Object.assign(deps, pkg.dependencies || {})
    }
    if (type === 'all' || type === 'dev') {
      Object.entries(pkg.devDependencies || {}).forEach(([k, v]) => {
        deps[`${k} (dev)`] = v as string
      })
    }
    if (type === 'all' || type === 'peer') {
      Object.entries(pkg.peerDependencies || {}).forEach(([k, v]) => {
        deps[`${k} (peer)`] = v as string
      })
    }

    return deps
  } catch {
    return {}
  }
}

/**
 * Categorize dependencies
 */
function categorizeDependencies(deps: Record<string, string>) {
  const categories: Record<string, string[]> = {
    'React/UI': [],
    'Build Tools': [],
    'Testing': [],
    'Linting': [],
    'Database': [],
    'HTTP': [],
    'Utilities': [],
    'Other': [],
  }

  const patterns = {
    'React/UI': ['react', 'vue', 'svelte', 'next', 'nuxt', '@mui', 'tailwind', 'styled-'],
    'Build Tools': ['webpack', 'rollup', 'esbuild', 'vite', 'tsup', 'tsc'],
    'Testing': ['jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', 'testing-library'],
    'Linting': ['eslint', 'prettier', 'biome', 'oxlint'],
    'Database': ['prisma', 'postgres', 'mongodb', 'sqlite', 'knex', 'redis'],
    'HTTP': ['axios', 'fetch', 'node-fetch', 'undici', 'superagent'],
    'Utilities': ['lodash', 'date-fns', 'zod', 'yup', 'uuid', 'chalk'],
  }

  for (const [name, version] of Object.entries(deps)) {
    let categorized = false

    for (const [category, keywords] of Object.entries(patterns)) {
      if (keywords.some(kw => name.toLowerCase().includes(kw))) {
        categories[category].push(`${name} (${version})`)
        categorized = true
        break
      }
    }

    if (!categorized) {
      categories.Other.push(`${name} (${version})`)
    }
  }

  return categories
}

export const dependencyGraphTool = createTool(
  'dependency-graph',
  'Analyze and visualize project dependencies by category',
  dependencyGraphSchema,
  async (args: DependencyGraphArgs) => {
    try {
      const rootPath = args.path || '.'
      const type = args.type || 'all'

      const deps = getDependencies(rootPath, type)

      if (Object.keys(deps).length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No dependencies found',
            },
          ],
        }
      }

      const categories = categorizeDependencies(deps)

      let output = '📊 Dependency Graph\n\n'

      for (const [category, pkgs] of Object.entries(categories)) {
        if (pkgs.length > 0) {
          output += `${category} (${pkgs.length}):\n`
          pkgs.forEach(pkg => {
            output += `  • ${pkg}\n`
          })
          output += '\n'
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: output,
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

export { dependencyGraphSchema }
