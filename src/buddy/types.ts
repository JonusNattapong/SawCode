/**
 * Buddy Companion System - Types
 *
 * Gamified virtual pet companion that sits beside the input box.
 * Deterministic generation from userId ensures same user = same companion.
 */

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const
export type Rarity = (typeof RARITIES)[number]

export const SPECIES = [
  'duck',
  'goose',
  'blob',
  'cat',
  'dragon',
  'octopus',
  'owl',
  'penguin',
  'turtle',
  'snail',
  'ghost',
  'axolotl',
  'capybara',
  'cactus',
  'robot',
  'rabbit',
  'mushroom',
  'chonk',
] as const
export type Species = (typeof SPECIES)[number]

export const EYES = ['·', '✦', '×', '◉', '@', '°'] as const
export type Eye = (typeof EYES)[number]

export const HATS = ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck'] as const
export type Hat = (typeof HATS)[number]

export const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK'] as const
export type StatName = (typeof STAT_NAMES)[number]

/** Deterministic parts — derived from hash(userId) */
export type CompanionBones = {
  rarity: Rarity
  species: Species
  eye: Eye
  hat: Hat
  shiny: boolean
  stats: Record<StatName, number>
}

/** Model-generated soul — stored in config after first hatch */
export type CompanionSoul = {
  name: string
  personality: string
}

export type Companion = CompanionBones &
  CompanionSoul & {
    hatchedAt: number
  }

/** What actually persists in config */
export type StoredCompanion = CompanionSoul & { hatchedAt: number }

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}

export const RARITY_STARS: Record<Rarity, string> = {
  common: '★',
  uncommon: '★★',
  rare: '★★★',
  epic: '★★★★',
  legendary: '★★★★★',
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: 'gray',
  uncommon: 'green',
  rare: 'blue',
  epic: 'magenta',
  legendary: 'yellow',
}

/** Companion names for each species (used when generating soul) */
export const SPECIES_NAMES: Record<Species, string[]> = {
  duck: ['Quackers', 'Waddles', 'Sir Quacks', 'Pond', 'Ducky'],
  goose: ['Honk', 'Goosey', 'Mr. Goose', 'Chaos', 'Hiss'],
  blob: ['Blobby', 'Goo', 'Oobleck', 'Squish', 'Glob'],
  cat: ['Whiskers', 'Mittens', 'Paws', 'Shadow', 'Mochi'],
  dragon: ['Ember', 'Spark', 'Blaze', 'Scales', 'Flicker'],
  octopus: ['Inky', 'Tentacle', 'Kraken', 'Squid', 'Arms'],
  owl: ['Hoot', 'Owlie', 'Wise', 'Sage', 'Feathers'],
  penguin: ['Waddle', 'Tux', 'Chilly', 'Ice', 'Slippy'],
  turtle: ['Shelly', 'Slowpoke', 'Tank', 'Shell', 'Tortuga'],
  snail: ['Slowly', 'Shell', 'Trail', 'Slimey', 'Gastropod'],
  ghost: ['Boo', 'Spooky', 'Casper', 'Wisp', 'Shade'],
  axolotl: ['Axel', 'Gills', 'Smiley', 'Wooper', 'Lotl'],
  capybara: ['Capy', 'Chill', 'Bara', 'Relaxed', 'Friend'],
  cactus: ['Spike', 'Prickly', 'Desert', 'Sunny', 'Needle'],
  robot: ['Beep', 'Bot', 'Circuit', 'Gears', 'Binary'],
  rabbit: ['Bun', 'Hopper', 'Flopsy', 'Thumper', 'Ears'],
  mushroom: ['Shroom', 'Spore', 'Cap', 'Fungi', 'Mycelium'],
  chonk: ['Chonk', 'Chunky', 'Unit', 'Beefy', 'Absolute'],
}

/** Personality templates for each rarity */
export const PERSONALITY_TEMPLATES: Record<Rarity, string[]> = {
  common: ['friendly and curious', 'gentle and quiet', 'cheerful and simple'],
  uncommon: ['playful and mischievous', 'thoughtful and calm', 'brave and loyal'],
  rare: ['wise beyond their years', 'mysteriously helpful', 'surprisingly clever'],
  epic: ['dramatically helpful', 'eloquently sarcastic', 'brilliantly chaotic'],
  legendary: ['cosmically wise', 'ancient and powerful', 'legendarily chill'],
}
