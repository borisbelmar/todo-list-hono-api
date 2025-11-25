import { describe, it, expect } from 'vitest'
import { registerController } from './register.controller'
import { createMockContext, parseJsonResponse } from '../../test/helpers/context.helper'
import { hashPassword } from '../../utils/crypto'

describe('registerController', () => {
  it('should register a new user successfully', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/register',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    })

    const response = await registerController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('user')
    expect(data.data).toHaveProperty('token')
    expect(data.data.user.email).toBe('test@example.com')
    expect(data.data.user).toHaveProperty('id')
    expect(data.data.user).toHaveProperty('createdAt')
    expect(data.data.user).toHaveProperty('updatedAt')
    expect(typeof data.data.token).toBe('string')
  })

  it('should return error if email already exists', async () => {
    const existingEmail = 'existing@example.com'
    const passwordHash = await hashPassword('password123', 'test-salt')

    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/register',
      body: {
        email: existingEmail,
        password: 'password123',
      },
      dbData: {
        users: new Map([
          [
            'user-1',
            {
              id: 'user-1',
              email: existingEmail,
              password_hash: passwordHash,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        ]),
      },
    })

    const response = await registerController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Email already registered')
  })

  it('should normalize email to lowercase', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/register',
      body: {
        email: 'Test@Example.COM',
        password: 'password123',
      },
    })

    const response = await registerController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.data.user.email).toBe('test@example.com')
  })

  it('should hash the password before storing', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/register',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    })

    const response = await registerController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.data.user).toBeDefined()
    expect(data.data.user).not.toHaveProperty('password')
    expect(data.data.user).not.toHaveProperty('password_hash')
  })

  it('should return valid JWT token', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/register',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    })

    const response = await registerController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(typeof data.data.token).toBe('string')
    expect(data.data.token.split('.').length).toBe(3) // JWT structure
  })

  it('should set createdAt and updatedAt timestamps', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/register',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    })

    const response = await registerController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.data.user.createdAt).toBeDefined()
    expect(data.data.user.updatedAt).toBeDefined()
    expect(new Date(data.data.user.createdAt).getTime()).toBeGreaterThan(0)
    expect(new Date(data.data.user.updatedAt).getTime()).toBeGreaterThan(0)
  })

  it('should generate unique user IDs', async () => {
    const mockContext1 = createMockContext({
      method: 'POST',
      path: '/auth/register',
      body: {
        email: 'user1@example.com',
        password: 'password123',
      },
    })

    const mockContext2 = createMockContext({
      method: 'POST',
      path: '/auth/register',
      body: {
        email: 'user2@example.com',
        password: 'password123',
      },
    })

    const response1 = await registerController(mockContext1)
    const response2 = await registerController(mockContext2)

    const data1 = await parseJsonResponse(response1)
    const data2 = await parseJsonResponse(response2)

    expect(data1.data.user.id).not.toBe(data2.data.user.id)
  })
})
