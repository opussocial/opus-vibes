import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { slugify } from "./utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = new Database("cms.db");

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS element_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      statuses TEXT, -- JSON array of strings
      color TEXT DEFAULT '#6366f1',
      icon TEXT DEFAULT 'Package'
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
      slug TEXT NOT NULL UNIQUE,
      status TEXT,
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
      slug TEXT NOT NULL UNIQUE,
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
      profile_element_id INTEGER,
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (profile_element_id) REFERENCES elements(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS interaction_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS type_hierarchy (
      parent_type_id INTEGER NOT NULL,
      child_type_id INTEGER NOT NULL,
      PRIMARY KEY (parent_type_id, child_type_id),
      FOREIGN KEY (parent_type_id) REFERENCES element_types(id) ON DELETE CASCADE,
      FOREIGN KEY (child_type_id) REFERENCES element_types(id) ON DELETE CASCADE
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

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      payload TEXT, -- JSON
      status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
      priority INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 3,
      error TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME
    );

    -- Trigger to automatically add default permissions for all roles when a new type is created
    CREATE TRIGGER IF NOT EXISTS after_type_insert
    AFTER INSERT ON element_types
    BEGIN
      INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete)
      SELECT id, NEW.id, 1, (CASE WHEN name = 'Super Admin' THEN 1 ELSE 0 END), (CASE WHEN name = 'Super Admin' THEN 1 ELSE 0 END), (CASE WHEN name = 'Super Admin' THEN 1 ELSE 0 END)
      FROM roles;
    END;
  `);

  // Migrations
  try { db.exec("ALTER TABLE elements ADD COLUMN parent_id INTEGER REFERENCES elements(id) ON DELETE SET NULL"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN profile_element_id INTEGER REFERENCES elements(id) ON DELETE SET NULL"); } catch (e) {}
  try { db.exec("ALTER TABLE users ALTER COLUMN password DROP NOT NULL"); } catch (e) {}
  try { db.exec("ALTER TABLE element_types ADD COLUMN statuses TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE elements ADD COLUMN status TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE element_types ADD COLUMN color TEXT DEFAULT '#6366f1'"); } catch (e) {}
  try { db.exec("ALTER TABLE element_types ADD COLUMN icon TEXT DEFAULT 'Package'"); } catch (e) {}
  
  // Slug Migrations
  try { db.exec("ALTER TABLE element_types ADD COLUMN slug TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE elements ADD COLUMN slug TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE roles ADD COLUMN slug TEXT"); } catch (e) {}

  // Fill existing slugs if null
  const types = db.prepare("SELECT id, name FROM element_types WHERE slug IS NULL").all() as any[];
  for (const t of types) {
    db.prepare("UPDATE element_types SET slug = ? WHERE id = ?").run(slugify(t.name), t.id);
  }
  const els = db.prepare("SELECT id, name FROM elements WHERE slug IS NULL").all() as any[];
  for (const e of els) {
    db.prepare("UPDATE elements SET slug = ? WHERE id = ?").run(slugify(e.name) + "-" + e.id, e.id);
  }
  const rs = db.prepare("SELECT id, name FROM roles WHERE slug IS NULL").all() as any[];
  for (const r of rs) {
    db.prepare("UPDATE roles SET slug = ? WHERE id = ?").run(slugify(r.name), r.id);
  }

  // Seeding
  const typeCount = db.prepare("SELECT COUNT(*) as count FROM element_types").get() as { count: number };
  if (typeCount.count === 0) {
    const insertType = db.prepare("INSERT INTO element_types (name, slug, description) VALUES (?, ?, ?)");
    const insertProp = db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)");

    const articleType = insertType.run("Article", "article", "A standard blog post or news article").lastInsertRowid;
    insertProp.run(articleType, "content", "Main Content");
    insertProp.run(articleType, "urls_embeds", "Related Links");

    const productType = insertType.run("Product", "product", "An item in the catalog").lastInsertRowid;
    insertProp.run(productType, "product_info", "Product Details");
    insertProp.run(productType, "content", "Description");
    insertProp.run(productType, "file", "Product Image");

    const eventType = insertType.run("Event", "event", "A scheduled gathering").lastInsertRowid;
    insertProp.run(eventType, "content", "Event Description");
    insertProp.run(eventType, "place", "Location");
    insertProp.run(eventType, "time_tracking", "Schedule");

    const categoryType = insertType.run("Category", "category", "A grouping for other elements").lastInsertRowid;
    insertProp.run(categoryType, "content", "Category Description");

    const profileType = insertType.run("Profile", "profile", "User personal information and settings").lastInsertRowid;
    insertProp.run(profileType, "content", "Bio");
    insertProp.run(profileType, "place", "Location");
    insertProp.run(profileType, "file", "Avatar");

    // Hierarchy: Articles can be under Categories or other Articles
    const insertHierarchy = db.prepare("INSERT INTO type_hierarchy (parent_type_id, child_type_id) VALUES (?, ?)");
    insertHierarchy.run(categoryType, articleType);
    insertHierarchy.run(articleType, articleType);
    insertHierarchy.run(categoryType, productType);
    insertHierarchy.run(categoryType, categoryType); // Nested categories

    const adminRole = db.prepare("INSERT INTO roles (name, slug, description) VALUES (?, ?, ?)").run("Super Admin", "super-admin", "Full system access").lastInsertRowid;
    const editorRole = db.prepare("INSERT INTO roles (name, slug, description) VALUES (?, ?, ?)").run("Editor", "editor", "Can manage content but not schema").lastInsertRowid;
    const viewerRole = db.prepare("INSERT INTO roles (name, slug, description) VALUES (?, ?, ?)").run("Viewer", "viewer", "Read-only access").lastInsertRowid;

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

    // Seed Sample Elements
    const articleId = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("Welcome to FlexCatalog", "welcome-to-flexcatalog", articleType).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(articleId, "This is your first modular element. You can edit it to see how the modular data system works.");
    db.prepare("INSERT INTO urls_embeds (element_id, url, title) VALUES (?, ?, ?)").run(articleId, "https://github.com", "Project Source");

    const productId = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("Premium Subscription", "premium-subscription", productType).lastInsertRowid;
    db.prepare("INSERT INTO product_info (element_id, sku, price, currency, stock) VALUES (?, ?, ?, ?, ?)").run(productId, "SUB-001", 99.99, "USD", 1000);
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(productId, "Get full access to all features with our premium plan.");

    const eventId = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("Launch Party", "launch-party", eventType).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(eventId, "Join us for the official launch of FlexCatalog CMS!");
    db.prepare("INSERT INTO place (element_id, latitude, longitude, address) VALUES (?, ?, ?, ?)").run(eventId, 37.7749, -122.4194, "San Francisco, CA");
    db.prepare("INSERT INTO time_tracking (element_id, start_time, end_time, duration) VALUES (?, ?, ?, ?)").run(eventId, "2024-12-01 18:00:00", "2024-12-01 22:00:00", 240);
  }

  // Ensure Profile type exists
  let profileType = db.prepare("SELECT id FROM element_types WHERE slug = 'profile'").get() as any;
  if (!profileType) {
    const typeId = db.prepare("INSERT INTO element_types (name, slug, description) VALUES (?, ?, ?)").run("Profile", "profile", "User personal information and settings").lastInsertRowid;
    db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)").run(typeId, "content", "Bio");
    db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)").run(typeId, "place", "Location");
    db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)").run(typeId, "file", "Avatar");
    
    // Grant permissions to all roles for the new type
    const roles = db.prepare("SELECT id, name FROM roles").all() as any[];
    for (const role of roles) {
      const canEdit = role.name !== "Viewer" ? 1 : 0;
      const canCreate = role.name === "Super Admin" ? 1 : 0;
      db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, ?, ?, 0)")
        .run(role.id, typeId, canCreate, canEdit);
    }
  }

  // Ensure at least one admin exists
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM users JOIN roles ON users.role_id = roles.id WHERE roles.name = 'Super Admin'").get() as { count: number };
  if (adminCount.count === 0) {
    let adminRole = db.prepare("SELECT id FROM roles WHERE name = 'Super Admin'").get() as any;
    if (!adminRole) {
      adminRole = { id: db.prepare("INSERT INTO roles (name, slug, description) VALUES (?, ?, ?)").run("Super Admin", "super-admin", "Full system access").lastInsertRowid };
    }
    const hashedPassword = bcrypt.hashSync("password123", 10);
    db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("admin", "admin@example.com", hashedPassword, adminRole.id);
  }

  // Ensure Editor exists
  const editorCount = db.prepare("SELECT COUNT(*) as count FROM users JOIN roles ON users.role_id = roles.id WHERE roles.name = 'Editor'").get() as { count: number };
  if (editorCount.count === 0) {
    let editorRole = db.prepare("SELECT id FROM roles WHERE name = 'Editor'").get() as any;
    if (editorRole) {
      const hashedPassword = bcrypt.hashSync("password123", 10);
      db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("editor", "editor@example.com", hashedPassword, editorRole.id);
    }
  }

  // Ensure Viewer exists
  const viewerCount = db.prepare("SELECT COUNT(*) as count FROM users JOIN roles ON users.role_id = roles.id WHERE roles.name = 'Viewer'").get() as { count: number };
  if (viewerCount.count === 0) {
    let viewerRole = db.prepare("SELECT id FROM roles WHERE name = 'Viewer'").get() as any;
    if (viewerRole) {
      const hashedPassword = bcrypt.hashSync("password123", 10);
      db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("viewer", "viewer@example.com", hashedPassword, viewerRole.id);
    }
  }
}
