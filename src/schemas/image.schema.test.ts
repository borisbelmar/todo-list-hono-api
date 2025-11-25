import { describe, it, expect } from 'vitest'
import { imageSuccessSchema, imageDeleteSchema } from '@/schemas/image.schema'

describe('Image Schemas', () => {
  describe('imageSuccessSchema', () => {
    it('should validate correct image success response', () => {
      const validData = {
        success: true,
        data: {
          url: '/images/user123/abc123.png',
          key: 'user123/abc123.png',
          size: 102400,
          contentType: 'image/png',
        },
      }

      const result = imageSuccessSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject response with success false', () => {
      const invalidData = {
        success: false,
        data: {
          url: '/images/user123/abc123.png',
          key: 'user123/abc123.png',
          size: 102400,
          contentType: 'image/png',
        },
      }

      const result = imageSuccessSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject response missing url', () => {
      const invalidData = {
        success: true,
        data: {
          key: 'user123/abc123.png',
          size: 102400,
          contentType: 'image/png',
        },
      }

      const result = imageSuccessSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject response missing key', () => {
      const invalidData = {
        success: true,
        data: {
          url: '/images/user123/abc123.png',
          size: 102400,
          contentType: 'image/png',
        },
      }

      const result = imageSuccessSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject response with invalid size type', () => {
      const invalidData = {
        success: true,
        data: {
          url: '/images/user123/abc123.png',
          key: 'user123/abc123.png',
          size: '102400', // should be number
          contentType: 'image/png',
        },
      }

      const result = imageSuccessSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept different image content types', () => {
      const contentTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']

      contentTypes.forEach((contentType) => {
        const validData = {
          success: true,
          data: {
            url: '/images/user123/abc123.png',
            key: 'user123/abc123.png',
            size: 102400,
            contentType,
          },
        }

        const result = imageSuccessSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('imageDeleteSchema', () => {
    it('should validate correct image delete response', () => {
      const validData = {
        success: true,
        data: {
          message: 'Image deleted successfully',
        },
      }

      const result = imageDeleteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject response with success false', () => {
      const invalidData = {
        success: false,
        data: {
          message: 'Image deleted successfully',
        },
      }

      const result = imageDeleteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject response missing message', () => {
      const invalidData = {
        success: true,
        data: {},
      }

      const result = imageDeleteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject response with invalid message type', () => {
      const invalidData = {
        success: true,
        data: {
          message: 123, // should be string
        },
      }

      const result = imageDeleteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
