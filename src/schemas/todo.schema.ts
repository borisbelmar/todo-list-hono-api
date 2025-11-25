import { z } from '@hono/zod-openapi'

// Location Schema
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

// Todo Schema
export const todoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  completed: z.boolean(),
  location: locationSchema.optional(),
  photoUri: z.url().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Create Todo Schema
export const createTodoSchema = z.object({
  title: z.string().min(1).openapi({ example: 'Buy groceries' }),
  completed: z.boolean().default(false).openapi({ example: false }),
  location: locationSchema.optional(),
  photoUri: z.url().optional().openapi({ example: 'https://example.com/photo.jpg' }),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>

// Update Todo Schema
export const updateTodoSchema = z.object({
  title: z.string().min(1).openapi({ example: 'Buy groceries' }),
  completed: z.boolean().default(false).openapi({ example: true }),
  location: locationSchema.optional(),
  photoUri: z.url().optional().openapi({ example: 'https://example.com/photo.jpg' }),
})

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>

// Patch Todo Schema
export const patchTodoSchema = z.object({
  title: z.string().min(1).optional().openapi({ example: 'Buy groceries' }),
  completed: z.boolean().optional().openapi({ example: true }),
  location: locationSchema.optional(),
  photoUri: z.url().optional().openapi({ example: 'https://example.com/photo.jpg' }),
})

export type PatchTodoInput = z.infer<typeof patchTodoSchema>

// Response Schemas
export const todoListSchema = z.object({
  success: z.literal(true),
  data: z.array(todoSchema),
  count: z.number(),
})

export const todoSuccessSchema = z.object({
  success: z.literal(true),
  data: todoSchema,
})

export const todoDeleteSchema = z.object({
  success: z.literal(true),
  data: todoSchema,
  message: z.string(),
})
