import express from "express";
import { requirePermission } from "../middleware";
import { configService } from "../services";

const router = express.Router();

router.get("/", requirePermission("manage_roles"), async (req, res) => {
  try {
    const config = await configService.getConfig();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:key", requirePermission("manage_roles"), async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  try {
    await configService.updateConfig(key, value);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
