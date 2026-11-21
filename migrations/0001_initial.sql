CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS regulation_sections (
  id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  section_number TEXT NOT NULL,
  chapter_number INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (version_id, id)
);
CREATE INDEX IF NOT EXISTS idx_regulation_sections_version
  ON regulation_sections(version_id, chapter_number, section_number);

CREATE TABLE IF NOT EXISTS school_years (
  id TEXT PRIMARY KEY,
  school_year TEXT NOT NULL,
  is_published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
