import { describe, it, expect } from 'vitest'
import { updateTodoController } from './update.controller'
import { createMockContext, parseJsonResponse } from '../../test/helpers/context.helper'

describe('updateTodoController', () => {
  const testUserId = 'user-123'

  it('should update a todo successfully', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'PUT',
      path: `/todos/${todoId}`,
      body: {
        title: 'Updated title',
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

    const response = await updateTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.title).toBe('Updated title')
    expect(data.data.completed).toBe(true)
  })

  it('should return 404 if todo not found', async () => {
    const mockContext = createMockContext({
      method: 'PUT',
      path: '/todos/nonexistent',
      body: {
        title: 'Updated',
        completed: false,
      },
      variables: {
        userId: testUserId,
      },
    })

    const response = await updateTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Todo not found')
  })

  it('should update location', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'PUT',
      path: `/todos/${todoId}`,
      body: {
        title: 'Todo',
        completed: false,
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

    const response = await updateTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.data.location).toEqual({
      latitude: -33.4489,
      longitude: -70.6693,
    })
  })

  it('should preserve createdAt but update updatedAt', async () => {
    const createdAt = new Date('2024-01-01').toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'PUT',
      path: `/todos/${todoId}`,
      body: {
        title: 'Updated',
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
              title: 'Original',
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

    const response = await updateTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data.createdAt).toBe(createdAt)
    expect(data.data.updatedAt).not.toBe(createdAt)
    expect(new Date(data.data.updatedAt).getTime()).toBeGreaterThan(new Date(createdAt).getTime())
  })
})
