import { z } from '@hono/zod-openapi'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

// Schema para validación en runtime
export const uploadImageSchema = z.object({
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'El tamaño máximo de la imagen es 5MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Solo se permiten imágenes JPEG, PNG, WebP o GIF',
    ),
})

export type UploadImageInput = z.infer<typeof uploadImageSchema>

// Response Schemas
export const imageSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    url: z.string(),
    key: z.string(),
    size: z.number(),
    contentType: z.string(),
  }),
})

export const imageDeleteSchema = z.object({
  success: z.literal(true),
  data: z.object({
    message: z.string(),
  }),
})
