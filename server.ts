import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { OAuth2Client } from "google-auth-library";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openapiDocument = YAML.load(path.join(__dirname, "openapi.yaml"));

const db = new Database("cms.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS element_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER NOT NULL,
    table_name TEXT NOT NULL,
    label TEXT NOT NULL,
    FOREIGN KEY (type_id) REFERENCES element_types(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS elements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER NOT NULL,
    parent_id INTEGER,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES element_types(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES elements(id) ON DELETE SET NULL
  );

  -- Graph Relationships (Schema Level)
  CREATE TABLE IF NOT EXISTS graph_relationship_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type_id INTEGER NOT NULL,
    target_type_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (source_type_id) REFERENCES element_types(id) ON DELETE CASCADE,
    FOREIGN KEY (target_type_id) REFERENCES element_types(id) ON DELETE CASCADE
  );

  -- Graph (Instance Level)
  CREATE TABLE IF NOT EXISTS graph_edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rel_type_id INTEGER NOT NULL,
    source_el_id INTEGER NOT NULL,
    target_el_id INTEGER NOT NULL,
    FOREIGN KEY (rel_type_id) REFERENCES graph_relationship_types(id) ON DELETE CASCADE,
    FOREIGN KEY (source_el_id) REFERENCES elements(id) ON DELETE CASCADE,
    FOREIGN KEY (target_el_id) REFERENCES elements(id) ON DELETE CASCADE
  );

  -- Modular Tables
  CREATE TABLE IF NOT EXISTS content (
    element_id INTEGER PRIMARY KEY,
    body TEXT,
    FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS place (
    element_id INTEGER PRIMARY KEY,
    latitude REAL,
    longitude REAL,
    address TEXT,
    FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS file (
    element_id INTEGER PRIMARY KEY,
    filename TEXT,
    url TEXT,
    mime_type TEXT,
    FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS urls_embeds (
    element_id INTEGER PRIMARY KEY,
    url TEXT,
    title TEXT,
    embed_code TEXT,
    FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS time_tracking (
    element_id INTEGER PRIMARY KEY,
    start_time DATETIME,
    end_time DATETIME,
    duration INTEGER,
    FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_info (
    element_id INTEGER PRIMARY KEY,
    sku TEXT,
    price REAL,
    currency TEXT DEFAULT 'USD',
    stock INTEGER,
    FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE
  );

  -- Roles & Permissions
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS role_type_permissions (
    role_id INTEGER NOT NULL,
    type_id INTEGER NOT NULL,
    can_view INTEGER DEFAULT 1,
    can_create INTEGER DEFAULT 0,
    can_edit INTEGER DEFAULT 0,
    can_delete INTEGER DEFAULT 0,
    PRIMARY KEY (role_id, type_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES element_types(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    google_id TEXT UNIQUE,
    role_id INTEGER NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
  );
`);

// Migration for existing elements table
try {
  db.exec("ALTER TABLE elements ADD COLUMN parent_id INTEGER REFERENCES elements(id) ON DELETE SET NULL");
} catch (e) {}

// Migration for users table
try {
  db.exec("ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE");
} catch (e) {}
try {
  db.exec("ALTER TABLE users ALTER COLUMN password DROP NOT NULL");
} catch (e) {
  // SQLite doesn't support ALTER COLUMN DROP NOT NULL directly easily, 
  // but we can just ignore if it fails or handle it differently if needed.
  // Actually in SQLite, columns are nullable by default unless specified.
  // The original schema had NOT NULL.
}


// Seed initial data if empty
const typeCount = db.prepare("SELECT COUNT(*) as count FROM element_types").get() as { count: number };
if (typeCount.count === 0) {
  const insertType = db.prepare("INSERT INTO element_types (name, description) VALUES (?, ?)");
  const insertProp = db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)");

  const articleType = insertType.run("Article", "A standard blog post or news article").lastInsertRowid;
  insertProp.run(articleType, "content", "Main Content");
  insertProp.run(articleType, "urls_embeds", "Related Links");

  const productType = insertType.run("Product", "An item in the catalog").lastInsertRowid;
  insertProp.run(productType, "product_info", "Product Details");
  insertProp.run(productType, "content", "Description");
  insertProp.run(productType, "file", "Product Image");

  const eventType = insertType.run("Event", "A scheduled gathering").lastInsertRowid;
  insertProp.run(eventType, "content", "Event Description");
  insertProp.run(eventType, "place", "Location");
  insertProp.run(eventType, "time_tracking", "Schedule");

  // Seed Roles & Permissions
  const adminRole = db.prepare("INSERT INTO roles (name, description) VALUES (?, ?)").run("Super Admin", "Full system access").lastInsertRowid;
  const editorRole = db.prepare("INSERT INTO roles (name, description) VALUES (?, ?)").run("Editor", "Can manage content but not schema").lastInsertRowid;
  const viewerRole = db.prepare("INSERT INTO roles (name, description) VALUES (?, ?)").run("Viewer", "Read-only access").lastInsertRowid;

  const manageTypes = db.prepare("INSERT INTO permissions (name, description) VALUES (?, ?)").run("manage_types", "Can create and edit element types").lastInsertRowid;
  const manageRoles = db.prepare("INSERT INTO permissions (name, description) VALUES (?, ?)").run("manage_roles", "Can manage roles and permissions").lastInsertRowid;

  db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(adminRole, manageTypes);
  db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(adminRole, manageRoles);

  // Per-type granularity for Editor
  const types = db.prepare("SELECT id FROM element_types").all() as any[];
  for (const t of types) {
    db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)").run(editorRole, t.id, 1, 1, 1, 0);
    db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)").run(viewerRole, t.id, 1, 0, 0, 0);
    db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)").run(adminRole, t.id, 1, 1, 1, 1);
  }

  // Seed Users
  const hashedPassword = bcrypt.hashSync("password123", 10);
  db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("admin", "admin@example.com", hashedPassword, adminRole);
  db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("editor", "editor@example.com", hashedPassword, editorRole);
  db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("viewer", "viewer@example.com", hashedPassword, viewerRole);
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Swagger Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

  // Middleware to simulate authentication
  app.use((req, res, next) => {
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
  });

  // Permission Helpers
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    next();
  };

  const requirePermission = (permission: string) => (req: any, res: any, next: any) => {
    if (!req.user || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: `Missing required permission: ${permission}` });
    }
    next();
  };

  const checkTypePermission = (action: "can_view" | "can_create" | "can_edit" | "can_delete") => (req: any, res: any, next: any) => {
    const typeId = req.body.type_id || req.params.type_id;
    if (!typeId && req.params.id) {
      // If we only have element ID, look up its type
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

  // API Routes

  // Auth Routes
  app.post("/api/auth/register", (req, res) => {
    const { username, email, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const viewerRole = db.prepare("SELECT id FROM roles WHERE name = 'Viewer'").get() as any;
      const result = db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run(username, email, hashedPassword, viewerRole.id);
      res.json({ id: result.lastInsertRowid, username, email });
    } catch (err: any) {
      res.status(400).json({ error: "Username or email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    if (user && bcrypt.compareSync(password, user.password)) {
      res.cookie("session_id", user.id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });
      res.json({ id: user.id, username: user.username, email: user.email });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("session_id", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.json({ success: true });
  });

  // Google OAuth Routes
  const getGoogleClient = (req: any) => {
    const origin = req.get('origin') || process.env.APP_URL || `http://localhost:3000`;
    return new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${origin}/api/auth/google/callback`
    );
  };

  app.get("/api/auth/google/url", (req, res) => {
    const client = getGoogleClient(req);
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
    });
    res.json({ url });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("Code missing");

    try {
      const client = getGoogleClient(req);
      const { tokens } = await client.getToken(code as string);
      client.setCredentials(tokens);

      const userInfoRes = await client.request({ url: "https://www.googleapis.com/oauth2/v3/userinfo" }) as any;
      const userInfo = userInfoRes.data;

      // Find or create user
      let user = db.prepare("SELECT * FROM users WHERE google_id = ? OR email = ?").get(userInfo.sub, userInfo.email) as any;

      if (!user) {
        const viewerRole = db.prepare("SELECT id FROM roles WHERE name = 'Viewer'").get() as any;
        const username = userInfo.email.split("@")[0] + "_" + Math.random().toString(36).substring(7);
        const result = db.prepare("INSERT INTO users (username, email, google_id, role_id) VALUES (?, ?, ?, ?)").run(
          username,
          userInfo.email,
          userInfo.sub,
          viewerRole.id
        );
        user = { id: result.lastInsertRowid, username, email: userInfo.email };
      } else if (!user.google_id) {
        db.prepare("UPDATE users SET google_id = ? WHERE id = ?").run(userInfo.sub, user.id);
      }

      res.cookie("session_id", user.id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (err) {
      console.error("Google Auth Error:", err);
      res.status(500).send("Authentication failed");
    }
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { email, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user) {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, user.id);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Get all available permissions (Admin only)
  app.get("/api/permissions", requirePermission("manage_roles"), (req, res) => {
    const perms = db.prepare("SELECT * FROM permissions").all();
    res.json(perms);
  });

  // Get current user info
  app.get("/api/me", (req, res) => {
    res.json((req as any).user || null);
  });

  // Get all users (Admin only)
  app.get("/api/users", requirePermission("manage_roles"), (req, res) => {
    const users = db.prepare(`
      SELECT u.id, u.username, u.email, u.role_id, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id
    `).all();
    res.json(users);
  });

  // Get all roles and their permissions (Admin only)
  app.get("/api/roles", requirePermission("manage_roles"), (req, res) => {
    const roles = db.prepare("SELECT * FROM roles").all();
    const rolesWithData = roles.map((role: any) => {
      const perms = db.prepare(`
        SELECT p.* 
        FROM permissions p 
        JOIN role_permissions rp ON p.id = rp.permission_id 
        WHERE rp.role_id = ?
      `).all(role.id);
      
      const typePerms = db.prepare(`
        SELECT rtp.*, et.name as type_name 
        FROM role_type_permissions rtp 
        JOIN element_types et ON rtp.type_id = et.id 
        WHERE rtp.role_id = ?
      `).all(role.id);
      
      return { ...role, permissions: perms, type_permissions: typePerms };
    });
    res.json(rolesWithData);
  });

  // Get all types
  app.get("/api/types", requireAuth, (req, res) => {
    const types = db.prepare("SELECT * FROM element_types").all();
    const typesWithProps = types.map((type: any) => {
      const props = db.prepare("SELECT * FROM properties WHERE type_id = ?").all(type.id);
      return { ...type, properties: props };
    });
    res.json(typesWithProps);
  });

  // Create a new type (Admin only)
  app.post("/api/types", requirePermission("manage_types"), (req, res) => {
    const { name, description, properties } = req.body;
    try {
      const transaction = db.transaction(() => {
        const typeId = db.prepare("INSERT INTO element_types (name, description) VALUES (?, ?)").run(name, description).lastInsertRowid;
        const insertProp = db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)");
        for (const prop of properties) {
          insertProp.run(typeId, prop.table_name, prop.label);
        }
        
        // Auto-grant full permissions to Super Admin for new type
        const adminRole = db.prepare("SELECT id FROM roles WHERE name = 'Super Admin'").get() as any;
        if (adminRole) {
          db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 1)").run(adminRole.id, typeId);
        }
        
        return typeId;
      });
      const id = transaction();
      res.json({ id, name, description, properties });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete a type (Admin only)
  app.delete("/api/types/:id", requirePermission("manage_types"), (req, res) => {
    try {
      db.prepare("DELETE FROM element_types WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update role global permissions (Admin only)
  app.put("/api/roles/:id/permissions", requirePermission("manage_roles"), (req, res) => {
    const { permission_ids } = req.body;
    const roleId = req.params.id;
    try {
      const transaction = db.transaction(() => {
        db.prepare("DELETE FROM role_permissions WHERE role_id = ?").run(roleId);
        const insert = db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
        for (const pid of permission_ids) {
          insert.run(roleId, pid);
        }
      });
      transaction();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update role type permissions (Admin only)
  app.put("/api/roles/:id/type-permissions/:type_id", requirePermission("manage_roles"), (req, res) => {
    const { can_view, can_create, can_edit, can_delete } = req.body;
    const { id: roleId, type_id: typeId } = req.params;
    try {
      db.prepare(`
        UPDATE role_type_permissions 
        SET can_view = ?, can_create = ?, can_edit = ?, can_delete = ? 
        WHERE role_id = ? AND type_id = ?
      `).run(can_view ? 1 : 0, can_create ? 1 : 0, can_edit ? 1 : 0, can_delete ? 1 : 0, roleId, typeId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Relationship Routes
  app.get("/api/relationship-types", requireAuth, (req, res) => {
    const types = db.prepare(`
      SELECT grt.*, st.name as source_type_name, tt.name as target_type_name 
      FROM graph_relationship_types grt
      JOIN element_types st ON grt.source_type_id = st.id
      JOIN element_types tt ON grt.target_type_id = tt.id
    `).all();
    res.json(types);
  });

  app.post("/api/relationship-types", requirePermission("manage_types"), (req, res) => {
    const { source_type_id, target_type_id, name } = req.body;
    try {
      const result = db.prepare("INSERT INTO graph_relationship_types (source_type_id, target_type_id, name) VALUES (?, ?, ?)").run(source_type_id, target_type_id, name);
      res.json({ id: result.lastInsertRowid, source_type_id, target_type_id, name });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/relationship-types/:id", requirePermission("manage_types"), (req, res) => {
    db.prepare("DELETE FROM graph_relationship_types WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/graph", requireAuth, (req, res) => {
    const edges = db.prepare(`
      SELECT ge.*, grt.name as rel_name, se.name as source_name, te.name as target_name
      FROM graph_edges ge
      JOIN graph_relationship_types grt ON ge.rel_type_id = grt.id
      JOIN elements se ON ge.source_el_id = se.id
      JOIN elements te ON ge.target_el_id = te.id
    `).all();
    res.json(edges);
  });

  app.post("/api/graph", requireAuth, (req, res) => {
    const { rel_type_id, source_el_id, target_el_id } = req.body;
    // Check permissions for both elements
    const se = db.prepare("SELECT type_id FROM elements WHERE id = ?").get(source_el_id) as any;
    const te = db.prepare("SELECT type_id FROM elements WHERE id = ?").get(target_el_id) as any;
    
    if (!se || !te) return res.status(404).json({ error: "Elements not found" });
    
    const user = (req as any).user;
    const sPerm = user.type_permissions.find((p: any) => p.type_id === se.type_id);
    const tPerm = user.type_permissions.find((p: any) => p.type_id === te.type_id);
    
    if (!sPerm?.can_edit || !tPerm?.can_edit) {
      return res.status(403).json({ error: "Permission denied to link these elements" });
    }

    try {
      const result = db.prepare("INSERT INTO graph_edges (rel_type_id, source_el_id, target_el_id) VALUES (?, ?, ?)").run(rel_type_id, source_el_id, target_el_id);
      res.json({ id: result.lastInsertRowid, rel_type_id, source_el_id, target_el_id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/graph/:id", requireAuth, (req, res) => {
    db.prepare("DELETE FROM graph_edges WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Get all elements (Filtered by view permission)
  app.get("/api/elements", requireAuth, (req, res) => {
    const user = (req as any).user;
    const allowedTypeIds = user.type_permissions.filter((p: any) => p.can_view).map((p: any) => p.type_id);
    
    if (allowedTypeIds.length === 0) return res.json([]);

    const placeholders = allowedTypeIds.map(() => "?").join(",");
    const elements = db.prepare(`
      SELECT e.*, t.name as type_name 
      FROM elements e 
      JOIN element_types t ON e.type_id = t.id
      WHERE e.type_id IN (${placeholders})
      ORDER BY e.updated_at DESC
    `).all(...allowedTypeIds);
    res.json(elements);
  });

  // Get single element (Filtered by view permission)
  app.get("/api/elements/:id", requireAuth, checkTypePermission("can_view"), (req, res) => {
    const element = db.prepare(`
      SELECT e.*, t.name as type_name 
      FROM elements e 
      JOIN element_types t ON e.type_id = t.id
      WHERE e.id = ?
    `).get(req.params.id) as any;

    if (!element) return res.status(404).json({ error: "Element not found" });

    const props = db.prepare("SELECT table_name FROM properties WHERE type_id = ?").all(element.type_id) as any[];
    const data: any = { ...element };

    for (const prop of props) {
      const tableData = db.prepare(`SELECT * FROM ${prop.table_name} WHERE element_id = ?`).get(element.id);
      data[prop.table_name] = tableData || {};
    }

    res.json(data);
  });

  // Create element (Filtered by create permission)
  app.post("/api/elements", requireAuth, checkTypePermission("can_create"), (req, res) => {
    const { name, type_id, parent_id, modular_data } = req.body;
    try {
      const transaction = db.transaction(() => {
        const elementId = db.prepare("INSERT INTO elements (name, type_id, parent_id) VALUES (?, ?, ?)").run(name, type_id, parent_id).lastInsertRowid;
        
        const props = db.prepare("SELECT table_name FROM properties WHERE type_id = ?").all(type_id) as any[];
        
        for (const prop of props) {
          const table = prop.table_name;
          const fields = modular_data[table] || {};
          const keys = Object.keys(fields);
          if (keys.length > 0) {
            const columns = ["element_id", ...keys].join(", ");
            const placeholders = ["?", ...keys.map(() => "?")].join(", ");
            const values = [elementId, ...keys.map(k => fields[k])];
            db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).run(...values);
          } else {
            db.prepare(`INSERT INTO ${table} (element_id) VALUES (?)`).run(elementId);
          }
        }
        return elementId;
      });
      const id = transaction();
      res.json({ id, name, type_id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update element (Filtered by edit permission)
  app.put("/api/elements/:id", requireAuth, checkTypePermission("can_edit"), (req, res) => {
    const { name, parent_id, modular_data } = req.body;
    const elementId = req.params.id;
    try {
      const transaction = db.transaction(() => {
        db.prepare("UPDATE elements SET name = ?, parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(name, parent_id, elementId);
        
        const element = db.prepare("SELECT type_id FROM elements WHERE id = ?").get(elementId) as any;
        const props = db.prepare("SELECT table_name FROM properties WHERE type_id = ?").all(element.type_id) as any[];
        
        for (const prop of props) {
          const table = prop.table_name;
          const fields = modular_data[table] || {};
          const keys = Object.keys(fields);
          
          if (keys.length > 0) {
            const setClause = keys.map(k => `${k} = ?`).join(", ");
            const values = [...keys.map(k => fields[k]), elementId];
            db.prepare(`UPDATE ${table} SET ${setClause} WHERE element_id = ?`).run(...values);
          }
        }
      });
      transaction();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete element (Filtered by delete permission)
  app.delete("/api/elements/:id", requireAuth, checkTypePermission("can_delete"), (req, res) => {
    try {
      db.prepare("DELETE FROM elements WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // User Management Routes (Admin only)
  app.put("/api/users/:id/role", requirePermission("manage_roles"), (req, res) => {
    const { role_id } = req.body;
    try {
      db.prepare("UPDATE users SET role_id = ? WHERE id = ?").run(role_id, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
