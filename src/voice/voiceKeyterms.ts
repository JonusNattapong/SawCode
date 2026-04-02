/**
 * Voice Keyterms
 *
 * Domain-specific vocabulary hints for STT engines (Deepgram, Whisper).
 * Boosts recognition accuracy for coding terminology, project names,
 * and git branch words.
 *
 * Based on Claude Code's services/voiceKeyterms.ts architecture.
 */

import { basename } from 'path'

// ─── Global Coding Keyterms ────────────────────────────────────────

const GLOBAL_KEYTERMS: readonly string[] = [
  'MCP',
  'symlink',
  'grep',
  'regex',
  'localhost',
  'codebase',
  'TypeScript',
  'JSON',
  'YAML',
  'OAuth',
  'webhook',
  'gRPC',
  'dotfiles',
  'subagent',
  'worktree',
  'npm',
  'bun',
  'docker',
  'kubernetes',
  'API',
  'CLI',
  'TUI',
  'REPL',
  'async',
  'Promise',
  'callback',
  'middleware',
  'endpoint',
  'repository',
  'commit',
  'branch',
  'merge',
  'rebase',
  'diff',
  'pipeline',
  'deploy',
  'environment',
  'variable',
  'function',
  'component',
  'module',
  'interface',
  'schema',
  'validator',
  'SawCode',
]

// ─── Helpers ───────────────────────────────────────────────────────

/**
 * Split identifier (camelCase, PascalCase, kebab-case, snake_case) into words.
 */
export function splitIdentifier(name: string): string[] {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[-_./\s]+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && w.length <= 20)
}

function fileNameWords(filePath: string): string[] {
  const stem = basename(filePath).replace(/\.[^.]+$/, '')
  return splitIdentifier(stem)
}

// ─── Public API ────────────────────────────────────────────────────

const MAX_KEYTERMS = 50

/**
 * Build keyterm list for voice stream STT endpoint.
 *
 * Combines global coding terms with session context (project name,
 * git branch, recent files) without model calls.
 */
export function getVoiceKeyterms(context?: {
  projectRoot?: string
  gitBranch?: string
  recentFiles?: ReadonlySet<string>
}): string[] {
  const terms = new Set<string>(GLOBAL_KEYTERMS)

  // Project root basename
  if (context?.projectRoot) {
    const name = basename(context.projectRoot)
    if (name.length > 2 && name.length <= 50) {
      terms.add(name)
    }
  }

  // Git branch words
  if (context?.gitBranch) {
    for (const word of splitIdentifier(context.gitBranch)) {
      terms.add(word)
    }
  }

  // Recent file names
  if (context?.recentFiles) {
    for (const filePath of context.recentFiles) {
      if (terms.size >= MAX_KEYTERMS) break
      for (const word of fileNameWords(filePath)) {
        terms.add(word)
      }
    }
  }

  return [...terms].slice(0, MAX_KEYTERMS)
}
