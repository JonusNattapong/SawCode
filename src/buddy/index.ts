/**
 * Buddy Companion System
 *
 * Gamified virtual pet companion for SawCode TUI.
 * Deterministic generation, ASCII sprites, animated speech bubbles.
 */

export { type Companion, type CompanionBones, type CompanionSoul, type StoredCompanion } from './types.js'
export { SPECIES, EYES, HATS, RARITIES, RARITY_WEIGHTS, RARITY_STARS, RARITY_COLORS, STAT_NAMES } from './types.js'
export type { Species, Eye, Hat, Rarity, StatName } from './types.js'
export { roll, rollWithSeed, hatchCompanion, getCompanion, storeCompanion } from './companion.js'
export type { Roll } from './companion.js'
export { renderSprite, renderFace, spriteFrameCount } from './sprites.js'
export { CompanionSprite } from './CompanionSprite.js'
export { companionIntroText, companionQuip } from './prompt.js'
export { formatCompanionCard, findBuddyTriggerPositions } from './useBuddyNotification.js'
