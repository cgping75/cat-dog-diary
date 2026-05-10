import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getRecipeById } from '@/lib/recipeData';
import { colors, borderRadius, spacing } from '@/lib/theme';

const nutritionRows = [
  { key: 'calories' as const, label: '热量', icon: 'fire' as const, color: '#FF6B6B' },
  { key: 'protein' as const, label: '蛋白质', icon: 'food-drumstick' as const, color: '#4ECDC4' },
  { key: 'fat' as const, label: '脂肪', icon: 'oil' as const, color: '#FFE66D' },
  { key: 'carbs' as const, label: '碳水', icon: 'grain' as const, color: '#95E1D3' },
];

export default function RecipeDetailScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const recipe = recipeId ? getRecipeById(recipeId) : undefined;

  if (!recipe) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>食谱详情</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyText}>食谱不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>食谱详情</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Recipe title */}
        <View style={styles.titleCard}>
          <MaterialCommunityIcons
            name={recipe.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={40}
            color="#FF9A6C"
          />
          <View style={styles.titleInfo}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <Text style={styles.recipeType}>
              {recipe.petType === 'cat' ? '猫咪' : recipe.petType === 'dog' ? '狗狗' : '通用'}
            </Text>
          </View>
        </View>

        <Text style={styles.recipeDesc}>{recipe.description}</Text>

        {/* Ingredients */}
        <Text style={styles.sectionTitle}>食材清单</Text>
        <View style={styles.card}>
          {recipe.ingredients.map((item, i) => (
            <View key={i} style={styles.ingredientRow}>
              <MaterialCommunityIcons name="circle-small" size={20} color="#FF9A6C" />
              <Text style={styles.ingredientText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Nutrition Table */}
        <Text style={styles.sectionTitle}>营养成分</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>营养素</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>含量</Text>
          </View>
          {nutritionRows.map((n, i) => (
            <View key={n.key} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
              <View style={[styles.tableCellView, { flex: 1 }]}>
                <MaterialCommunityIcons name={n.icon} size={16} color={n.color} />
                <Text style={styles.tableCellLabel}>{n.label}</Text>
              </View>
              <Text style={[styles.tableCellText, { flex: 1.5 }]}>{recipe.nutrition[n.key]}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        {recipe.nutrition.notes ? (
          <>
            <Text style={styles.sectionTitle}>喂食建议</Text>
            <View style={styles.card}>
              <View style={styles.noteRow}>
                <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} />
                <Text style={styles.noteText}>{recipe.nutrition.notes}</Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, color: colors.textSecondary },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },

  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  titleInfo: { flex: 1 },
  recipeName: { fontSize: 22, fontWeight: '800', color: colors.text },
  recipeType: {
    fontSize: 13,
    color: '#FF9A6C',
    fontWeight: '600',
    marginTop: 2,
  },
  recipeDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#FF7EB3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },

  table: {
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#FF7EB3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E0E8',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#FFFBFD',
  },
  tableCellView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tableCellText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  tableCellLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },

  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noteText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});
