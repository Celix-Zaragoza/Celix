// backend/src/index.js
import "dotenv/config";
import { createServer } from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket/index.js";
import { syncEvents } from "./services/events.sync.js";

const PORT = process.env.PORT ?? 3001;

async function main() {
  await connectDB();

  // Crear httpServer explícito para que Socket.io pueda adjuntarse
  const httpServer = createServer(app);

  // Inicializar Socket.io
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 CELIX API en http://localhost:${PORT}`);
    console.log(`📚 Swagger en http://localhost:${PORT}/api-docs`);
    console.log(`🔌 Socket.io activo`);
  });

  // Sync en background — no bloquea el arranque
  syncEvents().catch(console.error);
}

main();
