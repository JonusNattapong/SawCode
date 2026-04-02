/**
 * Design System - KeyboardShortcutHint
 *
 * Displays keyboard shortcuts in a consistent format.
 */

import React from 'react'
import { Box, Text } from 'ink'

interface KeyboardShortcutHintProps {
  keys: string[]
  description: string
  color?: string
}

export const KeyboardShortcutHint: React.FC<KeyboardShortcutHintProps> = ({
  keys,
  description,
  color = 'gray',
}) => {
  return (
    <Box flexDirection="row">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Text dimColor> + </Text>}
          <Text bold inverse>{` ${key} `}</Text>
        </React.Fragment>
      ))}
      <Text color={color as any}> {description}</Text>
    </Box>
  )
}
