import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import { initDb } from "./server/db";
import { authMiddleware } from "./server/middleware";

// Routes
import authRoutes from "./server/routes/auth";
import schemaRoutes from "./server/routes/schema";
import elementRoutes from "./server/routes/elements";
import interactionRoutes from "./server/routes/interactions";
import adminRoutes from "./server/routes/admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB
initDb();

const openapiDocument = YAML.load(path.join(__dirname, "openapi.yaml"));

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Swagger Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

  // Global Auth Middleware
  app.use(authMiddleware);

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api", schemaRoutes);
  app.use("/api", elementRoutes);
  app.use("/api", interactionRoutes);
  app.use("/api", adminRoutes);

  // Get current user info
  app.get("/api/me", (req: any, res) => {
    res.json(req.user || null);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
