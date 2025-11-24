import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { nanoid } from 'nanoid'
import type { Todo } from '../types/todo.types'
import { createTodoSchema, updateTodoSchema, patchTodoSchema } from '../schemas/todo.schema'
import { authMiddleware } from '../middleware/auth.middleware'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

type Variables = {
  userId: string
}

const todoRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Aplicar middleware de autenticación a todas las rutas
todoRouter.use('/*', authMiddleware)

// Helper para convertir row de D1 a Todo
const rowToTodo = (row: unknown): Todo => {
  const r = row as Record<string, unknown>
  return {
    id: r.id as string,
    userId: r.user_id as string,
    title: r.title as string,
    completed: r.completed === 1,
    location: r.latitude && r.longitude
      ? { latitude: r.latitude as number, longitude: r.longitude as number }
      : undefined,
    photoUri: r.photo_uri ? r.photo_uri as string : undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

// GET /todos - Listar todos
todoRouter.get('/', async (c) => {
  try {
    const userId = c.get('userId')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
    ).bind(userId).all()

    const todoList = results.map(rowToTodo)

    return c.json({
      success: true,
      data: todoList,
      count: todoList.length,
    })
  } catch {
    return c.json({
      success: false,
      error: 'Failed to fetch todos',
    }, 500)
  }
})

// GET /todos/:id - Obtener un todo por ID
todoRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('userId')
    const result = await c.env.DB.prepare(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
    ).bind(id, userId).first()

    if (!result) {
      return c.json({
        success: false,
        error: 'Todo not found',
      }, 404)
    }

    return c.json({
      success: true,
      data: rowToTodo(result),
    })
  } catch {
    return c.json({
      success: false,
      error: 'Failed to fetch todo',
    }, 500)
  }
})

// POST /todos - Crear un nuevo todo
todoRouter.post('/', zValidator('json', createTodoSchema), async (c) => {
  try {
    const body = c.req.valid('json')
    const userId = c.get('userId')

    const now = new Date().toISOString()
    const id = nanoid()

    await c.env.DB.prepare(
      `INSERT INTO todos (id, user_id, title, completed, latitude, longitude, photo_uri, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      id,
      userId,
      body.title,
      body.completed ? 1 : 0,
      body.location?.latitude || null,
      body.location?.longitude || null,
      body.photoUri || null,
      now,
      now,
    ).run()

    const newTodo: Todo = {
      id,
      userId,
      title: body.title,
      completed: body.completed ?? false,
      location: body.location,
      photoUri: body.photoUri,
      createdAt: now,
      updatedAt: now,
    }

    return c.json({
      success: true,
      data: newTodo,
    }, 201)
  } catch {
    return c.json({
      success: false,
      error: 'Invalid request body',
    }, 400)
  }
})

// PUT /todos/:id - Actualizar un todo completamente
todoRouter.put('/:id', zValidator('json', updateTodoSchema), async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('userId')
    const existing = await c.env.DB.prepare(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
    ).bind(id, userId).first()

    if (!existing) {
      return c.json({
        success: false,
        error: 'Todo not found',
      }, 404)
    }

    const body = c.req.valid('json')

    const now = new Date().toISOString()

    await c.env.DB.prepare(
      `UPDATE todos 
       SET title = ?, completed = ?, latitude = ?, longitude = ?, photo_uri = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
    ).bind(
      body.title,
      body.completed ? 1 : 0,
      body.location?.latitude || null,
      body.location?.longitude || null,
      body.photoUri || null,
      now,
      id,
      userId,
    ).run()

    const updatedTodo: Todo = {
      id,
      userId,
      title: body.title,
      completed: body.completed ?? false,
      location: body.location,
      photoUri: body.photoUri,
      createdAt: existing.created_at as string,
      updatedAt: now,
    }

    return c.json({
      success: true,
      data: updatedTodo,
    })
  } catch {
    return c.json({
      success: false,
      error: 'Invalid request body',
    }, 400)
  }
})

// PATCH /todos/:id - Actualizar parcialmente un todo
todoRouter.patch('/:id', zValidator('json', patchTodoSchema), async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('userId')
    const existing = await c.env.DB.prepare(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
    ).bind(id, userId).first()

    if (!existing) {
      return c.json({
        success: false,
        error: 'Todo not found',
      }, 404)
    }

    const body = c.req.valid('json')

    const now = new Date().toISOString()
    const updates: string[] = []
    const values: (string | number | null)[] = []

    if (body.title !== undefined) {
      updates.push('title = ?')
      values.push(body.title)
    }
    if (body.completed !== undefined) {
      updates.push('completed = ?')
      values.push(body.completed ? 1 : 0)
    }
    if (body.location !== undefined) {
      updates.push('latitude = ?', 'longitude = ?')
      values.push(body.location?.latitude || null, body.location?.longitude || null)
    }
    if (body.photoUri !== undefined) {
      updates.push('photo_uri = ?')
      values.push(body.photoUri || null)
    }

    updates.push('updated_at = ?')
    values.push(now)
    values.push(id)
    values.push(userId)

    await c.env.DB.prepare(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
    ).bind(...values).run()

    const updated = await c.env.DB.prepare(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
    ).bind(id, userId).first()

    return c.json({
      success: true,
      data: rowToTodo(updated),
    })
  } catch {
    return c.json({
      success: false,
      error: 'Invalid request body',
    }, 400)
  }
})

// DELETE /todos/:id - Eliminar un todo
todoRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('userId')
    const todo = await c.env.DB.prepare(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
    ).bind(id, userId).first()

    if (!todo) {
      return c.json({
        success: false,
        error: 'Todo not found',
      }, 404)
    }

    await c.env.DB.prepare(
      'DELETE FROM todos WHERE id = ? AND user_id = ?',
    ).bind(id, userId).run()

    return c.json({
      success: true,
      data: rowToTodo(todo),
      message: 'Todo deleted successfully',
    })
  } catch {
    return c.json({
      success: false,
      error: 'Failed to delete todo',
    }, 500)
  }
})

export default todoRouter
