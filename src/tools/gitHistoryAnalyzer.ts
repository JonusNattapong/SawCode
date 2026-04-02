/**
 * Git History Analyzer Tool
 *
 * Analyzes git commit history to extract patterns, contributions,
 * and code evolution insights.
 */

import { createTool } from './index.js'
import { z } from 'zod'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface CommitInfo {
  hash: string
  author: string
  date: string
  message: string
  filesChanged: number
  insertions: number
  deletions: number
}

async function getGitHistory(
  repoPath: string,
  limit = 50
): Promise<CommitInfo[]> {
  try {
    const { stdout } = await execAsync(
      `git -C ${repoPath} log --oneline -${limit} --format="%H|%an|%ad|%s" --date=short`,
      { maxBuffer: 10 * 1024 * 1024 }
    )

    return stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [hash, author, date, message] = line.split('|')
        return {
          hash: hash || '',
          author: author || 'unknown',
          date: date || '',
          message: message || '',
          filesChanged: 0,
          insertions: 0,
          deletions: 0,
        }
      })
  } catch {
    return []
  }
}

async function getCommitStats(
  repoPath: string,
  hash: string
): Promise<{ files: number; insertions: number; deletions: number }> {
  try {
    const { stdout } = await execAsync(
      `git -C ${repoPath} show --stat ${hash} | tail -1`,
      { maxBuffer: 10 * 1024 * 1024 }
    )

    const match = stdout.match(/(\d+) file.*?(\d+) insertion.*?(\d+) deletion/)
    return {
      files: match ? parseInt(match[1]) : 0,
      insertions: match ? parseInt(match[2]) : 0,
      deletions: match ? parseInt(match[3]) : 0,
    }
  } catch {
    return { files: 0, insertions: 0, deletions: 0 }
  }
}

export const gitHistoryAnalyzerTool = createTool(
  'git-history-analyzer',
  'Analyze git history for patterns and insights',
  z.object({
    path: z.string().describe('Repository path (default: current directory)'),
    limit: z.number().optional().describe('Number of commits to analyze (default: 50)'),
    author: z.string().optional().describe('Filter by author'),
    stats: z.boolean().optional().describe('Include detailed stats'),
  }),
  async ({ path = '.', limit = 50, author, stats = true }) => {
    try {
      const commits = await getGitHistory(path, limit)

      // Filter by author if specified
      let filtered = commits
      if (author) {
        filtered = commits.filter((c) => c.author.toLowerCase().includes(author.toLowerCase()))
      }

      // Get stats for each commit if requested
      if (stats && filtered.length > 0) {
        for (let i = 0; i < Math.min(filtered.length, 10); i++) {
          const stats_result = await getCommitStats(path, filtered[i].hash)
          filtered[i].filesChanged = stats_result.files
          filtered[i].insertions = stats_result.insertions
          filtered[i].deletions = stats_result.deletions
        }
      }

      // Analyze patterns
      const authorStats: Record<string, number> = {}
      filtered.forEach((c) => {
        authorStats[c.author] = (authorStats[c.author] || 0) + 1
      })

      const analysis = {
        totalCommits: filtered.length,
        timespan: filtered.length > 0 ? `${filtered[0].date} to ${filtered[filtered.length - 1].date}` : 'N/A',
        topAuthors: Object.entries(authorStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
        averageFilesChanged: Math.round(
          filtered.reduce((sum, c) => sum + c.filesChanged, 0) / Math.max(filtered.length, 1)
        ),
        commits: filtered.slice(0, 20),
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing git history: ${message}`,
          },
        ],
      }
    }
  }
)

export const gitHistoryAnalyzerSchema = z.object({
  path: z.string().optional(),
  limit: z.number().optional(),
  author: z.string().optional(),
  stats: z.boolean().optional(),
})
