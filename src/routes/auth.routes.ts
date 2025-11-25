import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { registerController } from '../controllers/auth/register.controller'
import { loginController } from '../controllers/auth/login.controller'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  PASSWORD_SALT: string
}

const authRouter = new OpenAPIHono<{ Bindings: Bindings }>()

// Schemas
const RegisterInputSchema = z.object({
  email: z.email().openapi({ example: 'user@example.com' }),
  password: z.string().min(6).openapi({ example: 'password123' }),
})

const LoginInputSchema = z.object({
  email: z.email().openapi({ example: 'user@example.com' }),
  password: z.string().min(1).openapi({ example: 'password123' }),
})

const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const AuthSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: UserSchema,
    token: z.string(),
  }),
})

const ErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})

// Ruta de registro
const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Auth'],
  summary: 'Registrar nuevo usuario',
  description: 'Crea una nueva cuenta de usuario con email y contraseña',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterInputSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Usuario registrado exitosamente',
      content: {
        'application/json': {
          schema: AuthSuccessSchema,
        },
      },
    },
    409: {
      description: 'Email ya registrado',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Error del servidor',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

authRouter.openapi(registerRoute, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await registerController(c) as any
})

// Ruta de login
const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  summary: 'Iniciar sesión',
  description: 'Autentica un usuario y devuelve un token JWT',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login exitoso',
      content: {
        'application/json': {
          schema: AuthSuccessSchema,
        },
      },
    },
    401: {
      description: 'Credenciales inválidas',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Error del servidor',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

authRouter.openapi(loginRoute, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await loginController(c) as any
})

export default authRouter
