import { getDB } from './db';
import { formatDateStr } from './calendarUtils';

// --- Checkin Items (configurable per pet) ---
export type CheckinItem = {
  id: number;
  pet_id: number;
  label: string;
  is_system: number; // 1 = system fixed, 0 = user custom
  sort_order: number;
};

// --- Daily checkin records ---
export type CheckinRecord = {
  id: number;
  pet_id: number;
  item_id: number;
  checkin_date: string;
  created_at: string;
};

export type CheckinItemWithStatus = CheckinItem & { done: boolean };

const SYSTEM_ITEMS = ['喂食', '换水', '铲屎/清理'];

export const checkinRepository = {
  ensureTables(): void {
    const db = getDB();
    db.execSync(`
      CREATE TABLE IF NOT EXISTS checkin_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pet_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        is_system INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (pet_id) REFERENCES pets(id)
      );
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
  },

  // Ensure a pet has system items seeded
  seedSystemItems(petId: number): void {
    this.ensureTables();
    const db = getDB();
    const existing = db.getFirstSync<{ c: number }>(
      'SELECT COUNT(*) as c FROM checkin_items WHERE pet_id = ? AND is_system = 1',
      [petId]
    );
    if (existing && existing.c > 0) return;
    SYSTEM_ITEMS.forEach((label, i) => {
      db.runSync(
        'INSERT INTO checkin_items (pet_id, label, is_system, sort_order) VALUES (?, ?, 1, ?)',
        [petId, label, i]
      );
    });
  },

  // Get all items for a pet (system first, then custom)
  getItems(petId: number): CheckinItem[] {
    this.ensureTables();
    this.seedSystemItems(petId);
    const db = getDB();
    return db.getAllSync<CheckinItem>(
      'SELECT * FROM checkin_items WHERE pet_id = ? ORDER BY is_system DESC, sort_order ASC',
      [petId]
    );
  },

  // Add custom item (3-5 limit)
  addItem(petId: number, label: string): boolean {
    this.ensureTables();
    this.seedSystemItems(petId);
    const items = this.getItems(petId);
    const customCount = items.filter((i) => !i.is_system).length;
    if (customCount >= 3) return false; // max 3 custom (system 3 + custom 3 = 6 max)
    const db = getDB();
    const maxOrder = db.getFirstSync<{ m: number }>(
      'SELECT COALESCE(MAX(sort_order), 0) as m FROM checkin_items WHERE pet_id = ?',
      [petId]
    );
    db.runSync(
      'INSERT INTO checkin_items (pet_id, label, is_system, sort_order) VALUES (?, ?, 0, ?)',
      [petId, label.trim(), (maxOrder?.m ?? 0) + 1]
    );
    return true;
  },

  // Remove custom item
  removeItem(itemId: number): void {
    this.ensureTables();
    const db = getDB();
    db.runSync('DELETE FROM checkin_records WHERE item_id = ?', [itemId]);
    db.runSync('DELETE FROM checkin_items WHERE id = ? AND is_system = 0', [itemId]);
  },

  // Toggle a checkin for today
  toggleCheckin(petId: number, itemId: number): void {
    this.ensureTables();
    const db = getDB();
    const today = formatDateStr(new Date());
    const existing = db.getFirstSync<{ id: number }>(
      'SELECT id FROM checkin_records WHERE pet_id = ? AND item_id = ? AND checkin_date = ?',
      [petId, itemId, today]
    );
    if (existing) {
      db.runSync('DELETE FROM checkin_records WHERE id = ?', [existing.id]);
    } else {
      db.runSync(
        'INSERT OR IGNORE INTO checkin_records (pet_id, item_id, checkin_date) VALUES (?, ?, ?)',
        [petId, itemId, today]
      );
    }
  },

  // Get items with today's status
  getItemsWithStatus(petId: number): CheckinItemWithStatus[] {
    this.ensureTables();
    this.seedSystemItems(petId);
    const items = this.getItems(petId);
    const today = formatDateStr(new Date());
    const db = getDB();
    const doneSet = new Set<number>();
    const rows = db.getAllSync<{ item_id: number }>(
      'SELECT item_id FROM checkin_records WHERE pet_id = ? AND checkin_date = ?',
      [petId, today]
    );
    rows.forEach((r) => doneSet.add(r.item_id));
    return items.map((item) => ({ ...item, done: doneSet.has(item.id) }));
  },

  // Check if all system items are done today
  isAllSystemDone(petId: number): boolean {
    this.ensureTables();
    this.seedSystemItems(petId);
    const items = this.getItems(petId);
    const systemItems = items.filter((i) => i.is_system);
    if (systemItems.length === 0) return false;
    const today = formatDateStr(new Date());
    const db = getDB();
    const doneCount = db.getFirstSync<{ c: number }>(
      `SELECT COUNT(*) as c FROM checkin_records
       WHERE pet_id = ? AND checkin_date = ? AND item_id IN (${systemItems.map(() => '?').join(',')})`,
      [petId, today, ...systemItems.map((i) => i.id)]
    );
    return (doneCount?.c ?? 0) === systemItems.length;
  },

  // Streak: consecutive days where all system items were completed
  getStreak(petId: number): number {
    this.ensureTables();
    this.seedSystemItems(petId);
    const items = this.getItems(petId);
    const systemIds = items.filter((i) => i.is_system).map((i) => i.id);
    if (systemIds.length === 0) return 0;
    const db = getDB();
    const placeholders = systemIds.map(() => '?').join(',');
    const rows = db.getAllSync<{ checkin_date: string }>(
      `SELECT DISTINCT checkin_date FROM checkin_records
       WHERE pet_id = ? AND item_id IN (${placeholders})
       ORDER BY checkin_date DESC`,
      [petId, ...systemIds]
    );
    // For each date, check if all system items are done
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDateStr(d);
      const doneCount = db.getFirstSync<{ c: number }>(
        `SELECT COUNT(*) as c FROM checkin_records
         WHERE pet_id = ? AND checkin_date = ? AND item_id IN (${placeholders})`,
        [petId, dateStr, ...systemIds]
      );
      if ((doneCount?.c ?? 0) === systemIds.length) {
        streak++;
      } else if (i > 0) {
        break; // only break if not today (today might be partial)
      } else {
        break;
      }
    }
    return streak;
  },
};
