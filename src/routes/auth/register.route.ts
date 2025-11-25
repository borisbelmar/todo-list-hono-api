import { authSuccessSchema, registerInputSchema } from '@/schemas/auth.schema'
import { errorSchema } from '@/schemas/common.schema'
import { createRoute } from '@hono/zod-openapi'

// POST /auth/register - Registrar usuario
export const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Auth'],
  summary: 'Registrar usuario',
  description: 'Crea una nueva cuenta de usuario',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerInputSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Usuario registrado exitosamente',
      content: {
        'application/json': {
          schema: authSuccessSchema,
        },
      },
    },
    400: {
      description: 'Datos inválidos o usuario ya existe',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
})
