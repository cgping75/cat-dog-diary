import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDB = () => {
  if (!db) {
    db = SQLite.openDatabaseSync('pets.db');
    initDB();
    seedDB();
  }
  return db;
};

const initDB = () => {
  if (!db) return;

  // Core tables
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      pet_type TEXT NOT NULL,
      breed TEXT,
      gender TEXT,
      age_text TEXT,
      is_neutered TEXT,
      personality TEXT,
      allergies TEXT,
      special_needs TEXT,
      weight TEXT,
      photo_uri TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      record_type TEXT NOT NULL,
      title TEXT NOT NULL,
      note TEXT,
      value_text TEXT,
      recorded_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS quiz_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      passed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS mood_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      mood TEXT NOT NULL,
      energy_level TEXT,
      appetite TEXT,
      behavior TEXT,
      note TEXT,
      recorded_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    );
  `);

  // Todos table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      due_date TEXT NOT NULL,
      is_done INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    );
  `);

  // New checkin system tables
  db.execSync(`
    CREATE TABLE IF NOT EXISTS checkin_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      is_system INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS checkin_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      checkin_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (pet_id) REFERENCES pets(id),
      FOREIGN KEY (item_id) REFERENCES checkin_items(id),
      UNIQUE(pet_id, item_id, checkin_date)
    );
  `);

  // Diary table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS diary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      images TEXT,
      pet_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    );
  `);

  // Migration: drop old checkins table if exists
  try {
    db.execSync('DROP TABLE IF EXISTS checkins');
  } catch (e) {
    // ignore
  }

  // Migration: add new columns to existing pets table
  try {
    const cols = db.getAllSync<{ name: string }>("PRAGMA table_info(pets)").map((c) => c.name);
    if (!cols.includes('personality')) db.execSync("ALTER TABLE pets ADD COLUMN personality TEXT");
    if (!cols.includes('allergies')) db.execSync("ALTER TABLE pets ADD COLUMN allergies TEXT");
    if (!cols.includes('special_needs')) db.execSync("ALTER TABLE pets ADD COLUMN special_needs TEXT");
    if (!cols.includes('weight')) db.execSync("ALTER TABLE pets ADD COLUMN weight TEXT");
    if (!cols.includes('photo_uri')) db.execSync("ALTER TABLE pets ADD COLUMN photo_uri TEXT");
  } catch (e) {
    // ignore migration errors
  }
};

const seedDB = () => {
  if (!db) return;
  const count = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM pets');
  if (count && count.c === 0) {
    db.runSync(`INSERT INTO pets (name, pet_type, breed, gender, age_text, is_neutered) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Mimi', 'cat', 'British Shorthair', 'female', '2岁', 'yes']);
    db.runSync(`INSERT INTO pets (name, pet_type, breed, gender, age_text, is_neutered) VALUES (?, ?, ?, ?, ?, ?)`,
      ['旺财', 'dog', 'Golden Retriever', 'male', '3岁', 'no']);
    db.runSync(`INSERT INTO records (pet_id, record_type, title, note, value_text, recorded_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 'vaccine', '狂犬疫苗', '年度疫苗接种', null, '2025-06-15']);
    db.runSync(`INSERT INTO records (pet_id, record_type, title, note, value_text, recorded_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 'deworm', '体内驱虫', '使用拜耳内虫逃', null, '2025-11-20']);
    db.runSync(`INSERT INTO records (pet_id, record_type, title, note, value_text, recorded_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 'weight', '体重记录', null, '4.5kg', '2026-01-10']);
    db.runSync(`INSERT INTO records (pet_id, record_type, title, note, value_text, recorded_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [2, 'vaccine', '犬四联疫苗', '首次接种', null, '2025-03-10']);
    db.runSync(`INSERT INTO records (pet_id, record_type, title, note, value_text, recorded_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [2, 'weight', '体重记录', null, '28kg', '2026-02-15']);
  }
};
