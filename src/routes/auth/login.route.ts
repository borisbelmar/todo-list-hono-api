import { authSuccessSchema, loginInputSchema } from '@/schemas/auth.schema'
import { errorSchema } from '@/schemas/common.schema'
import { createRoute } from '@hono/zod-openapi'

// POST /auth/login - Iniciar sesión
export const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  summary: 'Iniciar sesión',
  description: 'Autentica un usuario y devuelve un token JWT',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login exitoso',
      content: {
        'application/json': {
          schema: authSuccessSchema,
        },
      },
    },
    401: {
      description: 'Credenciales inválidas',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
})
