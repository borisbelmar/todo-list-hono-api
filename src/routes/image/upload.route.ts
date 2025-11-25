import { errorSchema } from '@/schemas/common.schema'
import { imageSuccessSchema } from '@/schemas/image.schema'
import { createRoute, z } from '@hono/zod-openapi'

// POST / - Subir imagen
export const uploadImageRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Images'],
  summary: 'Subir imagen',
  description: 'Sube una imagen a Cloudflare R2 (máx. 5MB, formatos: JPEG, PNG, WebP, GIF)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            image: z
              .any()
              .openapi({
                type: 'string',
                format: 'binary',
                description: 'Archivo de imagen (JPEG, PNG, WebP o GIF, máx. 5MB)',
              }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Imagen subida exitosamente',
      content: {
        'application/json': {
          schema: imageSuccessSchema,
        },
      },
    },
    400: {
      description: 'Archivo inválido o muy grande',
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
