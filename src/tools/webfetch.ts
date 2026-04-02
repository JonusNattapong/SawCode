/**
 * Web fetch tool
 */

import { z } from 'zod'
import { createTool } from './index.js'

export const webfetchSchema = z.object({
  url: z.string().url().describe('URL to fetch'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET').describe('HTTP method'),
  headers: z.record(z.string()).optional().describe('Request headers'),
  body: z.string().optional().describe('Request body (for POST/PUT)'),
})

export const webfetchTool = createTool(
  'webfetch',
  'Fetch content from a URL. Supports GET/POST/PUT/DELETE requests.',
  webfetchSchema,
  async args => {
    try {
      const { url, method = 'GET', headers, body } = args

      console.log(`[webfetch] ${method} ${url}`)

      const response = await fetch(url, {
        method,
        headers: headers || { 'Content-Type': 'application/json' },
        body: body ? body : undefined,
      })

      const text = await response.text()

      return {
        content: [
          {
            type: 'text' as const,
            text: `Status: ${response.status}\n\n${text}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      }
    }
  },
)
