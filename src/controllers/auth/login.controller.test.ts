import { describe, it, expect } from 'vitest'
import { loginController } from './login.controller'
import { createMockContext, parseJsonResponse } from '../../test/helpers/context.helper'
import { hashPassword } from '../../utils/crypto'

describe('loginController', () => {
  const testEmail = 'test@example.com'
  const testPassword = 'password123'
  const testSalt = 'test-salt'

  it('should login successfully with correct credentials', async () => {
    const passwordHash = await hashPassword(testPassword, testSalt)
    const userId = 'user-123'

    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/login',
      body: {
        email: testEmail,
        password: testPassword,
      },
      dbData: {
        users: new Map([
          [
            userId,
            {
              id: userId,
              email: testEmail,
              password_hash: passwordHash,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        ]),
      },
    })

    const response = await loginController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('user')
    expect(data.data).toHaveProperty('token')
    expect(data.data.user.email).toBe(testEmail)
    expect(data.data.user.id).toBe(userId)
    expect(typeof data.data.token).toBe('string')
  })

  it('should return error if user does not exist', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/login',
      body: {
        email: 'nonexistent@example.com',
        password: testPassword,
      },
    })

    const response = await loginController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should return error if password is incorrect', async () => {
    const passwordHash = await hashPassword(testPassword, testSalt)
    const userId = 'user-123'

    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/login',
      body: {
        email: testEmail,
        password: 'wrongpassword',
      },
      dbData: {
        users: new Map([
          [
            userId,
            {
              id: userId,
              email: testEmail,
              password_hash: passwordHash,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        ]),
      },
    })

    const response = await loginController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should normalize email to lowercase on login', async () => {
    const passwordHash = await hashPassword(testPassword, testSalt)
    const userId = 'user-123'

    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/login',
      body: {
        email: 'Test@Example.COM',
        password: testPassword,
      },
      dbData: {
        users: new Map([
          [
            userId,
            {
              id: userId,
              email: testEmail,
              password_hash: passwordHash,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        ]),
      },
    })

    const response = await loginController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.data.user.email).toBe(testEmail)
  })

  it('should not expose password hash in response', async () => {
    const passwordHash = await hashPassword(testPassword, testSalt)
    const userId = 'user-123'

    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/login',
      body: {
        email: testEmail,
        password: testPassword,
      },
      dbData: {
        users: new Map([
          [
            userId,
            {
              id: userId,
              email: testEmail,
              password_hash: passwordHash,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        ]),
      },
    })

    const response = await loginController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.data.user).not.toHaveProperty('password')
    expect(data.data.user).not.toHaveProperty('password_hash')
  })

  it('should return user data with correct structure', async () => {
    const passwordHash = await hashPassword(testPassword, testSalt)
    const userId = 'user-123'
    const now = new Date().toISOString()

    const mockContext = createMockContext({
      method: 'POST',
      path: '/auth/login',
      body: {
        email: testEmail,
        password: testPassword,
      },
      dbData: {
        users: new Map([
          [
            userId,
            {
              id: userId,
              email: testEmail,
              password_hash: passwordHash,
              created_at: now,
              updated_at: now,
            },
          ],
        ]),
      },
    })

    const response = await loginController(mockContext)
    const data = await parseJsonResponse(response)

    expect(data.data.user).toEqual({
      id: userId,
      email: testEmail,
      createdAt: now,
      updatedAt: now,
    })
  })
})
