/**
 * @file swagger.js
 * @description Configuración de Swagger/OpenAPI para la documentación de la API.
 * Define la información general, servidores, esquemas de seguridad y la ruta
 * donde se escanean los comentarios JSDoc de las rutas.
 */

import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "CELIX API",
    version: "1.0.0",
    description: "Documentación de la API de CELIX",
  },
  servers: [
    { url: "http://localhost:3001", description: "Local" },
    // En producción lo cambiáis o añadís otro:
    // { url: "https://celix-api.up.railway.app", description: "Prod" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }], // Por defecto, protegido (puedes quitarlo y poner security por endpoint)
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/**/*.js"], // aquí busca los comentarios JSDoc
};

export const swaggerSpec = swaggerJSDoc(options);