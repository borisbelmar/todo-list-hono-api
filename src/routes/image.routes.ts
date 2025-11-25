import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { authMiddleware } from '../middleware/auth.middleware'
import { uploadImageController } from '../controllers/image/upload.controller'
import { getImageController } from '../controllers/image/get.controller'
import { deleteImageController } from '../controllers/image/delete.controller'

type Bindings = {
  IMAGES: R2Bucket
}

type Variables = {
  userId: string
}

const imageRouter = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

// Middleware de autenticación para todas las rutas
imageRouter.use('/*', authMiddleware)

// Schemas
const ImageSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    url: z.string(),
    key: z.string(),
    size: z.number(),
    contentType: z.string(),
  }),
})

const ImageDeleteSchema = z.object({
  success: z.literal(true),
  data: z.object({
    message: z.string(),
  }),
})

const ErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})

// POST / - Subir imagen
const uploadImageRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Images'],
  summary: 'Subir imagen',
  description: 'Sube una imagen a Cloudflare R2 (máx. 5MB, formatos: JPEG, PNG, WebP, GIF)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            image: z
              .any()
              .openapi({
                type: 'string',
                format: 'binary',
                description: 'Archivo de imagen (JPEG, PNG, WebP o GIF, máx. 5MB)',
              }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Imagen subida exitosamente',
      content: {
        'application/json': {
          schema: ImageSuccessSchema,
        },
      },
    },
    400: {
      description: 'Archivo inválido o muy grande',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: 'No autenticado',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Error del servidor',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

imageRouter.openapi(uploadImageRoute, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await uploadImageController(c) as any
})

// GET /:userId/:imageId - Obtener imagen
const getImageRoute = createRoute({
  method: 'get',
  path: '/{userId}/{imageId}',
  tags: ['Images'],
  summary: 'Obtener imagen',
  description: 'Descarga una imagen desde Cloudflare R2',
  request: {
    params: z.object({
      userId: z.string().openapi({ example: 'user123' }),
      imageId: z.string().openapi({ example: 'abc123.jpg' }),
    }),
  },
  responses: {
    200: {
      description: 'Imagen encontrada',
      content: {
        'image/*': {
          schema: z.any().openapi({
            type: 'string',
            format: 'binary',
          }),
        },
      },
    },
    404: {
      description: 'Imagen no encontrada',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Error del servidor',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

imageRouter.openapi(getImageRoute, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await getImageController(c as any) as any
})

// DELETE /:userId/:imageId - Eliminar imagen
const deleteImageRoute = createRoute({
  method: 'delete',
  path: '/{userId}/{imageId}',
  tags: ['Images'],
  summary: 'Eliminar imagen',
  description: 'Elimina una imagen desde Cloudflare R2 (solo el propietario)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      userId: z.string().openapi({ example: 'user123' }),
      imageId: z.string().openapi({ example: 'abc123.jpg' }),
    }),
  },
  responses: {
    200: {
      description: 'Imagen eliminada',
      content: {
        'application/json': {
          schema: ImageDeleteSchema,
        },
      },
    },
    403: {
      description: 'Sin permisos para eliminar',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: 'Imagen no encontrada',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: 'No autenticado',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Error del servidor',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

imageRouter.openapi(deleteImageRoute, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await deleteImageController(c) as any
})

export default imageRouter
