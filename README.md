# Basic Hono API

API REST completa construida con Hono, TypeScript, Cloudflare Workers y D1 Database.

## 🚀 Características

- ✅ **Autenticación JWT** con bcrypt (scrypt-js)
- 🔒 **Sistema de usuarios** con registro y login
- 📝 **CRUD de Todos** privado por usuario
- 🗄️ **Cloudflare D1** como base de datos
- ✨ **Validación con Zod** en todas las rutas
- 🎯 **TypeScript** con ESLint (Standard JS)
- ⚡ **Desplegable en Cloudflare Workers**
- 🔑 **Manejo seguro de secretos**

## 📋 Stack Tecnológico

- **Framework:** Hono
- **Runtime:** Cloudflare Workers
- **Base de datos:** Cloudflare D1 (SQLite)
- **Autenticación:** JWT (jose) + scrypt-js
- **Validación:** Zod
- **IDs:** nanoid
- **Linting:** ESLint (Standard JS)
- **Package Manager:** Yarn

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

```bash
# JWT Secret (generar uno seguro)
npx wrangler secret put JWT_SECRET

# Password Salt (generar uno seguro)
npx wrangler secret put PASSWORD_SALT
```

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

### Deploy

```bash
yarn deploy
```

### Verificar Deployment

```bash
# Listar secretos configurados
npx wrangler secret list

# Ver logs en tiempo real
npx wrangler tail
```

---

## 🧪 Ejemplos de Uso

### Flujo Completo

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8787/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Respuesta incluye token JWT

# 2. Crear un todo
curl -X POST http://localhost:8787/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "title": "Mi primer todo",
    "completed": false,
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }'

# 3. Listar todos
curl http://localhost:8787/todos \
  -H "Authorization: Bearer eyJhbGc..."

# 4. Actualizar todo
curl -X PATCH http://localhost:8787/todos/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"completed": true}'

# 5. Eliminar todo
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
│   │   └── todo.routes.ts        # Rutas CRUD de todos
│   ├── schemas/
│   │   ├── auth.schema.ts        # Validaciones Zod para auth
│   │   └── todo.schema.ts        # Validaciones Zod para todos
│   ├── types/
│   │   ├── user.types.ts         # Tipos TypeScript de usuarios
│   │   └── todo.types.ts         # Tipos TypeScript de todos
│   ├── utils/
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
- ✅ **HTTPS obligatorio** en producción (Cloudflare)
- ✅ **Rate limiting** automático de Cloudflare Workers

### Recomendaciones Adicionales

- 🔄 Rotar `JWT_SECRET` periódicamente
- 🚫 **Nunca** cambiar `PASSWORD_SALT` (invalidaría todas las contraseñas)
- 📊 Monitorear logs con `wrangler tail`
- 🔐 Usar passwords fuertes (>12 caracteres recomendado)

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

