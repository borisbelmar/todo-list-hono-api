import { vi } from 'vitest'

export interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement
  first: <T = unknown>(colName?: string) => Promise<T | null>
  run: () => Promise<D1Response>
  all: <T = unknown>() => Promise<D1Result<T>>
}

export interface D1Response {
  success: boolean
  meta: Record<string, unknown>
  error?: string
}

export interface D1Result<T = unknown> {
  results: T[]
  success: boolean
  meta: Record<string, unknown>
}

export interface MockDatabase {
  users: Map<string, Record<string, unknown>>
  todos: Map<string, Record<string, unknown>>
  images: Map<string, Record<string, unknown>>
}

export const createMockD1Database = (initialData?: Partial<MockDatabase>): D1Database => {
  const db: MockDatabase = {
    users: new Map(initialData?.users || []),
    todos: new Map(initialData?.todos || []),
    images: new Map(initialData?.images || []),
  }

  const createPreparedStatement = (query: string): D1PreparedStatement => {
    let boundValues: unknown[] = []

    const statement: D1PreparedStatement = {
      bind: (...values: unknown[]) => {
        boundValues = values
        return statement
      },

      first: async <T = unknown>(colName?: string): Promise<T | null> => {
        // SELECT * FROM users WHERE email = ?
        if (query.includes('SELECT') && query.includes('users')) {
          if (query.includes('WHERE email')) {
            const email = boundValues[0] as string
            const user = Array.from(db.users.values()).find(
              (u) => u.email === email,
            )
            if (colName && user) {
              return (user[colName] as T) || null
            }
            return (user as T) || null
          }
          if (query.includes('WHERE id')) {
            const id = boundValues[0] as string
            const user = db.users.get(id)
            if (colName && user) {
              return (user[colName] as T) || null
            }
            return (user as T) || null
          }
        }

        // SELECT * FROM todos WHERE id = ?
        if (query.includes('SELECT') && query.includes('todos')) {
          if (query.includes('WHERE id')) {
            const id = boundValues[0] as string
            const todo = db.todos.get(id)
            return (todo as T) || null
          }
        }

        return null
      },

      run: async (): Promise<D1Response> => {
        // INSERT INTO users
        if (query.includes('INSERT INTO users')) {
          const [id, email, passwordHash, createdAt, updatedAt] = boundValues
          db.users.set(id as string, {
            id,
            email,
            password_hash: passwordHash,
            created_at: createdAt,
            updated_at: updatedAt,
          })
          return { success: true, meta: {} }
        }

        // INSERT INTO todos
        if (query.includes('INSERT INTO todos')) {
          const [id, userId, title, completed, latitude, longitude, photoUri, createdAt, updatedAt] =
            boundValues
          db.todos.set(id as string, {
            id,
            user_id: userId,
            title,
            completed,
            latitude,
            longitude,
            photo_uri: photoUri,
            created_at: createdAt,
            updated_at: updatedAt,
          })
          return { success: true, meta: {} }
        }

        // UPDATE todos
        if (query.includes('UPDATE todos')) {
          const id = boundValues[boundValues.length - 2] as string
          const todo = db.todos.get(id)
          if (todo) {
            // Parsear dinámicamente los campos a actualizar
            const updates: Record<string, unknown> = { ...todo }

            // Detectar qué campos se están actualizando basándose en la query
            if (query.includes('title = ?')) {
              const titleIdx = query.split('SET ')[1].split(',').findIndex(s => s.trim().startsWith('title'))
              updates.title = boundValues[titleIdx]
            }
            if (query.includes('completed = ?')) {
              const completedIdx = query.split('SET ')[1].split(',').findIndex(s => s.trim().startsWith('completed'))
              updates.completed = boundValues[completedIdx]
            }
            if (query.includes('latitude = ?')) {
              const latIdx = query.split('SET ')[1].split(',').findIndex(s => s.trim().startsWith('latitude'))
              const lngIdx = query.split('SET ')[1].split(',').findIndex(s => s.trim().startsWith('longitude'))
              updates.latitude = boundValues[latIdx]
              updates.longitude = boundValues[lngIdx]
            }
            if (query.includes('photo_uri = ?')) {
              const photoIdx = query.split('SET ')[1].split(',').findIndex(s => s.trim().startsWith('photo_uri'))
              updates.photo_uri = boundValues[photoIdx]
            }
            if (query.includes('updated_at = ?')) {
              const updatedIdx = query.split('SET ')[1].split(',').findIndex(s => s.trim().startsWith('updated_at'))
              updates.updated_at = boundValues[updatedIdx]
            }

            db.todos.set(id, updates)
          }
          return { success: true, meta: {} }
        }

        // DELETE FROM todos
        if (query.includes('DELETE FROM todos')) {
          const id = boundValues[0] as string
          db.todos.delete(id)
          return { success: true, meta: {} }
        }

        return { success: true, meta: {} }
      },

      all: async <T = unknown>(): Promise<D1Result<T>> => {
        // SELECT * FROM todos WHERE user_id = ?
        if (query.includes('SELECT') && query.includes('todos')) {
          if (query.includes('WHERE user_id')) {
            const userId = boundValues[0] as string
            const todos = Array.from(db.todos.values()).filter(
              (t) => t.user_id === userId,
            )
            // Ordenar por created_at DESC
            todos.sort((a, b) => {
              const dateA = new Date(a.created_at as string).getTime()
              const dateB = new Date(b.created_at as string).getTime()
              return dateB - dateA
            })
            return {
              results: todos as T[],
              success: true,
              meta: {},
            }
          }
        }

        return {
          results: [],
          success: true,
          meta: {},
        }
      },
    }

    return statement
  }

  return {
    prepare: vi.fn((query: string) => createPreparedStatement(query)),
    dump: vi.fn(),
    batch: vi.fn(),
    exec: vi.fn(),
  } as unknown as D1Database
}
