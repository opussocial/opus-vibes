import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import { initDb, db } from "./server/db";
import { authMiddleware } from "./server/middleware";

// Routes
import authRoutes from "./server/routes/auth";
import schemaRoutes from "./server/routes/schema";
import elementRoutes from "./server/routes/elements";
import interactionRoutes from "./server/routes/interactions";
import adminRoutes from "./server/routes/admin";
import taskRoutes from "./server/routes/tasks";
import definitionRoutes from "./server/routes/definition";
import settingsRoutes from "./server/routes/settings";
import featureRoutes from "./server/routes/features";
import themeRoutes from "./server/routes/theme";
import { queueService } from "./server/services";

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
  app.use("/api", taskRoutes);
  app.use("/api/definition", definitionRoutes);
  app.use("/api", settingsRoutes);
  app.use("/api", featureRoutes);
  app.use("/api", themeRoutes);

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
    startWorker();
  });
}

async function startWorker() {
  console.log("Starting background worker...");
  while (true) {
    try {
      const task = await queueService.pickNextTask();
      if (task) {
        console.log(`Processing task ${task.id} (${task.type})...`);
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Logic for different task types
        if (task.type === "demo_task") {
          console.log("Demo task payload:", task.payload);
        }
        
        await queueService.completeTask(task.id);
        console.log(`Task ${task.id} completed.`);
      } else {
        // Wait before checking again if no tasks
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (err: any) {
      console.error("Worker error:", err);
      // If we have a current task, we should probably fail it
      // But in this simple loop we don't have the ID easily if pickNextTask failed
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

startServer();
