import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { quizRepository } from '@/lib/quizRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';

export default function QuizResultScreen() {
  const params = useLocalSearchParams<{ score: string; total: string; passed: string }>();
  const score = Math.max(0, Number(params.score) || 0);
  const total = Math.max(1, Number(params.total) || 1);
  const passed = params.passed === '1';
  const percentage = Math.round((score / total) * 100);

  useEffect(() => {
    quizRepository.saveResult(score, total, passed);
  }, [score, total, passed]);

  return (
    <View style={styles.container}>
      <View style={styles.iconArea}>
        <MaterialCommunityIcons
          name={passed ? 'check-decagram' : 'emoticon-sad-outline'}
          size={80}
          color={passed ? colors.success : colors.warning}
        />
      </View>

      <Text style={[styles.title, { color: passed ? colors.success : colors.warning }]}>
        {passed ? '恭喜通过！' : '继续加油！'}
      </Text>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreNumber}>{percentage}</Text>
        <Text style={styles.scoreUnit}>分</Text>
      </View>
      <Text style={styles.scoreDetail}>答对 {score} / {total} 题</Text>

      <Text style={styles.comment}>
        {passed
          ? '你的养宠知识很棒！可以放心照顾好你的小宝贝了~'
          : '再多了解一下宠物知识吧，下次一定能通过！'}
      </Text>

      <View style={styles.buttonArea}>
        {!passed && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.replace('/quiz')} activeOpacity={0.8}>
            <MaterialCommunityIcons name="refresh" size={20} color={colors.card} />
            <Text style={styles.retryBtnText}>重新考核</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)/plan')} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
          <Text style={styles.backBtnText}>返回</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconArea: { marginBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: '800', marginBottom: spacing.lg },
  scoreCard: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: spacing.sm },
  scoreNumber: { fontSize: 64, fontWeight: '900', color: colors.text, lineHeight: 70 },
  scoreUnit: { fontSize: 20, fontWeight: '600', color: colors.textSecondary, marginBottom: 12 },
  scoreDetail: { fontSize: 16, color: colors.textSecondary, marginBottom: spacing.xl },
  comment: { fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl, maxWidth: 300 },
  buttonArea: { gap: spacing.md, width: '100%', maxWidth: 280 },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  retryBtnText: { color: colors.card, fontSize: 16, fontWeight: '700' },
  backBtn: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  backBtnText: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
