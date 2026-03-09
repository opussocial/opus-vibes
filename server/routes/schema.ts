import express from "express";
import { requireAuth, requirePermission } from "../middleware";
import { schemaService } from "../services";

const router = express.Router();

router.get("/types", requireAuth, async (req, res) => {
  try {
    const types = await schemaService.getTypes();
    res.json(types);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/types", requirePermission("manage_types"), async (req, res) => {
  const { name, description, properties, allowed_parent_types } = req.body;
  try {
    const id = await schemaService.createType({ name, description, properties, allowed_parent_types });
    res.json({ id, name, description, properties, allowed_parent_types });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/types/:idOrSlug", requirePermission("manage_types"), async (req, res) => {
  const { idOrSlug } = req.params;
  const { name, description, properties, allowed_parent_types } = req.body;
  try {
    await schemaService.updateType(idOrSlug, { name, description, properties, allowed_parent_types });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/types/:idOrSlug", requirePermission("manage_types"), async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    await schemaService.deleteType(idOrSlug);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/relationship-types", requireAuth, async (req, res) => {
  try {
    const types = await schemaService.getRelationshipTypes();
    res.json(types);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/relationship-types", requirePermission("manage_types"), async (req, res) => {
  const { source_type_id, target_type_id, name } = req.body;
  try {
    const id = await schemaService.createRelationshipType({ source_type_id, target_type_id, name });
    res.json({ id, source_type_id, target_type_id, name });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/relationship-types/:id", requirePermission("manage_types"), async (req, res) => {
  try {
    await schemaService.deleteRelationshipType(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
