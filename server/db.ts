import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { slugify } from "./utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = new Database("cms.db");

export function initDb() {
  console.log("[DEBUG] initDb started");
  db.exec(`
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

    CREATE TABLE IF NOT EXISTS element_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      statuses TEXT, -- JSON array of strings
      color TEXT DEFAULT '#6366f1',
      icon TEXT DEFAULT 'Package',
      settings TEXT -- JSON object
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
      user_id INTEGER,
      parent_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (type_id) REFERENCES element_types(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (parent_id) REFERENCES elements(id) ON DELETE SET NULL
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
  `);

  // --- Seed Roles and Permissions FIRST so triggers work ---
  const rolesToSeed = [
    { name: "Super Admin", slug: "super-admin", description: "Full system access" },
    { name: "Editor", slug: "editor", description: "Can edit content" },
    { name: "Viewer", slug: "viewer", description: "Can only view content" }
  ];

  for (const role of rolesToSeed) {
    db.prepare("INSERT OR IGNORE INTO roles (name, slug, description) VALUES (?, ?, ?)").run(role.name, role.slug, role.description);
  }

  const globalPermissions = [
    { name: "manage_types", description: "Can manage schema types, app definitions, and settings" },
    { name: "manage_roles", description: "Can manage roles, users, and global permissions" },
    { name: "view_all_elements", description: "Can view all elements regardless of ownership" }
  ];

  for (const perm of globalPermissions) {
    db.prepare("INSERT OR IGNORE INTO permissions (name, description) VALUES (?, ?)").run(perm.name, perm.description);
  }

  const adminRole = db.prepare("SELECT id FROM roles WHERE slug = 'super-admin'").get() as any;
  if (adminRole) {
    const allPerms = db.prepare("SELECT id FROM permissions").all() as any[];
    for (const p of allPerms) {
      db.prepare("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(adminRole.id, p.id);
    }
  }

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS after_type_insert
    AFTER INSERT ON element_types
    BEGIN
      INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete)
      SELECT id, NEW.id, 1, (CASE WHEN name = 'Super Admin' THEN 1 ELSE 0 END), (CASE WHEN name = 'Super Admin' THEN 1 ELSE 0 END), (CASE WHEN name = 'Super Admin' THEN 1 ELSE 0 END)
      FROM roles;
    END;
  `);

  // Add user_id column if it doesn't exist (for existing databases)
  try {
    db.exec("ALTER TABLE elements ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL");
  } catch (e) {
    // Column might already exist
  }

  db.exec(`
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

    CREATE TABLE IF NOT EXISTS color (
      element_id INTEGER PRIMARY KEY,
      hex TEXT NOT NULL,
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

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      value TEXT NOT NULL, -- JSON string
      type_id INTEGER,
      user_id INTEGER,
      FOREIGN KEY (type_id) REFERENCES element_types(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(key, type_id, user_id)
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
  try { db.exec("ALTER TABLE element_types ADD COLUMN settings TEXT"); } catch (e) {}
  
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

  console.log("Database initialized. Starting seeding...");

  // --- Seeding Helpers ---
  const ensureType = (name: string, slug: string, description: string, icon: string, color: string) => {
    db.prepare("INSERT OR IGNORE INTO element_types (name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?)").run(name, slug, description, icon, color);
    return (db.prepare("SELECT id FROM element_types WHERE slug = ?").get(slug) as any).id;
  };

  const ensureProperty = (typeId: number, tableName: string, label: string) => {
    const exists = db.prepare("SELECT id FROM properties WHERE type_id = ? AND table_name = ?").get(typeId, tableName);
    if (!exists) {
      db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)").run(typeId, tableName, label);
    }
  };

  const ensureHierarchy = (parentId: number, childId: number) => {
    db.prepare("INSERT OR IGNORE INTO type_hierarchy (parent_type_id, child_type_id) VALUES (?, ?)").run(parentId, childId);
  };

  const ensureElement = (name: string, slug: string, typeId: number, parentId: number | null = null) => {
    db.prepare("INSERT OR IGNORE INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run(name, slug, typeId, parentId);
    return (db.prepare("SELECT id FROM elements WHERE slug = ?").get(slug) as any).id;
  };

  // --- 1. Seed Types ---
  const magType = ensureType("Magazine", "magazine", "A periodic publication", "BookOpen", "#1e40af");
  ensureProperty(magType, "content", "Description");
  ensureProperty(magType, "file", "Logo/Cover");

  const issueType = ensureType("Issue", "issue", "A specific edition of a publication", "Layers", "#0369a1");
  ensureProperty(issueType, "content", "Summary");
  ensureProperty(issueType, "time_tracking", "Release Schedule");

  const articleType = ensureType("Article", "article", "A written piece of content", "FileText", "#0891b2");
  ensureProperty(articleType, "content", "Article Body");
  ensureProperty(articleType, "urls_embeds", "References");

  const pageType = ensureType("Page", "page", "A static informational page", "File", "#0f766e");
  ensureProperty(pageType, "content", "Page Content");

  const hostelType = ensureType("Hostel", "hostel", "A budget-friendly lodging establishment", "Home", "#b91c1c");
  ensureProperty(hostelType, "content", "Description");
  ensureProperty(hostelType, "place", "Location");

  const roomType = ensureType("Room", "room", "A room within a hostel", "DoorOpen", "#dc2626");
  ensureProperty(roomType, "content", "Room Details");

  const bedType = ensureType("Bed", "bed", "An individual bed in a room", "Bed", "#ef4444");
  ensureProperty(bedType, "color", "Status Color");

  const bookstoreType = ensureType("Bookstore", "bookstore", "A shop that sells books", "Store", "#15803d");
  ensureProperty(bookstoreType, "content", "About the Store");
  ensureProperty(bookstoreType, "place", "Location");

  const bookType = ensureType("Book", "book", "A printed or digital work", "Book", "#16a34a");
  ensureProperty(bookType, "content", "Summary");
  ensureProperty(bookType, "product_info", "Pricing & SKU");

  const authorType = ensureType("Author", "author", "A person who writes books", "User", "#22c55e");
  ensureProperty(authorType, "content", "Biography");

  const galleryType = ensureType("Art Gallery", "art-gallery", "A space for the exhibition of art", "Image", "#db2777");
  ensureProperty(galleryType, "content", "Gallery Mission");
  ensureProperty(galleryType, "place", "Location");

  const exhibitionType = ensureType("Exhibition", "exhibition", "A public display of art or items", "Palette", "#be185d");
  ensureProperty(exhibitionType, "content", "Exhibition Theme");
  ensureProperty(exhibitionType, "time_tracking", "Duration");

  const artworkType = ensureType("Artwork", "artwork", "A single piece of art", "Frame", "#9d174d");
  ensureProperty(artworkType, "content", "Artist Statement");
  ensureProperty(artworkType, "file", "Image of Work");
  ensureProperty(artworkType, "product_info", "Price & Availability");

  const studioType = ensureType("Music Studio", "music-studio", "A facility for sound recording and mixing", "Mic2", "#2563eb");
  ensureProperty(studioType, "content", "Studio Gear & Bio");
  ensureProperty(studioType, "place", "Location");

  const sessionType = ensureType("Recording Session", "recording-session", "A scheduled time for recording", "Clock", "#1d4ed8");
  ensureProperty(sessionType, "time_tracking", "Session Time");
  ensureProperty(sessionType, "content", "Session Notes");

  const trackType = ensureType("Track", "track", "A single musical recording", "Music", "#1e40af");
  ensureProperty(trackType, "content", "Lyrics/Notes");
  ensureProperty(trackType, "file", "Audio Preview");

  const agencyType = ensureType("Creative Agency", "creative-agency", "A business providing creative services", "Briefcase", "#4f46e5");
  ensureProperty(agencyType, "content", "Agency Bio");
  ensureProperty(agencyType, "place", "Headquarters");

  const projectType = ensureType("Project", "project", "A specific creative project", "ClipboardList", "#4338ca");
  ensureProperty(projectType, "content", "Project Scope");
  ensureProperty(projectType, "time_tracking", "Timeline");

  const assetType = ensureType("Asset", "asset", "A creative deliverable", "FileImage", "#3730a3");
  ensureProperty(assetType, "file", "File");
  ensureProperty(assetType, "content", "Asset Description");

  const storyType = ensureType("Story", "story", "A narrative or screenplay project", "Clapperboard", "#7c3aed");
  ensureProperty(storyType, "content", "Logline & Synopsis");

  const chapterType = ensureType("Chapter", "chapter", "A major division of a story", "Bookmark", "#8b5cf6");
  ensureProperty(chapterType, "content", "Chapter Summary");

  const characterType = ensureType("Character", "character", "A person in the story", "Users", "#a78bfa");
  ensureProperty(characterType, "content", "Character Profile");

  const sceneType = ensureType("Scene", "scene", "A specific sequence in a chapter", "Video", "#c4b5fd");
  ensureProperty(sceneType, "content", "Script Content");

  const tagType = ensureType("Tag", "tag", "Categorization tags", "Tag", "#10b981");

  // --- 2. Seed Hierarchy ---
  ensureHierarchy(magType, issueType);
  ensureHierarchy(issueType, pageType);
  ensureHierarchy(issueType, articleType);
  ensureHierarchy(magType, pageType);
  ensureHierarchy(hostelType, roomType);
  ensureHierarchy(roomType, bedType);
  ensureHierarchy(bookstoreType, bookType);
  ensureHierarchy(bookstoreType, authorType);
  ensureHierarchy(galleryType, exhibitionType);
  ensureHierarchy(exhibitionType, artworkType);
  ensureHierarchy(studioType, sessionType);
  ensureHierarchy(sessionType, trackType);
  ensureHierarchy(agencyType, projectType);
  ensureHierarchy(projectType, assetType);
  ensureHierarchy(storyType, chapterType);
  ensureHierarchy(chapterType, sceneType);
  ensureHierarchy(storyType, characterType);

  // --- 3. Seed Elements ---
  const magId = ensureElement("The Magazine", "the-magazine", magType);
  db.prepare("INSERT OR IGNORE INTO content (element_id, body) VALUES (?, ?)").run(magId, "Documenting the evolution of human creativity, technology, and culture in the digital age.");

  const issueId = ensureElement("March 2026: The AI Revolution", "march-2026-ai-revolution", issueType, magId);
  db.prepare("INSERT OR IGNORE INTO content (element_id, body) VALUES (?, ?)").run(issueId, "This issue explores the rapid advancement of generative agents and their impact on global industries.");
  db.prepare("INSERT OR IGNORE INTO time_tracking (element_id, start_time, end_time) VALUES (?, ?, ?)").run(issueId, "2026-03-01 00:00:00", "2026-03-31 23:59:59");

  const page1Id = ensureElement("About The Magazine", "about-the-magazine", pageType, magId);
  db.prepare("INSERT OR IGNORE INTO content (element_id, body) VALUES (?, ?)").run(page1Id, "Founded in 2020, The Magazine has been at the forefront of journalism for over half a decade.");

  const articleId = ensureElement("The Rise of Generative Agents", "rise-of-generative-agents", articleType, issueId);
  db.prepare("INSERT OR IGNORE INTO content (element_id, body) VALUES (?, ?)").run(articleId, "Generative agents are no longer just chatbots; they are becoming autonomous collaborators in the workplace...");
  db.prepare("INSERT OR IGNORE INTO urls_embeds (element_id, url, title) VALUES (?, ?, ?)").run(articleId, "https://ai.google.dev", "Learn more about Gemini");

  const hostelId = ensureElement("The Nomad's Rest", "nomads-rest", hostelType);
  db.prepare("INSERT OR IGNORE INTO content (element_id, body) VALUES (?, ?)").run(hostelId, "A cozy, community-driven hostel located in the heart of the historic district.");
  db.prepare("INSERT OR IGNORE INTO place (element_id, latitude, longitude, address) VALUES (?, ?, ?, ?)").run(hostelId, 52.3676, 4.9041, "Amsterdam, Netherlands");

  const roomId = ensureElement("Mixed Dorm A", "mixed-dorm-a", roomType, hostelId);
  db.prepare("INSERT OR IGNORE INTO content (element_id, body) VALUES (?, ?)").run(roomId, "A spacious 8-bed dorm with lockers and high-speed Wi-Fi.");

  const bed1Id = ensureElement("Bed A1 (Lower)", "bed-a1", bedType, roomId);
  db.prepare("INSERT OR IGNORE INTO color (element_id, hex) VALUES (?, ?)").run(bed1Id, "#10b981");

  const artworkId = ensureElement("Latent Dreams #4", "latent-dreams-4", artworkType);
  db.prepare("INSERT OR IGNORE INTO content (element_id, body) VALUES (?, ?)").run(artworkId, "A large-scale generative piece exploring the subconscious of a neural network.");
  db.prepare("INSERT OR IGNORE INTO product_info (element_id, sku, price, currency, stock) VALUES (?, ?, ?, ?, ?)").run(artworkId, "ART-LD-04", 4500.00, "USD", 1);
  db.prepare("INSERT OR IGNORE INTO file (element_id, filename, url, mime_type) VALUES (?, ?, ?, ?)").run(artworkId, "latent-dreams.jpg", "https://picsum.photos/seed/art/1200/800", "image/jpeg");

  // --- 4. Seed Interaction Types ---
  const likeTypeId = db.prepare("INSERT OR IGNORE INTO interaction_types (name, icon, description) VALUES (?, ?, ?)").run("Like", "Heart", "User likes the element").lastInsertRowid;
  const commentTypeId = db.prepare("INSERT OR IGNORE INTO interaction_types (name, icon, description) VALUES (?, ?, ?)").run("Comment", "MessageSquare", "User commented on the element").lastInsertRowid;
  db.prepare("INSERT OR IGNORE INTO interaction_types (name, icon, description) VALUES (?, ?, ?)").run("View", "Eye", "User viewed the element");

  // Ensure Profile type exists
  let profileType = db.prepare("SELECT id FROM element_types WHERE slug = 'profile'").get() as any;
  if (!profileType) {
    const typeId = db.prepare("INSERT INTO element_types (name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?)").run("Profile", "profile", "User personal information and settings", "User", "#6366f1").lastInsertRowid;
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

  // --- 5. Fix role_type_permissions for existing types ---
  const allTypes = db.prepare("SELECT id FROM element_types").all() as any[];
  const allRoles = db.prepare("SELECT id, name FROM roles").all() as any[];
  for (const type of allTypes) {
    for (const role of allRoles) {
      db.prepare(`
        INSERT OR IGNORE INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete)
        VALUES (?, ?, 1, ?, ?, ?)
      `).run(
        role.id, 
        type.id, 
        role.name === 'Super Admin' ? 1 : 0,
        role.name === 'Super Admin' ? 1 : 0,
        role.name === 'Super Admin' ? 1 : 0
      );
    }
  }

  // Ensure current user is Super Admin
  const currentUserEmail = "pedrokoblitz@gmail.com";
  const currentUser = db.prepare("SELECT id FROM users WHERE email = ?").get(currentUserEmail) as any;
  if (currentUser && adminRole) {
    console.log(`Ensuring ${currentUserEmail} is Super Admin...`);
    db.prepare("UPDATE users SET role_id = ? WHERE id = ?").run(adminRole.id, currentUser.id);
  }

  const adminExists = db.prepare("SELECT id FROM users WHERE username = 'admin' OR email = 'admin@example.com'").get() as any;
  if (!adminExists && adminRole) {
    console.log("Creating default admin user...");
    const hashedPassword = bcrypt.hashSync("password123", 10);
    db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("admin", "admin@example.com", hashedPassword, adminRole.id);
  } else if (adminExists && adminRole) {
    db.prepare("UPDATE users SET role_id = ? WHERE id = ?").run(adminRole.id, adminExists.id);
  }

  // Ensure Editor exists
  const editorRole = db.prepare("SELECT id FROM roles WHERE slug = 'editor'").get() as any;
  const editorExists = db.prepare("SELECT id FROM users WHERE username = 'editor' OR email = 'editor@example.com'").get();
  if (!editorExists && editorRole) {
    const hashedPassword = bcrypt.hashSync("password123", 10);
    db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("editor", "editor@example.com", hashedPassword, editorRole.id);
  }

  // Ensure Viewer exists
  const viewerRole = db.prepare("SELECT id FROM roles WHERE slug = 'viewer'").get() as any;
  const viewerExists = db.prepare("SELECT id FROM users WHERE username = 'viewer' OR email = 'viewer@example.com'").get();
  if (!viewerExists && viewerRole) {
    const hashedPassword = bcrypt.hashSync("password123", 10);
    db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("viewer", "viewer@example.com", hashedPassword, viewerRole.id);
  }

  // Ensure creative_pro exists
  const proExists = db.prepare("SELECT id FROM users WHERE username = 'creative_pro' OR email = 'pro@creative.com'").get();
  if (!proExists && viewerRole) {
    const hashedPassword = bcrypt.hashSync("password123", 10);
    db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("creative_pro", "pro@creative.com", hashedPassword, viewerRole.id);
  }

  // Ensure default settings exist
  const colorSetting = db.prepare("SELECT id FROM settings WHERE key = ? AND type_id IS NULL AND user_id IS NULL").get("brand_color_presets");
  if (!colorSetting) {
    const defaultColors = JSON.stringify(["#6366f1", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#71717a"]);
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("brand_color_presets", defaultColors);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS feature_switches (
      name TEXT PRIMARY KEY,
      enabled INTEGER DEFAULT 0
    );
  `);

  // Seed feature switches
  const circularDepSwitch = db.prepare("SELECT name FROM feature_switches WHERE name = ?").get("allow_schema_circular_dependencies");
  if (!circularDepSwitch) {
    db.prepare("INSERT INTO feature_switches (name, enabled) VALUES (?, ?)").run("allow_schema_circular_dependencies", 1);
  } else {
    db.prepare("UPDATE feature_switches SET enabled = 1 WHERE name = ?").run("allow_schema_circular_dependencies");
  }

  const homepageSwitch = db.prepare("SELECT name FROM feature_switches WHERE name = ?").get("homepage_enabled");
  if (!homepageSwitch) {
    db.prepare("INSERT INTO feature_switches (name, enabled) VALUES (?, ?)").run("homepage_enabled", 1);
  }

  const activeThemeSetting = db.prepare("SELECT id FROM settings WHERE key = ? AND type_id IS NULL AND user_id IS NULL").get("active_theme");
  if (!activeThemeSetting) {
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("active_theme", JSON.stringify("default"));
  }
  console.log("[DEBUG] initDb finished");
}
