import { getDB } from './db';

export type DocType = 'registration' | 'immunization' | 'other';

export type Document = {
  id: number;
  pet_id: number;
  doc_type: DocType;
  name: string;
  note: string | null;
  image_uri: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  created_at: string;
};

export type DocumentDraft = {
  doc_type: DocType;
  name: string;
  note: string;
  image_uri: string;
  issue_date: string;
  expiry_date: string;
};

export const docTypeLabels: Record<DocType, { label: string; icon: string; color: string }> = {
  registration: { label: '登记证', icon: 'file-certificate', color: '#66BB6A' },
  immunization: { label: '免疫证明', icon: 'shield-check', color: '#42A5F5' },
  other: { label: '其他证件', icon: 'file-document', color: '#AB47BC' },
};

export const documentRepository = {
  save(draft: DocumentDraft, petId: number): void {
    const db = getDB();
    db.runSync(
      'INSERT INTO documents (pet_id, doc_type, name, note, image_uri, issue_date, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [petId, draft.doc_type, draft.name.trim(), draft.note.trim(), draft.image_uri, draft.issue_date, draft.expiry_date]
    );
  },

  getByPetId(petId: number): Document[] {
    const db = getDB();
    return db.getAllSync<Document>(
      'SELECT * FROM documents WHERE pet_id = ? ORDER BY created_at DESC',
      [petId]
    );
  },

  getByPetIdAndType(petId: number, docType: DocType): Document[] {
    const db = getDB();
    return db.getAllSync<Document>(
      'SELECT * FROM documents WHERE pet_id = ? AND doc_type = ? ORDER BY created_at DESC',
      [petId, docType]
    );
  },

  getById(id: number): Document | null {
    const db = getDB();
    return db.getFirstSync<Document>('SELECT * FROM documents WHERE id = ?', [id]) ?? null;
  },

  update(id: number, draft: DocumentDraft): void {
    const db = getDB();
    db.runSync(
      'UPDATE documents SET doc_type = ?, name = ?, note = ?, image_uri = ?, issue_date = ?, expiry_date = ? WHERE id = ?',
      [draft.doc_type, draft.name.trim(), draft.note.trim(), draft.image_uri, draft.issue_date, draft.expiry_date, id]
    );
  },

  delete(id: number): void {
    const db = getDB();
    db.runSync('DELETE FROM documents WHERE id = ?', [id]);
  },
};
