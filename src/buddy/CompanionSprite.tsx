/**
 * Buddy Companion System - CompanionSprite Component
 *
 * React/Ink component for rendering the companion with animation,
 * speech bubble, and pet hearts.
 */

import React, { useEffect, useRef, useState } from 'react'
import { Box, Text } from 'ink'
import type { Companion } from './companion.js'
import { renderFace, renderSprite, spriteFrameCount } from './sprites.js'
import { RARITY_COLORS } from './types.js'

const TICK_MS = 500
const BUBBLE_SHOW = 20
const FADE_WINDOW = 6
const PET_BURST_MS = 2500

const IDLE_SEQUENCE = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0]

const PET_HEARTS = ['  ♥    ♥  ', ' ♥  ♥  ♥ ', '♥   ♥   ♥', ' ·   ·   ']

interface CompanionSpriteProps {
  companion: Companion
  reaction?: string
  petAt?: number
  focused?: boolean
  compact?: boolean
}

function wrap(text: string, width: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (cur.length + w.length + 1 > width && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = cur ? `${cur} ${w}` : w
    }
  }
  if (cur) lines.push(cur)
  return lines
}

interface SpeechBubbleProps {
  text: string
  color: string
  fading: boolean
}

function SpeechBubble({ text, color, fading }: SpeechBubbleProps) {
  const lines = wrap(text, 28)
  const borderColor = fading ? 'gray' : color
  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor={borderColor as any} paddingX={1} width={32}>
        <Box flexDirection="column">
          {lines.map((line, i) => (
            <Text key={i} italic dimColor={fading} color={fading ? 'gray' : undefined}>
              {line}
            </Text>
          ))}
        </Box>
      </Box>
      <Box flexDirection="column" alignItems="flex-end" paddingRight={4}>
        <Text color={borderColor as any}>╲ </Text>
        <Text color={borderColor as any}>╲</Text>
      </Box>
    </Box>
  )
}

export const CompanionSprite: React.FC<CompanionSpriteProps> = ({
  companion,
  reaction,
  petAt,
  focused = false,
  compact = false,
}) => {
  const [tick, setTick] = useState(0)
  const lastSpokeTick = useRef(0)
  const [petStartTick, setPetStartTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), TICK_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (petAt) setPetStartTick(tick)
  }, [petAt])

  useEffect(() => {
    if (reaction) lastSpokeTick.current = tick
  }, [reaction])

  const color = RARITY_COLORS[companion.rarity as keyof typeof RARITY_COLORS]
  const bubbleAge = reaction ? tick - lastSpokeTick.current : 0
  const fading = reaction !== undefined && bubbleAge >= BUBBLE_SHOW - FADE_WINDOW
  const petAge = petAt ? tick - petStartTick : Infinity
  const petting = petAge * TICK_MS < PET_BURST_MS

  if (compact) {
    const quip = reaction && reaction.length > 20 ? reaction.slice(0, 19) + '…' : reaction
    const label = quip ? `"${quip}"` : companion.name
    return (
      <Box paddingX={1}>
        <Text>
          {petting && <Text color="green">♥ </Text>}
          <Text bold color={color as any}>
            {renderFace(companion)}
          </Text>{' '}
          <Text
            italic
            dimColor={!focused && !reaction}
            bold={focused}
            inverse={focused && !reaction}
            color={(reaction ? color : focused ? color : undefined) as any}
          >
            {label}
          </Text>
        </Text>
      </Box>
    )
  }

  const frameCount = spriteFrameCount(companion.species)
  const heartFrame = petting ? PET_HEARTS[petAge % PET_HEARTS.length] : null
  let spriteFrame: number
  let blink = false

  if (reaction || petting) {
    spriteFrame = tick % frameCount
  } else {
    const step = IDLE_SEQUENCE[tick % IDLE_SEQUENCE.length]!
    if (step === -1) {
      spriteFrame = 0
      blink = true
    } else {
      spriteFrame = step % frameCount
    }
  }

  const body = renderSprite(companion, spriteFrame).map(line =>
    blink ? line.replaceAll(companion.eye, '-') : line,
  )
  const sprite = heartFrame ? [heartFrame, ...body] : body

  const spriteColumn = (
    <Box flexDirection="column" flexShrink={0} alignItems="center">
      {sprite.map((line, i) => (
        <Text key={i} color={(i === 0 && heartFrame ? 'green' : color) as any}>
          {line}
        </Text>
      ))}
      <Text
        italic
        bold={focused}
        dimColor={!focused}
        color={(focused ? color : undefined) as any}
        inverse={focused}
      >
        {focused ? ` ${companion.name} ` : companion.name}
      </Text>
    </Box>
  )

  if (!reaction) {
    return <Box paddingX={1}>{spriteColumn}</Box>
  }

  return (
    <Box flexDirection="row" alignItems="flex-end" paddingX={1} flexShrink={0}>
      <SpeechBubble text={reaction} color={color} fading={fading} />
      {spriteColumn}
    </Box>
  )
}

export default CompanionSprite
