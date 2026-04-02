/**
 * Spinner Enhancement - GlimmerMessage
 *
 * Glimmer text effect for streaming responses.
 * Based on Claude Code's Spinner/GlimmerMessage.tsx pattern.
 */

import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'

interface GlimmerMessageProps {
  text: string
  color?: string
  speed?: number
}

export const GlimmerMessage: React.FC<GlimmerMessageProps> = ({
  text,
  color = 'cyan',
  speed = 150,
}) => {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => f + 1)
    }, speed)
    return () => clearInterval(timer)
  }, [speed])

  const visibleChars = Math.min(text.length, frame)

  return (
    <Box>
      <Text color={color as any}>
        {text.slice(0, visibleChars)}
      </Text>
      {visibleChars < text.length && (
        <Text dimColor>
          {text.slice(visibleChars)}
        </Text>
      )}
    </Box>
  )
}
