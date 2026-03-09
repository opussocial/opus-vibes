import express from "express";
import { requireAuth, requirePermission } from "../middleware";
import { queueService } from "../services";

const router = express.Router();

router.get("/tasks", requirePermission("manage_roles"), async (req, res) => {
  try {
    const tasks = await queueService.getTasks();
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/tasks/clear", requirePermission("manage_roles"), async (req, res) => {
  try {
    await queueService.clearTasks();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Demo: Enqueue a dummy task
router.post("/tasks/demo", requirePermission("manage_roles"), async (req, res) => {
  try {
    const id = await queueService.enqueue("demo_task", { message: "Hello from Queue", timestamp: Date.now() });
    res.json({ id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
