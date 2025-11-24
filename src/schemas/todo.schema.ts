import { z } from 'zod'

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
}).optional()

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  completed: z.boolean().optional().default(false),
  location: locationSchema,
  photoUri: z.url().optional(),
})

export const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  completed: z.boolean().optional().default(false),
  location: locationSchema,
  photoUri: z.url().optional(),
})

export const patchTodoSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  location: locationSchema,
  photoUri: z.url().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
export type PatchTodoInput = z.infer<typeof patchTodoSchema>
