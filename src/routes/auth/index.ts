/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAPIHono } from '@hono/zod-openapi'
import { registerController } from '@/controllers/auth/register.controller'
import { loginController } from '@/controllers/auth/login.controller'
import { registerRoute } from './register.route'
import { loginRoute } from './login.route'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  PASSWORD_SALT: string
}

// TODO: Fix any types in controllers. This requires updating hono/zod-openapi to support generics in controllers.

const authRouter = new OpenAPIHono<{ Bindings: Bindings }>()

// POST /auth/register - Registrar usuario
authRouter.openapi(registerRoute, async (c) => {
  return (await registerController(c)) as any
})

// POST /auth/login - Iniciar sesión
authRouter.openapi(loginRoute, async (c) => {
  return (await loginController(c)) as any
})

export default authRouter
