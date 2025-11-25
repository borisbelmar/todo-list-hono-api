import { describe, it, expect } from 'vitest'
import { listTodosController } from './list.controller'
import { createMockContext, parseJsonResponse } from '../../test/helpers/context.helper'

describe('listTodosController', () => {
  const testUserId = 'user-123'

  it('should return empty list if no todos exist', async () => {
    const mockContext = createMockContext({
      method: 'GET',
      path: '/todos',
      variables: {
        userId: testUserId,
      },
    })

    const response = await listTodosController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
    expect(data.count).toBe(0)
  })

  it('should return list of todos for user', async () => {
    const now = new Date().toISOString()
    const mockContext = createMockContext({
      method: 'GET',
      path: '/todos',
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            'todo-1',
            {
              id: 'todo-1',
              user_id: testUserId,
              title: 'First todo',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: null,
              created_at: now,
              updated_at: now,
            },
          ],
          [
            'todo-2',
            {
              id: 'todo-2',
              user_id: testUserId,
              title: 'Second todo',
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

    const response = await listTodosController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(data.count).toBe(2)
  })

  it('should only return todos for the authenticated user', async () => {
    const now = new Date().toISOString()
    const mockContext = createMockContext({
      method: 'GET',
      path: '/todos',
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            'todo-1',
            {
              id: 'todo-1',
              user_id: testUserId,
              title: 'My todo',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: null,
              created_at: now,
              updated_at: now,
            },
          ],
          [
            'todo-2',
            {
              id: 'todo-2',
              user_id: 'other-user',
              title: 'Other user todo',
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

    const response = await listTodosController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.data).toHaveLength(1)
    expect(data.data[0].userId).toBe(testUserId)
  })

  it('should convert completed field from number to boolean', async () => {
    const now = new Date().toISOString()
    const mockContext = createMockContext({
      method: 'GET',
      path: '/todos',
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            'todo-1',
            {
              id: 'todo-1',
              user_id: testUserId,
              title: 'Incomplete',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: null,
              created_at: now,
              updated_at: now,
            },
          ],
          [
            'todo-2',
            {
              id: 'todo-2',
              user_id: testUserId,
              title: 'Complete',
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

    const response = await listTodosController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data[0].completed).toBe(false)
    expect(data.data[1].completed).toBe(true)
  })

  it('should include location when latitude and longitude are present', async () => {
    const now = new Date().toISOString()
    const mockContext = createMockContext({
      method: 'GET',
      path: '/todos',
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            'todo-1',
            {
              id: 'todo-1',
              user_id: testUserId,
              title: 'Todo with location',
              completed: 0,
              latitude: 40.7128,
              longitude: -74.006,
              photo_uri: null,
              created_at: now,
              updated_at: now,
            },
          ],
        ]),
      },
    })

    const response = await listTodosController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data[0].location).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    })
  })

  it('should not include location when coordinates are null', async () => {
    const now = new Date().toISOString()
    const mockContext = createMockContext({
      method: 'GET',
      path: '/todos',
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            'todo-1',
            {
              id: 'todo-1',
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

    const response = await listTodosController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data[0].location).toBeUndefined()
  })

  it('should include photoUri when present', async () => {
    const now = new Date().toISOString()
    const mockContext = createMockContext({
      method: 'GET',
      path: '/todos',
      variables: {
        userId: testUserId,
      },
      dbData: {
        todos: new Map([
          [
            'todo-1',
            {
              id: 'todo-1',
              user_id: testUserId,
              title: 'Todo with photo',
              completed: 0,
              latitude: null,
              longitude: null,
              photo_uri: '/images/photo.jpg',
              created_at: now,
              updated_at: now,
            },
          ],
        ]),
      },
    })

    const response = await listTodosController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data[0].photoUri).toBe('/images/photo.jpg')
  })
})
