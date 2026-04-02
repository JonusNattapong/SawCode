/**
 * API Client Service
 * Simple multi-provider support: Direct API and KiloCode adapter
 * Based on Claude Code reference patterns
 */

import Anthropic from '@anthropic-ai/sdk'
import { isEnvTruthy } from '../../utils/env.js'

export type APIProvider = 'firstParty' | 'kilocode'

export interface ApiClientOptions {
  apiKey?: string
  maxRetries?: number
}

export async function getApiClient(options: ApiClientOptions = {}): Promise<Anthropic> {
  const { apiKey, maxRetries = 3 } = options

  const commonArgs = {
    maxRetries,
    timeout: parseInt(process.env.API_TIMEOUT_MS || String(600 * 1000), 10),
  }

  if (isEnvTruthy(process.env.SAWCODE_USE_KILOCODE)) {
    const baseURL = process.env.KILOCODE_BASE_URL || 'http://localhost:8080/v1'
    const key = process.env.KILOCODE_API_KEY || apiKey || 'kilocode-local'

    return new Anthropic({
      apiKey: key,
      baseURL,
      ...commonArgs,
    })
  }

  return new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    ...commonArgs,
  })
}

export function getAPIProvider(): APIProvider {
  if (isEnvTruthy(process.env.SAWCODE_USE_KILOCODE)) return 'kilocode'
  return 'firstParty'
}

export const apiClient = {
  getApiClient,
  getAPIProvider,
}
