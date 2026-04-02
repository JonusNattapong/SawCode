/**
 * Spinner Enhancement - ShimmerChar
 *
 * Shimmering character effect for loading states.
 * Based on Claude Code's Spinner/ShimmerChar.tsx pattern.
 */

import React, { useState, useEffect } from 'react'
import { Text } from 'ink'

interface ShimmerCharProps {
  text: string
  color?: string
  speed?: number
}

export const ShimmerChar: React.FC<ShimmerCharProps> = ({
  text,
  color = 'cyan',
  speed = 100,
}) => {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => f + 1)
    }, speed)
    return () => clearInterval(timer)
  }, [speed])

  return (
    <Text>
      {[...text].map((char, i) => {
        const phase = (frame + i) % 10
        const dimmed = phase < 5
        return (
          <Text key={i} color={color as any} dimColor={dimmed}>
            {char}
          </Text>
        )
      })}
    </Text>
  )
}
