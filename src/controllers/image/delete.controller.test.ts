import { describe, it, expect } from 'vitest'
import { deleteImageController } from './delete.controller'
import { createMockContext, parseJsonResponse } from '../../test/helpers/context.helper'

describe('deleteImageController', () => {
  const testUserId = 'user-123'

  it('should delete an image successfully', async () => {
    const userId = testUserId
    const imageId = 'image-123.jpg'
    const imageKey = `${userId}/${imageId}`

    const mockContext = createMockContext({
      method: 'DELETE',
      path: `/images/${userId}/${imageId}`,
      variables: {
        userId: testUserId,
      },
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

    const response = await deleteImageController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.message).toBe('Imagen eliminada exitosamente')
  })

  it('should return 403 if user tries to delete another user image', async () => {
    const userId = 'other-user'
    const imageId = 'image-123.jpg'

    const mockContext = createMockContext({
      method: 'DELETE',
      path: `/images/${userId}/${imageId}`,
      variables: {
        userId: testUserId,
      },
    })

    const response = await deleteImageController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.error).toBe('No tienes permisos para eliminar esta imagen')
  })

  it('should return 404 if image not found', async () => {
    const userId = testUserId
    const imageId = 'nonexistent.jpg'

    const mockContext = createMockContext({
      method: 'DELETE',
      path: `/images/${userId}/${imageId}`,
      variables: {
        userId: testUserId,
      },
    })

    const response = await deleteImageController(mockContext)
    const data = await parseJsonResponse(response)

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Imagen no encontrada')
  })
})
