/**
 * Permission System - Request Dispatcher
 *
 * Routes permission requests to tool-specific handlers.
 * Based on Claude Code's components/permissions/PermissionRequest.tsx pattern.
 */

import React from 'react'
import { Box, Text } from 'ink'
import { Dialog } from '../design-system/Dialog.js'

export type PermissionBehavior = 'allow' | 'deny' | 'ask'

export type ToolPermissionContext = {
  toolName: string
  toolInput: Record<string, unknown>
  behavior: PermissionBehavior
  message?: string
}

interface PermissionRequestProps {
  context: ToolPermissionContext
  onAllow: () => void
  onDeny: () => void
}

const TOOL_DESCRIPTIONS: Record<string, string> = {
  bash: 'Run shell command',
  webfetch: 'Fetch URL content',
  fileread: 'Read file',
  filewrite: 'Write file',
  listdir: 'List directory',
  grep: 'Search file contents',
  find: 'Find files',
  tree: 'Show directory tree',
  'git-status': 'Check git status',
  'git-diff': 'Show git diff',
  'git-add': 'Stage files',
  'git-commit': 'Create commit',
  'speech-to-text': 'Transcribe audio',
  'text-to-speech': 'Generate speech',
  'audio-processor': 'Process audio',
}

function getToolDescription(toolName: string): string {
  return TOOL_DESCRIPTIONS[toolName] || `Use ${toolName} tool`
}

function formatToolInput(toolName: string, input: Record<string, unknown>): string {
  switch (toolName) {
    case 'bash':
      return `$ ${input.command ?? 'unknown'}`
    case 'webfetch':
      return `URL: ${input.url ?? 'unknown'}`
    case 'fileread':
    case 'filewrite':
      return `File: ${input.filepath ?? input.path ?? 'unknown'}`
    case 'grep':
      return `Pattern: ${input.pattern ?? 'unknown'}`
    case 'git-commit':
      return `Message: ${input.message ?? 'unknown'}`
    default:
      return JSON.stringify(input, null, 2).slice(0, 200)
  }
}

export const PermissionRequest: React.FC<PermissionRequestProps> = ({
  context,
  onAllow,
  onDeny,
}) => {
  const description = getToolDescription(context.toolName)
  const inputPreview = formatToolInput(context.toolName, context.toolInput)

  return (
    <Dialog
      title={`Permission Required: ${context.toolName}`}
      subtitle={description}
      onConfirm={onAllow}
      onCancel={onDeny}
      confirmLabel="Allow"
      cancelLabel="Deny"
      color="yellow"
    >
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text dimColor>Tool Input:</Text>
        </Box>
        <Box paddingLeft={2}>
          <Text>{inputPreview}</Text>
        </Box>
      </Box>
    </Dialog>
  )
}

/**
 * Check if a tool action should be allowed based on permission context.
 */
export function checkPermission(context: ToolPermissionContext): {
  allowed: boolean
  reason?: string
} {
  switch (context.behavior) {
    case 'allow':
      return { allowed: true }
    case 'deny':
      return { allowed: false, reason: context.message || 'Permission denied' }
    case 'ask':
      return { allowed: false, reason: 'User confirmation required' }
    default:
      return { allowed: false, reason: 'Unknown permission behavior' }
  }
}
