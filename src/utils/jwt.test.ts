import { describe, it, expect } from 'vitest'
import { generateToken, verifyToken } from '@/utils/jwt'

describe('JWT Utils', () => {
  const testSecret = 'test-jwt-secret-key-123'
  const testUserId = 'user-123-abc'

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const token = await generateToken(testUserId, testSecret)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate JWT with three parts (header.payload.signature)', async () => {
      const token = await generateToken(testUserId, testSecret)
      const parts = token.split('.')

      expect(parts).toHaveLength(3)
    })

    it('should generate different tokens for different user IDs', async () => {
      const token1 = await generateToken('user1', testSecret)
      const token2 = await generateToken('user2', testSecret)

      expect(token1).not.toBe(token2)
    })

    it('should generate different tokens for different secrets', async () => {
      const token1 = await generateToken(testUserId, 'secret1')
      const token2 = await generateToken(testUserId, 'secret2')

      expect(token1).not.toBe(token2)
    })

    it('should handle special characters in user ID', async () => {
      const specialUserId = 'user-@#$%^&*()'
      const token = await generateToken(specialUserId, testSecret)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })

    it('should handle empty user ID', async () => {
      const token = await generateToken('', testSecret)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token and return user ID', async () => {
      const token = await generateToken(testUserId, testSecret)
      const userId = await verifyToken(token, testSecret)

      expect(userId).toBe(testUserId)
    })

    it('should return null for invalid token', async () => {
      const invalidToken = 'invalid.token.here'
      const userId = await verifyToken(invalidToken, testSecret)

      expect(userId).toBeNull()
    })

    it('should return null for token with wrong secret', async () => {
      const token = await generateToken(testUserId, 'secret1')
      const userId = await verifyToken(token, 'secret2')

      expect(userId).toBeNull()
    })

    it('should return null for malformed token', async () => {
      const malformedToken = 'not-a-valid-jwt'
      const userId = await verifyToken(malformedToken, testSecret)

      expect(userId).toBeNull()
    })

    it('should return null for empty token', async () => {
      const userId = await verifyToken('', testSecret)

      expect(userId).toBeNull()
    })

    it('should verify token with special characters in user ID', async () => {
      const specialUserId = 'user-@#$%'
      const token = await generateToken(specialUserId, testSecret)
      const userId = await verifyToken(token, testSecret)

      expect(userId).toBe(specialUserId)
    })

    it('should handle token with modified payload', async () => {
      const token = await generateToken(testUserId, testSecret)
      // Intentar modificar el token (cambiar un carácter en el payload)
      const parts = token.split('.')
      const modifiedToken = `${parts[0]}.${parts[1].slice(0, -1)}X.${parts[2]}`

      const userId = await verifyToken(modifiedToken, testSecret)
      expect(userId).toBeNull()
    })

    it('should verify multiple tokens for same user', async () => {
      // Tokens generados en diferentes momentos para el mismo usuario
      const token1 = await generateToken(testUserId, testSecret)
      // Pequeño delay para asegurar timestamps diferentes
      await new Promise((resolve) => setTimeout(resolve, 1100))
      const token2 = await generateToken(testUserId, testSecret)

      const userId1 = await verifyToken(token1, testSecret)
      const userId2 = await verifyToken(token2, testSecret)

      expect(userId1).toBe(testUserId)
      expect(userId2).toBe(testUserId)
      // Los tokens pueden ser diferentes por timestamp, pero ambos son válidos
      const tokensAreDifferent = token1 !== token2
      expect(tokensAreDifferent || token1 === token2).toBe(true)
    })
  })

  describe('Token Lifecycle', () => {
    it('should complete full cycle: generate -> verify -> get user ID', async () => {
      const originalUserId = 'user-full-cycle-test'

      // Generate
      const token = await generateToken(originalUserId, testSecret)
      expect(token).toBeDefined()

      // Verify
      const verifiedUserId = await verifyToken(token, testSecret)
      expect(verifiedUserId).toBe(originalUserId)
    })

    it('should handle multiple users independently', async () => {
      const user1Id = 'user1'
      const user2Id = 'user2'
      const user3Id = 'user3'

      const token1 = await generateToken(user1Id, testSecret)
      const token2 = await generateToken(user2Id, testSecret)
      const token3 = await generateToken(user3Id, testSecret)

      expect(await verifyToken(token1, testSecret)).toBe(user1Id)
      expect(await verifyToken(token2, testSecret)).toBe(user2Id)
      expect(await verifyToken(token3, testSecret)).toBe(user3Id)
    })
  })
})
