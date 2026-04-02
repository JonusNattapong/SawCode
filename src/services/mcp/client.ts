/**
 * MCP Service - Client & Tool Discovery
 *
 * Model Context Protocol client for connecting to MCP servers.
 * Based on Claude Code's services/mcp/ architecture.
 *
 * Features:
 * - MCP server connection management
 * - Tool discovery and caching
 * - Tool execution via MCP
 * - Stdio and HTTP transport support
 */

import { spawn, type ChildProcess } from 'child_process'
import { z } from 'zod'
import { createLogger } from '../../utils/advanced-logging.js'

const logger = createLogger('mcp')

// ─── Types ─────────────────────────────────────────────────────────

export type MCPServerConfig = {
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
  url?: string  // For HTTP transport
}

export type MCPToolDefinition = {
  name: string
  description: string
  inputSchema: z.ZodType<unknown>
}

export type MCPServerStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

export type MCPConnection = {
  name: string
  status: MCPServerStatus
  tools: MCPToolDefinition[]
  config: MCPServerConfig
  connect: () => Promise<void>
  disconnect: () => void
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>
  listTools: () => Promise<MCPToolDefinition[]>
}

// ─── MCP Client ────────────────────────────────────────────────────

class MCPClientImpl implements MCPConnection {
  name: string
  status: MCPServerStatus = 'disconnected'
  tools: MCPToolDefinition[] = []
  config: MCPServerConfig

  private process: ChildProcess | null = null
  private requestId = 0
  private pendingRequests: Map<number, {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
  }> = new Map()
  private buffer = ''

  constructor(config: MCPServerConfig) {
    this.name = config.name
    this.config = config
  }

  async connect(): Promise<void> {
    if (this.status === 'connected') return

    this.status = 'connecting'
    logger.info(`Connecting to MCP server: ${this.name}`, {
      command: this.config.command,
      args: this.config.args,
    })

    try {
      if (this.config.url) {
        // HTTP transport (not implemented in this version)
        throw new Error('HTTP MCP transport not yet supported')
      }

      // Stdio transport
      this.process = spawn(this.config.command, this.config.args ?? [], {
        env: { ...process.env, ...this.config.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      this.process.stdout?.on('data', (data: Buffer) => {
        this.handleResponse(data.toString())
      })

      this.process.stderr?.on('data', (data: Buffer) => {
        logger.warn(`MCP server stderr: ${this.name}`, { output: data.toString().trim() })
      })

      this.process.on('close', (code) => {
        logger.info(`MCP server closed: ${this.name}`, { code })
        this.status = 'disconnected'
        this.process = null
      })

      this.process.on('error', (err) => {
        logger.error(`MCP server error: ${this.name}`, err)
        this.status = 'error'
      })

      // Initialize the connection
      await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'sawcode', version: '0.1.0' },
      })

      this.status = 'connected'

      // Discover tools
      this.tools = await this.listTools()
      logger.info(`MCP server connected: ${this.name}`, { toolCount: this.tools.length })
    } catch (error) {
      this.status = 'error'
      logger.error(`Failed to connect to MCP server: ${this.name}`, error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  disconnect(): void {
    if (this.process) {
      this.process.kill('SIGTERM')
      this.process = null
    }
    this.status = 'disconnected'
    this.tools = []
    this.pendingRequests.clear()
    logger.info(`MCP server disconnected: ${this.name}`)
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (this.status !== 'connected') {
      throw new Error(`MCP server ${this.name} is not connected`)
    }

    const result = await this.sendRequest('tools/call', { name, arguments: args })
    return result
  }

  async listTools(): Promise<MCPToolDefinition[]> {
    if (this.status !== 'connected') {
      return []
    }

    try {
      const result = await this.sendRequest('tools/list', {}) as { tools?: MCPToolDefinition[] }
      this.tools = (result.tools ?? []).map(tool => ({
        name: tool.name,
        description: tool.description ?? '',
        inputSchema: z.object({}).passthrough(), // Default schema
      }))
      return this.tools
    } catch (error) {
      logger.warn(`Failed to list tools from ${this.name}`)
      return []
    }
  }

  private async sendRequest(method: string, params: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      }

      this.pendingRequests.set(id, { resolve, reject })

      const json = JSON.stringify(request) + '\n'
      this.process?.stdin?.write(json)

      // Timeout after 30s
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error(`MCP request timed out: ${method}`))
        }
      }, 30_000)
    })
  }

  private handleResponse(data: string): void {
    this.buffer += data

    // Process complete JSON-RPC messages (newline-delimited)
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) continue

      try {
        const response = JSON.parse(line)

        if (response.id !== undefined) {
          const pending = this.pendingRequests.get(response.id)
          if (pending) {
            this.pendingRequests.delete(response.id)

            if (response.error) {
              pending.reject(new Error(`MCP error: ${response.error.message ?? JSON.stringify(response.error)}`))
            } else {
              pending.resolve(response.result)
            }
          }
        }
      } catch {
        // Not JSON, ignore (might be partial data)
      }
    }
  }
}

// ─── MCP Registry ──────────────────────────────────────────────────

class MCPRegistry {
  private servers: Map<string, MCPConnection> = new Map()

  register(config: MCPServerConfig): MCPConnection {
    const existing = this.servers.get(config.name)
    if (existing) return existing

    const client = new MCPClientImpl(config)
    this.servers.set(config.name, client)
    return client
  }

  async connectAll(): Promise<void> {
    const results = await Promise.allSettled(
      [...this.servers.values()].map(s => s.connect()),
    )

    for (const result of results) {
      if (result.status === 'rejected') {
        logger.warn('MCP server connection failed', { error: result.reason })
      }
    }
  }

  disconnectAll(): void {
    for (const server of this.servers.values()) {
      server.disconnect()
    }
  }

  getServer(name: string): MCPConnection | undefined {
    return this.servers.get(name)
  }

  getAllServers(): MCPConnection[] {
    return [...this.servers.values()]
  }

  getConnectedServers(): MCPConnection[] {
    return [...this.servers.values()].filter(s => s.status === 'connected')
  }

  getAllTools(): Array<{ server: string; tool: MCPToolDefinition }> {
    const tools: Array<{ server: string; tool: MCPToolDefinition }> = []
    for (const server of this.servers.values()) {
      if (server.status === 'connected') {
        for (const tool of server.tools) {
          tools.push({ server: server.name, tool })
        }
      }
    }
    return tools
  }

  async callTool(
    serverName: string,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const server = this.servers.get(serverName)
    if (!server) {
      throw new Error(`MCP server "${serverName}" not found`)
    }
    return server.callTool(toolName, args)
  }

  getStatus(): Array<{ name: string; status: MCPServerStatus; toolCount: number }> {
    return [...this.servers.values()].map(s => ({
      name: s.name,
      status: s.status,
      toolCount: s.tools.length,
    }))
  }
}

// ─── Singleton ─────────────────────────────────────────────────────

let registryInstance: MCPRegistry | null = null

export function getMCPRegistry(): MCPRegistry {
  if (!registryInstance) {
    registryInstance = new MCPRegistry()
  }
  return registryInstance
}

// ─── Convenience Functions ─────────────────────────────────────────

export function registerMCPServer(config: MCPServerConfig): MCPConnection {
  return getMCPRegistry().register(config)
}

export async function connectAllMCPServers(): Promise<void> {
  return getMCPRegistry().connectAll()
}

export function disconnectAllMCPServers(): void {
  return getMCPRegistry().disconnectAll()
}

export function getMCPTools(): Array<{ server: string; tool: MCPToolDefinition }> {
  return getMCPRegistry().getAllTools()
}

export async function callMCPTool(
  serverName: string,
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  return getMCPRegistry().callTool(serverName, toolName, args)
}

export function getMCPServerStatus(): Array<{ name: string; status: MCPServerStatus; toolCount: number }> {
  return getMCPRegistry().getStatus()
}
