import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { diaryRepository, CloudDiary } from '@/lib/diaryRepository';
import { useAuth } from '@/components/AuthProvider';
import { colors, borderRadius, spacing } from '@/lib/theme';
import EmptyState from '@/components/EmptyState';

const CARD_GAP = spacing.sm;

export default function DiaryScreen() {
  const { user } = useAuth();
  const [allDiaries, setAllDiaries] = useState<CloudDiary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) {
      setAllDiaries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await diaryRepository.getAll(user.id);
    setAllDiaries(data);
    setLoading(false);
  }, [user]);

  useFocusEffect(() => { loadData(); });

  const { leftCol, rightCol } = useMemo(() => {
    const left: CloudDiary[] = [];
    const right: CloudDiary[] = [];
    let leftH = 0;
    let rightH = 0;
    allDiaries.forEach((d) => {
      const hasImg = d.images.length > 0;
      const cardH = hasImg ? 250 : 120;
      if (leftH <= rightH) {
        left.push(d);
        leftH += cardH + CARD_GAP;
      } else {
        right.push(d);
        rightH += cardH + CARD_GAP;
      }
    });
    return { leftCol: left, rightCol: right };
  }, [allDiaries]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const renderCard = (diary: CloudDiary) => {
    const hasImg = diary.images.length > 0;

    return (
      <TouchableOpacity
        key={diary.id}
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/diary-detail', params: { diaryId: String(diary.id) } })}
      >
        {hasImg && (
          <Image source={{ uri: diary.images[0] }} style={styles.cardImage} resizeMode="cover" />
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardContent} numberOfLines={hasImg ? 2 : 4}>
            {diary.content}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardDate}>{formatDate(diary.created_at)}</Text>
            {diary.pet_name && <Text style={styles.cardPet}>{diary.pet_name}</Text>}
          </View>
          <View style={styles.cardActions}>
            <View style={styles.actionItem}>
              <MaterialCommunityIcons
                name={diary.is_liked ? 'heart' : 'heart-outline'}
                size={14}
                color={diary.is_liked ? colors.warning : colors.textSecondary}
              />
              <Text style={[styles.actionText, diary.is_liked && { color: colors.warning }]}>
                {diary.like_count || ''}
              </Text>
            </View>
            <View style={styles.actionItem}>
              <MaterialCommunityIcons name="comment-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.actionText}>{diary.comment_count || ''}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
        <MaterialCommunityIcons name="account-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={{ fontSize: 16, color: colors.text, marginTop: spacing.md, fontWeight: '600' }}>请先登录</Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }}>
          登录后可以写日记、上传图片、点赞和评论
        </Text>
        <TouchableOpacity
          style={[styles.fab, { position: 'relative', right: 0, bottom: 0, marginTop: spacing.lg }]}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>去登录</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>日记</Text>
      </View>

      <FlatList
        data={[{ key: 'placeholder' }]}
        keyExtractor={() => 'content'}
        renderItem={() => null}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          allDiaries.length === 0 ? (
            <EmptyState icon="book-heart-outline" title="还没有日记" subtitle="点击右下角按钮记录和毛孩子的故事" />
          ) : (
            <View style={styles.masonry}>
              <View style={styles.column}>
                {leftCol.map(renderCard)}
              </View>
              <View style={[styles.column, { marginLeft: CARD_GAP }]}>
                {rightCol.map(renderCard)}
              </View>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-diary')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="pencil-plus" size={28} color={colors.card} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.background,
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  listContent: { padding: spacing.lg, paddingBottom: 100 },
  masonry: { flexDirection: 'row' },
  column: { flex: 1 },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.md, marginBottom: CARD_GAP, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardImage: { width: '100%', height: 150 },
  cardBody: { padding: spacing.sm },
  cardContent: { fontSize: 14, color: colors.text, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  cardDate: { fontSize: 11, color: colors.textSecondary },
  cardPet: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionText: { fontSize: 11, color: colors.textSecondary },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF7EB3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});
