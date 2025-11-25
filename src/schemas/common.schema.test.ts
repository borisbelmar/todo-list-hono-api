import { describe, it, expect } from 'vitest'
import { errorSchema } from '@/schemas/common.schema'

describe('Common Schemas', () => {
  describe('errorSchema', () => {
    it('should validate correct error response', () => {
      const validData = {
        success: false,
        error: 'Something went wrong',
      }

      const result = errorSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject response with success true', () => {
      const invalidData = {
        success: true,
        error: 'Something went wrong',
      }

      const result = errorSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject response missing error message', () => {
      const invalidData = {
        success: false,
      }

      const result = errorSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject response with invalid error type', () => {
      const invalidData = {
        success: false,
        error: 123, // should be string
      }

      const result = errorSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate different error messages', () => {
      const errorMessages = [
        'Invalid email format',
        'User not found',
        'Unauthorized',
        'Internal server error',
        'File too large',
      ]

      errorMessages.forEach((errorMessage) => {
        const validData = {
          success: false,
          error: errorMessage,
        }

        const result = errorSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })

    it('should accept empty error message', () => {
      const validData = {
        success: false,
        error: '',
      }

      const result = errorSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
