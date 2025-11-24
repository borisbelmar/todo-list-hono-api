import { Hono } from 'hono'
import todoRouter from './routes/todo.routes'
import authRouter from './routes/auth.routes'

type Bindings = {
  JWT_SECRET: string
  PASSWORD_SALT: string
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Healthcheck público
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// Ruta raíz
app.get('/', (c) => {
  return c.json({
    message: 'Bienvenido a la API con Hono',
    endpoints: {
      health: '/health',
      auth: {
        register: '/auth/register',
        login: '/auth/login',
      },
      todos: '/todos (requiere autenticación)',
    },
  })
})

// Router de autenticación (público)
app.route('/auth', authRouter)

// Router de todos (requiere autenticación)
app.route('/todos', todoRouter)

export default app
