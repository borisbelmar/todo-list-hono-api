import { errorSchema } from '@/schemas/common.schema'
import { createRoute, z } from '@hono/zod-openapi'

// GET /:userId/:imageId - Descargar imagen
export const getImageRoute = createRoute({
  method: 'get',
  path: '/{userId}/{imageId}',
  tags: ['Images'],
  summary: 'Descargar imagen',
  description: 'Descarga una imagen desde Cloudflare R2',
  request: {
    params: z.object({
      userId: z.string().openapi({ example: 'user123' }),
      imageId: z.string().openapi({ example: 'abc123.jpg' }),
    }),
  },
  responses: {
    200: {
      description: 'Imagen encontrada',
      content: {
        'image/*': {
          schema: z.any().openapi({
            type: 'string',
            format: 'binary',
          }),
        },
      },
    },
    404: {
      description: 'Imagen no encontrada',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    500: {
      description: 'Error del servidor',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
})
