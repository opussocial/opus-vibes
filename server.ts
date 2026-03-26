import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { initDb } from "./server/db";
import { authMiddleware } from "./server/middleware";

// Routes
import authRoutes from "./server/routes/auth";
import adminRoutes from "./server/routes/admin";
import schemaRoutes from "./server/routes/schema";
import elementRoutes from "./server/routes/elements";
import interactionRoutes from "./server/routes/interactions";
import taskRoutes from "./server/routes/tasks";
import definitionRoutes from "./server/routes/definition";
import settingsRoutes from "./server/routes/settings";
import featureRoutes from "./server/routes/features";
import configRoutes from "./server/routes/config";
import themeRoutes from "./server/routes/theme";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB
initDb();

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(authMiddleware);

  // --- API Routes ---
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", schemaRoutes);
  app.use("/api", elementRoutes);
  app.use("/api", interactionRoutes);
  app.use("/api", taskRoutes);
  app.use("/api", definitionRoutes);
  app.use("/api", settingsRoutes);
  app.use("/api", featureRoutes);
  app.use("/api", configRoutes);
  app.use("/api", themeRoutes);

  // Mock "me" endpoint for compatibility if needed, but authRoutes should handle it
  app.get("/api/me", (req: any, res) => {
    res.json(req.user || null);
  });

  // --- Vite / Static Files ---

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
    console.log(`FlexCatalog server running on http://localhost:${PORT}`);
  });
}

startServer();
