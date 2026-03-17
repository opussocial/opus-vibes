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

  // Seeding
  const typeCount = db.prepare("SELECT COUNT(*) as count FROM element_types WHERE slug NOT IN ('profile')").get() as { count: number };
  if (typeCount.count === 0) {
    const insertType = db.prepare("INSERT INTO element_types (name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?)");
    const insertProp = db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)");

    const pubType = insertType.run("Publication", "publication", "A top-level digital or print publication", "BookOpen", "#1e40af").lastInsertRowid;
    insertProp.run(pubType, "content", "Description");
    insertProp.run(pubType, "file", "Logo/Cover");

    const issueType = insertType.run("Issue", "issue", "A specific edition of a publication", "Layers", "#0369a1").lastInsertRowid;
    insertProp.run(issueType, "content", "Summary");
    insertProp.run(issueType, "time_tracking", "Release Schedule");

    const articleType = insertType.run("Article", "article", "A written piece of content", "FileText", "#0891b2").lastInsertRowid;
    insertProp.run(articleType, "content", "Article Body");
    insertProp.run(articleType, "urls_embeds", "References");

    const pageType = insertType.run("Page", "page", "A static informational page", "File", "#0f766e").lastInsertRowid;
    insertProp.run(pageType, "content", "Page Content");

    // --- Hostel Types ---
    const hostelType = insertType.run("Hostel", "hostel", "A budget-friendly lodging establishment", "Home", "#b91c1c").lastInsertRowid;
    insertProp.run(hostelType, "content", "Description");
    insertProp.run(hostelType, "place", "Location");

    const roomType = insertType.run("Room", "room", "A room within a hostel", "DoorOpen", "#dc2626").lastInsertRowid;
    insertProp.run(roomType, "content", "Room Details");

    const bedType = insertType.run("Bed", "bed", "An individual bed in a room", "Bed", "#ef4444").lastInsertRowid;
    insertProp.run(bedType, "color", "Status Color");

    // --- Bookstore Types ---
    const bookstoreType = insertType.run("Bookstore", "bookstore", "A shop that sells books", "Store", "#15803d").lastInsertRowid;
    insertProp.run(bookstoreType, "content", "About the Store");
    insertProp.run(bookstoreType, "place", "Location");

    const bookType = insertType.run("Book", "book", "A printed or digital work", "Book", "#16a34a").lastInsertRowid;
    insertProp.run(bookType, "content", "Summary");
    insertProp.run(bookType, "product_info", "Pricing & SKU");

    const authorType = insertType.run("Author", "author", "A person who writes books", "User", "#22c55e").lastInsertRowid;
    insertProp.run(authorType, "content", "Biography");

    // --- Art Gallery Types ---
    const galleryType = insertType.run("Art Gallery", "art-gallery", "A space for the exhibition of art", "Image", "#db2777").lastInsertRowid;
    insertProp.run(galleryType, "content", "Gallery Mission");
    insertProp.run(galleryType, "place", "Location");

    const exhibitionType = insertType.run("Exhibition", "exhibition", "A public display of art or items", "Palette", "#be185d").lastInsertRowid;
    insertProp.run(exhibitionType, "content", "Exhibition Theme");
    insertProp.run(exhibitionType, "time_tracking", "Duration");

    const artworkType = insertType.run("Artwork", "artwork", "A single piece of art", "Frame", "#9d174d").lastInsertRowid;
    insertProp.run(artworkType, "content", "Artist Statement");
    insertProp.run(artworkType, "file", "Image of Work");
    insertProp.run(artworkType, "product_info", "Price & Availability");

    // --- Music Studio Types ---
    const studioType = insertType.run("Music Studio", "music-studio", "A facility for sound recording and mixing", "Mic2", "#2563eb").lastInsertRowid;
    insertProp.run(studioType, "content", "Studio Gear & Bio");
    insertProp.run(studioType, "place", "Location");

    const sessionType = insertType.run("Recording Session", "recording-session", "A scheduled time for recording", "Clock", "#1d4ed8").lastInsertRowid;
    insertProp.run(sessionType, "time_tracking", "Session Time");
    insertProp.run(sessionType, "content", "Session Notes");

    const trackType = insertType.run("Track", "track", "A single musical recording", "Music", "#1e40af").lastInsertRowid;
    insertProp.run(trackType, "content", "Lyrics/Notes");
    insertProp.run(trackType, "file", "Audio Preview");

    // --- Creative Agency Types ---
    const agencyType = insertType.run("Creative Agency", "creative-agency", "A business providing creative services", "Briefcase", "#4f46e5").lastInsertRowid;
    insertProp.run(agencyType, "content", "Agency Bio");
    insertProp.run(agencyType, "place", "Headquarters");

    const projectType = insertType.run("Project", "project", "A specific creative project", "ClipboardList", "#4338ca").lastInsertRowid;
    insertProp.run(projectType, "content", "Project Scope");
    insertProp.run(projectType, "time_tracking", "Timeline");

    const assetType = insertType.run("Asset", "asset", "A creative deliverable", "FileImage", "#3730a3").lastInsertRowid;
    insertProp.run(assetType, "file", "File");
    insertProp.run(assetType, "content", "Asset Description");

    // --- Screenwriting Types ---
    const storyType = insertType.run("Story", "story", "A narrative or screenplay project", "Clapperboard", "#7c3aed").lastInsertRowid;
    insertProp.run(storyType, "content", "Logline & Synopsis");

    const chapterType = insertType.run("Chapter", "chapter", "A major division of a story", "Bookmark", "#8b5cf6").lastInsertRowid;
    insertProp.run(chapterType, "content", "Chapter Summary");

    const characterType = insertType.run("Character", "character", "A person in the story", "Users", "#a78bfa").lastInsertRowid;
    insertProp.run(characterType, "content", "Character Profile");

    const sceneType = insertType.run("Scene", "scene", "A specific sequence in a chapter", "Video", "#c4b5fd").lastInsertRowid;
    insertProp.run(sceneType, "content", "Script Content");

    const profileType = db.prepare("SELECT id FROM element_types WHERE slug = 'profile'").get() as any;

    // Hierarchy
    const insertHierarchy = db.prepare("INSERT INTO type_hierarchy (parent_type_id, child_type_id) VALUES (?, ?)");
    insertHierarchy.run(pubType, issueType);   // publication > issue
    insertHierarchy.run(issueType, pageType);  // issue > page
    insertHierarchy.run(issueType, articleType); // issue > article
    insertHierarchy.run(pubType, pageType);    // publication > page

    // Hostel Hierarchy
    insertHierarchy.run(hostelType, roomType); // hostel > room
    insertHierarchy.run(roomType, bedType);   // room > bed

    // Bookstore Hierarchy
    insertHierarchy.run(bookstoreType, bookType); // bookstore > book
    insertHierarchy.run(bookstoreType, authorType); // bookstore > author (as contributors)

    // Art Gallery Hierarchy
    insertHierarchy.run(galleryType, exhibitionType); // gallery > exhibition
    insertHierarchy.run(exhibitionType, artworkType); // exhibition > artwork

    // Music Studio Hierarchy
    insertHierarchy.run(studioType, sessionType); // studio > session
    insertHierarchy.run(sessionType, trackType);   // session > track

    // Creative Agency Hierarchy
    insertHierarchy.run(agencyType, projectType); // agency > project
    insertHierarchy.run(projectType, assetType);  // project > asset

    // Screenwriting Hierarchy
    insertHierarchy.run(storyType, chapterType);   // story > chapter
    insertHierarchy.run(chapterType, sceneType);   // chapter > scene
    insertHierarchy.run(storyType, characterType); // story > character

    const adminRole = db.prepare("SELECT id FROM roles WHERE slug = 'super-admin'").get() as any;
    const editorRole = db.prepare("SELECT id FROM roles WHERE slug = 'editor'").get() as any;
    const viewerRole = db.prepare("SELECT id FROM roles WHERE slug = 'viewer'").get() as any;

    const types = db.prepare("SELECT id FROM element_types").all() as any[];
    for (const t of types) {
      // Clear existing permissions for these types to avoid duplicates if profile existed
      db.prepare("DELETE FROM role_type_permissions WHERE type_id = ?").run(t.id);
      db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 0)").run(editorRole.id, t.id);
      db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 0, 0, 0)").run(viewerRole.id, t.id);
      db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 1)").run(adminRole.id, t.id);
    }

    // Seed Sample Elements
    const pubId = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("The Tech Chronicle", "the-tech-chronicle", pubType).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(pubId, "A leading publication covering the intersection of technology, society, and the future.");

    const issueId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("March 2026: The AI Revolution", "march-2026-ai-revolution", issueType, pubId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(issueId, "This issue explores the rapid advancement of generative agents and their impact on global industries.");
    db.prepare("INSERT INTO time_tracking (element_id, start_time, end_time) VALUES (?, ?, ?)").run(issueId, "2026-03-01 00:00:00", "2026-03-31 23:59:59");

    const page1Id = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("About The Chronicle", "about-the-chronicle", pageType, pubId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(page1Id, "Founded in 2020, The Tech Chronicle has been at the forefront of tech journalism for over half a decade.");

    const page2Id = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Editor's Note", "editors-note", pageType, issueId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(page2Id, "In this month's note, we discuss why the 'Agentic Era' is more than just a buzzword.");

    const page3Id = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("Privacy Policy", "privacy-policy", pageType).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(page3Id, "Your privacy is important to us. This page outlines how we handle your data.");

    const articleId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("The Rise of Generative Agents", "rise-of-generative-agents", articleType, issueId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(articleId, "Generative agents are no longer just chatbots; they are becoming autonomous collaborators in the workplace...");
    db.prepare("INSERT INTO urls_embeds (element_id, url, title) VALUES (?, ?, ?)").run(articleId, "https://ai.google.dev", "Learn more about Gemini");

    // --- Hostel Seeds ---
    const hostelId = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("The Nomad's Rest", "nomads-rest", hostelType).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(hostelId, "A cozy, community-driven hostel located in the heart of the historic district.");
    db.prepare("INSERT INTO place (element_id, latitude, longitude, address) VALUES (?, ?, ?, ?)").run(hostelId, 52.3676, 4.9041, "Amsterdam, Netherlands");

    const roomId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Mixed Dorm A", "mixed-dorm-a", roomType, hostelId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(roomId, "A spacious 8-bed dorm with lockers and high-speed Wi-Fi.");

    const bed1Id = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Bed A1 (Lower)", "bed-a1", bedType, roomId).lastInsertRowid;
    db.prepare("INSERT INTO color (element_id, hex) VALUES (?, ?)").run(bed1Id, "#10b981"); // Green for available

    const bed2Id = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Bed A2 (Upper)", "bed-a2", bedType, roomId).lastInsertRowid;
    db.prepare("INSERT INTO color (element_id, hex) VALUES (?, ?)").run(bed2Id, "#f43f5e"); // Red for occupied

    // --- Bookstore Seeds ---
    const bookstoreId = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("The Dusty Shelf", "the-dusty-shelf", bookstoreType).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(bookstoreId, "Specializing in rare first editions and forgotten classics since 1974.");
    db.prepare("INSERT INTO place (element_id, latitude, longitude, address) VALUES (?, ?, ?, ?)").run(bookstoreId, 51.5074, -0.1278, "Charing Cross Rd, London");

    const author1Id = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("F. Scott Fitzgerald", "f-scott-fitzgerald", authorType, bookstoreId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(author1Id, "An American novelist and short story writer, widely regarded as one of the greatest American writers of the 20th century.");

    const book1Id = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("The Great Gatsby (1925)", "great-gatsby-1925", bookType, bookstoreId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(book1Id, "A 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island.");
    db.prepare("INSERT INTO product_info (element_id, sku, price, currency, stock) VALUES (?, ?, ?, ?, ?)").run(book1Id, "RARE-GATSBY-01", 1250.00, "GBP", 1);

    // --- Art Gallery Seeds ---
    const galleryId = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("The Prism Gallery", "prism-gallery", galleryType).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(galleryId, "A contemporary art space dedicated to showcasing emerging digital and physical artists.");
    db.prepare("INSERT INTO place (element_id, latitude, longitude, address) VALUES (?, ?, ?, ?)").run(galleryId, 40.7128, -74.0060, "Chelsea, New York, NY");

    const exhibitionId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Digital Horizons", "digital-horizons", exhibitionType, galleryId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(exhibitionId, "An exploration of how AI and generative tools are reshaping the landscape of modern art.");
    db.prepare("INSERT INTO time_tracking (element_id, start_time, end_time) VALUES (?, ?, ?)").run(exhibitionId, "2026-04-01 10:00:00", "2026-05-31 18:00:00");

    const artworkId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Latent Dreams #4", "latent-dreams-4", artworkType, exhibitionId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(artworkId, "A large-scale generative piece exploring the subconscious of a neural network trained on classical landscapes.");
    db.prepare("INSERT INTO product_info (element_id, sku, price, currency, stock) VALUES (?, ?, ?, ?, ?)").run(artworkId, "ART-LD-04", 4500.00, "USD", 1);
    db.prepare("INSERT INTO file (element_id, filename, url, mime_type) VALUES (?, ?, ?, ?)").run(artworkId, "latent-dreams.jpg", "https://picsum.photos/seed/art/1200/800", "image/jpeg");

    // --- Music Studio Seeds ---
    const studioId = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("Echo Chamber Studios", "echo-chamber-studios", studioType).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(studioId, "State-of-the-art recording facility specializing in analog warmth and modern precision.");
    db.prepare("INSERT INTO place (element_id, latitude, longitude, address) VALUES (?, ?, ?, ?)").run(studioId, 34.0522, -118.2437, "Hollywood, Los Angeles, CA");

    const sessionId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("The Midnight Session", "midnight-session", sessionType, studioId).lastInsertRowid;
    db.prepare("INSERT INTO time_tracking (element_id, start_time, end_time) VALUES (?, ?, ?)").run(sessionId, "2026-03-20 22:00:00", "2026-03-21 04:00:00");
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(sessionId, "Vocal tracking for the upcoming 'Neon Shadows' soundtrack.");

    const trackId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Cyberpunk Lullaby", "cyberpunk-lullaby", trackType, sessionId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(trackId, "A haunting synth-driven track with ethereal vocals. Key: Cm, BPM: 85.");

    // --- Creative Agency Seeds ---
    const agencyId = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("Vanguard Creative", "vanguard-creative", agencyType).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(agencyId, "A full-service creative agency specializing in brand identity and digital storytelling.");
    db.prepare("INSERT INTO place (element_id, latitude, longitude, address) VALUES (?, ?, ?, ?)").run(agencyId, 37.7749, -122.4194, "Market St, San Francisco, CA");

    const projectId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Rebrand 2026", "rebrand-2026", projectType, agencyId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(projectId, "A complete visual overhaul for a major fintech startup.");
    db.prepare("INSERT INTO time_tracking (element_id, start_time, end_time) VALUES (?, ?, ?)").run(projectId, "2026-01-01 09:00:00", "2026-06-30 17:00:00");

    const assetId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("New Logo Concept", "new-logo-concept", assetType, projectId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(assetId, "A minimalist geometric logo representing growth and stability.");
    db.prepare("INSERT INTO file (element_id, filename, url, mime_type) VALUES (?, ?, ?, ?)").run(assetId, "logo-v1.png", "https://picsum.photos/seed/logo/400/400", "image/png");

    // --- Screenwriting Seeds ---
    const storyId = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("Neon Shadows", "neon-shadows", storyType).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(storyId, "In a rain-soaked cyberpunk future, a low-level data courier discovers a secret that could topple the mega-corporations.");

    const charId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Jax Miller", "jax-miller", characterType, storyId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(charId, "A cynical courier with a cybernetic eye and a past he'd rather forget.");

    const chapId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Chapter 1: The Drop", "chapter-1-the-drop", chapterType, storyId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(chapId, "Jax takes a routine job that goes horribly wrong when his contact is assassinated.");

    const sceneId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run("Scene 1: The Alleyway", "scene-1-alleyway", sceneType, chapId).lastInsertRowid;
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(sceneId, "EXT. ALLEYWAY - NIGHT\n\nRain hammers against the rusted dumpsters. JAX (30s) waits, checking his internal clock. The neon sign above flickers: 'OPEN'.");

    // --- Showcase Content: Tags, Interactions, and User ---
    
    // 1. Interaction Types
    const likeTypeId = db.prepare("INSERT OR IGNORE INTO interaction_types (name, icon, description) VALUES (?, ?, ?)").run("Like", "Heart", "User likes the element").lastInsertRowid;
    const commentTypeId = db.prepare("INSERT OR IGNORE INTO interaction_types (name, icon, description) VALUES (?, ?, ?)").run("Comment", "MessageSquare", "User commented on the element").lastInsertRowid;
    const viewTypeId = db.prepare("INSERT OR IGNORE INTO interaction_types (name, icon, description) VALUES (?, ?, ?)").run("View", "Eye", "User viewed the element").lastInsertRowid;

    // 2. Showcase User
    const showcaseUserId = db.prepare("INSERT OR IGNORE INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run("creative_pro", "pro@creative.com", bcrypt.hashSync("password123", 10), viewerRole.id).lastInsertRowid;

    // 3. Tags as Element Type
    const tagType = db.prepare("INSERT OR IGNORE INTO element_types (name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?)").run("Tag", "tag", "Categorization tags", "Tag", "#10b981").lastInsertRowid;
    
    // 4. Create some Tags
    const tagInspiration = db.prepare("INSERT OR IGNORE INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("Inspiration", "tag-inspiration", tagType).lastInsertRowid;
    const tagProcess = db.prepare("INSERT OR IGNORE INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("Process", "tag-process", tagType).lastInsertRowid;
    const tagFeatured = db.prepare("INSERT OR IGNORE INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run("Featured", "tag-featured", tagType).lastInsertRowid;

    // 5. Link Tags to Elements (using graph_edges)
    // We need a relationship type first
    const tagRelId = db.prepare("INSERT OR IGNORE INTO graph_relationship_types (source_type_id, target_type_id, name) VALUES (?, ?, ?)").run(tagType, artworkType, "Categorizes").lastInsertRowid;
    if (tagRelId && tagFeatured && artworkId) {
      db.prepare("INSERT OR IGNORE INTO graph_edges (rel_type_id, source_el_id, target_el_id) VALUES (?, ?, ?)").run(tagRelId, tagFeatured, artworkId);
    }

    // 6. Add some Interactions
    if (showcaseUserId && artworkId) {
      const actualLikeType = db.prepare("SELECT id FROM interaction_types WHERE name = 'Like'").get() as any;
      const actualCommentType = db.prepare("SELECT id FROM interaction_types WHERE name = 'Comment'").get() as any;
      
      db.prepare("INSERT INTO interactions (element_id, user_id, type_id) VALUES (?, ?, ?)").run(artworkId, showcaseUserId, actualLikeType.id);
      db.prepare("INSERT INTO interactions (element_id, user_id, type_id, content) VALUES (?, ?, ?, ?)").run(artworkId, showcaseUserId, actualCommentType.id, "This is absolutely stunning! The latent space interpretation is spot on.");
    }
  }

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
}
