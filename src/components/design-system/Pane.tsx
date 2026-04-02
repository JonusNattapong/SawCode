/**
 * Design System - Pane
 *
 * Bounded terminal region below REPL prompt.
 * Used by slash-command screens (/config, /help, /stats).
 */

import React from 'react'
import { Box, Text } from 'ink'
import { useThemeColors } from './ThemeProvider.js'

interface PaneProps {
  children: React.ReactNode
  color?: string
  title?: string
  width?: number | string
  padding?: number
}

export const Pane: React.FC<PaneProps> = ({
  children,
  color,
  title,
  width = '100%',
  padding = 1,
}) => {
  const colors = useThemeColors()
  const borderColor = color ?? colors.border

  return (
    <Box flexDirection="column" width={width}>
      {title && (
        <Box borderStyle="single" borderColor={borderColor as any} paddingX={1}>
          <Text bold color={borderColor as any}>{title}</Text>
        </Box>
      )}
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor={borderColor as any}
        paddingX={padding}
        paddingY={0}
      >
        {children}
      </Box>
    </Box>
  )
}
