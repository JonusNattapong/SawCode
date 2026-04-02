# KiloCode API Provider Guide

Complete guide for integrating KiloCode API with SawCode Agent.

## 🚀 Quick Start

### 1. Set Up Environment Variables

```bash
cp .env.example .env
```

Add your KiloCode credentials to `.env`:

```env
KILOCODE_API_URL=https://api.kilocode.com
KILOCODE_TOKEN=your-jwt-token-here
KILOCODE_USER_ID=your-user-id-here
```

### 2. Use in Agent

```typescript
import { Agent, createKiloCodeTool, kilocode } from '@sawcode/agent'

const agent = new Agent({
  tools: [
    createKiloCodeTool(),
  ]
})

// Or use directly
const user = await kilocode.getUser()
console.log(user.data)
```

### 3. Call API

```typescript
// Using the client
const client = kilocode.client()
const response = await client.getUser()

// Using helper functions
const user = await kilocode.getUser()
const projects = await kilocode.listProjects()
const project = await kilocode.createProject('My Project', 'Description')

// Using generic call
const custom = await kilocode.call('GET', '/api/v1/custom-endpoint')
```

## 🔐 Authentication

### Token-Based Authentication (Recommended)

```env
KILOCODE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The token is sent as:
```
Authorization: Bearer <token>
```

### API Key Authentication

```env
KILOCODE_API_KEY=your-api-key-here
```

The API key is sent as:
```
X-API-Key: <key>
```

### User ID Header

```env
KILOCODE_USER_ID=6c7b30e5-e852-4083-bd22-184928361616
```

Sent as:
```
X-User-Id: <id>
```

## 📚 API Methods

### User Operations

```typescript
// Get current user
const userResponse = await kilocode.getUser()
// Returns: { success: true, data: { id, email, name, ... } }

// Get user by ID
const client = kilocode.client()
const user = await client.getUserById('user-id')
```

### Project Operations

```typescript
// List all projects
const projectsResponse = await kilocode.listProjects()
// Returns: { success: true, data: [{ id, name, description, ... }] }

// Get specific project
const project = await client.getProject('project-id')

// Create project
const newProject = await kilocode.createProject('New Project', 'Description')
```

### Generic API Calls

```typescript
// Make custom API calls
const response = await kilocode.call(
  'GET',
  '/api/v1/users/me',
)

// With request body
const response = await kilocode.call(
  'POST',
  '/api/v1/projects',
  {
    name: 'My Project',
    description: 'Project description'
  }
)
```

## 🛠️ Using KiloCode Tool in Agent

### Add to Agent

```typescript
import { Agent, createKiloCodeTool } from '@sawcode/agent'

const agent = new Agent({
  tools: [createKiloCodeTool()],
})
```

### Call via Agent

```typescript
const result = await agent.query(
  'Get my KiloCode user info and list my projects'
)

// In the TUI:
// 🤖 SawCode> Get my KiloCode user info
// ⏳ Processing...
// 🤖 Agent Response:
// {
//   "id": "6c7b30e5-e852-4083-bd22-184928361616",
//   "email": "user@example.com",
//   ...
// }
```

### Tool Input Format

The KiloCode tool accepts:

```typescript
{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: '/api/v1/...',
  body?: { /* request data */ }
}
```

Example:
```
Query: Call KiloCode API with method GET, endpoint /api/v1/users/me
```

## 📋 KiloCodeClient Class

### Constructor

```typescript
import { KiloCodeClient } from '@sawcode/agent'

const client = new KiloCodeClient({
  apiUrl: 'https://api.kilocode.com',
  token: process.env.KILOCODE_TOKEN,
  apiKey: process.env.KILOCODE_API_KEY,
  userId: process.env.KILOCODE_USER_ID,
  timeout: 10000, // ms
})
```

### Methods

```typescript
// Check authentication status
client.isAuthenticated() // boolean

// Get API URL
client.getApiUrl() // string

// User operations
await client.getUser() // Get current user
await client.getUserById(userId)

// Project operations
await client.listProjects()
await client.getProject(projectId)
await client.createProject(name, description?)

// Generic API call
await client.call(method, endpoint, body?)
```

### Response Format

All methods return:

```typescript
interface KiloCodeResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KILOCODE_TOKEN` | ✅ | - | JWT bearer token |
| `KILOCODE_API_URL` | ❌ | `https://api.kilocode.com` | API base URL |
| `KILOCODE_USER_ID` | ❌ | - | User ID (optional) |
| `KILOCODE_API_KEY` | ❌ | - | API key (alternative auth) |

### Complete .env Example

```env
# KiloCode API Configuration
KILOCODE_API_URL=https://api.kilocode.com
KILOCODE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
KILOCODE_USER_ID=6c7b30e5-e852-4083-bd22-184928361616

# Optional: API key authentication
# KILOCODE_API_KEY=sk-kilo-...
```

## 💻 Examples

### Example 1: Get User Information

```typescript
import { kilocode } from '@sawcode/agent'

const response = await kilocode.getUser()

if (response.success) {
  console.log('User:', response.data)
  console.log('ID:', response.data?.id)
  console.log('Email:', response.data?.email)
} else {
  console.error('Error:', response.error)
}
```

### Example 2: List and Create Projects

```typescript
import { kilocode } from '@sawcode/agent'

// List existing projects
const projects = await kilocode.listProjects()
console.log(`You have ${projects.data?.length || 0} projects`)

// Create new project
const newProject = await kilocode.createProject(
  'AI Agent',
  'Powered by SawCode'
)

if (newProject.success) {
  console.log('Created project:', newProject.data?.id)
}
```

### Example 3: Custom API Call

```typescript
import { kilocode } from '@sawcode/agent'

// Call custom endpoint
const response = await kilocode.call(
  'GET',
  '/api/v1/users/me/settings'
)

if (response.success) {
  console.log('Settings:', response.data)
}
```

### Example 4: In Agent Query

```typescript
import { Agent, createKiloCodeTool } from '@sawcode/agent'

const agent = new Agent({
  tools: [createKiloCodeTool()],
})

const result = await agent.query(
  'What are my KiloCode projects and how many do I have?'
)

console.log(result.response)
```

### Example 5: TUI Interactive Usage

```bash
bun run tui
```

Then in TUI:
```
🤖 SawCode> tools
(see kilocode-api tool listed)

🤖 SawCode> Get my user info from KiloCode
⏳ Processing...

🤖 Agent Response:
{
  "id": "6c7b30e5-e852-4083-bd22-184928361616",
  "email": "user@example.com",
  ...
}
```

## 🐛 Troubleshooting

### Authentication Error

**Error:** `KiloCode not authenticated. Set KILOCODE_TOKEN in .env`

**Solution:**
1. Check `.env` file exists
2. Verify `KILOCODE_TOKEN` is set
3. Confirm token is not expired
4. Restart your application

### API Error (401 Unauthorized)

**Error:** `HTTP 401`

**Solution:**
- Token has expired → generate new token
- Token is invalid → verify token format
- Wrong API URL → check `KILOCODE_API_URL`

### Connection Timeout

**Error:** Timeout after 10000ms

**Solution:**
- Check internet connection
- Verify `KILOCODE_API_URL` is correct
- Increase timeout in client config:
  ```typescript
  new KiloCodeClient({ timeout: 30000 })
  ```

### Cannot Find Module

**Error:** `Cannot find module '@sawcode/agent'`

**Solution:**
- Run `bun install`
- Build project: `bun run build`
- Check imports are correct

## 🔒 Security Best Practices

### Token Management

```env
# ✅ GOOD - Token in .env (not committed)
KILOCODE_TOKEN=eyJh...

# ❌ BAD - Token in code
const token = 'eyJh...'

# ❌ BAD - Token in git history
git log --all --full-history -- "*" | grep KILOCODE_TOKEN
```

### Secure Storage

```typescript
// ✅ GOOD - Load from environment
const token = process.env.KILOCODE_TOKEN

// ❌ BAD - Hardcoded token
const token = 'hardcoded-token'
```

### API Key Rotation

1. Generate new token in KiloCode dashboard
2. Update `.env` file
3. Restart application
4. Revoke old token

## 📖 JWT Token Structure

Your KiloCode JWT token contains:

```json
{
  "env": "production",
  "kiloUserId": "6c7b30e5-e852-4083-bd22-184928361616",
  "apiTokenPepper": null,
  "version": 3,
  "iat": 1775123180,
  "exp": 1932803180
}
```

- **env**: Environment (production/staging)
- **kiloUserId**: Your unique user ID
- **iat**: Issued at timestamp
- **exp**: Expiration timestamp

## 🚀 Deployment

### Docker

```dockerfile
FROM oven/bun:latest

WORKDIR /app
COPY . .

RUN bun install
RUN bun run build

# Set environment
ENV KILOCODE_TOKEN=${KILOCODE_TOKEN}
ENV KILOCODE_API_URL=https://api.kilocode.com

EXPOSE 3000
CMD ["bun", "run", "example"]
```

Run with:
```bash
docker run -e KILOCODE_TOKEN=$TOKEN my-app
```

### Environment Variables in Production

**Never commit secrets!**

Set environment variables via:
- Container orchestration (Kubernetes secrets)
- CI/CD pipeline (GitHub Actions secrets)
- Environment variable service
- Process manager (PM2, systemd)

## 📚 API Endpoints Reference

Common KiloCode API endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/users/me` | Get current user |
| GET | `/api/v1/users/{id}` | Get user by ID |
| GET | `/api/v1/projects` | List projects |
| GET | `/api/v1/projects/{id}` | Get project |
| POST | `/api/v1/projects` | Create project |
| PUT | `/api/v1/projects/{id}` | Update project |
| DELETE | `/api/v1/projects/{id}` | Delete project |

See [KiloCode API docs](https://docs.kilocode.com) for more.

## 🆘 Support

- **KiloCode Docs:** https://docs.kilocode.com
- **API Reference:** https://api.kilocode.com/docs
- **SawCode Issues:** Report on GitHub

---

**Ready to integrate KiloCode? 🎉**

1. Set `KILOCODE_TOKEN` in `.env`
2. Test with `kilocode.getUser()`
3. Use in agent: `createKiloCodeTool()`
4. Deploy confidently!
