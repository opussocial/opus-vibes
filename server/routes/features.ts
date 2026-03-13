import express from "express";
import { featureService } from "../services/FeatureService";
import { requireAuth } from "../middleware";
import { db } from "../db";

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
    if (name === "enable_homepage" && enabled === false) {
      // Check for home_element setting
      const setting = db.prepare("SELECT value FROM settings WHERE key = 'home_element' AND type_id IS NULL AND user_id IS NULL").get() as { value: string } | undefined;
      if (!setting) {
        return res.status(400).json({ error: "Cannot disable homepage without a 'home_element' setting defined." });
      }
    }

    await featureService.setFeatureEnabled(name, enabled);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
