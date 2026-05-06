import { getDB } from './db';

export type Mood = 'happy' | 'calm' | 'anxious' | 'sad' | 'angry' | 'sick';
export type Level = 'high' | 'normal' | 'low';

export type MoodRecord = {
  id: number;
  pet_id: number;
  mood: Mood;
  energy_level: string | null;
  appetite: string | null;
  behavior: string | null;
  note: string | null;
  recorded_at: string;
  created_at: string;
};

export type MoodDraft = {
  mood: Mood;
  energyLevel: Level | '';
  appetite: Level | '';
  behavior: string;
  note: string;
};

export const moodRepository = {
  save(draft: MoodDraft, petId: number): void {
    const db = getDB();
    db.runSync(
      'INSERT INTO mood_records (pet_id, mood, energy_level, appetite, behavior, note) VALUES (?, ?, ?, ?, ?, ?)',
      [petId, draft.mood, draft.energyLevel || null, draft.appetite || null, draft.behavior.trim() || null, draft.note.trim() || null]
    );
  },

  getByPetId(petId: number): MoodRecord[] {
    const db = getDB();
    return db.getAllSync<MoodRecord>(
      'SELECT * FROM mood_records WHERE pet_id = ? ORDER BY recorded_at DESC',
      [petId]
    );
  },

  getRecentByPetId(petId: number, limit: number): MoodRecord[] {
    const db = getDB();
    return db.getAllSync<MoodRecord>(
      'SELECT * FROM mood_records WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT ?',
      [petId, limit]
    );
  },

  delete(id: number): void {
    const db = getDB();
    db.runSync('DELETE FROM mood_records WHERE id = ?', [id]);
  },

  getMoodDatesInMonth(petId: number, year: number, month: number): Set<string> {
    const db = getDB();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const rows = db.getAllSync<{ recorded_at: string }>(
      "SELECT recorded_at FROM mood_records WHERE pet_id = ? AND recorded_at LIKE ?",
      [petId, `${prefix}%`]
    );
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.recorded_at.slice(0, 10)));
    return set;
  },
};
