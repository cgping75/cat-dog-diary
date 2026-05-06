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

const SYSTEM_ITEMS = ['喂食', '换水', '铲屎/清理'];

export const checkinRepository = {
  seedSystemItems(petId: number): void {
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
