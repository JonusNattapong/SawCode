/**
 * Buddy Companion System - Prompt Integration
 *
 * Generates system prompt text for the companion.
 */

import type { Companion } from './companion.js'

export function companionIntroText(companion: Companion): string {
  return `# Companion

A small ${companion.species} named ${companion.name} sits beside the user's input box.
Personality: ${companion.personality}
Rarity: ${companion.rarity}
Stats: DEBUGGING=${companion.stats.DEBUGGING} PATIENCE=${companion.stats.PATIENCE} CHAOS=${companion.stats.CHAOS} WISDOM=${companion.stats.WISDOM} SNARK=${companion.stats.SNARK}

When the user addresses ${companion.name} directly, respond briefly in character as the companion.
Keep companion responses to 1-2 lines maximum.`
}

export function companionQuip(companion: Companion): string {
  const quips: Record<string, string[]> = {
    duck: ['Quack!', 'Got any grapes?', 'Waddle waddle'],
    goose: ['HONK!', 'Chaos mode: ON', 'Peace was never an option'],
    blob: ['*wobble*', '*squish*', '...blob...'],
    cat: ['*purrrr*', 'Pet me... or else', 'I knocked your code off the table'],
    dragon: ['*puff*', 'Fear me!', 'I breathe clean code'],
    octopus: ['*tentacle wave*', '8 arms, 0 bugs', 'Ink-credible!'],
    owl: ['Hoo goes there?', 'Wise choice', 'Who? Who?'],
    penguin: ['*slides*', 'Cool.', 'Tux approves'],
    turtle: ['Slow and steady...', 'Shell yeah!', 'I have layers'],
    snail: ['...almost...there...', 'Trail of greatness', 'Shell-abrate!'],
    ghost: ['Boo!', 'Spooky code', 'I see dead code'],
    axolotl: ['*smiles*', 'Gills activated!', 'Water you doing?'],
    capybara: ['Chilling...', 'Vibes are immaculate', 'Everyone is friend'],
    cactus: ['*poke*', 'Desert vibes', 'Prickly but lovable'],
    robot: ['Beep boop!', 'Calculating...', '01001000 01101001'],
    rabbit: ['*hop hop*', 'Down the rabbit hole!', 'Code like a rabbit'],
    mushroom: ['*spore*', 'Fungi fun!', 'I grow on you'],
    chonk: ['*CHONK*', 'Absolute unit', 'I am inevitable'],
  }
  const speciesQuips = quips[companion.species] || ['...']
  return speciesQuips[Math.floor(Math.random() * speciesQuips.length)]!
}
