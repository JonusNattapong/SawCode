/**
 * Context Extractor Tool
 *
 * Extracts context from files and directories for better AI understanding.
 * Supports code context, documentation, dependencies, and metadata.
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { readdir, readFile, stat } from 'fs/promises'
import { join, extname } from 'path'

// Supported file extensions for context extraction
const CONTEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json',
  '.md', '.mdx', '.txt',
  '.yaml', '.yml', '.toml',
  '.py', '.go', '.rs',
  '.sql', '.html', '.css'
])

interface FileContext {
  path: string
  extension: string
  lines: number
  size: number
  content?: string
}

interface DirectoryContext {
  totalFiles: number
  filesByType: Record<string, number>
  estimatedLines: number
  files: FileContext[]
}

async function getFileContext(
  filePath: string,
  includeContent = false,
  maxSize = 50000
): Promise<FileContext> {
  try {
    const fileStats = await stat(filePath)
    const extension = extname(filePath).toLowerCase()
    let lines = 0
    let content: string | undefined

    if (fileStats.isFile() && fileStats.size <= maxSize) {
      content = await readFile(filePath, 'utf-8')
      lines = content.split('\n').length

      return {
        path: filePath,
        extension: extension || 'unknown',
        lines,
        size: fileStats.size,
        content: includeContent ? content.substring(0, maxSize) : undefined,
      }
    }

    return {
      path: filePath,
      extension: extension || 'unknown',
      lines: 0,
      size: fileStats.size,
    }
  } catch {
    return {
      path: filePath,
      extension: 'error',
      lines: 0,
      size: 0,
    }
  }
}

async function extractDirectoryContext(
  dirPath: string,
  depth = 0,
  maxDepth = 3,
  includeContent = false
): Promise<DirectoryContext> {
  const filesByType: Record<string, number> = {}
  const files: FileContext[] = []
  let totalFiles = 0
  let estimatedLines = 0

  try {
    if (depth > maxDepth) return { totalFiles, filesByType, estimatedLines, files }

    const entries = await readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue // Skip hidden files

      const fullPath = join(dirPath, entry.name)

      if (entry.isDirectory()) {
        const subContext = await extractDirectoryContext(fullPath, depth + 1, maxDepth, includeContent)
        totalFiles += subContext.totalFiles
        estimatedLines += subContext.estimatedLines
        files.push(...subContext.files)

        for (const [type, count] of Object.entries(subContext.filesByType)) {
          filesByType[type] = (filesByType[type] || 0) + count
        }
      } else if (CONTEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
        totalFiles++
        const fileCtx = await getFileContext(fullPath, includeContent)
        estimatedLines += fileCtx.lines
        filesByType[fileCtx.extension] = (filesByType[fileCtx.extension] || 0) + 1
        files.push(fileCtx)
      }
    }
  } catch (error) {
    console.error(`Error reading directory: ${dirPath}`, error)
  }

  return { totalFiles, filesByType, estimatedLines, files }
}

export const contextExtractorTool = createTool(
  'context-extractor',
  'Extract context from files and directories for AI understanding',
  z.object({
    path: z.string().describe('Path to file or directory'),
    depth: z.number().optional().describe('Max directory depth (default: 3)'),
    includeContent: z.boolean().optional().describe('Include file contents (default: false)'),
    maxSize: z.number().optional().describe('Max file size to read in bytes (default: 50000)'),
  }),
  async ({ path, depth = 3, includeContent = false, maxSize = 50000 }) => {
    try {
      const fileStats = await stat(path)

      let context: string

      if (fileStats.isFile()) {
        const fileCtx = await getFileContext(path, includeContent, maxSize)
        context = JSON.stringify(
          {
            type: 'file',
            ...fileCtx,
            contentPreview: fileCtx.content?.substring(0, 200),
          },
          null,
          2
        )
      } else if (fileStats.isDirectory()) {
        const dirCtx = await extractDirectoryContext(path, 0, depth, includeContent)
        context = JSON.stringify(
          {
            type: 'directory',
            path,
            ...dirCtx,
            fileDetails: dirCtx.files.slice(0, 20), // First 20 files
          },
          null,
          2
        )
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${path} is neither a file nor a directory`,
            },
          ],
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: context,
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [
          {
            type: 'text',
            text: `Error extracting context: ${message}`,
          },
        ],
      }
    }
  }
)

export const contextExtractorSchema = z.object({
  path: z.string(),
  depth: z.number().optional(),
  includeContent: z.boolean().optional(),
  maxSize: z.number().optional(),
})
