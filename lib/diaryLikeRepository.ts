import { supabase } from './supabase';

export const diaryLikeRepository = {
  async toggle(diaryId: number, userId: string): Promise<boolean> {
    // Check if already liked
    const { data: existing } = await supabase
      .from('diary_likes')
      .select('id')
      .eq('diary_id', diaryId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Unlike
      await supabase.from('diary_likes').delete().eq('id', existing.id);
      return false;
    } else {
      // Like
      await supabase.from('diary_likes').insert({
        diary_id: diaryId,
        user_id: userId,
      });
      return true;
    }
  },

  async getCount(diaryId: number): Promise<number> {
    const { count } = await supabase
      .from('diary_likes')
      .select('*', { count: 'exact', head: true })
      .eq('diary_id', diaryId);
    return count || 0;
  },

  async isLiked(diaryId: number, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('diary_likes')
      .select('id')
      .eq('diary_id', diaryId)
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  },
};
