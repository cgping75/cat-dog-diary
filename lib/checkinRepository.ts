import { getDB } from './db';
import { formatDateStr } from './calendarUtils';

export type CheckinItem = {
  id: number;
  pet_id: number;
  label: string;
  is_system: number;
  sort_order: number;
};

export type CheckinRecord = {
  id: number;
  pet_id: number;
  item_id: number;
  checkin_date: string;
  created_at: string;
};

export type CheckinItemWithStatus = CheckinItem & { done: boolean };

const SYSTEM_ITEMS = ['陪伴互动', '情绪观察'];

export const checkinRepository = {
  seedSystemItems(petId: number): void {
    const db = getDB();
    // Get existing system items
    const existing = db.getAllSync<{ id: number; label: string }>(
      'SELECT id, label FROM checkin_items WHERE pet_id = ? AND is_system = 1',
      [petId]
    );
    const existingLabels = existing.map((e) => e.label);
    // If labels don't match, delete old and re-seed
    const needsReseed = existing.length !== SYSTEM_ITEMS.length ||
      !SYSTEM_ITEMS.every((l) => existingLabels.includes(l));
    if (needsReseed) {
      // Delete old system item records first
      existing.forEach((e) => {
        db.runSync('DELETE FROM checkin_records WHERE item_id = ?', [e.id]);
      });
      db.runSync('DELETE FROM checkin_items WHERE pet_id = ? AND is_system = 1', [petId]);
      SYSTEM_ITEMS.forEach((label, i) => {
        db.runSync(
          'INSERT INTO checkin_items (pet_id, label, is_system, sort_order) VALUES (?, ?, 1, ?)',
          [petId, label, i]
        );
      });
    }
  },

  getItems(petId: number): CheckinItem[] {
    const db = getDB();
    this.seedSystemItems(petId);
    return db.getAllSync<CheckinItem>(
      'SELECT * FROM checkin_items WHERE pet_id = ? ORDER BY is_system DESC, sort_order ASC',
      [petId]
    );
  },

  addItem(petId: number, label: string): boolean {
    const db = getDB();
    this.seedSystemItems(petId);
    const items = this.getItems(petId);
    const customCount = items.filter((i) => !i.is_system).length;
    if (customCount >= 3) return false;
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

  removeItem(itemId: number): void {
    const db = getDB();
    db.runSync('DELETE FROM checkin_records WHERE item_id = ?', [itemId]);
    db.runSync('DELETE FROM checkin_items WHERE id = ? AND is_system = 0', [itemId]);
  },

  toggleCheckin(petId: number, itemId: number): void {
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

  getItemsWithStatus(petId: number): CheckinItemWithStatus[] {
    const db = getDB();
    this.seedSystemItems(petId);
    const items = this.getItems(petId);
    const today = formatDateStr(new Date());
    const doneSet = new Set<number>();
    const rows = db.getAllSync<{ item_id: number }>(
      'SELECT item_id FROM checkin_records WHERE pet_id = ? AND checkin_date = ?',
      [petId, today]
    );
    rows.forEach((r) => doneSet.add(r.item_id));
    return items.map((item) => ({ ...item, done: doneSet.has(item.id) }));
  },

  isAllSystemDone(petId: number): boolean {
    const db = getDB();
    this.seedSystemItems(petId);
    const items = this.getItems(petId);
    const systemItems = items.filter((i) => i.is_system);
    if (systemItems.length === 0) return false;
    const today = formatDateStr(new Date());
    const placeholders = systemItems.map(() => '?').join(',');
    const doneCount = db.getFirstSync<{ c: number }>(
      `SELECT COUNT(*) as c FROM checkin_records WHERE pet_id = ? AND checkin_date = ? AND item_id IN (${placeholders})`,
      [petId, today, ...systemItems.map((i) => i.id)]
    );
    return (doneCount?.c ?? 0) === systemItems.length;
  },

  getStreak(petId: number): number {
    const db = getDB();
    this.seedSystemItems(petId);
    const items = this.getItems(petId);
    const systemIds = items.filter((i) => i.is_system).map((i) => i.id);
    if (systemIds.length === 0) return 0;
    const placeholders = systemIds.map(() => '?').join(',');

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDateStr(d);
      const doneCount = db.getFirstSync<{ c: number }>(
        `SELECT COUNT(*) as c FROM checkin_records WHERE pet_id = ? AND checkin_date = ? AND item_id IN (${placeholders})`,
        [petId, dateStr, ...systemIds]
      );
      if ((doneCount?.c ?? 0) === systemIds.length) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },
};
