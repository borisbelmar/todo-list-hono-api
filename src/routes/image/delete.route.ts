import { errorSchema } from '@/schemas/common.schema'
import { imageDeleteSchema } from '@/schemas/image.schema'
import { createRoute, z } from '@hono/zod-openapi'

// DELETE /:userId/:imageId - Eliminar imagen
export const deleteImageRoute = createRoute({
  method: 'delete',
  path: '/{userId}/{imageId}',
  tags: ['Images'],
  summary: 'Eliminar imagen',
  description: 'Elimina una imagen desde Cloudflare R2 (solo el propietario)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      userId: z.string().openapi({ example: 'user123' }),
      imageId: z.string().openapi({ example: 'abc123.jpg' }),
    }),
  },
  responses: {
    200: {
      description: 'Imagen eliminada',
      content: {
        'application/json': {
          schema: imageDeleteSchema,
        },
      },
    },
    403: {
      description: 'Sin permisos para eliminar',
      content: {
        'application/json': {
          schema: errorSchema,
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
    401: {
      description: 'No autenticado',
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
