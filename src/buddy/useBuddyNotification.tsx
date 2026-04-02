/**
 * Buddy Companion System - Notification Hook
 *
 * Handles buddy teaser notifications and trigger detection.
 */

import { RARITY_STARS } from './types.js'
import type { Companion } from './companion.js'

export function formatCompanionCard(companion: Companion): string {
  const stars = RARITY_STARS[companion.rarity]
  const shiny = companion.shiny ? ' ✨ SHINY!' : ''
  return `
${stars} ${companion.name} ${stars}
Species: ${companion.species}
Rarity: ${companion.rarity}${shiny}
Personality: ${companion.personality}

Stats:
  DEBUGGING  ${'█'.repeat(Math.floor(companion.stats.DEBUGGING / 10))}${'░'.repeat(10 - Math.floor(companion.stats.DEBUGGING / 10))} ${companion.stats.DEBUGGING}
  PATIENCE   ${'█'.repeat(Math.floor(companion.stats.PATIENCE / 10))}${'░'.repeat(10 - Math.floor(companion.stats.PATIENCE / 10))} ${companion.stats.PATIENCE}
  CHAOS      ${'█'.repeat(Math.floor(companion.stats.CHAOS / 10))}${'░'.repeat(10 - Math.floor(companion.stats.CHAOS / 10))} ${companion.stats.CHAOS}
  WISDOM     ${'█'.repeat(Math.floor(companion.stats.WISDOM / 10))}${'░'.repeat(10 - Math.floor(companion.stats.WISDOM / 10))} ${companion.stats.WISDOM}
  SNARK      ${'█'.repeat(Math.floor(companion.stats.SNARK / 10))}${'░'.repeat(10 - Math.floor(companion.stats.SNARK / 10))} ${companion.stats.SNARK}
`
}

export function findBuddyTriggerPositions(text: string): Array<{ start: number; end: number }> {
  const triggers: Array<{ start: number; end: number }> = []
  const re = /\/buddy\b/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    triggers.push({ start: m.index, end: m.index + m[0].length })
  }
  return triggers
}
