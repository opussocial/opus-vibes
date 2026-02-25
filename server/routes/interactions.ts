import express from "express";
import { db } from "../db";
import { requireAuth } from "../middleware";

const router = express.Router();

router.get("/interaction-types", requireAuth, (req, res) => {
  const types = db.prepare("SELECT * FROM interaction_types").all();
  res.json(types);
});

router.get("/elements/:id/interactions", requireAuth, (req, res) => {
  const interactions = db.prepare(`
    SELECT i.*, u.username, it.name as type_name, it.icon as type_icon
    FROM interactions i
    JOIN users u ON i.user_id = u.id
    JOIN interaction_types it ON i.type_id = it.id
    WHERE i.element_id = ?
    ORDER BY i.created_at DESC
  `).all(req.params.id);
  res.json(interactions);
});

router.post("/elements/:id/interactions", requireAuth, (req: any, res) => {
  const { type_id, content } = req.body;
  const elementId = req.params.id;
  const userId = req.user.id;

  try {
    const type = db.prepare("SELECT name FROM interaction_types WHERE id = ?").get(type_id) as any;
    if (type && (type.name === 'like' || type.name === 'favorite')) {
      const existing = db.prepare("SELECT id FROM interactions WHERE element_id = ? AND user_id = ? AND type_id = ?").get(elementId, userId, type_id);
      if (existing) return res.status(400).json({ error: `Already ${type.name}d this element` });
    }
    const result = db.prepare("INSERT INTO interactions (element_id, user_id, type_id, content) VALUES (?, ?, ?, ?)").run(elementId, userId, type_id, content);
    res.json({ id: result.lastInsertRowid, element_id: elementId, user_id: userId, type_id, content });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/interactions/:id", requireAuth, (req: any, res) => {
  const userId = req.user.id;
  const interactionId = req.params.id;
  const interaction = db.prepare("SELECT user_id FROM interactions WHERE id = ?").get(interactionId) as any;
  if (!interaction) return res.status(404).json({ error: "Interaction not found" });
  if (interaction.user_id !== userId && !req.user.permissions.includes("manage_roles")) {
    return res.status(403).json({ error: "Unauthorized to delete this interaction" });
  }
  db.prepare("DELETE FROM interactions WHERE id = ?").run(interactionId);
  res.json({ success: true });
});

export default router;
