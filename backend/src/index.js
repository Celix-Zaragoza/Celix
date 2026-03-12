import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT ?? 3001;

async function main() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 CELIX API en http://localhost:${PORT}`);
    console.log(`📚 Swagger en http://localhost:${PORT}/api-docs`);
  });
}

main();