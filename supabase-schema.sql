-- ============================================
-- 猫狗日记 — Supabase 数据库初始化 SQL
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 日记表
CREATE TABLE IF NOT EXISTS diaries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  pet_name TEXT,
  pet_type TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 点赞表
CREATE TABLE IF NOT EXISTS diary_likes (
  id BIGSERIAL PRIMARY KEY,
  diary_id BIGINT NOT NULL REFERENCES diaries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(diary_id, user_id)
);

-- 评论表
CREATE TABLE IF NOT EXISTS diary_comments (
  id BIGSERIAL PRIMARY KEY,
  diary_id BIGINT NOT NULL REFERENCES diaries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diary_likes_diary_id ON diary_likes(diary_id);
CREATE INDEX IF NOT EXISTS idx_diary_comments_diary_id ON diary_comments(diary_id);

-- RLS 策略
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_comments ENABLE ROW LEVEL SECURITY;

-- 日记：自己可读写自己的，公开的任何人可读
CREATE POLICY "Public diaries are readable" ON diaries FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own diaries" ON diaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diaries" ON diaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diaries" ON diaries FOR DELETE USING (auth.uid() = user_id);

-- 点赞：所有人可读，自己可插入/删除
CREATE POLICY "Likes are readable" ON diary_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON diary_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON diary_likes FOR DELETE USING (auth.uid() = user_id);

-- 评论：所有人可读，自己可插入/删除
CREATE POLICY "Comments are readable" ON diary_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON diary_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON diary_comments FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket（如果 diary-images 不存在则创建）
INSERT INTO storage.buckets (id, name, public)
VALUES ('diary-images', 'diary-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 策略
CREATE POLICY "Authenticated users can upload diary images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'diary-images' AND auth.role() = 'authenticated');

CREATE POLICY "Diary images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'diary-images');

CREATE POLICY "Users can delete own diary images"
ON storage.objects FOR DELETE
USING (bucket_id = 'diary-images' AND auth.uid()::text = (storage.foldername(name))[1]);
