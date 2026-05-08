import { supabase } from './supabase';

export type Comment = {
  id: number;
  diary_id: number;
  user_id: string;
  content: string;
  created_at: string;
  user_email: string;
};

export const diaryCommentRepository = {
  async getByDiaryId(diaryId: number): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('diary_comments')
      .select('*')
      .eq('diary_id', diaryId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('diaryCommentRepository.getByDiaryId:', error.message);
      return [];
    }

    // Fetch user emails for unique user_ids
    const userIds = [...new Set((data || []).map((r) => r.user_id))];
    const emailMap = new Map<string, string>();

    for (const uid of userIds) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(uid);
        emailMap.set(uid, userData?.user?.email || '匿名用户');
      } catch {
        // Fallback: use masked user_id
        emailMap.set(uid, uid.slice(0, 8) + '...');
      }
    }

    return (data || []).map((r) => ({
      ...r,
      user_email: emailMap.get(r.user_id) || '匿名用户',
    }));
  },

  async add(diaryId: number, userId: string, content: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('diary_comments')
      .insert({
        diary_id: diaryId,
        user_id: userId,
        content: content.trim(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('diaryCommentRepository.add:', error.message);
      return null;
    }
    return data.id;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('diary_comments').delete().eq('id', id);
    if (error) {
      console.error('diaryCommentRepository.delete:', error.message);
    }
  },

  async getCount(diaryId: number): Promise<number> {
    const { count } = await supabase
      .from('diary_comments')
      .select('*', { count: 'exact', head: true })
      .eq('diary_id', diaryId);
    return count || 0;
  },
};
