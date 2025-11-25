import { describe, it, expect } from 'vitest'
import { getImageController } from './get.controller'
import { createMockContext } from '../../test/helpers/context.helper'

describe('getImageController', () => {
  it('should return an image successfully', async () => {
    const userId = 'user-123'
    const imageId = 'image-123.jpg'
    const imageKey = `${userId}/${imageId}`

    const mockContext = createMockContext({
      method: 'GET',
      path: `/images/${userId}/${imageId}`,
      r2Data: {
        objects: new Map([
          [
            imageKey,
            {
              key: imageKey,
              size: 1024,
              httpMetadata: {
                contentType: 'image/jpeg',
              },
              body: new ReadableStream(),
            },
          ],
        ]),
      },
    })

    const response = await getImageController(mockContext)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000')
  })

  it('should return 404 if image not found', async () => {
    const userId = 'user-123'
    const imageId = 'nonexistent.jpg'

    const mockContext = createMockContext({
      method: 'GET',
      path: `/images/${userId}/${imageId}`,
    })

    const response = await getImageController(mockContext)
    const text = await response.text()
    const data = JSON.parse(text)

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Imagen no encontrada')
  })

  it('should set default content type if not specified', async () => {
    const userId = 'user-123'
    const imageId = 'image-no-type.jpg'
    const imageKey = `${userId}/${imageId}`

    const mockContext = createMockContext({
      method: 'GET',
      path: `/images/${userId}/${imageId}`,
      r2Data: {
        objects: new Map([
          [
            imageKey,
            {
              key: imageKey,
              size: 1024,
              httpMetadata: {},
              body: new ReadableStream(),
            },
          ],
        ]),
      },
    })

    const response = await getImageController(mockContext)

    expect(response.headers.get('Content-Type')).toBe('application/octet-stream')
  })
})
