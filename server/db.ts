import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = new Database("cms.db");

export function initDb() {
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

    CREATE TABLE IF NOT EXISTS graph_relationship_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_type_id INTEGER NOT NULL,
      target_type_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (source_type_id) REFERENCES element_types(id) ON DELETE CASCADE,
      FOREIGN KEY (target_type_id) REFERENCES element_types(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS graph_edges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rel_type_id INTEGER NOT NULL,
      source_el_id INTEGER NOT NULL,
      target_el_id INTEGER NOT NULL,
      FOREIGN KEY (rel_type_id) REFERENCES graph_relationship_types(id) ON DELETE CASCADE,
      FOREIGN KEY (source_el_id) REFERENCES elements(id) ON DELETE CASCADE,
      FOREIGN KEY (target_el_id) REFERENCES elements(id) ON DELETE CASCADE
    );

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

    CREATE TABLE IF NOT EXISTS interaction_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      element_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      type_id INTEGER NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (type_id) REFERENCES interaction_types(id) ON DELETE CASCADE
    );
  `);

  // Migrations
  try { db.exec("ALTER TABLE elements ADD COLUMN parent_id INTEGER REFERENCES elements(id) ON DELETE SET NULL"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE"); } catch (e) {}
  try { db.exec("ALTER TABLE users ALTER COLUMN password DROP NOT NULL"); } catch (e) {}

  // Seeding
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

    const adminRole = db.prepare("INSERT INTO roles (name, description) VALUES (?, ?)").run("Super Admin", "Full system access").lastInsertRowid;
    const editorRole = db.prepare("INSERT INTO roles (name, description) VALUES (?, ?)").run("Editor", "Can manage content but not schema").lastInsertRowid;
    const viewerRole = db.prepare("INSERT INTO roles (name, description) VALUES (?, ?)").run("Viewer", "Read-only access").lastInsertRowid;

    const manageTypes = db.prepare("INSERT INTO permissions (name, description) VALUES (?, ?)").run("manage_types", "Can create and edit element types").lastInsertRowid;
    const manageRoles = db.prepare("INSERT INTO permissions (name, description) VALUES (?, ?)").run("manage_roles", "Can manage roles and permissions").lastInsertRowid;

    db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(adminRole, manageTypes);
    db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(adminRole, manageRoles);

    const types = db.prepare("SELECT id FROM element_types").all() as any[];
    for (const t of types) {
      db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 0)").run(editorRole, t.id);
      db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 0, 0, 0)").run(viewerRole, t.id);
      db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 1)").run(adminRole, t.id);
    }

    const hashedPassword = bcrypt.hashSync("password123", 10);
    db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("admin", "admin@example.com", hashedPassword, adminRole);
    db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("editor", "editor@example.com", hashedPassword, editorRole);
    db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("viewer", "viewer@example.com", hashedPassword, viewerRole);

    const insertInteractionType = db.prepare("INSERT INTO interaction_types (name, icon, description) VALUES (?, ?, ?)");
    insertInteractionType.run("like", "Heart", "Users can like elements");
    insertInteractionType.run("favorite", "Star", "Users can favorite elements");
    insertInteractionType.run("comment", "MessageSquare", "Users can leave comments");
  }
}
