import { Context } from 'hono'
import { vi } from 'vitest'
import { createMockD1Database, type MockDatabase } from '../mocks/d1.mock'
import { createMockR2Bucket, type MockR2Storage } from '../mocks/r2.mock'

interface MockBindings {
  DB?: D1Database
  IMAGES?: R2Bucket
  JWT_SECRET?: string
  PASSWORD_SALT?: string
}

interface MockVariables {
  userId?: string
}

interface CreateMockContextOptions {
  bindings?: MockBindings
  variables?: MockVariables
  dbData?: Partial<MockDatabase>
  r2Data?: MockR2Storage
  method?: string
  path?: string
  body?: unknown
  headers?: Record<string, string>
}

export const createMockContext = (options: CreateMockContextOptions = {}): Context => {
  const {
    bindings = {},
    variables = {},
    dbData,
    r2Data,
    method = 'GET',
    path = '/',
    body,
    headers = {},
  } = options

  // Crear mocks de bindings si no se proporcionan
  const mockBindings: MockBindings = {
    DB: bindings.DB || createMockD1Database(dbData),
    IMAGES: bindings.IMAGES || createMockR2Bucket(r2Data),
    JWT_SECRET: bindings.JWT_SECRET || 'test-secret-key',
    PASSWORD_SALT: bindings.PASSWORD_SALT || 'test-salt',
  }

  // Mock del request
  const mockRequest = {
    method,
    url: `http://localhost${path}`,
    headers: new Headers(headers),
    header: vi.fn((name: string) => headers[name] || null),
    json: vi.fn(async () => body),
    formData: vi.fn(async () => {
      const formData = new FormData()
      if (body && typeof body === 'object') {
        Object.entries(body).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value)
          } else if (typeof value === 'string') {
            formData.append(key, value)
          }
        })
      }
      return formData
    }),
    param: vi.fn((key: string) => {
      // Extrae parámetros de la URL si están en formato /resource/:id
      const parts = path.split('/')
      if (parts.length > 2 && key === 'id') {
        return parts[parts.length - 1]
      }
      if (key === 'userId' && parts.includes('images')) {
        return parts[2] // /images/:userId/:imageId
      }
      if (key === 'imageId' && parts.includes('images')) {
        return parts[3]
      }
      return undefined
    }),
  } as unknown as Request

  // Mock del contexto
  const mockContext = {
    req: mockRequest,
    env: mockBindings,
    get: vi.fn((key: string) => {
      if (key === 'userId') return variables.userId
      return undefined
    }),
    set: vi.fn(),
    json: vi.fn((data: unknown, status?: number) => {
      return new Response(JSON.stringify(data), {
        status: status || 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }),
    text: vi.fn((text: string, status?: number) => {
      return new Response(text, {
        status: status || 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }),
    html: vi.fn((html: string, status?: number) => {
      return new Response(html, {
        status: status || 200,
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }),
  } as unknown as Context

  return mockContext
}

// Helper para parsear la respuesta JSON
export const parseJsonResponse = async (response: Response) => {
  const text = await response.text()
  return JSON.parse(text)
}
