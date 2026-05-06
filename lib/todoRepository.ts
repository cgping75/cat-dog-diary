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
  save(petId: number, draft: TodoDraft): void {
    const db = getDB();
    db.runSync(
      'INSERT INTO todos (pet_id, title, due_date) VALUES (?, ?, ?)',
      [petId, draft.title.trim(), draft.dueDate]
    );
  },

  getByPetId(petId: number): TodoItem[] {
    const db = getDB();
    return db.getAllSync<TodoItem>(
      'SELECT * FROM todos WHERE pet_id = ? ORDER BY is_done ASC, due_date ASC',
      [petId]
    );
  },

  getByDate(petId: number, dateStr: string): TodoItem[] {
    const db = getDB();
    return db.getAllSync<TodoItem>(
      'SELECT * FROM todos WHERE pet_id = ? AND due_date = ? ORDER BY is_done ASC',
      [petId, dateStr]
    );
  },

  getUpcoming(petId: number, limit: number): TodoItem[] {
    const db = getDB();
    return db.getAllSync<TodoItem>(
      'SELECT * FROM todos WHERE pet_id = ? AND is_done = 0 ORDER BY due_date ASC LIMIT ?',
      [petId, limit]
    );
  },

  getOverdue(petId: number): TodoItem[] {
    const db = getDB();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return db.getAllSync<TodoItem>(
      'SELECT * FROM todos WHERE pet_id = ? AND is_done = 0 AND due_date < ? ORDER BY due_date ASC',
      [petId, todayStr]
    );
  },

  toggleDone(id: number): void {
    const db = getDB();
    db.runSync('UPDATE todos SET is_done = CASE WHEN is_done = 0 THEN 1 ELSE 0 END WHERE id = ?', [id]);
  },

  delete(id: number): void {
    const db = getDB();
    db.runSync('DELETE FROM todos WHERE id = ?', [id]);
  },

  getTodoDatesInMonth(petId: number, year: number, month: number): Map<string, number> {
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
