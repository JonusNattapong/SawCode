/**
 * KiloCode API Provider
 *
 * Client for interacting with KiloCode API endpoints
 * Handles authentication, requests, and responses
 */

import { createLogger } from '../utils/logger.js'

const log = createLogger('kilocode')

export interface KiloCodeConfig {
  apiUrl?: string
  apiKey?: string
  token?: string
  userId?: string
  timeout?: number
}

export interface KiloCodeResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface KiloCodeUser {
  id: string
  email?: string
  name?: string
  createdAt?: string
  updatedAt?: string
}

export interface KiloCodeProject {
  id: string
  name: string
  description?: string
  status?: string
  owner?: string
}

/**
 * KiloCode API Client
 */
export class KiloCodeClient {
  private apiUrl: string
  private apiKey?: string
  private token?: string
  private userId?: string
  private timeout: number

  constructor(config: KiloCodeConfig = {}) {
    this.apiUrl = config.apiUrl || 'https://api.kilocode.com'
    this.apiKey = config.apiKey || process.env.KILOCODE_API_KEY
    this.token = config.token || process.env.KILOCODE_TOKEN
    this.userId = config.userId || process.env.KILOCODE_USER_ID
    this.timeout = config.timeout || 10000

    log.debug('KiloCode client initialized', {
      apiUrl: this.apiUrl,
      hasToken: !!this.token,
      hasApiKey: !!this.apiKey,
      userId: this.userId,
    })
  }

  /**
   * Make authenticated request to KiloCode API
   */
  private async request<T = unknown>(
    method: string,
    endpoint: string,
    body?: unknown,
  ): Promise<KiloCodeResponse<T>> {
    try {
      const url = `${this.apiUrl}${endpoint}`

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Add authentication
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
      } else if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey
      }

      // Add user ID if available
      if (this.userId) {
        headers['X-User-Id'] = this.userId
      }

      log.debug(`${method} ${endpoint}`, { headers: Object.keys(headers) })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.text()
        log.warn(`API error: ${response.status}`, { endpoint, error })

        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: error,
        }
      }

      const data = (await response.json()) as T

      return {
        success: true,
        data,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      log.error('Request failed', { endpoint, error: errorMessage })

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Get current user info
   */
  async getUser(): Promise<KiloCodeResponse<KiloCodeUser>> {
    return this.request<KiloCodeUser>('GET', '/api/v1/users/me')
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<KiloCodeResponse<KiloCodeUser>> {
    return this.request<KiloCodeUser>('GET', `/api/v1/users/${userId}`)
  }

  /**
   * List user projects
   */
  async listProjects(): Promise<KiloCodeResponse<KiloCodeProject[]>> {
    return this.request<KiloCodeProject[]>('GET', '/api/v1/projects')
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<KiloCodeResponse<KiloCodeProject>> {
    return this.request<KiloCodeProject>('GET', `/api/v1/projects/${projectId}`)
  }

  /**
   * Create a new project
   */
  async createProject(name: string, description?: string): Promise<KiloCodeResponse<KiloCodeProject>> {
    return this.request<KiloCodeProject>('POST', '/api/v1/projects', {
      name,
      description,
    })
  }

  /**
   * Generic API call
   */
  async call<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown,
  ): Promise<KiloCodeResponse<T>> {
    return this.request<T>(method, endpoint, body)
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.token || this.apiKey)
  }

  /**
   * Get API URL
   */
  getApiUrl(): string {
    return this.apiUrl
  }
}

/**
 * Singleton instance
 */
let instance: KiloCodeClient | null = null

/**
 * Get or create KiloCode client instance
 */
export function getKiloCodeClient(config?: KiloCodeConfig): KiloCodeClient {
  if (!instance) {
    instance = new KiloCodeClient(config)
  }
  return instance
}

/**
 * Reset client instance (for testing)
 */
export function resetKiloCodeClient(): void {
  instance = null
}

/**
 * Create KiloCode tool for agent
 * Note: This requires importing in client code to avoid circular dependencies
 */
export async function createKiloCodeTool() {
  // Dynamic import to avoid circular dependencies
  const { z } = await import('zod')
  const { createTool } = await import('../tools/index.js')

  const kilocodeSchema = z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    endpoint: z.string().describe('API endpoint (e.g., /api/v1/users/me)'),
    body: z.record(z.unknown()).optional().describe('Request body for POST/PUT'),
  })

  return createTool(
    'kilocode-api',
    'Call KiloCode API endpoints. Requires KILOCODE_TOKEN in environment.',
    kilocodeSchema,
    async (args: Record<string, unknown>) => {
      const method = args.method as 'GET' | 'POST' | 'PUT' | 'DELETE'
      const endpoint = args.endpoint as string
      const body = args.body as Record<string, unknown> | undefined

      try {
        const client = getKiloCodeClient()

        if (!client.isAuthenticated()) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'Error: KiloCode not authenticated. Set KILOCODE_TOKEN in .env',
              },
            ],
            isError: true,
          }
        }

        const response = await client.call(method, endpoint, body)

        if (response.success) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          }
        } else {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Error: ${response.error}\n${response.message || ''}`,
              },
            ],
            isError: true,
          }
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
}

/**
 * Helper functions for common operations
 */
export const kilocode = {
  client: getKiloCodeClient,
  getUser: async () => getKiloCodeClient().getUser(),
  listProjects: async () => getKiloCodeClient().listProjects(),
  createProject: async (name: string, description?: string) =>
    getKiloCodeClient().createProject(name, description),
  call: async <T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown,
  ) => getKiloCodeClient().call<T>(method, endpoint, body),
}
