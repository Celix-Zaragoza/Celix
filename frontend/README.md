# CELIX — Frontend

Interfaz de usuario de CELIX, desarrollada con Next.js y desplegada en Vercel.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS
- **Componentes UI:** shadcn/ui
- **Gráficas:** Recharts
- **Mapas:** Leaflet
- **Mensajería en tiempo real:** Socket.io client
- **Notificaciones:** Sonner
- **Despliegue:** Vercel

## Estructura

```
frontend/
├── app/
│   ├── app/                  # Rutas protegidas de la app
│   │   ├── feed/             # Feed principal (Siguiendo / Para ti)
│   │   ├── search/           # Búsqueda de usuarios
│   │   ├── create-post/      # Crear publicación
│   │   ├── events/           # Eventos e instalaciones
│   │   ├── messages/         # Mensajería
│   │   └── profile/          # Perfil propio y ajeno
│   ├── admin/                # Panel de administración
│   │   ├── publications/     # Gestión de publicaciones
│   │   ├── users/            # Gestión de usuarios
│   │   └── events/           # Gestión de eventos
│   ├── auth/                 # Autenticación
│   │   ├── login/
│   │   ├── register/
│   │   ├── create-profile-1/
│   │   └── create-profile-2/
│   ├── components/           # Componentes reutilizables
│   ├── context/              # AuthContext
│   └── page.tsx              # Landing page
├── lib/
│   └── socket.ts             # Singleton Socket.io
└── public/
    └── logo.png              # Logo oficial CELIX
```

## Instalación y desarrollo

```bash
npm install
npm run dev
```

La app estará disponible en `http://localhost:3000`.

## Variables de entorno

Crea un archivo `.env.local` en la raíz del frontend:

```env
# URL base del backend (sin /api/v1 al final)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> En producción (Vercel) esta variable apunta a la URL de Railway.

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # Linter
```

## Notas

- Las imágenes de posts y avatares se suben directamente a **Cloudinary** desde el cliente. No requiere variables de entorno adicionales.
- El acceso al panel `/admin` requiere que el usuario tenga `rol: "ADMIN"` en la base de datos. Este rol se asigna manualmente en MongoDB Atlas.
- La autenticación persiste en `localStorage` con un token JWT de 7 días de expiración.