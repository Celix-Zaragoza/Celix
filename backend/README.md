# Backend CELIX (estructura mínima)

Estructura base para implementar la lógica de negocio sin tocar el esqueleto:

```text
backend/
  src/
    app.js                      # Configuración de express + middlewares + montaje de rutas
    index.js                    # Arranque del servidor
    config/
      swagger.js                # Config Swagger/OpenAPI
    routes/
      index.js                  # /api -> v1
      v1/
        index.js                # Composición de módulos
        auth.routes.js          # /auth/login, /auth/register
        users.routes.js         # /users/me
        posts.routes.js         # /posts
        conversations.routes.js # /conversations, /conversations/:id/messages
    controllers/
      _helpers.js               # Helper de respuesta 501
      auth.controller.js
      users.controller.js
      posts.controller.js
      conversations.controller.js
    middlewares/
      auth.middleware.js        # Bearer básico (placeholder)
      notFound.middleware.js
      error.middleware.js
```

## Endpoints base disponibles

- `GET /health`
- `GET /api-docs`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/posts`
- `POST /api/v1/posts`
- `GET /api/v1/conversations`
- `GET /api/v1/conversations/:conversationId/messages`
- `POST /api/v1/conversations/:conversationId/messages`

Ahora todos los controladores devuelven `501 Not Implemented` con `expectedBody` para que sepas qué espera cada request.