/**
 * Convert Zod schema to JSON Schema for the Anthropic API.
 * Lightweight conversion that handles the common cases used by tools.
 */

import { z } from 'zod'

export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape
    const properties: Record<string, unknown> = {}
    const required: string[] = []

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodTypeAny
      properties[key] = zodToJsonSchema(zodValue)

      // Check if field is required (not optional, not with default)
      if (!(zodValue instanceof z.ZodOptional) && !(zodValue instanceof z.ZodDefault)) {
        required.push(key)
      }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {}),
    }
  }

  if (schema instanceof z.ZodString) {
    const result: Record<string, unknown> = { type: 'string' }
    if (schema.description) result.description = schema.description
    return result
  }

  if (schema instanceof z.ZodNumber) {
    const result: Record<string, unknown> = { type: 'number' }
    if (schema.description) result.description = schema.description
    return result
  }

  if (schema instanceof z.ZodBoolean) {
    const result: Record<string, unknown> = { type: 'boolean' }
    if (schema.description) result.description = schema.description
    return result
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(schema.element),
      ...(schema.description ? { description: schema.description } : {}),
    }
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema.options,
      ...(schema.description ? { description: schema.description } : {}),
    }
  }

  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap())
  }

  if (schema instanceof z.ZodDefault) {
    const inner = zodToJsonSchema(schema.removeDefault())
    return { ...inner, default: schema._def.defaultValue() }
  }

  if (schema instanceof z.ZodRecord) {
    return {
      type: 'object',
      additionalProperties: zodToJsonSchema(schema.valueSchema),
      ...(schema.description ? { description: schema.description } : {}),
    }
  }

  if (schema instanceof z.ZodUnion) {
    return {
      anyOf: (schema.options as z.ZodTypeAny[]).map(zodToJsonSchema),
    }
  }

  // Fallback
  return { type: 'string' }
}
