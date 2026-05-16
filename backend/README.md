# CELIX — Backend

API REST de CELIX, desarrollada con Express.js y desplegada en Railway.

## Stack

- **Framework:** Express.js 5
- **Base de datos:** MongoDB Atlas (Mongoose)
- **Autenticación:** JWT (jsonwebtoken + bcrypt)
- **Tiempo real:** Socket.io
- **Email:** Nodemailer + Gmail
- **IA:** Google Gemini API
- **Documentación API:** Swagger / OpenAPI
- **Validación:** Zod
- **Despliegue:** Railway

## Estructura

```
backend/
├── src/
│   ├── controllers/          # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── posts.controller.js
│   │   ├── conversations.controller.js
│   │   ├── events.controller.js
│   │   ├── instalaciones.controller.js
│   │   └── admin.controller.js
│   ├── models/               # Modelos Mongoose
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Conversation.js
│   │   ├── Event.js
│   │   └── index.js
│   ├── routes/               # Rutas Express
│   │   └── v1/
│   │       ├── auth.routes.js
│   │       ├── users.routes.js
│   │       ├── posts.routes.js
│   │       ├── conversations.routes.js
│   │       ├── events.routes.js
│   │       ├── instalaciones.routes.js
│   │       └── admin.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js     # requireAuth + requireRole (RBAC)
│   │   └── validate.middleware.js # Validación Zod
│   ├── schemas/              # Esquemas Zod
│   ├── services/
│   │   ├── events.sync.js    # Sincronización Open Data Zaragoza
│   │   └── email.service.js  # Notificaciones email
│   ├── socket/
│   │   └── index.js          # Lógica Socket.io
│   ├── config/
│   │   └── db.js             # Conexión MongoDB
│   ├── tests/                # Tests Jest
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── services/
│   └── index.js              # Entry point
└── jest.config.cjs
```

## Instalación y desarrollo

```bash
npm install
npm run dev
```

La API estará disponible en `http://localhost:3001`.

La documentación Swagger estará en `http://localhost:3001/api-docs`.

## Variables de entorno

Crea un archivo `.env` en la raíz del backend:

```env
# Servidor
PORT=3001

# Entorno
NODE_ENV=development

# Base de datos
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<nombre_bd>?appName=<app>

# Autenticación JWT
JWT_SECRET=una_clave_secreta_larga_y_aleatoria

# Email (Nodemailer + Gmail)
# Requiere verificación en dos pasos y contraseña de aplicación:
# myaccount.google.com → Seguridad → Contraseñas de aplicación
EMAIL_USER=tucuenta@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Google Gemini (feed "Para ti")
# Obtener en: aistudio.google.com → Get API Key
GEMINI_API_KEY=tu_api_key_de_gemini

# URL del frontend (CORS)
FRONTEND_URL=http://localhost:3000
```

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo con nodemon
npm run start      # Servidor de producción
npm test           # Ejecutar tests
npm test -- --coverage  # Tests con cobertura
npm run lint       # Linter ESLint
npm run format     # Formatear con Prettier
```

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/register` | Registro de usuario |
| POST | `/api/v1/auth/login` | Inicio de sesión |
| GET | `/api/v1/users/me` | Perfil propio |
| PATCH | `/api/v1/users/me` | Actualizar perfil |
| GET | `/api/v1/users/me/stats` | Estadísticas del usuario |
| GET | `/api/v1/posts` | Feed global |
| GET | `/api/v1/posts/following` | Feed siguiendo |
| GET | `/api/v1/posts/para-ti` | Feed IA personalizado |
| POST | `/api/v1/posts` | Crear publicación |
| GET | `/api/v1/events` | Listado de eventos |
| GET | `/api/v1/instalaciones` | Instalaciones deportivas |
| GET | `/api/v1/conversations` | Conversaciones del usuario |
| GET | `/api/v1/admin/posts` | Panel admin — publicaciones |
| GET | `/api/v1/admin/users` | Panel admin — usuarios |
| GET | `/api/v1/admin/events` | Panel admin — eventos |
| POST | `/api/v1/admin/events/sync` | Sincronizar eventos manualmente |

> Documentación completa disponible en `/api-docs` (Swagger UI).

## Notas

- Al arrancar el servidor se sincroniza automáticamente el catálogo de eventos con la **API Open Data del Ayuntamiento de Zaragoza**. Los eventos desaparecidos se eliminan de la BD.
- El rol `ADMIN` se asigna manualmente en MongoDB Atlas (`rol: "ADMIN"`).
- Los tokens JWT expiran en **7 días**. Los tokens invalidados (logout) se almacenan en una colección `BlacklistedToken` con TTL automático.
- Socket.io gestiona la mensajería en tiempo real con salas por conversación.