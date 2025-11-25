import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { authMiddleware } from '../middleware/auth.middleware'
import { listTodosController } from '../controllers/todo/list.controller'
import { getTodoController } from '../controllers/todo/get.controller'
import { createTodoController } from '../controllers/todo/create.controller'
import { updateTodoController } from '../controllers/todo/update.controller'
import { patchTodoController } from '../controllers/todo/patch.controller'
import { deleteTodoController } from '../controllers/todo/delete.controller'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  IMAGES: R2Bucket
}

type Variables = {
  userId: string
}

const todoRouter = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

// Aplicar middleware de autenticación a todas las rutas
todoRouter.use('/*', authMiddleware)

// Schemas
const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

const TodoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  completed: z.boolean(),
  location: LocationSchema.optional(),
  photoUri: z.string().url().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const CreateTodoSchema = z.object({
  title: z.string().min(1).openapi({ example: 'Buy groceries' }),
  completed: z.boolean().default(false).openapi({ example: false }),
  location: LocationSchema.optional(),
  photoUri: z.string().url().optional().openapi({ example: 'https://example.com/photo.jpg' }),
})

const UpdateTodoSchema = z.object({
  title: z.string().min(1).openapi({ example: 'Buy groceries' }),
  completed: z.boolean().default(false).openapi({ example: true }),
  location: LocationSchema.optional(),
  photoUri: z.string().url().optional().openapi({ example: 'https://example.com/photo.jpg' }),
})

const PatchTodoSchema = z.object({
  title: z.string().min(1).optional().openapi({ example: 'Buy groceries' }),
  completed: z.boolean().optional().openapi({ example: true }),
  location: LocationSchema.optional(),
  photoUri: z.string().url().optional().openapi({ example: 'https://example.com/photo.jpg' }),
})

const TodoListSchema = z.object({
  success: z.literal(true),
  data: z.array(TodoSchema),
  count: z.number(),
})

const TodoSuccessSchema = z.object({
  success: z.literal(true),
  data: TodoSchema,
})

const TodoDeleteSchema = z.object({
  success: z.literal(true),
  data: TodoSchema,
  message: z.string(),
})

const ErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})

// GET /todos - Listar todos
const listTodosRoute = createRoute({
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
          schema: TodoListSchema,
        },
      },
    },
    401: {
      description: 'No autenticado',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

todoRouter.openapi(listTodosRoute, async (c) => {
  // @ts-expect-error - OpenAPI type compatibility
  return await listTodosController(c) as any
})

// GET /todos/:id - Obtener un todo por ID
const getTodoRoute = createRoute({
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
          schema: TodoSuccessSchema,
        },
      },
    },
    404: {
      description: 'Todo no encontrado',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: 'No autenticado',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

todoRouter.openapi(getTodoRoute, async (c) => {
  // @ts-expect-error - OpenAPI type compatibility
  return await getTodoController(c) as any
})

// POST /todos - Crear un nuevo todo
const createTodoRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Todos'],
  summary: 'Crear un todo',
  description: 'Crea un nuevo todo para el usuario autenticado',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateTodoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Todo creado exitosamente',
      content: {
        'application/json': {
          schema: TodoSuccessSchema,
        },
      },
    },
    400: {
      description: 'Datos inválidos',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: 'No autenticado',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

todoRouter.openapi(createTodoRoute, async (c) => {
  // @ts-expect-error - OpenAPI type compatibility
  return await createTodoController(c) as any
})

// PUT /todos/:id - Actualizar un todo completamente
const updateTodoRoute = createRoute({
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
          schema: UpdateTodoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Todo actualizado',
      content: {
        'application/json': {
          schema: TodoSuccessSchema,
        },
      },
    },
    404: {
      description: 'Todo no encontrado',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    400: {
      description: 'Datos inválidos',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

todoRouter.openapi(updateTodoRoute, async (c) => {
  // @ts-expect-error - OpenAPI type compatibility
  return await updateTodoController(c) as any
})

// PATCH /todos/:id - Actualizar parcialmente un todo
const patchTodoRoute = createRoute({
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
          schema: PatchTodoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Todo actualizado',
      content: {
        'application/json': {
          schema: TodoSuccessSchema,
        },
      },
    },
    404: {
      description: 'Todo no encontrado',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    400: {
      description: 'Datos inválidos',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

todoRouter.openapi(patchTodoRoute, async (c) => {
  // @ts-expect-error - OpenAPI type compatibility
  return await patchTodoController(c) as any
})

// DELETE /todos/:id - Eliminar un todo
const deleteTodoRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Todos'],
  summary: 'Eliminar un todo',
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
          schema: TodoDeleteSchema,
        },
      },
    },
    404: {
      description: 'Todo no encontrado',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

todoRouter.openapi(deleteTodoRoute, async (c) => {
  // @ts-expect-error - OpenAPI type compatibility
  return await deleteTodoController(c) as any
})

export default todoRouter
