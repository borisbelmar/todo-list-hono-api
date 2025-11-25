import { describe, it, expect } from 'vitest'
import { uploadImageController } from './upload.controller'
import { createMockContext, parseJsonResponse } from '../../test/helpers/context.helper'

describe('uploadImageController', () => {
  const testUserId = 'user-123'

  it('should upload an image successfully', async () => {
    const imageFile = new File(['fake image content'], 'test.jpg', { type: 'image/jpeg' })

    const mockContext = createMockContext({
      method: 'POST',
      path: '/images',
      body: {
        image: imageFile,
      },
      variables: {
        userId: testUserId,
      },
    })

    const response = await uploadImageController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('url')
    expect(data.data).toHaveProperty('key')
    expect(data.data).toHaveProperty('size')
    expect(data.data).toHaveProperty('contentType')
    expect(data.data.contentType).toBe('image/jpeg')
    expect(data.data.url).toContain('/images/')
    expect(data.data.key).toContain(testUserId)
  })

  it('should return error if no image provided', async () => {
    const mockContext = createMockContext({
      method: 'POST',
      path: '/images',
      body: {},
      variables: {
        userId: testUserId,
      },
    })

    const response = await uploadImageController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Se requiere una imagen')
  })

  it('should return error if file is not an image', async () => {
    const textFile = new File(['text content'], 'test.txt', { type: 'text/plain' })

    const mockContext = createMockContext({
      method: 'POST',
      path: '/images',
      body: {
        image: textFile,
      },
      variables: {
        userId: testUserId,
      },
    })

    const response = await uploadImageController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('El archivo debe ser una imagen')
  })

  it('should return error if image exceeds max size', async () => {
    // Crear un archivo de más de 5MB (simulado con size property)
    const largeImageFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

    const mockContext = createMockContext({
      method: 'POST',
      path: '/images',
      body: {
        image: largeImageFile,
      },
      variables: {
        userId: testUserId,
      },
    })

    const response = await uploadImageController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('La imagen no puede pesar más de 5MB')
  })

  it('should accept different image formats', async () => {
    const formats = [
      { name: 'test.png', type: 'image/png' },
      { name: 'test.gif', type: 'image/gif' },
      { name: 'test.webp', type: 'image/webp' },
    ]

    for (const format of formats) {
      const imageFile = new File(['fake image'], format.name, { type: format.type })

      const mockContext = createMockContext({
        method: 'POST',
        path: '/images',
        body: {
          image: imageFile,
        },
        variables: {
          userId: testUserId,
        },
      })

      const response = await uploadImageController(mockContext)
      const data = await parseJsonResponse(response)

      expect(response.status).toBe(201)
      expect(data.data.contentType).toBe(format.type)
    }
  })
})
