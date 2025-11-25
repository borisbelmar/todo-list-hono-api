import { z } from '@hono/zod-openapi'

// Register Schema
export const registerInputSchema = z.object({
  email: z.email().openapi({ example: 'user@example.com' }),
  password: z.string().min(6).openapi({ example: 'password123' }),
})

export type RegisterInput = z.infer<typeof registerInputSchema>

// Login Schema
export const loginInputSchema = z.object({
  email: z.email().openapi({ example: 'user@example.com' }),
  password: z.string().min(6).openapi({ example: 'password123' }),
})

export type LoginInput = z.infer<typeof loginInputSchema>

// Response Schemas
export const authSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
    userId: z.string(),
  }),
})
