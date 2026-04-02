/**
 * Token Estimation Service
 * Estimates token counts for messages and context
 * Based on Claude Code reference patterns
 */

export function roughTokenCountEstimation(text: string): number {
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

export function roughTokenCountEstimationForMessages(
  messages: { type: string; content: string; blocks?: unknown[] }[],
): number {
  let total = 0

  for (const msg of messages) {
    if (msg.type === 'user') {
      total += roughTokenCountEstimation(msg.content) + 4
    } else if (msg.type === 'assistant') {
      total += roughTokenCountEstimation(msg.content) + 4
    } else if (msg.type === 'tool_result') {
      total += roughTokenCountEstimation(msg.content) + 9
    } else if (msg.type === 'system') {
      total += roughTokenCountEstimation(msg.content) + 3
    } else if (msg.type === 'assistant_with_tools' && msg.blocks) {
      total += roughTokenCountEstimation(msg.content) + 4
      for (const block of msg.blocks) {
        if (typeof block === 'object' && block !== null) {
          const b = block as { type?: string; input?: unknown }
          if (b.type === 'tool_use' && b.input) {
            total += roughTokenCountEstimation(JSON.stringify(b.input)) + 9
          }
        }
      }
    }
  }

  return total
}

export function getTokenUsage(inputTokens: number, outputTokens: number): {
  input: number
  output: number
  total: number
} {
  return {
    input: inputTokens,
    output: outputTokens,
    total: inputTokens + outputTokens,
  }
}

export const tokenEstimation = {
  roughTokenCountEstimation,
  roughTokenCountEstimationForMessages,
  getTokenUsage,
}
