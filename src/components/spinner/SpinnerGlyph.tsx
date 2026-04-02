/**
 * Spinner Enhancement - SpinnerGlyph
 *
 * Animated spinner character with multiple styles.
 */

import React, { useState, useEffect } from 'react'
import { Text } from 'ink'

export type SpinnerStyle = 'dots' | 'line' | 'circle' | 'arrow' | 'braille'

const SPINNER_STYLES: Record<SpinnerStyle, string[]> = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['|', '/', '-', '\\'],
  circle: ['◐', '◓', '◑', '◒'],
  arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
  braille: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
}

interface SpinnerGlyphProps {
  style?: SpinnerStyle
  color?: string
  speed?: number
}

export const SpinnerGlyph: React.FC<SpinnerGlyphProps> = ({
  style = 'dots',
  color = 'cyan',
  speed = 80,
}) => {
  const [frame, setFrame] = useState(0)
  const chars = SPINNER_STYLES[style]

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % chars.length)
    }, speed)
    return () => clearInterval(timer)
  }, [speed, chars.length])

  return <Text color={color as any}>{chars[frame]}</Text>
}
