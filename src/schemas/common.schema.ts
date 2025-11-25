import { z } from '@hono/zod-openapi'

// Response Error Schema
export const errorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})
