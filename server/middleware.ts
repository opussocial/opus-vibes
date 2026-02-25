import { db } from "./db";

export const authMiddleware = (req: any, res: any, next: any) => {
  const userId = req.cookies["session_id"] || req.headers["x-user-id"];
  if (userId) {
    const user = db.prepare(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ?
    `).get(userId) as any;
    
    if (user) {
      const perms = db.prepare(`
        SELECT p.name 
        FROM permissions p 
        JOIN role_permissions rp ON p.id = rp.permission_id 
        WHERE rp.role_id = ?
      `).all(user.role_id) as any[];
      
      const typePerms = db.prepare(`
        SELECT * FROM role_type_permissions WHERE role_id = ?
      `).all(user.role_id) as any[];
      
      user.permissions = perms.map(p => p.name);
      user.type_permissions = typePerms;
      (req as any).user = user;
    }
  }
  next();
};

export const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  next();
};

export const requirePermission = (permission: string) => (req: any, res: any, next: any) => {
  if (!req.user || !req.user.permissions.includes(permission)) {
    return res.status(403).json({ error: `Missing required permission: ${permission}` });
  }
  next();
};

export const checkTypePermission = (action: "can_view" | "can_create" | "can_edit" | "can_delete") => (req: any, res: any, next: any) => {
  const typeId = req.body.type_id || req.params.type_id;
  if (!typeId && req.params.id) {
    const element = db.prepare("SELECT type_id FROM elements WHERE id = ?").get(req.params.id) as any;
    if (element) req.params.type_id = element.type_id;
  }
  
  const targetTypeId = typeId || req.params.type_id;
  const perm = req.user.type_permissions.find((p: any) => p.type_id == targetTypeId);
  
  if (!perm || !perm[action]) {
    return res.status(403).json({ error: `Permission denied for this element type: ${action}` });
  }
  next();
};
