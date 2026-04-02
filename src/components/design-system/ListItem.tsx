/**
 * Design System - ListItem
 *
 * Selectable list item with focus/selection indicators.
 */

import React from 'react'
import { Box, Text } from 'ink'

interface ListItemProps {
  children: React.ReactNode
  isFocused?: boolean
  isSelected?: boolean
  description?: string
  showScrollDown?: boolean
  showScrollUp?: boolean
  color?: string
}

export const ListItem: React.FC<ListItemProps> = ({
  children,
  isFocused = false,
  isSelected = false,
  description,
  showScrollDown = false,
  showScrollUp = false,
  color,
}) => {
  const prefix = isFocused ? '❯' : isSelected ? '✓' : ' '
  const textColor = isSelected ? color ?? 'green' : isFocused ? color ?? 'cyan' : undefined

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold={isFocused} color={textColor as any}>
          {prefix} {children}
        </Text>
        {showScrollUp && <Text dimColor> ↑</Text>}
        {showScrollDown && <Text dimColor> ↓</Text>}
      </Box>
      {description && (
        <Box paddingLeft={2}>
          <Text dimColor>{description}</Text>
        </Box>
      )}
    </Box>
  )
}
