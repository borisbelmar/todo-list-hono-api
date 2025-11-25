import { describe, it, expect, vi } from 'vitest'
import { authMiddleware } from './auth.middleware'
import { createMockContext } from '../test/helpers/context.helper'
import { generateToken } from '../utils/jwt'

describe('authMiddleware', () => {
  const testSecret = 'test-secret-key'
  const testUserId = 'user-123'

  it('should pass authentication with valid token', async () => {
    const token = await generateToken(testUserId, testSecret)
    const next = vi.fn()

    const mockContext = createMockContext({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      bindings: {
        JWT_SECRET: testSecret,
      },
    })

    await authMiddleware(mockContext, next)

    expect(next).toHaveBeenCalledOnce()
    expect(mockContext.set).toHaveBeenCalledWith('userId', testUserId)
  })

  it('should return 401 if no authorization header', async () => {
    const next = vi.fn()

    const mockContext = createMockContext({})

    const response = await authMiddleware(mockContext, next)

    if (!response) {
      throw new Error('Response is undefined')
    }

    const text = await response.text()
    const data = JSON.parse(text)

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Missing or invalid authorization header')
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 if authorization header does not start with Bearer', async () => {
    const next = vi.fn()

    const mockContext = createMockContext({
      headers: {
        Authorization: 'Basic sometoken',
      },
    })

    const response = await authMiddleware(mockContext, next)

    if (!response) {
      throw new Error('Response is undefined')
    }

    const text = await response.text()
    const data = JSON.parse(text)

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Missing or invalid authorization header')
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 if token is invalid', async () => {
    const next = vi.fn()

    const mockContext = createMockContext({
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    })

    const response = await authMiddleware(mockContext, next)

    if (!response) {
      throw new Error('Response is undefined')
    }

    const text = await response.text()
    const data = JSON.parse(text)

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid or expired token')
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 if token is expired or malformed', async () => {
    const next = vi.fn()

    const mockContext = createMockContext({
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
      },
    })

    const response = await authMiddleware(mockContext, next)

    if (!response) {
      throw new Error('Response is undefined')
    }

    const text = await response.text()
    const data = JSON.parse(text)

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid or expired token')
    expect(next).not.toHaveBeenCalled()
  })

  it('should set userId in context', async () => {
    const token = await generateToken(testUserId, testSecret)
    const next = vi.fn()

    const mockContext = createMockContext({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    await authMiddleware(mockContext, next)

    expect(mockContext.set).toHaveBeenCalledWith('userId', testUserId)
  })

  it('should extract token correctly from Bearer header', async () => {
    const token = await generateToken(testUserId, testSecret)
    const next = vi.fn()

    const mockContext = createMockContext({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    await authMiddleware(mockContext, next)

    expect(next).toHaveBeenCalled()
  })
})
