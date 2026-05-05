import { getDB } from './db';

export type QuizProgress = {
  id: number;
  score: number;
  total: number;
  passed: number;
  completed_at: string;
};

export const quizRepository = {
  saveResult(score: number, total: number, passed: boolean): void {
    const db = getDB();
    db.runSync(
      'INSERT INTO quiz_progress (score, total, passed) VALUES (?, ?, ?)',
      [score, total, passed ? 1 : 0]
    );
  },

  getLatestResult(): QuizProgress | null {
    const db = getDB();
    const result = db.getFirstSync<QuizProgress>(
      'SELECT * FROM quiz_progress ORDER BY id DESC LIMIT 1'
    );
    return result ?? null;
  },

  hasPassed(): boolean {
    const db = getDB();
    const result = db.getFirstSync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM quiz_progress WHERE passed = 1'
    );
    return (result?.cnt ?? 0) > 0;
  },
};
