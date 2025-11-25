import { describe, it, expect } from 'vitest'
import { registerInputSchema, loginInputSchema, authSuccessSchema } from '@/schemas/auth.schema'

describe('Auth Schemas', () => {
  describe('registerInputSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
      }

      const result = registerInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Password123!',
      }

      const result = registerInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
      }

      const result = registerInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing email', () => {
      const invalidData = {
        password: 'Password123!',
      }

      const result = registerInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      }

      const result = registerInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('loginInputSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
      }

      const result = loginInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Password123!',
      }

      const result = loginInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('authSuccessSchema', () => {
    it('should validate correct auth success response', () => {
      const validData = {
        success: true,
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          userId: 'user123',
        },
      }

      const result = authSuccessSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject response with success false', () => {
      const invalidData = {
        success: false,
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          userId: 'user123',
        },
      }

      const result = authSuccessSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject response missing token', () => {
      const invalidData = {
        success: true,
        data: {
          userId: 'user123',
        },
      }

      const result = authSuccessSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject response missing userId', () => {
      const invalidData = {
        success: true,
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      }

      const result = authSuccessSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject response with invalid token type', () => {
      const invalidData = {
        success: true,
        data: {
          token: 123, // should be string
          userId: 'user123',
        },
      }

      const result = authSuccessSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
