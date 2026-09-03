-- Deen Helper admin database schema
-- Run this once against your D1 database (see SETUP.md)

CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

-- key/value store for things like mosque list (JSON) and prayer time settings (JSON)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- seed the two settings keys so the admin panel has something to edit right away
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('mosque_list', '[]'),
  ('prayer_settings', '{"calculation_method": "Muslim World League", "asr_method": "Standard"}');
