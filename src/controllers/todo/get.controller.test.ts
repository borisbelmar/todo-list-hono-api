import { describe, it, expect } from 'vitest'
import { getTodoController } from './get.controller'
import { createMockContext, parseJsonResponse } from '../../test/helpers/context.helper'

describe('getTodoController', () => {
  const testUserId = 'user-123'

  it('should return a todo by id', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'GET',
      path: `/todos/${todoId}`,
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
              title: 'Test todo',
              completed: 0,
              latitude: 40.7128,
              longitude: -74.006,
              photo_uri: '/images/photo.jpg',
              created_at: now,
              updated_at: now,
            },
          ],
        ]),
      },
    })

    const response = await getTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe(todoId)
    expect(data.data.title).toBe('Test todo')
    expect(data.data.location).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    })
  })

  it('should return 404 if todo not found', async () => {
    const mockContext = createMockContext({
      method: 'GET',
      path: '/todos/nonexistent',
      variables: {
        userId: testUserId,
      },
    })

    const response = await getTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Todo not found')
  })

  it('should convert completed from number to boolean', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'GET',
      path: `/todos/${todoId}`,
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
              title: 'Completed todo',
              completed: 1,
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

    const response = await getTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data.completed).toBe(true)
  })

  it('should not include location when coordinates are null', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'GET',
      path: `/todos/${todoId}`,
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
              title: 'Todo without location',
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

    const response = await getTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data.location).toBeUndefined()
  })

  it('should include photoUri when present', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'GET',
      path: `/todos/${todoId}`,
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
              title: 'Todo with photo',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: '/images/test.jpg',
              created_at: now,
              updated_at: now,
            },
          ],
        ]),
      },
    })

    const response = await getTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data.photoUri).toBe('/images/test.jpg')
  })

  it('should not include photoUri when null', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'GET',
      path: `/todos/${todoId}`,
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
              title: 'Todo without photo',
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

    const response = await getTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data.photoUri).toBeUndefined()
  })
})
