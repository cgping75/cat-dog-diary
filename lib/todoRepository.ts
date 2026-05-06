import { getDB } from './db';

export type TodoItem = {
  id: number;
  pet_id: number;
  title: string;
  due_date: string; // YYYY-MM-DD
  is_done: number; // 0 or 1
  created_at: string;
};

export type TodoDraft = {
  title: string;
  dueDate: string;
};

export const todoRepository = {
  ensureTable(): void {
    const db = getDB();
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
  },

  save(petId: number, draft: TodoDraft): void {
    this.ensureTable();
    const db = getDB();
    db.runSync(
      'INSERT INTO todos (pet_id, title, due_date) VALUES (?, ?, ?)',
      [petId, draft.title.trim(), draft.dueDate]
    );
  },

  getByPetId(petId: number): TodoItem[] {
    this.ensureTable();
    const db = getDB();
    return db.getAllSync<TodoItem>(
      'SELECT * FROM todos WHERE pet_id = ? ORDER BY is_done ASC, due_date ASC',
      [petId]
    );
  },

  getByDate(petId: number, dateStr: string): TodoItem[] {
    this.ensureTable();
    const db = getDB();
    return db.getAllSync<TodoItem>(
      'SELECT * FROM todos WHERE pet_id = ? AND due_date = ? ORDER BY is_done ASC',
      [petId, dateStr]
    );
  },

  getUpcoming(petId: number, limit: number): TodoItem[] {
    this.ensureTable();
    const db = getDB();
    return db.getAllSync<TodoItem>(
      'SELECT * FROM todos WHERE pet_id = ? AND is_done = 0 ORDER BY due_date ASC LIMIT ?',
      [petId, limit]
    );
  },

  getOverdue(petId: number): TodoItem[] {
    this.ensureTable();
    const db = getDB();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return db.getAllSync<TodoItem>(
      'SELECT * FROM todos WHERE pet_id = ? AND is_done = 0 AND due_date < ? ORDER BY due_date ASC',
      [petId, todayStr]
    );
  },

  toggleDone(id: number): void {
    this.ensureTable();
    const db = getDB();
    db.runSync('UPDATE todos SET is_done = CASE WHEN is_done = 0 THEN 1 ELSE 0 END WHERE id = ?', [id]);
  },

  delete(id: number): void {
    this.ensureTable();
    const db = getDB();
    db.runSync('DELETE FROM todos WHERE id = ?', [id]);
  },

  getTodoDatesInMonth(petId: number, year: number, month: number): Map<string, number> {
    this.ensureTable();
    const db = getDB();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const rows = db.getAllSync<{ due_date: string; cnt: number }>(
      "SELECT due_date, COUNT(*) as cnt FROM todos WHERE pet_id = ? AND due_date LIKE ? AND is_done = 0 GROUP BY due_date",
      [petId, `${prefix}%`]
    );
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.due_date, r.cnt));
    return map;
  },
};
