import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDietGuides } from '@/lib/dietData';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { sharedStyles } from '@/lib/sharedStyles';
import Card from '@/components/Card';

export default function DietGuideScreen() {
  const params = useLocalSearchParams<{ petType?: string; petName?: string }>();
  const petType = (params.petType as 'cat' | 'dog') || 'cat';
  const petName = params.petName || '宠物';
  const guides = getDietGuides(petType);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name={petType === 'cat' ? 'cat' : 'dog'}
          size={28}
          color={colors.primary}
        />
        <Text style={styles.headerTitle}>{petName}的饮食指南</Text>
      </View>

      {guides.map((guide, idx) => (
        <Card key={idx} style={styles.card}>
          <Text style={sharedStyles.sectionLabel}>{guide.ageGroup}</Text>
          {guide.tips.map((tip, tipIdx) => (
            <View key={tipIdx} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.content}</Text>
              </View>
            </View>
          ))}
        </Card>
      ))}

      <Card style={styles.card}>
        <Text style={sharedStyles.sectionLabel}>通用注意事项</Text>
        <View style={styles.tipRow}>
          <View style={styles.tipDot} />
          <Text style={styles.tipText}>换粮时用 7 天渐进法：新旧粮比例从 1:3 逐步过渡到 3:1</Text>
        </View>
        <View style={styles.tipRow}>
          <View style={styles.tipDot} />
          <Text style={styles.tipText}>避免频繁更换主粮品牌，容易导致肠胃不适</Text>
        </View>
        <View style={styles.tipRow}>
          <View style={styles.tipDot} />
          <Text style={styles.tipText}>食物和水碗每天清洗，保持卫生</Text>
        </View>
        <View style={styles.tipRow}>
          <View style={styles.tipDot} />
          <Text style={styles.tipText}>如有特殊健康问题，请遵医嘱调整饮食</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  card: { marginBottom: spacing.md },
  tipRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'flex-start' },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 7 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  tipText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, flex: 1 },
});
