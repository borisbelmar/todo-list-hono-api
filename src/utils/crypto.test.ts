import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/utils/crypto'

describe('Crypto Utils', () => {
  const testSalt = 'test-salt-123'

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'mySecretPassword123'
      const hash = await hashPassword(password, testSalt)

      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should produce different hashes for different passwords', async () => {
      const password1 = 'password1'
      const password2 = 'password2'

      const hash1 = await hashPassword(password1, testSalt)
      const hash2 = await hashPassword(password2, testSalt)

      expect(hash1).not.toBe(hash2)
    })

    it('should produce same hash for same password and salt', async () => {
      const password = 'consistentPassword'

      const hash1 = await hashPassword(password, testSalt)
      const hash2 = await hashPassword(password, testSalt)

      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes with different salts', async () => {
      const password = 'samePassword'
      const salt1 = 'salt1'
      const salt2 = 'salt2'

      const hash1 = await hashPassword(password, salt1)
      const hash2 = await hashPassword(password, salt2)

      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty password', async () => {
      const password = ''
      const hash = await hashPassword(password, testSalt)

      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
    })

    it('should handle special characters in password', async () => {
      const password = 'p@ssw0rd!#$%^&*()'
      const hash = await hashPassword(password, testSalt)

      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
    })

    it('should produce hex string output', async () => {
      const password = 'testPassword'
      const hash = await hashPassword(password, testSalt)

      // Hex string should only contain 0-9 and a-f
      expect(hash).toMatch(/^[0-9a-f]+$/)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'correctPassword'
      const hash = await hashPassword(password, testSalt)

      const isValid = await verifyPassword(password, hash, testSalt)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'correctPassword'
      const wrongPassword = 'wrongPassword'
      const hash = await hashPassword(password, testSalt)

      const isValid = await verifyPassword(wrongPassword, hash, testSalt)
      expect(isValid).toBe(false)
    })

    it('should reject password with wrong salt', async () => {
      const password = 'testPassword'
      const salt1 = 'salt1'
      const salt2 = 'salt2'
      const hash = await hashPassword(password, salt1)

      const isValid = await verifyPassword(password, hash, salt2)
      expect(isValid).toBe(false)
    })

    it('should handle empty password verification', async () => {
      const password = ''
      const hash = await hashPassword(password, testSalt)

      const isValid = await verifyPassword(password, hash, testSalt)
      expect(isValid).toBe(true)
    })

    it('should be case sensitive', async () => {
      const password = 'Password123'
      const hash = await hashPassword(password, testSalt)

      const isValid = await verifyPassword('password123', hash, testSalt)
      expect(isValid).toBe(false)
    })

    it('should handle special characters correctly', async () => {
      const password = 'p@ssw0rd!#$%'
      const hash = await hashPassword(password, testSalt)

      const isValid = await verifyPassword(password, hash, testSalt)
      expect(isValid).toBe(true)
    })
  })
})
