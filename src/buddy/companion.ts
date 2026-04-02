/**
 * Buddy Companion System - Companion Generation
 *
 * Deterministic generation using Mulberry32 PRNG seeded with hash(userId).
 * Bones (rarity, species, eye, hat, stats) never persist — only soul (name, personality).
 */

import {
  type Companion,
  type CompanionBones,
  type CompanionSoul,
  EYES,
  HATS,
  PERSONALITY_TEMPLATES,
  RARITIES,
  RARITY_WEIGHTS,
  type Rarity,
  SPECIES,
  SPECIES_NAMES,
  STAT_NAMES,
  type StatName,
  type StoredCompanion,
} from './types.js'

export type { Companion }

/** Mulberry32 — tiny seeded PRNG */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a hash for string → number */
function hashString(s: string): number {
  if (typeof Bun !== 'undefined') {
    return Number(BigInt(Bun.hash(s)) & 0xffffffffn)
  }
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!
}

function rollRarity(rng: () => number): Rarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (const rarity of RARITIES) {
    roll -= RARITY_WEIGHTS[rarity]
    if (roll < 0) return rarity
  }
  return 'common'
}

const RARITY_FLOOR: Record<Rarity, number> = {
  common: 5,
  uncommon: 15,
  rare: 25,
  epic: 35,
  legendary: 50,
}

/** One peak stat, one dump stat, rest scattered. Rarity bumps the floor. */
function rollStats(rng: () => number, rarity: Rarity): Record<StatName, number> {
  const floor = RARITY_FLOOR[rarity]
  const peak = pick(rng, STAT_NAMES)
  let dump = pick(rng, STAT_NAMES)
  while (dump === peak) dump = pick(rng, STAT_NAMES)

  const stats = {} as Record<StatName, number>
  for (const name of STAT_NAMES) {
    if (name === peak) {
      stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30))
    } else if (name === dump) {
      stats[name] = Math.max(1, floor - 10 + Math.floor(rng() * 15))
    } else {
      stats[name] = floor + Math.floor(rng() * 40)
    }
  }
  return stats
}

const SALT = 'sawcode-buddy-2026'

export type Roll = {
  bones: CompanionBones
  inspirationSeed: number
}

function rollFrom(rng: () => number): Roll {
  const rarity = rollRarity(rng)
  const bones: CompanionBones = {
    rarity,
    species: pick(rng, SPECIES),
    eye: pick(rng, EYES),
    hat: rarity === 'common' ? 'none' : pick(rng, HATS),
    shiny: rng() < 0.01,
    stats: rollStats(rng, rarity),
  }
  return { bones, inspirationSeed: Math.floor(rng() * 1e9) }
}

let rollCache: { key: string; value: Roll } | undefined
export function roll(userId: string): Roll {
  const key = userId + SALT
  if (rollCache?.key === key) return rollCache.value
  const value = rollFrom(mulberry32(hashString(key)))
  rollCache = { key, value }
  return value
}

export function rollWithSeed(seed: string): Roll {
  return rollFrom(mulberry32(hashString(seed)))
}

/** Generate companion soul (name + personality) from bones */
function generateSoul(bones: CompanionBones, seed: number): CompanionSoul {
  const rng = mulberry32(seed)
  const names = SPECIES_NAMES[bones.species]
  const personalities = PERSONALITY_TEMPLATES[bones.rarity]
  return {
    name: pick(rng, names),
    personality: pick(rng, personalities),
  }
}

/** Create a new companion from userId */
export function hatchCompanion(userId: string): Companion {
  const { bones, inspirationSeed } = roll(userId)
  const soul = generateSoul(bones, inspirationSeed)
  return {
    ...bones,
    ...soul,
    hatchedAt: Date.now(),
  }
}

/** Reconstruct companion from stored soul + userId */
export function getCompanion(userId: string, stored: StoredCompanion | undefined): Companion | undefined {
  if (!stored) return undefined
  const { bones } = roll(userId)
  return { ...stored, ...bones }
}

/** Serialize companion for storage (only soul persists) */
export function storeCompanion(companion: Companion): StoredCompanion {
  return {
    name: companion.name,
    personality: companion.personality,
    hatchedAt: companion.hatchedAt,
  }
}
