import { vi } from 'vitest'

export interface MockR2Object {
  key: string
  size: number
  httpMetadata?: {
    contentType?: string
  }
  body: ReadableStream
}

export interface MockR2Storage {
  objects: Map<string, MockR2Object>
}

export const createMockR2Bucket = (initialData?: MockR2Storage): R2Bucket => {
  const storage: MockR2Storage = {
    objects: new Map(initialData?.objects || []),
  }

  return {
    put: vi.fn(async (key: string, value: ReadableStream | ArrayBuffer | string, options?: {
      httpMetadata?: {
        contentType?: string
      }
    }) => {
      // Convertir el valor a ReadableStream si no lo es
      let stream: ReadableStream
      let size = 0

      if (value instanceof ReadableStream) {
        stream = value
        // Para el mock, asumimos un tamaño
        size = 1024
      } else if (value instanceof ArrayBuffer) {
        size = value.byteLength
        stream = new ReadableStream({
          start (controller) {
            controller.enqueue(new Uint8Array(value))
            controller.close()
          },
        })
      } else {
        size = value.length
        stream = new ReadableStream({
          start (controller) {
            controller.enqueue(new TextEncoder().encode(value))
            controller.close()
          },
        })
      }

      storage.objects.set(key, {
        key,
        size,
        httpMetadata: options?.httpMetadata,
        body: stream,
      })

      return null as unknown as R2Object
    }),

    get: vi.fn(async (key: string) => {
      const obj = storage.objects.get(key)
      if (!obj) return null

      return {
        key: obj.key,
        size: obj.size,
        httpMetadata: obj.httpMetadata,
        body: obj.body,
      } as unknown as R2ObjectBody
    }),

    delete: vi.fn(async (key: string | string[]) => {
      if (Array.isArray(key)) {
        key.forEach((k) => storage.objects.delete(k))
      } else {
        storage.objects.delete(key)
      }
    }),

    head: vi.fn(async (key: string) => {
      const obj = storage.objects.get(key)
      if (!obj) return null

      return {
        key: obj.key,
        size: obj.size,
        httpMetadata: obj.httpMetadata,
      } as unknown as R2Object
    }),

    list: vi.fn(async () => {
      return {
        objects: Array.from(storage.objects.values()),
        truncated: false,
      } as unknown as R2Objects
    }),
  } as unknown as R2Bucket
}
