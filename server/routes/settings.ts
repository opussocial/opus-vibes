import express from "express";
import { requireAuth } from "../middleware";
import { settingsService } from "../services";

const router = express.Router();

router.get("/settings", async (req: any, res) => {
  const { type_id, user_id } = req.query;
  try {
    const settings = await settingsService.getSettings({ 
      type_id: type_id ? parseInt(type_id as string) : undefined,
      user_id: user_id ? parseInt(user_id as string) : undefined
    });
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/settings/:key", async (req: any, res) => {
  const { key } = req.params;
  const { type_id, user_id } = req.query;
  try {
    const value = await settingsService.getSetting(key, {
      type_id: type_id ? parseInt(type_id as string) : undefined,
      user_id: user_id ? parseInt(user_id as string) : undefined
    });
    res.json({ key, value });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/settings/:key", requireAuth, async (req: any, res) => {
  const { key } = req.params;
  const { value, type_id, user_id } = req.body;
  
  // Only admins can set global or type-level settings
  if (!type_id && !user_id && req.user.role_name !== "Super Admin") {
    return res.status(403).json({ error: "Only admins can set global settings" });
  }
  
  // Users can only set their own settings unless they are admin
  if (user_id && parseInt(user_id) !== req.user.id && req.user.role_name !== "Super Admin") {
    return res.status(403).json({ error: "Permission denied" });
  }

  try {
    await settingsService.updateSetting(key, value, {
      type_id: type_id ? parseInt(type_id) : undefined,
      user_id: user_id ? parseInt(user_id) : undefined
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/settings/:key", requireAuth, async (req: any, res) => {
  const { key } = req.params;
  const { type_id, user_id } = req.query;

  // Only admins can delete global or type-level settings
  if (!type_id && !user_id && req.user.role_name !== "Super Admin") {
    return res.status(403).json({ error: "Only admins can delete global settings" });
  }

  // Users can only delete their own settings unless they are admin
  if (user_id && parseInt(user_id as string) !== req.user.id && req.user.role_name !== "Super Admin") {
    return res.status(403).json({ error: "Permission denied" });
  }

  try {
    await settingsService.deleteSetting(key, {
      type_id: type_id ? parseInt(type_id as string) : undefined,
      user_id: user_id ? parseInt(user_id as string) : undefined
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
