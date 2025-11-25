import { describe, it, expect } from 'vitest'
import { deleteTodoController } from './delete.controller'
import { createMockContext, parseJsonResponse } from '../../test/helpers/context.helper'

describe('deleteTodoController', () => {
  const testUserId = 'user-123'

  it('should delete a todo successfully', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'DELETE',
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
              title: 'To be deleted',
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

    const response = await deleteTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Todo deleted successfully')
    expect(data.data.id).toBe(todoId)
  })

  it('should return 404 if todo not found', async () => {
    const mockContext = createMockContext({
      method: 'DELETE',
      path: '/todos/nonexistent',
      variables: {
        userId: testUserId,
      },
    })

    const response = await deleteTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Todo not found')
  })

  it('should return the deleted todo data', async () => {
    const now = new Date().toISOString()
    const todoId = 'todo-123'

    const mockContext = createMockContext({
      method: 'DELETE',
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
              title: 'Todo with data',
              completed: 1,
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

    const response = await deleteTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data).toEqual({
      id: todoId,
      userId: testUserId,
      title: 'Todo with data',
      completed: true,
      location: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      photoUri: '/images/photo.jpg',
      createdAt: now,
      updatedAt: now,
    })
  })
})
