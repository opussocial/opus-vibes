import express from "express";
import { featureService } from "../services/FeatureService";
import { requireAuth } from "../middleware";

const router = express.Router();

router.get("/features", requireAuth, async (req, res) => {
  try {
    const features = await featureService.getAllFeatures();
    res.json(features);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/features/:name", requireAuth, async (req: any, res) => {
  const { name } = req.params;
  const { enabled } = req.body;

  if (req.user.role_name !== "Super Admin") {
    return res.status(403).json({ error: "Only admins can toggle features" });
  }

  try {
    await featureService.setFeatureEnabled(name, enabled);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
