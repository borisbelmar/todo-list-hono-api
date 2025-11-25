# Basic Todo List API with Hono

API REST completa construida con Hono, TypeScript, Cloudflare Workers y D1 Database.

## 🚀 Características

- ✅ **Autenticación JWT** con scrypt-js para hashing de passwords
- 🔒 **Sistema de usuarios** con registro y login
- 📝 **CRUD de Todos** privado por usuario (aislamiento de datos)
- 🖼️ **Gestión de imágenes** con Cloudflare R2 (upload, download, delete)
- 🧹 **Limpieza automática** de imágenes huérfanas al actualizar/eliminar todos
- 🗄️ **Cloudflare D1** como base de datos serverless (SQLite)
- ✨ **Validación con Zod** en todas las rutas
- 📖 **Documentación OpenAPI/Swagger** interactiva con autenticación global
- 🎯 **TypeScript** con ESLint (Standard JS)
- ⚡ **Desplegable en Cloudflare Workers**
- 🔑 **Manejo seguro de secretos** con variables de entorno
- 🚀 **CI/CD** con GitHub Actions para despliegue automático
- 🏗️ **Arquitectura MVC** con controladores separados
- 📦 **Estructura modular** con schemas y rutas OpenAPI organizadas

## 📋 Stack Tecnológico

- **Framework:** Hono con OpenAPIHono
- **Documentación:** Swagger UI + OpenAPI 3.0
- **Runtime:** Cloudflare Workers
- **Base de datos:** Cloudflare D1 (SQLite)
- **Almacenamiento:** Cloudflare R2 (imágenes)
- **Autenticación:** JWT (jose) + scrypt-js
- **Validación:** Zod + @hono/zod-openapi
- **Testing:** Vitest 3.2.4 con UI y Coverage (v8)
- **IDs:** nanoid
- **Linting:** ESLint (Standard JS)
- **Package Manager:** Yarn

## 📁 Estructura del Proyecto

```
src/
├── controllers/          # Lógica de negocio (MVC)
│   ├── auth/            # Registro y login
│   ├── todo/            # CRUD de todos (6 controladores)
│   └── image/           # Gestión de imágenes R2 (3 controladores)
├── openapi/             # Definiciones OpenAPI separadas
│   ├── schemas/         # Schemas Zod reutilizables
│   │   ├── auth.schemas.ts
│   │   ├── todo.schemas.ts
│   │   └── image.schemas.ts
│   └── routes/          # Definiciones createRoute()
│       ├── auth.routes.openapi.ts
│       ├── todo.routes.openapi.ts
│       └── image.routes.openapi.ts
├── routes/              # Routers Hono (un archivo por endpoint)
│   ├── auth/
│   │   ├── index.ts           # Router principal de auth
│   │   ├── register.route.ts  # Definición de /register
│   │   └── login.route.ts     # Definición de /login
│   ├── todo/
│   │   ├── index.ts           # Router principal de todos
│   │   ├── list.route.ts      # GET /todos
│   │   ├── get.route.ts       # GET /todos/:id
│   │   ├── create.route.ts    # POST /todos
│   │   ├── update.route.ts    # PUT /todos/:id
│   │   ├── patch.route.ts     # PATCH /todos/:id
│   │   └── delete.route.ts    # DELETE /todos/:id
│   └── image/
│       ├── index.ts           # Router principal de imágenes
│       ├── upload.route.ts    # POST /images
│       ├── get.route.ts       # GET /images/:userId/:imageId
│       └── delete.route.ts    # DELETE /images/:userId/:imageId
├── middleware/          # Middlewares (auth JWT)
├── schemas/             # Schemas de validación runtime
├── types/               # Tipos TypeScript
├── utils/               # Utilidades (JWT, crypto, R2)
└── index.ts             # Entry point + configuración OpenAPI global
```

## 🛠️ Instalación y Desarrollo

### Prerequisitos

- Node.js 18+
- Yarn
- Cuenta de Cloudflare (para deploy)

### Configuración Inicial

```bash
# Instalar dependencias
yarn install

# Configurar variables de entorno (crear .dev.vars)
cp .dev.vars.example .dev.vars  # Editar con tus valores
```

### Variables de Entorno

Crear archivo `.dev.vars` en la raíz:

```bash
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
PASSWORD_SALT=dev-password-salt-change-in-production
```

### Base de Datos Local

```bash
# Crear base de datos D1
npx wrangler d1 create basic-hono-todos-db

# Ejecutar migraciones (en orden)
npx wrangler d1 execute basic-hono-todos-db --local --file=./migrations/001_create_todos_table.sql
npx wrangler d1 execute basic-hono-todos-db --local --file=./migrations/002_create_users_table.sql
npx wrangler d1 execute basic-hono-todos-db --local --file=./migrations/003_add_user_id_to_todos.sql
```

### Comandos Disponibles

```bash
# Desarrollo local
yarn dev

# Testing
yarn test              # Ejecutar tests en watch mode
yarn test --run        # Ejecutar tests una vez
yarn test:ui           # Abrir UI interactivo con coverage
yarn test:coverage     # Generar reporte de coverage

# Linting
yarn lint
yarn lint:fix

# Deploy a producción
yarn deploy
```

## 📚 API Reference

### 📖 Documentación Interactiva

La API incluye documentación interactiva con Swagger UI y esquema de autenticación global:

- **Swagger UI:** [http://localhost:8787/docs](http://localhost:8787/docs) (desarrollo)
- **Swagger UI Producción:** [https://basic-hono-api.borisbelmarm.workers.dev/docs](https://basic-hono-api.borisbelmarm.workers.dev/docs)
- **OpenAPI JSON:** `/openapi.json`

**Características de la documentación:**
- ✨ Explorar todos los endpoints disponibles
- 📝 Esquemas de request/response con Zod
- 🧪 Probar las rutas directamente desde el navegador
- 🔐 **Autenticación global:** Botón "Authorize" para configurar el token JWT una sola vez
- 🏷️ Endpoints organizados por tags (Auth, Todos, Images)
- 📋 Ejemplos de uso en cada endpoint

### Base URL

- **Local:** `http://localhost:8787`
- **Producción:** `https://basic-hono-api.borisbelmarm.workers.dev`

### Endpoints Públicos

#### Healthcheck

```bash
GET /health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T10:00:00.000Z"
}
```

#### Información de la API

```bash
GET /
```

**Respuesta:**
```json
{
  "message": "Bienvenido a la API con Hono",
  "documentation": "/docs",
  "openapi": "/openapi.json",
  "endpoints": {
    "health": "/health",
    "auth": {
      "register": "/auth/register",
      "login": "/auth/login"
    },
    "todos": "/todos (requiere autenticación)",
    "images": "/images (requiere autenticación)"
  }
}
```
```

---

### 🔐 Autenticación

**Todas las rutas protegidas requieren:**
```
Authorization: Bearer {token}
```

**En Swagger UI:** Usa el botón "Authorize" (🔒) en la parte superior para configurar el token una sola vez. Se aplicará automáticamente a todos los endpoints protegidos.

#### Registrar Usuario

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validaciones:**
- Email válido
- Password mínimo 6 caracteres

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "abc123",
      "email": "user@example.com",
      "createdAt": "2025-11-24T10:00:00.000Z",
      "updatedAt": "2025-11-24T10:00:00.000Z"
    },
    "token": "eyJhbGc..."
  }
}
```

#### Iniciar Sesión

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* mismo formato que register */ },
    "token": "eyJhbGc..."
  }
}
```

---

### 📝 Todos (Requiere Autenticación)

**Todas las rutas de todos requieren el header:**
```
Authorization: Bearer {token}
```

#### Listar Todos del Usuario

```bash
GET /todos
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "xyz789",
      "userId": "abc123",
      "title": "Comprar leche",
      "completed": false,
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "photoUri": "https://example.com/photo.jpg",
      "createdAt": "2025-11-24T10:00:00.000Z",
      "updatedAt": "2025-11-24T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### Obtener Todo por ID

```bash
GET /todos/:id
Authorization: Bearer {token}
```

#### Crear Todo

```bash
POST /todos
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Comprar leche",
  "completed": false,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "photoUri": "https://example.com/photo.jpg"
}
```

**Validaciones:**
- `title`: string, requerido, mínimo 1 carácter
- `completed`: boolean, opcional (default: false)
- `location.latitude`: number, -90 a 90
- `location.longitude`: number, -180 a 180
- `photoUri`: string, URL válida, opcional

#### Actualizar Todo (PUT - Reemplazo Completo)

```bash
PUT /todos/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Comprar pan",
  "completed": true,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "photoUri": "https://example.com/new-photo.jpg"
}
```

#### Actualizar Todo (PATCH - Parcial)

```bash
PATCH /todos/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "completed": true
}
```

**Nota:** Al menos un campo debe ser proporcionado

#### Eliminar Todo

```bash
DELETE /todos/:id
Authorization: Bearer {token}
```

---

### 🖼️ Imágenes (Requiere Autenticación)

**Todas las rutas de imágenes requieren el header:**
```
Authorization: Bearer {token}
```

#### Subir Imagen

```bash
POST /images
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  image: [archivo de imagen]
```

**Validaciones:**
- Tamaño máximo: 5MB
- Formatos permitidos: JPEG, PNG, WebP, GIF

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "url": "/images/abc123/xyz789.jpg",
    "key": "abc123/xyz789.jpg",
    "size": 245678,
    "contentType": "image/jpeg"
  }
}
```

#### Obtener Imagen

```bash
GET /images/:userId/:imageId
Authorization: Bearer {token}
```

**Respuesta:** Archivo de imagen con headers de cache

#### Eliminar Imagen

```bash
DELETE /images/:userId/:imageId
Authorization: Bearer {token}
```

**Nota:** Solo el dueño de la imagen puede eliminarla.

**🧹 Limpieza automática:**
- Al actualizar el `photoUri` de un todo, la imagen anterior se elimina automáticamente de R2
- Al eliminar un todo, su imagen asociada se elimina automáticamente de R2
- Previene acumulación de archivos huérfanos

---

### Formato de Respuestas

#### Éxito
```json
{
  "success": true,
  "data": { /* objeto o array */ }
}
```

#### Error
```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

#### Códigos de Estado HTTP

- `200` - OK
- `201` - Creado
- `400` - Bad Request (validación fallida)
- `401` - No autorizado (token inválido/ausente)
- `404` - No encontrado
- `409` - Conflicto (ej: email ya registrado)
- `500` - Error del servidor

---

## 🚀 Deployment

### Configurar Secretos en Producción

Los secretos deben configurarse **una sola vez** en Cloudflare Workers:

```bash
# JWT Secret (generar uno seguro)
npx wrangler secret put JWT_SECRET

# Password Salt (generar uno seguro - NUNCA cambiar después)
npx wrangler secret put PASSWORD_SALT
```

**⚠️ IMPORTANTE:** Una vez configurados, los despliegues automáticos (GitHub Actions) usarán estos secretos.

### Generar Secretos Seguros

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Node.js:**
```javascript
require('crypto').randomBytes(32).toString('base64')
```

### Migrar Base de Datos en Producción

```bash
npx wrangler d1 execute basic-hono-todos-db --remote --file=./migrations/001_create_todos_table.sql
npx wrangler d1 execute basic-hono-todos-db --remote --file=./migrations/002_create_users_table.sql
npx wrangler d1 execute basic-hono-todos-db --remote --file=./migrations/003_add_user_id_to_todos.sql
```

### Deploy Manual

```bash
yarn deploy
```

### Deploy Automático con GitHub Actions

El proyecto incluye un workflow de GitHub Actions que despliega automáticamente a Cloudflare Workers en cada push a la rama `main`.

**Configuración requerida (una sola vez):**

1. Obtén tu API Token de Cloudflare:
   - Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Crea un token con permisos "Edit Cloudflare Workers"

2. Obtén tu Account ID:
   ```bash
   npx wrangler whoami
   ```

3. Configura los secretos en GitHub:
   - Ve a `Settings > Secrets and variables > Actions`
   - Agrega los siguientes secretos:
     - `CLOUDFLARE_API_TOKEN`: Tu API token de Cloudflare
     - `CLOUDFLARE_ACCOUNT_ID`: Tu Account ID

4. El workflow se ejecutará automáticamente en cada push a `main`

**Monitoreo del deployment:**
- Ve a la pestaña "Actions" en tu repositorio de GitHub
- Verifica el estado del workflow "Deploy to Cloudflare Workers"

### Verificar Deployment

```bash
# Listar secretos configurados en Cloudflare
npx wrangler secret list

# Ver logs en tiempo real
npx wrangler tail

# Verificar estado del Worker
curl https://basic-hono-api.borisbelmarm.workers.dev/health
```

---

## 🧪 Testing

### Suite de Tests

El proyecto incluye una suite completa de tests con **143 tests** y **88.83% de coverage**:

```bash
# Ejecutar todos los tests
yarn test --run

# Modo watch (desarrollo)
yarn test

# UI interactivo con coverage
yarn test:ui
```

### Estructura de Tests

```
src/
├── controllers/
│   ├── auth/
│   │   ├── login.controller.test.ts       # 6 tests
│   │   └── register.controller.test.ts    # 7 tests
│   ├── todo/
│   │   ├── create.controller.test.ts      # 6 tests
│   │   ├── list.controller.test.ts        # 7 tests
│   │   ├── get.controller.test.ts         # 6 tests
│   │   ├── update.controller.test.ts      # 4 tests
│   │   ├── patch.controller.test.ts       # 7 tests
│   │   └── delete.controller.test.ts      # 3 tests
│   └── image/
│       ├── upload.controller.test.ts      # 5 tests
│       ├── get.controller.test.ts         # 3 tests
│       └── delete.controller.test.ts      # 3 tests
├── middleware/
│   └── auth.middleware.test.ts            # 7 tests
├── schemas/
│   ├── auth.schema.test.ts                # 12 tests
│   ├── todo.schema.test.ts                # 22 tests
│   ├── image.schema.test.ts               # 10 tests
│   └── common.schema.test.ts              # 6 tests
├── utils/
│   ├── crypto.test.ts                     # 13 tests
│   └── jwt.test.ts                        # 16 tests
└── test/
    ├── mocks/
    │   ├── d1.mock.ts                     # Mock D1Database
    │   └── r2.mock.ts                     # Mock R2Bucket
    └── helpers/
        └── context.helper.ts              # Helper para Hono context
```

### Coverage por Módulo

| Módulo | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| **Controllers** | 88.31% | 81.70% | 100% | 88.31% |
| **Middleware** | 100% | 100% | 100% | 100% |
| **Schemas** | 100% | 100% | 100% | 100% |
| **Utils** | 81.69% | 70.58% | 90% | 81.69% |
| **Total** | **88.83%** | **81.61%** | **96.42%** | **88.83%** |

### Infraestructura de Testing

**Mocks de Cloudflare:**
- `D1Database`: Mock completo con soporte para CRUD, queries complejas y PATCH parcial
- `R2Bucket`: Mock de almacenamiento con put, get, delete, head, list

**Context Helper:**
- `createMockContext()`: Simula el contexto de Hono con bindings, variables, headers
- `parseJsonResponse()`: Helper para parsear respuestas JSON
- Soporte automático para extracción de parámetros de rutas

**Características:**
- ✅ Tests unitarios para todos los controllers
- ✅ Tests de integración para auth middleware
- ✅ Validación de schemas con Zod
- ✅ Tests de utils (crypto, JWT)
- ✅ Mocks realistas de Cloudflare Workers
- ✅ UI interactivo con Vitest
- ✅ Coverage con v8 provider

### CI/CD con Tests

Los tests se ejecutan automáticamente en cada push a `main` mediante GitHub Actions:

```yaml
- Run linter
- Run tests ← Valida que todos los 143 tests pasen
- Deploy (solo si tests pasan)
```

---

## 🧪 Ejemplos de Uso

### Con Bruno API Client

El proyecto incluye una colección completa de Bruno con todos los endpoints documentados:

1. **Abrir colección:** Abre Bruno → "Open Collection" → Selecciona la carpeta `bruno/`
2. **Seleccionar entorno:** Elige "Local" o "Production"
3. **Autenticación automática:** 
   - Ejecuta "Register" o "Login"
   - El token se guarda automáticamente en la variable secreta `authToken`
   - Todos los requests siguientes usan el token automáticamente
4. **Probar endpoints:** 
   - Carpeta "Auth" - Registro y login
   - Carpeta "Todos" - CRUD de todos
   - Carpeta "Images" - Upload, obtener y eliminar imágenes

**🔐 Nota:** El token se maneja como secret y no se commitea al repositorio.

### Con cURL (Flujo Completo)

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8787/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Respuesta incluye token JWT

# 2. Subir una imagen
curl -X POST http://localhost:8787/images \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "image=@/ruta/a/tu/imagen.jpg"

# Respuesta incluye URL de la imagen

# 3. Crear un todo con imagen
curl -X POST http://localhost:8787/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "title": "Mi primer todo",
    "completed": false,
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "photoUri": "/images/abc123/xyz789.jpg"
  }'

# 4. Listar todos
curl http://localhost:8787/todos \
  -H "Authorization: Bearer eyJhbGc..."

# 5. Actualizar todo (cambia la imagen - la anterior se elimina automáticamente)
curl -X PATCH http://localhost:8787/todos/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"photoUri": "/images/abc123/nueva-imagen.jpg"}'

# 6. Eliminar todo (la imagen se elimina automáticamente de R2)
curl -X DELETE http://localhost:8787/todos/{id} \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🏗️ Arquitectura

### Patrón MVC con OpenAPI

El proyecto sigue una arquitectura modular y escalable:

**1. Controladores (Controllers):**
- Contienen la lógica de negocio
- Separados por dominio (auth, todo, image)
- Independientes de la capa de presentación

**2. Definiciones OpenAPI:**
- Schemas Zod reutilizables en `src/openapi/schemas/`
- Rutas OpenAPI con `createRoute()` en `src/openapi/routes/`
- Documentación centralizada y mantenible

**3. Routers (Routes):**
- Organizados por dominio en subdirectorios (`auth/`, `todo/`, `image/`)
- Cada endpoint en su propio archivo (ej: `login.route.ts`, `create.route.ts`)
- Archivo `index.ts` en cada dominio que registra todos los endpoints
- Ultra modular: fácil de encontrar y modificar endpoints específicos

**4. Middleware:**
- Autenticación JWT centralizada
- Aplicado a nivel de router completo

**5. Utilidades:**
- Funciones reutilizables (JWT, crypto, R2)
- Separación de responsabilidades

### Beneficios de esta arquitectura:

✅ **Mantenibilidad:** Código organizado y fácil de encontrar
✅ **Escalabilidad:** Agregar nuevos endpoints es simple
✅ **Reutilización:** Schemas compartidos entre rutas
✅ **Documentación:** OpenAPI auto-generado desde código
✅ **Testing:** Controladores testeables independientemente
✅ **Legibilidad:** Archivos pequeños y enfocados

---

## 📁 Estructura del Proyecto Detallada

```
basic-hono-api/
├── src/
│   ├── controllers/              # Lógica de negocio (MVC)
│   ├── openapi/                  # Definiciones OpenAPI separadas
│   │   ├── schemas/              # Schemas Zod reutilizables
│   │   └── routes/               # createRoute() por dominio
│   ├── routes/                   # Routers Hono (conectan OpenAPI + Controllers)
│   ├── middleware/               # Middlewares (auth JWT)
│   ├── schemas/                  # Schemas de validación runtime
│   ├── types/                    # Tipos TypeScript
│   ├── utils/                    # Utilidades (JWT, crypto, R2)
│   └── index.ts                  # Entry point + OpenAPI global config
├── migrations/                   # SQL migrations para D1
├── bruno/                        # Colección de requests con Bruno
│   ├── Auth/                     # Requests de autenticación
│   ├── Todos/                    # Requests CRUD de todos
│   ├── Images/                   # Requests de imágenes
│   └── environments/             # Entornos (Local, Production)
├── .github/workflows/            # CI/CD con GitHub Actions
├── wrangler.toml                 # Config Cloudflare Workers + D1 + R2
├── .dev.vars                     # Variables de entorno local
└── package.json
```

---

## 🔒 Seguridad

### Mejores Prácticas Implementadas

- ✅ **Passwords hasheados** con scrypt (N=16384, r=8, p=1)
- ✅ **JWT con expiración** de 7 días
- ✅ **Validación estricta** con Zod en todas las entradas
- ✅ **Secretos en variables de entorno** (nunca en código)
- ✅ **Aislamiento de datos** por usuario (WHERE user_id)
- ✅ **Control de permisos** en eliminación de imágenes (solo el dueño)
- ✅ **Validación de archivos** (tipo y tamaño de imágenes)
- ✅ **Limpieza automática** de recursos huérfanos en R2
- ✅ **HTTPS obligatorio** en producción (Cloudflare)
- ✅ **Rate limiting** automático de Cloudflare Workers

### Recomendaciones Adicionales

- 🔄 Rotar `JWT_SECRET` periódicamente
- 🚫 **Nunca** cambiar `PASSWORD_SALT` (invalidaría todas las contraseñas)
- 📊 Monitorear logs con `wrangler tail`
- 🔐 Usar passwords fuertes (>12 caracteres recomendado)
- 🖼️ Las imágenes son públicamente accesibles una vez subidas (considera usar signed URLs para producción)

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📝 License

MIT

---

## 👤 Autor

Boris Belmar - [borisbelmarm@gmail.com](mailto:borisbelmarm@gmail.com)

