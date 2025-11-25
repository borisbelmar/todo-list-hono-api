import { describe, it, expect } from 'vitest'
import { patchTodoController } from './patch.controller'
import { createMockContext, parseJsonResponse } from '../../test/helpers/context.helper'

describe('patchTodoController', () => {
  const testUserId = 'user-123'

  it('should patch only the title', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'PATCH',
      path: `/todos/${todoId}`,
      body: {
        title: 'Updated title',
      },
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            todoId,
            {
              id: todoId,
              user_id: testUserId,
              title: 'Original title',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: null,
              created_at: now,
              updated_at: now,
            },
          ],
        ]),
      },
    })

    const response = await patchTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.title).toBe('Updated title')
    expect(data.data.completed).toBe(false) // No cambió
  })

  it('should patch only the completed status', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'PATCH',
      path: `/todos/${todoId}`,
      body: {
        completed: true,
      },
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            todoId,
            {
              id: todoId,
              user_id: testUserId,
              title: 'Todo title',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: null,
              created_at: now,
              updated_at: now,
            },
          ],
        ]),
      },
    })

    const response = await patchTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.data.completed).toBe(true)
    expect(data.data.title).toBe('Todo title') // No cambió
  })

  it('should patch only the location', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'PATCH',
      path: `/todos/${todoId}`,
      body: {
        location: {
          latitude: -33.4489,
          longitude: -70.6693,
        },
      },
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            todoId,
            {
              id: todoId,
              user_id: testUserId,
              title: 'Todo',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: null,
              created_at: now,
              updated_at: now,
            },
          ],
        ]),
      },
    })

    const response = await patchTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.data.location).toEqual({
      latitude: -33.4489,
      longitude: -70.6693,
    })
  })

  it('should patch multiple fields at once', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'PATCH',
      path: `/todos/${todoId}`,
      body: {
        title: 'New title',
        completed: true,
        photoUri: '/images/new.jpg',
      },
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            todoId,
            {
              id: todoId,
              user_id: testUserId,
              title: 'Old title',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: null,
              created_at: now,
              updated_at: now,
            },
          ],
        ]),
      },
    })

    const response = await patchTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.data.title).toBe('New title')
    expect(data.data.completed).toBe(true)
    expect(data.data.photoUri).toBe('/images/new.jpg')
  })

  it('should return 404 if todo not found', async () => {
    const mockContext = createMockContext({
      method: 'PATCH',
      path: '/todos/nonexistent',
      body: {
        title: 'Updated',
      },
      variables: {
        userId: testUserId,
      },
    })

    const response = await patchTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Todo not found')
  })

  it('should update only updatedAt timestamp', async () => {
    const createdAt = new Date('2024-01-01').toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'PATCH',
      path: `/todos/${todoId}`,
      body: {
        completed: true,
      },
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            todoId,
            {
              id: todoId,
              user_id: testUserId,
              title: 'Todo',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: null,
              created_at: createdAt,
              updated_at: createdAt,
            },
          ],
        ]),
      },
    })

    const response = await patchTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data.createdAt).toBe(createdAt)
    expect(data.data.updatedAt).not.toBe(createdAt)
  })

  it('should patch with empty body (only update timestamp)', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'PATCH',
      path: `/todos/${todoId}`,
      body: {},
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            todoId,
            {
              id: todoId,
              user_id: testUserId,
              title: 'Todo',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: null,
              created_at: now,
              updated_at: now,
            },
          ],
        ]),
      },
    })

    const response = await patchTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.data.title).toBe('Todo')
    expect(data.data.completed).toBe(false)
  })
})
