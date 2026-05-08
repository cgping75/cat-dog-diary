import { supabase } from './supabase';
import { deleteImages } from './diaryImageUtils';

export type CloudDiary = {
  id: number;
  user_id: string;
  content: string;
  images: string[];
  pet_name: string | null;
  pet_type: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
};

export type DiaryDraft = {
  content: string;
  images: string[];
  is_public?: boolean;
};

export const diaryRepository = {
  async getAll(userId: string): Promise<CloudDiary[]> {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('diaryRepository.getAll:', error.message);
      return [];
    }

    return enrichDiaries(data || [], userId);
  },

  async getById(id: number, userId: string): Promise<CloudDiary | null> {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    const [enriched] = await enrichDiaries([data], userId);
    return enriched || null;
  },

  async save(userId: string, draft: DiaryDraft): Promise<number | null> {
    const { data, error } = await supabase
      .from('diaries')
      .insert({
        user_id: userId,
        content: draft.content.trim(),
        images: draft.images,
        is_public: draft.is_public ?? false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('diaryRepository.save:', error.message);
      return null;
    }
    return data.id;
  },

  async update(id: number, draft: DiaryDraft): Promise<void> {
    const { error } = await supabase
      .from('diaries')
      .update({
        content: draft.content.trim(),
        images: draft.images,
        is_public: draft.is_public ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('diaryRepository.update:', error.message);
    }
  },

  async delete(id: number): Promise<void> {
    // Fetch diary to get image URLs for cleanup
    const { data: diary } = await supabase
      .from('diaries')
      .select('images')
      .eq('id', id)
      .single();

    if (diary?.images?.length) {
      await deleteImages(diary.images);
    }

    const { error } = await supabase.from('diaries').delete().eq('id', id);
    if (error) {
      console.error('diaryRepository.delete:', error.message);
    }
  },

  async getPublic(): Promise<CloudDiary[]> {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('diaryRepository.getPublic:', error.message);
      return [];
    }

    return enrichDiaries(data || [], '');
  },
};

// Enrich diaries with like/comment counts
async function enrichDiaries(diaries: any[], userId: string): Promise<CloudDiary[]> {
  if (diaries.length === 0) return [];

  const ids = diaries.map((d) => d.id);

  // Batch query like counts
  const { data: likeRows } = await supabase
    .from('diary_likes')
    .select('diary_id')
    .in('diary_id', ids);

  // Batch query comment counts
  const { data: commentRows } = await supabase
    .from('diary_comments')
    .select('diary_id')
    .in('diary_id', ids);

  // Batch query user's likes
  let likedSet = new Set<number>();
  if (userId) {
    const { data: userLikes } = await supabase
      .from('diary_likes')
      .select('diary_id')
      .in('diary_id', ids)
      .eq('user_id', userId);
    likedSet = new Set((userLikes || []).map((r) => r.diary_id));
  }

  // Count maps
  const likeCountMap = new Map<number, number>();
  (likeRows || []).forEach((r) => {
    likeCountMap.set(r.diary_id, (likeCountMap.get(r.diary_id) || 0) + 1);
  });
  const commentCountMap = new Map<number, number>();
  (commentRows || []).forEach((r) => {
    commentCountMap.set(r.diary_id, (commentCountMap.get(r.diary_id) || 0) + 1);
  });

  return diaries.map((d) => ({
    ...d,
    like_count: likeCountMap.get(d.id) || 0,
    comment_count: commentCountMap.get(d.id) || 0,
    is_liked: likedSet.has(d.id),
  }));
}
