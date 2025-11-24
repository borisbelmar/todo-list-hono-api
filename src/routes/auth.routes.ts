import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { nanoid } from 'nanoid'
import type { User } from '../types/user.types'
import { registerSchema, loginSchema } from '../schemas/auth.schema'
import { hashPassword, verifyPassword } from '../utils/crypto'
import { generateToken } from '../utils/jwt'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  PASSWORD_SALT: string
}

const authRouter = new Hono<{ Bindings: Bindings }>()

// POST /auth/register - Registrar nuevo usuario
authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const body = c.req.valid('json')

    // Verificar si el email ya existe
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?',
    ).bind(body.email.toLowerCase()).first()

    if (existingUser) {
      return c.json({
        success: false,
        error: 'Email already registered',
      }, 409)
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(body.password, c.env.PASSWORD_SALT)

    // Crear usuario
    const now = new Date().toISOString()
    const id = nanoid()

    await c.env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    ).bind(
      id,
      body.email.toLowerCase(),
      passwordHash,
      now,
      now,
    ).run()

    const user: User = {
      id,
      email: body.email.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    }

    // Generar token
    const token = await generateToken(id, c.env.JWT_SECRET)

    return c.json({
      success: true,
      data: {
        user,
        token,
      },
    }, 201)
  } catch {
    return c.json({
      success: false,
      error: 'Registration failed',
    }, 500)
  }
})

// POST /auth/login - Iniciar sesión
authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const body = c.req.valid('json')

    // Buscar usuario
    const userRow = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?',
    ).bind(body.email.toLowerCase()).first()

    if (!userRow) {
      return c.json({
        success: false,
        error: 'Invalid credentials',
      }, 401)
    }

    const userData = userRow as Record<string, unknown>

    // Verificar contraseña
    const isValidPassword = await verifyPassword(
      body.password,
      userData.password_hash as string,
      c.env.PASSWORD_SALT,
    )

    if (!isValidPassword) {
      return c.json({
        success: false,
        error: 'Invalid credentials',
      }, 401)
    }

    const user: User = {
      id: userData.id as string,
      email: userData.email as string,
      createdAt: userData.created_at as string,
      updatedAt: userData.updated_at as string,
    }

    // Generar token
    const token = await generateToken(user.id, c.env.JWT_SECRET)

    return c.json({
      success: true,
      data: {
        user,
        token,
      },
    })
  } catch {
    return c.json({
      success: false,
      error: 'Login failed',
    }, 500)
  }
})

export default authRouter
