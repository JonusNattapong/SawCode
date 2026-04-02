/**
 * Design System - Divider
 *
 * Horizontal divider line.
 */

import React from 'react'
import { Box, Text } from 'ink'

interface DividerProps {
  width?: number | string
  color?: string
  character?: string
  title?: string
}

export const Divider: React.FC<DividerProps> = ({
  width = '100%',
  color = 'gray',
  character = '─',
  title,
}) => {
  if (title) {
    return (
      <Box flexDirection="row" width={width as any}>
        <Text color={color as any}>{character.repeat(2)} </Text>
        <Text color={color as any} bold>{title} </Text>
        <Text color={color as any}>{character.repeat(50)}</Text>
      </Box>
    )
  }

  return (
    <Box width={width as any}>
      <Text color={color as any}>{character.repeat(80)}</Text>
    </Box>
  )
}
