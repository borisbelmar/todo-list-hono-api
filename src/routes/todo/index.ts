/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAPIHono } from '@hono/zod-openapi'
import { authMiddleware } from '@/middleware/auth.middleware'
import { listTodosController } from '@/controllers/todo/list.controller'
import { getTodoController } from '@/controllers/todo/get.controller'
import { createTodoController } from '@/controllers/todo/create.controller'
import { updateTodoController } from '@/controllers/todo/update.controller'
import { patchTodoController } from '@/controllers/todo/patch.controller'
import { deleteTodoController } from '@/controllers/todo/delete.controller'
import { listTodosRoute } from './get.route'
import { getTodoRoute } from './list.route'
import { createTodoRoute } from './create.route'
import { updateTodoRoute } from './update.route'
import { patchTodoRoute } from './patch.route'
import { deleteTodoRoute } from './delete.route'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  IMAGES: R2Bucket
}

type Variables = {
  userId: string
}

// TODO: Fix any types in controllers. This requires updating hono/zod-openapi to support generics in controllers.

const todoRouter = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

// Aplicar middleware de autenticación a todas las rutas
todoRouter.use('/*', authMiddleware)

// GET /todos - Listar todos
todoRouter.openapi(listTodosRoute, async (c) => {
  return (await listTodosController(c as any)) as any
})

// GET /todos/:id - Obtener un todo por ID
todoRouter.openapi(getTodoRoute, async (c) => {
  return (await getTodoController(c as any)) as any
})

// POST /todos - Crear todo
todoRouter.openapi(createTodoRoute, async (c) => {
  return (await createTodoController(c as any)) as any
})

// PUT /todos/:id - Actualizar todo (completo)
todoRouter.openapi(updateTodoRoute, async (c) => {
  return (await updateTodoController(c as any)) as any
})

// PATCH /todos/:id - Actualizar todo (parcial)
todoRouter.openapi(patchTodoRoute, async (c) => {
  return (await patchTodoController(c as any)) as any
})

// DELETE /todos/:id - Eliminar todo
todoRouter.openapi(deleteTodoRoute, async (c) => {
  return (await deleteTodoController(c as any)) as any
})

export default todoRouter
