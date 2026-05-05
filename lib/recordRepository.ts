import { getDB } from './db';

export type RecordType =
  | 'vaccine' | 'deworm' | 'weight' | 'issue' | 'feeding' | 'checkup' | 'dental'
  | 'bath' | 'grooming' | 'nail' | 'period' | 'heat';

export type PetRecord = {
  id: number;
  pet_id: number;
  record_type: RecordType;
  title: string;
  note: string | null;
  value_text: string | null;
  recorded_at: string;
  created_at: string;
};

export type RecordDraft = {
  record_type: RecordType;
  title: string;
  note: string;
  value_text: string;
};

export const recordRepository = {
  save(draft: RecordDraft, petId: number): void {
    const db = getDB();
    db.runSync(
      'INSERT INTO records (pet_id, record_type, title, note, value_text) VALUES (?, ?, ?, ?, ?)',
      [petId, draft.record_type, draft.title.trim(), draft.note.trim(), draft.value_text.trim()]
    );
  },

  getAll(): PetRecord[] {
    const db = getDB();
    return db.getAllSync<PetRecord>('SELECT * FROM records ORDER BY recorded_at DESC');
  },

  getByPetId(petId: number): PetRecord[] {
    const db = getDB();
    return db.getAllSync<PetRecord>(
      'SELECT * FROM records WHERE pet_id = ? ORDER BY recorded_at DESC',
      [petId]
    );
  },

  update(id: number, draft: RecordDraft): void {
    const db = getDB();
    db.runSync(
      'UPDATE records SET record_type = ?, title = ?, note = ?, value_text = ? WHERE id = ?',
      [draft.record_type, draft.title.trim(), draft.note.trim(), draft.value_text.trim(), id]
    );
  },

  getById(id: number): PetRecord | null {
    const db = getDB();
    const result = db.getFirstSync<PetRecord>('SELECT * FROM records WHERE id = ?', [id]);
    return result ?? null;
  },

  delete(id: number): void {
    const db = getDB();
    db.runSync('DELETE FROM records WHERE id = ?', [id]);
  },

  getLatestByPetId(petId: number): PetRecord | null {
    const db = getDB();
    const result = db.getFirstSync<PetRecord>(
      'SELECT * FROM records WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT 1',
      [petId]
    );
    return result ?? null;
  },

  getRecentByPetId(petId: number, limit: number): PetRecord[] {
    const db = getDB();
    return db.getAllSync<PetRecord>(
      'SELECT * FROM records WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT ?',
      [petId, limit]
    );
  },

  getByPetIdAndType(petId: number, type: RecordType): PetRecord[] {
    const db = getDB();
    return db.getAllSync<PetRecord>(
      'SELECT * FROM records WHERE pet_id = ? AND record_type = ? ORDER BY recorded_at DESC',
      [petId, type]
    );
  },

  getCountByPetId(petId: number): number {
    const db = getDB();
    const result = db.getFirstSync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM records WHERE pet_id = ?',
      [petId]
    );
    return result?.cnt ?? 0;
  },
};
