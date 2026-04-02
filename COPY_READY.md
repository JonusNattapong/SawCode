# Copy-Ready Code from Reference

รายการของ code ที่เราสามารถ copy และใช้ได้เลย จาก `.reference/claudecode`

---

## 🎯 **REUSABLE UTILITIES** (Copy เลยได้)

### 1. **Array Utilities** ✅
📍 `.reference/claudecode/utils/array.ts`

```typescript
// ฟังก์ชันที่ใช้ได้เลย:
export function intersperse<A>(as: A[], separator: (index: number) => A): A[]
export function count<T>(arr: readonly T[], pred: (x: T) => unknown): number
export function uniq<T>(xs: Iterable<T>): T[]
```

**ใช้สำหรับ:**
- ประมวลผล arrays
- จำแนก unique items
- นับสิ่งของ

---

### 2. **Error Classes** ✅
📍 `.reference/claudecode/utils/errors.ts`

```typescript
// Error classes ที่ copy ได้เลย:
export class ClaudeError extends Error { }
export class AbortError extends Error { }
export class ConfigParseError extends Error { }
export class ShellError extends Error { }

// ฟังก์ชันช่วย:
export function isAbortError(e: unknown): boolean
```

**ใช้สำหรับ:**
- Error handling ที่เป็นมาตรฐาน
- ตรวจหา abort errors
- Config error tracking

---

### 3. **ID System** ✅
📍 `.reference/claudecode/utils/agentId.ts`

```typescript
// ระบบ ID ที่ copy ได้:
export function formatAgentId(agentName: string, teamName: string): string
export function parseAgentId(agentId: string): { agentName: string; teamName: string } | null
export function generateRequestId(requestType: string, agentId: string): string
export function parseRequestId(requestId: string): { requestType: string; timestamp: number; agentId: string } | null
```

**ใช้สำหรับ:**
- สร้าง deterministic IDs
- Parse IDs ที่มีโครงสร้าง
- Request tracking

---

### 4. **Environment Utilities** ✅
📍 `.reference/claudecode/utils/env.ts` และ `utils/envUtils.ts`

```typescript
// Copy ได้ฟังก์ชัน:
export function isEnvTruthy(value: unknown): boolean
export function isBareMode(): boolean
export const env = { ... }  // Environment configuration object
```

**ใช้สำหรับ:**
- ตรวจหา environment variables
- Detect Bare mode
- Feature flags

---

### 5. **Type Utilities** ✅
📍 `.reference/claudecode/types/utils.ts`

```typescript
// Copy ได้ type definitions:
export type DeepImmutable<T> = { readonly [K in keyof T]: DeepImmutable<T[K]> }
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }
```

**ใช้สำหรับ:**
- Type safety
- Immutable types
- Read-only types

---

### 6. **String/Display Utilities** ✅
📍 `.reference/claudecode/utils/displayTags.ts`

```typescript
// Copy ได้ฟังก์ชัน:
export function stripDisplayTags(text: string): string
export function stripDisplayTagsAllowEmpty(text: string): string
export function truncateText(text: string, maxLength: number): string
```

**ใช้สำหรับ:**
- ทำความสะอาดข้อความ
- Truncate strings
- Display formatting

---

## 📦 **PATTERNS TO COPY** (คัดลอกแนวคิด)

### 1. **Error Handling Pattern** ✅

```typescript
// Pattern จาก reference:
class CustomError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

// และ Helper functions:
export function isSpecificError(e: unknown): boolean {
  return e instanceof CustomError ||
         (e instanceof Error && e.name === 'CustomError')
}
```

**Copy นี้เพราะ:**
- มาตรฐานและทดสอบแล้ว
- Handles minified code
- Best practice

---

### 2. **ID Parsing Pattern** ✅

```typescript
// Pattern:
// - Use separator (@ หรือ -)
// - Parse deterministically
// - Return null if invalid
// - Include validation

export function parseId(id: string): ParsedId | null {
  const index = id.indexOf('@')
  if (index === -1) return null
  return { part1: id.slice(0, index), part2: id.slice(index + 1) }
}
```

**Copy นี้เพราะ:**
- Deterministic
- Human-readable
- Reproducible

---

### 3. **Type-Safe Config Pattern** ✅

```typescript
// Pattern:
// - Define type first
// - Add validation
// - Provide defaults
// - Export helper functions

export interface Config {
  model: string
  temperature: number
}

export function parseConfig(raw: unknown): Config {
  // Validate and parse
}
```

---

## 📚 **FULL FILES TO COPY** (Copy ทั้งไฟล์)

### Best Candidates for Full Copy:

| ไฟล์ | ความยาว | ความสำคัญ | Copy? |
|------|--------|----------|-------|
| `utils/array.ts` | 14 lines | ⭐⭐⭐ | ✅ YES |
| `utils/errors.ts` | 80+ lines | ⭐⭐⭐ | ✅ YES |
| `utils/agentId.ts` | 100 lines | ⭐⭐⭐ | ✅ YES |
| `utils/envUtils.ts` | ~50 lines | ⭐⭐ | ✅ YES |
| `types/utils.ts` | ~30 lines | ⭐⭐ | ✅ YES |

---

## 🚀 **ACTION PLAN - Copy Ready Code**

### **Step 1: Array Utilities** (5 min)
```bash
# Copy: .reference/claudecode/utils/array.ts
# To: src/utils/array.ts
```

### **Step 2: Error Classes** (10 min)
```bash
# Copy: .reference/claudecode/utils/errors.ts (some functions)
# To: src/utils/errors.ts (merge with existing)
```

### **Step 3: ID System** (10 min)
```bash
# Copy: .reference/claudecode/utils/agentId.ts
# To: src/utils/ids.ts
```

### **Step 4: Types** (5 min)
```bash
# Copy: .reference/claudecode/types/utils.ts
# To: src/types/utils.ts (new file)
```

### **Step 5: Environment Utils** (5 min)
```bash
# Copy: relevant parts from envUtils.ts
# To: src/utils/env.ts (update existing)
```

---

## 📝 **Code to NOT Copy** (ประหยัดเวลา)

❌ **Too specific/integrated:**
- `log.ts` - too tied to their system
- `config.ts` - too specific to Claude Code
- `hook.ts` - UI-specific
- `browser/` - Chrome automation specific
- `canvas-host/` - React-specific

---

## ✅ **Quick Copy Checklist**

```
Priority 1 (Do First):
☐ Array utilities (array.ts)
☐ Error classes (errors.ts)
☐ ID system (agentId.ts)

Priority 2 (Nice to Have):
☐ Type utils (types/utils.ts)
☐ Env utils (envUtils.ts)
☐ String utilities (displayTags.ts)

Priority 3 (Later):
☐ Config patterns (study, don't copy)
☐ Logging patterns (study, adapt)
☐ Setup patterns (study, adapt)
```

---

## 🎯 **Time Estimate**

| Task | Time | Status |
|------|------|--------|
| Copy array.ts | 5 min | ✅ Quick |
| Copy errors.ts | 10 min | ✅ Quick |
| Copy agentId.ts | 10 min | ✅ Quick |
| Copy types/utils.ts | 5 min | ✅ Quick |
| Update imports | 10 min | ✅ Quick |
| Test | 10 min | ✅ Quick |
| **TOTAL** | **50 min** | ✅ Very Fast |

---

## 📌 **Next Step**

**เริ่มด้วยอันไหน?**

```bash
# Option 1: Copy ทันที (50 min)
# ✅ ได้ battle-tested code
# ✅ ประหยัด development time
# ✅ ตรงแบบฉบับ

# Option 2: Adapt and Improve (2 hours)
# ✅ Customize ให้เหมาะกับเรา
# ✅ เข้าใจลึกขึ้น
# ⚠️ ใช้เวลานาน
```

**ผมขอแนะนำ:** เริ่ม **Copy ทันที** แล้วค่อยปรับแต่งให้เหมาะ ✅
