import { errorSchema } from '@/schemas/common.schema'
import { todoSuccessSchema, updateTodoSchema } from '@/schemas/todo.schema'
import { createRoute, z } from '@hono/zod-openapi'

// PUT /todos/:id - Actualizar todo (completo)
export const updateTodoRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Todos'],
  summary: 'Actualizar todo (completo)',
  description: 'Actualiza todos los campos de un todo',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'abc123' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateTodoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Todo actualizado',
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
