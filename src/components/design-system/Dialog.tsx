/**
 * Design System - Dialog
 *
 * Confirm/cancel dialog with keybindings.
 * Supports Esc to cancel, Enter to confirm.
 */

import React, { useCallback } from 'react'
import { Box, Text, useInput } from 'ink'
import { useThemeColors } from './ThemeProvider.js'

interface DialogProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  color?: string
  showInputGuide?: boolean
}

export const Dialog: React.FC<DialogProps> = ({
  title,
  subtitle,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  color,
  showInputGuide = true,
}) => {
  const colors = useThemeColors()
  const accentColor = color ?? colors.primary

  useInput(
    useCallback(
      (input, key) => {
        if (key.escape || input === 'q') {
          onCancel?.()
        }
        if (key.return) {
          onConfirm?.()
        }
      },
      [onConfirm, onCancel],
    ),
  )

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={accentColor as any} paddingX={2} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold color={accentColor as any}>{title}</Text>
      </Box>

      {subtitle && (
        <Box marginBottom={1}>
          <Text dimColor>{subtitle}</Text>
        </Box>
      )}

      {children && (
        <Box marginBottom={1} flexDirection="column">
          {children}
        </Box>
      )}

      {showInputGuide && (
        <Box marginTop={1}>
          <Text dimColor>
            {onConfirm && <Text color="green">Enter</Text>}
            {onConfirm && onCancel && <Text dimColor> · </Text>}
            {onCancel && <Text color="red">Esc</Text>}
            <Text dimColor> to {onConfirm ? confirmLabel.toLowerCase() : ''}{onConfirm && onCancel ? '/' : ''}{onCancel ? cancelLabel.toLowerCase() : ''}</Text>
          </Text>
        </Box>
      )}
    </Box>
  )
}
