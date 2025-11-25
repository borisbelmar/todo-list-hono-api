import { errorSchema } from '@/schemas/common.schema'
import { todoListSchema } from '@/schemas/todo.schema'
import { createRoute } from '@hono/zod-openapi'

// GET /todos - Listar todos
export const listTodosRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Todos'],
  summary: 'Listar todos los todos',
  description: 'Obtiene la lista de todos del usuario autenticado',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Lista de todos',
      content: {
        'application/json': {
          schema: todoListSchema,
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
