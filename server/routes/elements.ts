import express from "express";
import { requireAuth, checkTypePermission } from "../middleware";
import { elementService } from "../services";

const router = express.Router();

router.get("/elements", requireAuth, async (req: any, res) => {
  const user = req.user;
  const allowedTypeIds = user.type_permissions.filter((p: any) => p.can_view).map((p: any) => p.type_id);
  try {
    const elements = await elementService.getElements(allowedTypeIds);
    res.json(elements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/elements/roots", requireAuth, async (req: any, res) => {
  const user = req.user;
  const allowedTypeIds = user.type_permissions.filter((p: any) => p.can_view).map((p: any) => p.type_id);
  try {
    const elements = await elementService.getRootElements(allowedTypeIds);
    res.json(elements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/elements/:id", requireAuth, checkTypePermission("can_view"), async (req, res) => {
  try {
    const element = await elementService.getElement(req.params.id);
    if (!element) return res.status(404).json({ error: "Element not found" });
    res.json(element);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/elements/:id/children", requireAuth, async (req, res) => {
  try {
    const children = await elementService.getChildren(req.params.id);
    res.json(children);
  } catch (err: any) {
    res.status(err.message === "Element not found" ? 404 : 500).json({ error: err.message });
  }
});

router.get("/elements/:id/parent", requireAuth, async (req, res) => {
  try {
    const parent = await elementService.getParent(req.params.id);
    res.json(parent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/elements/:id/graph", requireAuth, async (req, res) => {
  try {
    const edges = await elementService.getGraph(req.params.id);
    res.json(edges);
  } catch (err: any) {
    res.status(err.message === "Element not found" ? 404 : 500).json({ error: err.message });
  }
});

router.post("/elements", requireAuth, checkTypePermission("can_create"), async (req, res) => {
  const { name, type_id, parent_id, modular_data } = req.body;
  try {
    const id = await elementService.createElement({ name, type_id, parent_id, modular_data });
    res.json({ id, name, type_id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/elements/:id", requireAuth, checkTypePermission("can_edit"), async (req, res) => {
  const { name, parent_id, modular_data } = req.body;
  try {
    await elementService.updateElement(req.params.id, { name, parent_id, modular_data });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/elements/:id", requireAuth, checkTypePermission("can_delete"), async (req, res) => {
  try {
    await elementService.deleteElement(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Graph Edges
router.get("/graph", requireAuth, async (req, res) => {
  try {
    const edges = await elementService.getAllGraphEdges();
    res.json(edges);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/graph", requireAuth, async (req: any, res) => {
  const { rel_type_id, source_el_id, target_el_id } = req.body;
  try {
    // Permission check still in route for now as it depends on req.user
    const element = await elementService.getElement(source_el_id.toString());
    const target = await elementService.getElement(target_el_id.toString());
    if (!element || !target) return res.status(404).json({ error: "Elements not found" });
    
    const user = req.user;
    const sPerm = user.type_permissions.find((p: any) => p.type_id === element.type_id);
    const tPerm = user.type_permissions.find((p: any) => p.type_id === target.type_id);
    if (!sPerm?.can_edit || !tPerm?.can_edit) return res.status(403).json({ error: "Permission denied to link these elements" });

    const id = await elementService.createGraphEdge({ rel_type_id, source_el_id, target_el_id });
    res.json({ id, rel_type_id, source_el_id, target_el_id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/graph/:id", requireAuth, async (req, res) => {
  try {
    await elementService.deleteGraphEdge(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
