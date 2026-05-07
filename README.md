# CELIX

Red social deportiva para la comunidad amateur de Zaragoza.

## Estructura del proyecto

```
celix/
├── frontend/        Next.js — desplegado en Vercel
├── backend/         Express.js — desplegado en Railway
└── documentacion/   Memoria, diagramas, OpenAPI
```

## Requisitos previos

- Node.js 18+
- npm 9+
- Cuenta en MongoDB Atlas (o MongoDB local)

---

## Cómo ejecutar en local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Celix-Zaragoza/Celix.git
cd Celix
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # rellenar con los valores reales
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # rellenar con los valores reales
npm run dev
```

La app estará disponible en `http://localhost:3000` y la API en `http://localhost:3001`.

---

## Variables de entorno

### Backend — `backend/.env`

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
# Requiere cuenta Gmail con verificación en dos pasos activada
# y contraseña de aplicación generada en: myaccount.google.com → Seguridad → Contraseñas de aplicación
EMAIL_USER=tucuenta@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Google Gemini (motor de recomendación IA para el feed "Para ti")
# Obtener en: aistudio.google.com → Get API Key
GEMINI_API_KEY=tu_api_key_de_gemini

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend — `frontend/.env.local`

```env
# URL base del backend (sin /api/v1 al final)
# En local:
NEXT_PUBLIC_API_URL=http://localhost:3001
# En producción (Vercel):
# NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
```

> **Nota:** Cloudinary está configurado directamente en el código del frontend. No requiere variables de entorno adicionales.

---

## Despliegue

### Backend en Railway

Variables de entorno a configurar en Railway → tu proyecto → Variables:

| Variable | Descripción |
|---|---|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `MONGO_URI` | URI de MongoDB Atlas con nombre de BD |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `EMAIL_USER` | Cuenta Gmail para notificaciones |
| `EMAIL_PASS` | Contraseña de aplicación de Google |
| `GEMINI_API_KEY` | API key de Google AI Studio |
| `FRONTEND_URL` | URL del frontend en Vercel |

### Frontend en Vercel

Variables de entorno a configurar en Vercel → tu proyecto → Settings → Environment Variables:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://tu-backend.railway.app` (sin `/api/v1`) |

---

## Ejecutar tests

```bash
cd backend
npm test               # Ejecutar todos los tests
npm test -- --coverage # Con cobertura de código
```

---

## Notas importantes

- El rol `ADMIN` debe asignarse manualmente en MongoDB Atlas modificando el campo `rol` del usuario a `"ADMIN"`.
- Al arrancar el backend se sincroniza automáticamente el catálogo de eventos con la API Open Data del Ayuntamiento de Zaragoza.
- El frontend usa `NEXT_PUBLIC_API_URL` como base — todas las peticiones añaden `/api/v1/` en el código. La variable **no debe incluir** `/api/v1` al final.
- Cloudinary está configurado directamente en el código — no requiere variables de entorno.