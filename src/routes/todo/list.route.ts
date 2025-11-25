import { errorSchema } from '@/schemas/common.schema'
import { todoSuccessSchema } from '@/schemas/todo.schema'
import { createRoute, z } from '@hono/zod-openapi'

// GET /todos/:id - Obtener un todo por ID
export const getTodoRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Todos'],
  summary: 'Obtener un todo',
  description: 'Obtiene un todo específico por su ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'abc123' }),
    }),
  },
  responses: {
    200: {
      description: 'Todo encontrado',
      content: {
        'application/json': {
          schema: todoSuccessSchema,
        },
      },
    },
    404: {
      description: 'Todo no encontrado',
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
  },
})
