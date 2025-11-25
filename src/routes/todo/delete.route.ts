import { errorSchema } from '@/schemas/common.schema'
import { todoDeleteSchema } from '@/schemas/todo.schema'
import { createRoute, z } from '@hono/zod-openapi'

// DELETE /todos/:id - Eliminar todo
export const deleteTodoRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Todos'],
  summary: 'Eliminar todo',
  description: 'Elimina un todo y su imagen asociada si existe',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'abc123' }),
    }),
  },
  responses: {
    200: {
      description: 'Todo eliminado',
      content: {
        'application/json': {
          schema: todoDeleteSchema,
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
