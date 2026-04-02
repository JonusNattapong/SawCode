/**
 * Design System - ProgressBar
 *
 * Terminal progress bar visualization.
 */

import React from 'react'
import { Box, Text } from 'ink'

interface ProgressBarProps {
  value: number
  max?: number
  width?: number
  color?: string
  showLabel?: boolean
  label?: string
  filledChar?: string
  emptyChar?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  width = 20,
  color = 'cyan',
  showLabel = true,
  label,
  filledChar = '█',
  emptyChar = '░',
}) => {
  const ratio = Math.max(0, Math.min(1, value / max))
  const filled = Math.round(ratio * width)
  const empty = width - filled

  const bar = filledChar.repeat(filled) + emptyChar.repeat(empty)
  const percent = `${(ratio * 100).toFixed(0)}%`

  return (
    <Box flexDirection="row">
      <Text color={color as any}>{bar}</Text>
      {showLabel && (
        <Text dimColor>
          {' '}{label ?? percent}
        </Text>
      )}
    </Box>
  )
}
