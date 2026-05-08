import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, FlatList, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { diaryRepository, CloudDiary } from '@/lib/diaryRepository';
import { diaryLikeRepository } from '@/lib/diaryLikeRepository';
import { diaryCommentRepository, Comment } from '@/lib/diaryCommentRepository';
import { useAuth } from '@/components/AuthProvider';
import { colors, borderRadius, spacing } from '@/lib/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DiaryDetailScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ diaryId: string }>();
  const diaryId = Number(params.diaryId);
  const insets = useSafeAreaInsets();

  const [diary, setDiary] = useState<CloudDiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await diaryRepository.getById(diaryId, user.id);
      if (cancelled) return;
      setDiary(data);
      if (data) {
        const cmts = await diaryCommentRepository.getByDiaryId(diaryId);
        if (!cancelled) setComments(cmts);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [diaryId, user]);

  const handleToggleLike = async () => {
    if (!user || !diary) return;
    const isNowLiked = await diaryLikeRepository.toggle(diaryId, user.id);
    setDiary({
      ...diary,
      is_liked: isNowLiked,
      like_count: diary.like_count + (isNowLiked ? 1 : -1),
    });
  };

  const handleSendComment = async () => {
    if (!user || !commentText.trim()) return;
    setSendingComment(true);
    const newId = await diaryCommentRepository.add(diaryId, user.id, commentText.trim());
    if (newId) {
      setComments([
        ...comments,
        {
          id: newId,
          diary_id: diaryId,
          user_id: user.id,
          content: commentText.trim(),
          created_at: new Date().toISOString(),
          user_email: user.email || '我',
        },
      ]);
      setCommentText('');
      if (diary) setDiary({ ...diary, comment_count: diary.comment_count + 1 });
    }
    setSendingComment(false);
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert('删除评论', '确定要删除这条评论吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await diaryCommentRepository.delete(commentId);
          setComments(comments.filter((c) => c.id !== commentId));
          if (diary) setDiary({ ...diary, comment_count: Math.max(0, diary.comment_count - 1) });
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('删除日记', '确定要删除这篇日记吗？删除后无法恢复。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await diaryRepository.delete(diaryId);
          router.back();
        },
      },
    ]);
  };

  const handleEdit = () => {
    router.push({ pathname: '/add-diary', params: { diaryId: String(diaryId) } });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatCommentTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!diary) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textSecondary }}>日记不存在</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>日记详情</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
            <MaterialCommunityIcons name="delete-outline" size={20} color={colors.warning} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <FlatList
        ref={flatRef}
        data={comments}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUser}>{item.user_email.split('@')[0]}</Text>
              <Text style={styles.commentTime}>{formatCommentTime(item.created_at)}</Text>
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>
            {item.user_id === user?.id && (
              <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.commentDelete}>
                <MaterialCommunityIcons name="close" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            {/* Diary content */}
            <View style={styles.contentSection}>
              <View style={styles.metaRow}>
                <Text style={styles.dateText}>{formatDate(diary.created_at)}</Text>
                {diary.pet_name && (
                  <View style={styles.petTag}>
                    <MaterialCommunityIcons
                      name={diary.pet_type === 'cat' ? 'cat' : 'dog'}
                      size={12}
                      color={colors.primary}
                    />
                    <Text style={styles.petName}>{diary.pet_name}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.contentText}>{diary.content}</Text>
            </View>

            {/* Images */}
            {diary.images.length > 0 && (
              <View style={styles.imageSection}>
                <FlatList
                  data={diary.images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, i) => String(i)}
                  onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    setCurrentIdx(idx);
                  }}
                  renderItem={({ item: uri }) => (
                    <Image source={{ uri }} style={styles.fullImage} resizeMode="contain" />
                  )}
                />
                {diary.images.length > 1 && (
                  <View style={styles.dots}>
                    {diary.images.map((_, i) => (
                      <View key={i} style={[styles.dot, i === currentIdx && styles.dotActive]} />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Social bar */}
            <View style={styles.socialBar}>
              <TouchableOpacity style={styles.socialBtn} onPress={handleToggleLike} activeOpacity={0.7}>
                <MaterialCommunityIcons
                  name={diary.is_liked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={diary.is_liked ? colors.warning : colors.textSecondary}
                />
                <Text style={[styles.socialText, diary.is_liked && { color: colors.warning }]}>
                  {diary.like_count || '点赞'}
                </Text>
              </TouchableOpacity>
              <View style={styles.socialBtn}>
                <MaterialCommunityIcons name="comment-outline" size={22} color={colors.textSecondary} />
                <Text style={styles.socialText}>{comments.length || '评论'}</Text>
              </View>
            </View>

            {/* Comments header */}
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>评论 {comments.length > 0 ? `(${comments.length})` : ''}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyComments}>
            <Text style={styles.emptyText}>还没有评论，来说点什么吧</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Comment input */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <TextInput
          style={styles.input}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="写评论..."
          placeholderTextColor={colors.textSecondary}
          multiline={false}
        />
        <TouchableOpacity
          onPress={handleSendComment}
          disabled={sendingComment || !commentText.trim()}
          style={[styles.sendBtn, !commentText.trim() && { opacity: 0.4 }]}
        >
          <MaterialCommunityIcons name="send" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: spacing.xl },
  contentSection: { padding: spacing.lg },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  dateText: { fontSize: 13, color: colors.textSecondary },
  petTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  petName: { fontSize: 12, fontWeight: '600', color: colors.primary },
  contentText: { fontSize: 16, lineHeight: 26, color: colors.text },
  imageSection: { marginTop: spacing.sm },
  fullImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 18 },
  socialBar: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xl,
  },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  socialText: { fontSize: 14, color: colors.textSecondary },
  commentsHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commentsTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  commentItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentUser: { fontSize: 13, fontWeight: '600', color: colors.text },
  commentTime: { fontSize: 11, color: colors.textSecondary },
  commentContent: { fontSize: 14, color: colors.text, lineHeight: 20 },
  commentDelete: { position: 'absolute', top: spacing.md, right: spacing.lg },
  emptyComments: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: 13, color: colors.textSecondary },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  sendBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});
