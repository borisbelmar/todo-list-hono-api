import { describe, it, expect } from 'vitest'
import {
  createTodoSchema,
  updateTodoSchema,
  patchTodoSchema,
  todoSchema,
  todoListSchema,
  todoSuccessSchema,
  todoDeleteSchema,
} from '@/schemas/todo.schema'

describe('Todo Schemas', () => {
  describe('createTodoSchema', () => {
    it('should validate todo with title only', () => {
      const validData = {
        title: 'Test Todo',
      }

      const result = createTodoSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.completed).toBe(false) // default value
      }
    })

    it('should validate todo with all fields', () => {
      const validData = {
        title: 'Test Todo',
        description: 'Test Description',
        completed: true,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      }

      const result = createTodoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject missing title', () => {
      const invalidData = {
        description: 'No title',
      }

      const result = createTodoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid location (missing latitude)', () => {
      const invalidData = {
        title: 'Test Todo',
        location: {
          longitude: -74.0060,
        },
      }

      const result = createTodoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid location (missing longitude)', () => {
      const invalidData = {
        title: 'Test Todo',
        location: {
          latitude: 40.7128,
        },
      }

      const result = createTodoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('updateTodoSchema', () => {
    it('should validate complete todo update', () => {
      const validData = {
        title: 'Updated Todo',
        completed: true,
      }

      const result = updateTodoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should apply default value for completed when not provided', () => {
      const validData = {
        title: 'Only title',
      }

      const result = updateTodoSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.completed).toBe(false) // default value
      }
    })
  })

  describe('patchTodoSchema', () => {
    it('should validate partial update with title only', () => {
      const validData = {
        title: 'Updated Title',
      }

      const result = patchTodoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate partial update with completed only', () => {
      const validData = {
        completed: true,
      }

      const result = patchTodoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate partial update with all fields', () => {
      const validData = {
        title: 'Updated Title',
        completed: true,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      }

      const result = patchTodoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should allow empty update (all fields optional)', () => {
      const validData = {}

      const result = patchTodoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('todoSchema', () => {
    it('should validate complete todo object', () => {
      const validData = {
        id: 'todo123',
        userId: 'user123',
        title: 'Test Todo',
        completed: false,
        createdAt: '2025-11-25T12:00:00Z',
        updatedAt: '2025-11-25T12:00:00Z',
      }

      const result = todoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate todo with optional location', () => {
      const validData = {
        id: 'todo123',
        userId: 'user123',
        title: 'Test Todo',
        completed: false,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
        createdAt: '2025-11-25T12:00:00Z',
        updatedAt: '2025-11-25T12:00:00Z',
      }

      const result = todoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate todo with optional photoUri', () => {
      const validData = {
        id: 'todo123',
        userId: 'user123',
        title: 'Test Todo',
        completed: false,
        photoUri: 'https://example.com/photo.jpg',
        createdAt: '2025-11-25T12:00:00Z',
        updatedAt: '2025-11-25T12:00:00Z',
      }

      const result = todoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject todo missing required fields', () => {
      const invalidData = {
        id: 'todo123',
        title: 'Test Todo',
      }

      const result = todoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('todoListSchema', () => {
    it('should validate todo list response', () => {
      const validData = {
        success: true,
        data: [
          {
            id: 'todo1',
            userId: 'user123',
            title: 'Todo 1',
            completed: false,
            createdAt: '2025-11-25T12:00:00Z',
            updatedAt: '2025-11-25T12:00:00Z',
          },
          {
            id: 'todo2',
            userId: 'user123',
            title: 'Todo 2',
            completed: true,
            createdAt: '2025-11-25T12:00:00Z',
            updatedAt: '2025-11-25T12:00:00Z',
          },
        ],
        count: 2,
      }

      const result = todoListSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate empty todo list', () => {
      const validData = {
        success: true,
        data: [],
        count: 0,
      }

      const result = todoListSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject response with success false', () => {
      const invalidData = {
        success: false,
        data: [],
        count: 0,
      }

      const result = todoListSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('todoSuccessSchema', () => {
    it('should validate todo success response', () => {
      const validData = {
        success: true,
        data: {
          id: 'todo123',
          userId: 'user123',
          title: 'Test Todo',
          completed: false,
          createdAt: '2025-11-25T12:00:00Z',
          updatedAt: '2025-11-25T12:00:00Z',
        },
      }

      const result = todoSuccessSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject response with success false', () => {
      const invalidData = {
        success: false,
        data: {
          id: 'todo123',
          userId: 'user123',
          title: 'Test Todo',
          completed: false,
          createdAt: '2025-11-25T12:00:00Z',
          updatedAt: '2025-11-25T12:00:00Z',
        },
      }

      const result = todoSuccessSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('todoDeleteSchema', () => {
    it('should validate todo delete response', () => {
      const validData = {
        success: true,
        data: {
          id: 'todo123',
          userId: 'user123',
          title: 'Deleted Todo',
          completed: false,
          createdAt: '2025-11-25T12:00:00Z',
          updatedAt: '2025-11-25T12:00:00Z',
        },
        message: 'Todo deleted successfully',
      }

      const result = todoDeleteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject response missing message', () => {
      const invalidData = {
        success: true,
        data: {
          id: 'todo123',
          userId: 'user123',
          title: 'Deleted Todo',
          completed: false,
          createdAt: '2025-11-25T12:00:00Z',
          updatedAt: '2025-11-25T12:00:00Z',
        },
      }

      const result = todoDeleteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
