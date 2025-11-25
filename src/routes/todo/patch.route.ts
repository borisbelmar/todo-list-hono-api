import { errorSchema } from '@/schemas/common.schema'
import { patchTodoSchema, todoSuccessSchema } from '@/schemas/todo.schema'
import { createRoute, z } from '@hono/zod-openapi'

// PATCH /todos/:id - Actualizar todo (parcial)
export const patchTodoRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Todos'],
  summary: 'Actualizar todo (parcial)',
  description: 'Actualiza solo los campos enviados de un todo',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'abc123' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: patchTodoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Todo actualizado parcialmente',
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
