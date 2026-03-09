import express from "express";
import { requirePermission } from "../middleware";
import { definitionService } from "../services";

const router = express.Router();

router.get("/export", requirePermission("manage_types"), async (req, res) => {
  try {
    const def = await definitionService.exportDefinition();
    res.json(def);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/import", requirePermission("manage_types"), async (req, res) => {
  try {
    await definitionService.importDefinition(req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
