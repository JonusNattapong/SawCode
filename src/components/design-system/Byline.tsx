/**
 * Design System - Byline
 *
 * Inline metadata display with middot separators.
 */

import React from 'react'
import { Box, Text } from 'ink'

interface BylineProps {
  children: React.ReactNode[]
  separator?: string
  color?: string
}

export const Byline: React.FC<BylineProps> = ({
  children,
  separator = ' · ',
  color = 'gray',
}) => {
  const filtered = children.filter(c => c != null && c !== false)

  return (
    <Box flexDirection="row">
      {filtered.map((child, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Text color={color as any}>{separator}</Text>}
          <Text color={color as any}>{child}</Text>
        </React.Fragment>
      ))}
    </Box>
  )
}
