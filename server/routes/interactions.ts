import express from "express";
import { requireAuth } from "../middleware";
import { interactionService } from "../services";
import { validate, interactionSchema } from "../validation";

const router = express.Router();

router.get("/interaction-types", requireAuth, async (req, res) => {
  try {
    const types = await interactionService.getInteractionTypes();
    res.json(types);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/elements/:id/interactions", requireAuth, async (req, res) => {
  try {
    const interactions = await interactionService.getInteractions(req.params.id);
    res.json(interactions);
  } catch (err: any) {
    res.status(err.message === "Element not found" ? 404 : 500).json({ error: err.message });
  }
});

router.post("/elements/:id/interactions", requireAuth, validate(interactionSchema), async (req: any, res) => {
  const { type_id, content } = req.body;
  try {
    const id = await interactionService.createInteraction(req.params.id, req.user.id, { type_id, content });
    res.json({ id, element_id: req.params.id, user_id: req.user.id, type_id, content });
  } catch (err: any) {
    res.status(err.message === "Element not found" ? 404 : 400).json({ error: err.message });
  }
});

router.delete("/interactions/:id", requireAuth, async (req: any, res) => {
  try {
    const isAdmin = req.user.permissions.includes("manage_roles");
    await interactionService.deleteInteraction(parseInt(req.params.id), req.user.id, isAdmin);
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message === "Interaction not found" ? 404 : (err.message === "Unauthorized to delete this interaction" ? 403 : 400);
    res.status(status).json({ error: err.message });
  }
});

export default router;
