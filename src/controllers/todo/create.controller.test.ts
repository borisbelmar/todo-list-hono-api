import { describe, it, expect } from 'vitest'
import { createTodoController } from './create.controller'
import { createMockContext, parseJsonResponse } from '../../test/helpers/context.helper'

describe('createTodoController', () => {
  const testUserId = 'user-123'

  it('should create a new todo successfully', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/todos',
      body: {
        title: 'Test todo',
        completed: false,
      },
      variables: {
        userId: testUserId,
      },
    })

    const response = await createTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('id')
    expect(data.data.title).toBe('Test todo')
    expect(data.data.completed).toBe(false)
    expect(data.data.userId).toBe(testUserId)
    expect(data.data).toHaveProperty('createdAt')
    expect(data.data).toHaveProperty('updatedAt')
  })

  it('should create a todo with location', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/todos',
      body: {
        title: 'Todo with location',
        completed: false,
        location: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
      variables: {
        userId: testUserId,
      },
    })

    const response = await createTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.data.location).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    })
  })

  it('should create a todo with photoUri', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/todos',
      body: {
        title: 'Todo with photo',
        photoUri: '/images/user-123/photo.jpg',
      },
      variables: {
        userId: testUserId,
      },
    })

    const response = await createTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.data.photoUri).toBe('/images/user-123/photo.jpg')
  })

  it('should default completed to false if not provided', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/todos',
      body: {
        title: 'Test todo',
      },
      variables: {
        userId: testUserId,
      },
    })

    const response = await createTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.data.completed).toBe(false)
  })

  it('should create todo with all optional fields', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/todos',
      body: {
        title: 'Complete todo',
        completed: true,
        location: {
          latitude: -33.4489,
          longitude: -70.6693,
        },
        photoUri: '/images/user-123/complete.jpg',
      },
      variables: {
        userId: testUserId,
      },
    })

    const response = await createTodoController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.data).toEqual({
      id: expect.any(String),
      userId: testUserId,
      title: 'Complete todo',
      completed: true,
      location: {
        latitude: -33.4489,
        longitude: -70.6693,
      },
      photoUri: '/images/user-123/complete.jpg',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  it('should generate unique IDs for different todos', async () => {
    const mockContext1 = createMockContext({
      method: 'POST',
      path: '/todos',
      body: {
        title: 'First todo',
      },
      variables: {
        userId: testUserId,
      },
    })

    const mockContext2 = createMockContext({
      method: 'POST',
      path: '/todos',
      body: {
        title: 'Second todo',
      },
      variables: {
        userId: testUserId,
      },
    })

    const response1 = await createTodoController(mockContext1)
    const response2 = await createTodoController(mockContext2)

    const data1 = await parseJsonResponse(response1)
    const data2 = await parseJsonResponse(response2)

    expect(data1.data.id).not.toBe(data2.data.id)
  })
})
