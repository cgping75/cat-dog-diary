import { getDB } from './db';
import { formatDateStr } from './calendarUtils';

export type CheckinRecord = {
  id: number;
  pet_id: number;
  checkin_date: string; // YYYY-MM-DD
  note: string | null;
  created_at: string;
};

export const checkinRepository = {
  ensureTable(): void {
    const db = getDB();
    db.execSync(`
      CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pet_id INTEGER NOT NULL,
        checkin_date TEXT NOT NULL,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (pet_id) REFERENCES pets(id),
        UNIQUE(pet_id, checkin_date)
      );
    `);
  },

  checkin(petId: number, note?: string): void {
    this.ensureTable();
    const db = getDB();
    const today = formatDateStr(new Date());
    db.runSync(
      'INSERT OR REPLACE INTO checkins (pet_id, checkin_date, note) VALUES (?, ?, ?)',
      [petId, today, note?.trim() || null]
    );
  },

  isCheckedinToday(petId: number): boolean {
    this.ensureTable();
    const db = getDB();
    const today = formatDateStr(new Date());
    const row = db.getFirstSync<{ c: number }>(
      'SELECT COUNT(*) as c FROM checkins WHERE pet_id = ? AND checkin_date = ?',
      [petId, today]
    );
    return (row?.c ?? 0) > 0;
  },

  getByMonth(petId: number, year: number, month: number): CheckinRecord[] {
    this.ensureTable();
    const db = getDB();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return db.getAllSync<CheckinRecord>(
      "SELECT * FROM checkins WHERE pet_id = ? AND checkin_date LIKE ? ORDER BY checkin_date DESC",
      [petId, `${prefix}%`]
    );
  },

  getRecordOnDate(petId: number, dateStr: string): CheckinRecord | null {
    this.ensureTable();
    const db = getDB();
    const row = db.getFirstSync<CheckinRecord>(
      'SELECT * FROM checkins WHERE pet_id = ? AND checkin_date = ?',
      [petId, dateStr]
    );
    return row ?? null;
  },

  getRecordsOnDates(petId: number, dateStrs: string[]): Map<string, CheckinRecord> {
    this.ensureTable();
    const db = getDB();
    const result = new Map<string, CheckinRecord>();
    if (dateStrs.length === 0) return result;
    const placeholders = dateStrs.map(() => '?').join(',');
    const rows = db.getAllSync<CheckinRecord>(
      `SELECT * FROM checkins WHERE pet_id = ? AND checkin_date IN (${placeholders})`,
      [petId, ...dateStrs]
    );
    rows.forEach((r) => result.set(r.checkin_date, r));
    return result;
  },

  getStreak(petId: number): number {
    this.ensureTable();
    const db = getDB();
    const rows = db.getAllSync<{ checkin_date: string }>(
      'SELECT checkin_date FROM checkins WHERE pet_id = ? ORDER BY checkin_date DESC',
      [petId]
    );
    if (rows.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < rows.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = formatDateStr(expected);
      if (rows[i].checkin_date === expectedStr) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },
};
