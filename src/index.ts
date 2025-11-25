import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { cors } from 'hono/cors'
import todoRouter from './routes/todo.routes'
import authRouter from './routes/auth.routes'
import imageRouter from './routes/image.routes'

type Bindings = {
  JWT_SECRET: string
  PASSWORD_SALT: string
  DB: D1Database
  IMAGES: R2Bucket
}

const app = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: result.error.issues,
        },
        400,
      )
    }
  },
})

// CORS middleware
app.use('/*', cors())

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
    documentation: '/docs',
    openapi: '/openapi.json',
    endpoints: {
      health: '/health',
      auth: {
        register: '/auth/register',
        login: '/auth/login',
      },
      todos: '/todos (requiere autenticación)',
      images: '/images (requiere autenticación)',
    },
  })
})

// Router de autenticación (público)
app.route('/auth', authRouter)

// Router de todos (requiere autenticación)
app.route('/todos', todoRouter)

// Router de imágenes (requiere autenticación)
app.route('/images', imageRouter)

// Endpoint personalizado para OpenAPI JSON con security schemes
app.get('/openapi.json', (c) => {
  // Obtener el spec base generado por OpenAPIHono
  const spec = app.getOpenAPIDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Todo List API',
      description: 'API REST completa con autenticación JWT, gestión de todos e imágenes con Cloudflare Workers, D1 y R2',
    },
    servers: [
      {
        url: 'http://localhost:8787',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://basic-hono-api.borisbelmarm.workers.dev',
        description: 'Servidor de producción',
      },
    ],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Autenticación y gestión de usuarios' },
      { name: 'Todos', description: 'CRUD de tareas' },
      { name: 'Images', description: 'Gestión de imágenes con R2' },
    ],
  })

  // Agregar security schemes globalmente
  spec.components = spec.components || {}
  spec.components.securitySchemes = {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Token JWT obtenido del endpoint /auth/login',
    },
  }

  return c.json(spec)
})

// Swagger UI
app.get('/docs', swaggerUI({ url: '/openapi.json' }))

export default app
