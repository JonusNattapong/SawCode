/**
 * Array utilities - copied from Claude Code reference
 * https://github.com/anthropics/claude-code/blob/main/src/utils/array.ts
 */

/**
 * Insert a separator between array elements
 * @example
 * intersperse([1, 2, 3], (i) => 0) => [1, 0, 2, 0, 3]
 */
export function intersperse<A>(as: A[], separator: (index: number) => A): A[] {
  return as.flatMap((a, i) => (i ? [separator(i), a] : [a]))
}

/**
 * Count elements matching a predicate
 * @example
 * count([1, 2, 3, 4], (x) => x > 2) => 2
 */
export function count<T>(arr: readonly T[], pred: (x: T) => unknown): number {
  let n = 0
  for (const x of arr) n += +!!pred(x)
  return n
}

/**
 * Get unique items from an iterable
 * @example
 * uniq([1, 2, 2, 3, 1]) => [1, 2, 3]
 */
export function uniq<T>(xs: Iterable<T>): T[] {
  return [...new Set(xs)]
}
