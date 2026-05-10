import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { assessHealth, HealthResult } from '@/lib/healthAssessment';
import { getRecommendedRecipes, Recipe } from '@/lib/recipeData';
import { getLifeStage, parseAgeMonths } from '@/lib/lifeStage';
import { recordRepository } from '@/lib/recordRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { getDB } from '@/lib/db';

const bodySizeOptions = [
  { key: 'too-thin', label: '太瘦', icon: 'arrow-down-bold-circle', color: '#EF5350' },
  { key: 'thin', label: '偏瘦', icon: 'arrow-down-circle', color: '#FF9800' },
  { key: 'normal', label: '正常', icon: 'check-circle', color: '#66BB6A' },
  { key: 'overweight', label: '偏胖', icon: 'arrow-up-circle', color: '#FF9800' },
  { key: 'obese', label: '太胖', icon: 'arrow-up-bold-circle', color: '#EF5350' },
] as const;

export default function HealthAssessmentScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = petId ? petRepository.getById(Number(petId)) : null;

  const [weight, setWeight] = useState(pet?.weight || '');
  const [bodySize, setBodySize] = useState<string>('');
  const [result, setResult] = useState<{
    health: HealthResult;
    recipes: Recipe[];
    stageName: string;
  } | null>(null);

  const handleSubmit = () => {
    if (!pet) return;
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    if (!bodySize) return;

    // 更新宠物体重
    const db = getDB();
    db.runSync('UPDATE pets SET weight = ? WHERE id = ?', [weight.trim(), pet.id]);

    // 保存体型记录
    const sizeLabel = bodySizeOptions.find((b) => b.key === bodySize)?.label || '';
    recordRepository.save(
      { record_type: 'body_size', title: '体型评估', note: '', value_text: sizeLabel },
      pet.id
    );

    // 计算结果
    const updatedPet = petRepository.getById(pet.id);
    if (!updatedPet) return;
    const health = assessHealth(updatedPet);
    if (!health) return;

    const recipes = getRecommendedRecipes(updatedPet);
    const ageMonths = parseAgeMonths(updatedPet.age_text ?? '');
    const stage = getLifeStage((updatedPet.pet_type as 'cat' | 'dog') || 'cat', ageMonths);

    setResult({ health, recipes, stageName: stage?.name || '' });
  };

  if (!pet) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>健康评估</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyText}>未找到宠物信息</Text>
        </View>
      </View>
    );
  }

  // 结果页面
  if (result) {
    const { health, recipes, stageName } = result;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setResult(null)} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>评估结果</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Pet info */}
          <View style={styles.petInfoCard}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petMeta}>
              {pet.breed || (pet.pet_type === 'cat' ? '猫' : '狗')}
              {stageName ? ` · ${stageName}` : ''}
            </Text>
          </View>

          {/* Health status circle */}
          <View style={styles.statusCard}>
            <View style={[styles.statusCircle, { borderColor: health.color }]}>
              <MaterialCommunityIcons
                name={health.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={48}
                color={health.color}
              />
              <Text style={[styles.statusLabel, { color: health.color }]}>{health.label}</Text>
            </View>
            <Text style={styles.weightText}>
              当前体重 <Text style={styles.weightValue}>{health.currentWeight}kg</Text>
            </Text>
            <Text style={styles.idealText}>
              理想范围 {health.idealMin}~{health.idealMax}kg
            </Text>
          </View>

          {/* Suggestion */}
          <View style={styles.suggestionCard}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.primary} />
            <Text style={styles.suggestionText}>{health.suggestion}</Text>
          </View>

          {/* Recommended recipes */}
          {recipes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>推荐食谱</Text>
              {recipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => router.push({ pathname: '/recipe-detail', params: { recipeId: recipe.id } })}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={recipe.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={28}
                    color="#FF9A6C"
                  />
                  <View style={styles.recipeContent}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <Text style={styles.recipeDesc} numberOfLines={1}>{recipe.description}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Re-evaluate */}
          <TouchableOpacity
            style={styles.recordBtn}
            onPress={() => setResult(null)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={colors.card} />
            <Text style={styles.recordBtnText}>重新评估</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // 输入页面
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>健康评估</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Pet info */}
        <View style={styles.petInfoCard}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petMeta}>
            {pet.breed || (pet.pet_type === 'cat' ? '猫' : '狗')}
            {pet.age_text ? ` · ${pet.age_text}` : ''}
          </Text>
        </View>

        {/* Weight input */}
        <Text style={styles.inputLabel}>体重（kg）</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="请输入体重，如 4.5"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
        />

        {/* Body size selector */}
        <Text style={[styles.inputLabel, { marginTop: spacing.lg }]}>体型判断</Text>
        <View style={styles.sizeGrid}>
          {bodySizeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.sizeBtn,
                bodySize === opt.key && { borderColor: opt.color, backgroundColor: opt.color + '15' },
              ]}
              onPress={() => setBodySize(opt.key)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={opt.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={28}
                color={bodySize === opt.key ? opt.color : colors.textSecondary}
              />
              <Text style={[styles.sizeBtnText, bodySize === opt.key && { color: opt.color }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.recordBtn, { opacity: weight.trim() && bodySize ? 1 : 0.5 }]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!weight.trim() || !bodySize}
        >
          <MaterialCommunityIcons name="check" size={20} color={colors.card} />
          <Text style={styles.recordBtnText}>提交评估</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 48, paddingBottom: 8, paddingHorizontal: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textSecondary },

  petInfoCard: {
    backgroundColor: colors.card, borderRadius: 18, padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 1,
  },
  petName: { fontSize: 20, fontWeight: '800', color: colors.text },
  petMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  inputLabel: {
    fontSize: 15, fontWeight: '700', color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 16, color: colors.text,
  },

  sizeGrid: {
    flexDirection: 'row', gap: spacing.sm,
  },
  sizeBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md, borderWidth: 1.5,
    borderColor: colors.border, backgroundColor: colors.card,
  },
  sizeBtnText: {
    fontSize: 13, fontWeight: '700', color: colors.textSecondary,
  },

  statusCard: {
    backgroundColor: colors.card, borderRadius: 24, padding: spacing.xl,
    alignItems: 'center', marginBottom: spacing.md,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 1,
  },
  statusCircle: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 4,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background, marginBottom: spacing.md,
  },
  statusLabel: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  weightText: { fontSize: 14, color: colors.textSecondary },
  weightValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  idealText: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  suggestionCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.primaryLight, borderRadius: 16,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  suggestionText: { fontSize: 14, color: colors.text, lineHeight: 20, flex: 1 },

  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: colors.text,
    marginBottom: spacing.sm, marginTop: spacing.sm,
  },
  recipeCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.card, borderRadius: 18, padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 1,
  },
  recipeContent: { flex: 1 },
  recipeName: { fontSize: 15, fontWeight: '600', color: colors.text },
  recipeDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  recordBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, marginTop: spacing.lg,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  recordBtnText: { color: colors.card, fontSize: 16, fontWeight: '700' },
});
