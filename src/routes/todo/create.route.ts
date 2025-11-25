import { errorSchema } from '@/schemas/common.schema'
import { createTodoSchema, todoSuccessSchema } from '@/schemas/todo.schema'
import { createRoute } from '@hono/zod-openapi'

// POST /todos - Crear todo
export const createTodoRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Todos'],
  summary: 'Crear un nuevo todo',
  description: 'Crea un nuevo todo para el usuario autenticado',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createTodoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Todo creado exitosamente',
      content: {
        'application/json': {
          schema: todoSuccessSchema,
        },
      },
    },
    400: {
      description: 'Datos inválidos',
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
