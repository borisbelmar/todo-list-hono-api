# Basic Hono API

API REST completa construida con Hono, TypeScript, Cloudflare Workers y D1 Database.

## 🚀 Características

- ✅ **Autenticación JWT** con scrypt-js para hashing de passwords
- 🔒 **Sistema de usuarios** con registro y login
- 📝 **CRUD de Todos** privado por usuario (aislamiento de datos)
- 🖼️ **Gestión de imágenes** con Cloudflare R2 (upload, download, delete)
- 🧹 **Limpieza automática** de imágenes huérfanas al actualizar/eliminar todos
- 🗄️ **Cloudflare D1** como base de datos serverless (SQLite)
- ✨ **Validación con Zod** en todas las rutas
- 📖 **Documentación OpenAPI/Swagger** interactiva
- 🎯 **TypeScript** con ESLint (Standard JS)
- ⚡ **Desplegable en Cloudflare Workers**
- 🔑 **Manejo seguro de secretos** con variables de entorno
- 🚀 **CI/CD** con GitHub Actions para despliegue automático
- 🏗️ **Arquitectura MVC** con controladores separados

## 📋 Stack Tecnológico

- **Framework:** Hono con OpenAPIHono
- **Documentación:** Swagger UI + OpenAPI 3.0
- **Runtime:** Cloudflare Workers
- **Base de datos:** Cloudflare D1 (SQLite)
- **Almacenamiento:** Cloudflare R2 (imágenes)
- **Autenticación:** JWT (jose) + scrypt-js
- **Validación:** Zod + @hono/zod-openapi
- **IDs:** nanoid
- **Linting:** ESLint (Standard JS)
- **Package Manager:** Yarn

## 📁 Estructura del Proyecto

```
src/
├── controllers/          # Lógica de negocio
│   ├── auth/            # Controladores de autenticación
│   │   ├── register.controller.ts
│   │   └── login.controller.ts
│   ├── todo/            # Controladores de todos
│   │   ├── list.controller.ts
│   │   ├── get.controller.ts
│   │   ├── create.controller.ts
│   │   ├── update.controller.ts
│   │   ├── patch.controller.ts
│   │   └── delete.controller.ts
│   └── image/           # Controladores de imágenes
│       ├── upload.controller.ts
│       ├── get.controller.ts
│       └── delete.controller.ts
├── routes/              # Definición de rutas
│   ├── auth.routes.ts
│   ├── todo.routes.ts
│   └── image.routes.ts
├── middleware/          # Middlewares personalizados
│   └── auth.middleware.ts
├── schemas/             # Schemas de validación Zod
│   ├── auth.schema.ts
│   ├── todo.schema.ts
│   └── image.schema.ts
├── types/               # Tipos TypeScript
│   ├── user.types.ts
│   └── todo.types.ts
├── utils/               # Funciones utilitarias
│   ├── jwt.ts
│   ├── crypto.ts
│   └── r2.ts
└── index.ts             # Punto de entrada
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

# Linting
yarn lint
yarn lint:fix

# Deploy a producción
yarn deploy
```

## 📚 API Reference

### 📖 Documentación Interactiva

La API incluye documentación interactiva con Swagger UI:

- **Swagger UI:** [http://localhost:8787/docs](http://localhost:8787/docs) (desarrollo)
- **Swagger UI Producción:** [https://basic-hono-api.borisbelmarm.workers.dev/docs](https://basic-hono-api.borisbelmarm.workers.dev/docs)
- **OpenAPI JSON:** `/openapi.json`

La documentación Swagger UI permite:
- ✨ Explorar todos los endpoints disponibles
- 📝 Ver esquemas de request/response con Zod
- 🧪 Probar las rutas directamente desde el navegador
- 🔐 Configurar el token JWT para rutas protegidas

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

## 📁 Estructura del Proyecto

```
basic-hono-api/
├── src/
│   ├── middleware/
│   │   └── auth.middleware.ts    # Middleware de autenticación JWT
│   ├── routes/
│   │   ├── auth.routes.ts        # Rutas de autenticación
│   │   ├── todo.routes.ts        # Rutas CRUD de todos
│   │   └── image.routes.ts       # Rutas de gestión de imágenes (R2)
│   ├── schemas/
│   │   ├── auth.schema.ts        # Validaciones Zod para auth
│   │   ├── todo.schema.ts        # Validaciones Zod para todos
│   │   └── image.schema.ts       # Validaciones Zod para imágenes
│   ├── types/
│   │   ├── user.types.ts         # Tipos TypeScript de usuarios
│   │   └── todo.types.ts         # Tipos TypeScript de todos
│   ├── utils/
│   │   ├── crypto.ts             # Hashing de passwords (scrypt)
│   │   ├── jwt.ts                # Generación/verificación JWT
│   │   └── r2.ts                 # Utilidades para R2 (limpieza de imágenes)
│   └── index.ts                  # Entry point
├── migrations/
│   ├── 001_create_todos_table.sql      # Migración inicial de todos
│   ├── 002_create_users_table.sql      # Tabla de usuarios
│   └── 003_add_user_id_to_todos.sql    # Relación user-todo
├── bruno/
│   ├── Auth/                     # Requests de autenticación
│   │   ├── Register.bru          # POST /auth/register (guarda token)
│   │   └── Login.bru             # POST /auth/login (guarda token)
│   ├── Todos/                    # Requests CRUD de todos
│   │   ├── List Todos.bru        # GET /todos
│   │   ├── Get Todo.bru          # GET /todos/:id
│   │   ├── Create Todo.bru       # POST /todos
│   │   ├── Update Todo (PUT).bru # PUT /todos/:id
│   │   ├── Update Todo (PATCH).bru # PATCH /todos/:id
│   │   └── Delete Todo.bru       # DELETE /todos/:id
│   ├── Images/                   # Requests de imágenes
│   │   ├── Upload Image.bru      # POST /images
│   │   ├── Get Image.bru         # GET /images/:userId/:imageId
│   │   └── Delete Image.bru      # DELETE /images/:userId/:imageId
│   ├── environments/             # Entornos (Local, Production)
│   ├── Health Check.bru          # GET /health
│   ├── API Info.bru              # GET /
│   ├── bruno.json                # Configuración de colección
│   └── .gitignore                # Ignora archivo de secrets
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions para deploy automático
├── wrangler.toml                 # Config Cloudflare Workers + D1 + R2
├── .dev.vars                     # Variables de entorno local
├── eslint.config.js              # Config ESLint
├── tsconfig.json                 # Config TypeScript
└── package.json
```
│   │   ├── crypto.ts             # Hashing de passwords (scrypt)
│   │   └── jwt.ts                # Generación/verificación JWT
│   └── index.ts                  # Entry point
├── migrations/
│   ├── 001_create_todos_table.sql      # Migración inicial de todos
│   ├── 002_create_users_table.sql      # Tabla de usuarios
│   └── 003_add_user_id_to_todos.sql    # Relación user-todo
├── wrangler.toml                  # Config Cloudflare Workers
├── .dev.vars                      # Variables de entorno local
├── eslint.config.js               # Config ESLint
├── tsconfig.json                  # Config TypeScript
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

