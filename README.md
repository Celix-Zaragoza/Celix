# CELIX

Aplicación web para deportistas amateurs en Zaragoza.

## Estructura
- `frontend/` Next.js (Vercel)
- `backend/` Express.js (Railway)
- `documentacion/` Memoria, diagramas, OpenAPI, etc.

## Cómo ejecutar en local

### Frontend
```bash
cd frontend
npm install
npm run dev
```
### Backend
```bash
cd backend
npm install
npm run dev
```

### `.env.example` en la raíz
```env
# FRONTEND
# (si necesitáis)
NEXT_PUBLIC_API_URL=http://localhost:3001

# BACKEND
PORT=3001
MONGO_URI=mongodb://localhost:27017/celix
JWT_SECRET=changeme
```