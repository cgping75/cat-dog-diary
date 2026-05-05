import { getDB } from './db';

export type Pet = {
  id: number;
  name: string;
  pet_type: 'cat' | 'dog' | '';
  breed: string;
  gender: 'male' | 'female' | 'unknown' | '';
  age_text: string;
  is_neutered: 'yes' | 'no' | '';
  created_at: string;
};

export type PetDraft = {
  name: string;
  petType: 'cat' | 'dog' | '';
  breed: string;
  gender: 'male' | 'female' | 'unknown' | '';
  ageText: string;
  isNeutered: 'yes' | 'no' | '';
};

export const petRepository = {
  save(pet: PetDraft): number {
    const db = getDB();
    db.runSync(
      'INSERT INTO pets (name, pet_type, breed, gender, age_text, is_neutered) VALUES (?, ?, ?, ?, ?, ?)',
      [pet.name, pet.petType, pet.breed, pet.gender, pet.ageText, pet.isNeutered]
    );
    const result = db.getFirstSync<{ id: number }>('SELECT last_insert_rowid() as id');
    return result!.id;
  },

  getLatest(): Pet | null {
    const db = getDB();
    const result = db.getFirstSync<Pet>(
      'SELECT * FROM pets ORDER BY id DESC LIMIT 1'
    );
    return result ?? null;
  },

  getAll(): Pet[] {
    const db = getDB();
    return db.getAllSync<Pet>('SELECT * FROM pets ORDER BY id ASC');
  },

  getById(id: number): Pet | null {
    const db = getDB();
    const result = db.getFirstSync<Pet>(
      'SELECT * FROM pets WHERE id = ?',
      [id]
    );
    return result ?? null;
  },

  delete(id: number): void {
    const db = getDB();
    db.runSync('DELETE FROM records WHERE pet_id = ?', [id]);
    db.runSync('DELETE FROM pets WHERE id = ?', [id]);
  },

  update(id: number, pet: PetDraft): void {
    const db = getDB();
    db.runSync(
      'UPDATE pets SET name = ?, pet_type = ?, breed = ?, gender = ?, age_text = ?, is_neutered = ? WHERE id = ?',
      [pet.name, pet.petType, pet.breed, pet.gender, pet.ageText, pet.isNeutered, id]
    );
  },
};
