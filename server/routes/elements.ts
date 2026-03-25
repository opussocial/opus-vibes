import express from "express";
import { requireAuth, checkTypePermission } from "../middleware";
import { elementService } from "../services";

const router = express.Router();

router.get("/elements", requireAuth, async (req: any, res) => {
  const user = req.user;
  const canViewAll = user.permissions.includes("view_all_elements");
  const allowedTypeIds = user.type_permissions.filter((p: any) => p.can_view).map((p: any) => p.type_id);
  
  console.log(`[DEBUG] Fetching elements for ${user.username} (Role: ${user.role_name})`);
  console.log(`[DEBUG] canViewAll: ${canViewAll}, allowedTypeIds: ${allowedTypeIds.length}`);
  console.log(`[DEBUG] type_permissions count: ${user.type_permissions.length}`);
  
  try {
    const elements = await elementService.getElements(allowedTypeIds, user.id, canViewAll);
    console.log(`[DEBUG] Found ${elements.length} elements`);
    res.json(elements);
  } catch (err: any) {
    console.error(`[DEBUG] Error fetching elements: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

router.get("/elements/roots", requireAuth, async (req: any, res) => {
  const user = req.user;
  const canViewAll = user.permissions.includes("view_all_elements");
  const allowedTypeIds = user.type_permissions.filter((p: any) => p.can_view).map((p: any) => p.type_id);
  try {
    const elements = await elementService.getRootElements(allowedTypeIds, user.id, canViewAll);
    res.json(elements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/elements/:id", requireAuth, checkTypePermission("can_view"), async (req: any, res) => {
  try {
    const canViewAll = req.user.permissions.includes("view_all_elements");
    const element = await elementService.getElement(req.params.id, req.user.id, canViewAll);
    if (!element) return res.status(404).json({ error: "Element not found or permission denied" });
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

router.post("/elements", requireAuth, checkTypePermission("can_create"), async (req: any, res) => {
  const { name, type_id, parent_id, modular_data } = req.body;
  try {
    const id = await elementService.createElement({ name, type_id, parent_id, modular_data }, req.user.id);
    res.json({ id, name, type_id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/elements/:id", requireAuth, checkTypePermission("can_edit"), async (req: any, res) => {
  const { name, parent_id, modular_data } = req.body;
  try {
    const canViewAll = req.user.permissions.includes("view_all_elements");
    await elementService.updateElement(req.params.id, { name, parent_id, modular_data }, req.user.id, canViewAll);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/elements/:id", requireAuth, checkTypePermission("can_delete"), async (req: any, res) => {
  try {
    const canViewAll = req.user.permissions.includes("view_all_elements");
    await elementService.deleteElement(req.params.id, req.user.id, canViewAll);
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
