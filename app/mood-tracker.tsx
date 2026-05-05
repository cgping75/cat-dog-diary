import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { moodRepository, Mood, MoodRecord, MoodDraft, Level } from '@/lib/moodRepository';
import { moodInfoMap } from '@/lib/moodCareData';
import { petRepository, Pet } from '@/lib/petRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { sharedStyles } from '@/lib/sharedStyles';
import Card from '@/components/Card';

const moodOptions: Mood[] = ['happy', 'calm', 'anxious', 'sad', 'angry', 'sick'];
const levelOptions: { value: Level; label: string }[] = [
  { value: 'high', label: '高' },
  { value: 'normal', label: '正常' },
  { value: 'low', label: '低' },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function MoodTrackerScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = Number(params.petId || 0);

  const [pet, setPet] = useState<Pet | null>(null);
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | ''>('');
  const [energyLevel, setEnergyLevel] = useState<Level | ''>('');
  const [appetite, setAppetite] = useState<Level | ''>('');
  const [behavior, setBehavior] = useState('');
  const [note, setNote] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCare, setShowCare] = useState<Mood | null>(null);

  const loadData = useCallback(() => {
    if (petId) {
      setPet(petRepository.getById(petId));
      setRecords(moodRepository.getRecentByPetId(petId, 20));
    }
  }, [petId]);

  useFocusEffect(loadData);

  const handleSave = () => {
    if (!selectedMood) {
      Alert.alert('提示', '请选择情绪状态');
      return;
    }
    const draft: MoodDraft = {
      mood: selectedMood,
      energyLevel,
      appetite,
      behavior: behavior.trim(),
      note: note.trim(),
    };
    moodRepository.save(draft, petId);
    setSelectedMood('');
    setEnergyLevel('');
    setAppetite('');
    setBehavior('');
    setNote('');
    setShowForm(false);
    loadData();
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除记录', '确定要删除这条情绪记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => { moodRepository.delete(id); loadData(); } },
    ]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color={colors.primary} />
        <Text style={styles.headerTitle}>{pet?.name || '宠物'}的情绪档案</Text>
      </View>

      {/* 记录情绪按钮 */}
      <TouchableOpacity
        style={[sharedStyles.saveBtn, showForm && { backgroundColor: colors.textSecondary }]}
        onPress={() => setShowForm(!showForm)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name={showForm ? 'close' : 'plus'} size={20} color={colors.card} />
        <Text style={sharedStyles.saveBtnText}>{showForm ? '取消' : '记录当前情绪'}</Text>
      </TouchableOpacity>

      {/* 记录表单 */}
      {showForm && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={sharedStyles.sectionLabel}>选择情绪状态</Text>
          <View style={styles.moodGrid}>
            {moodOptions.map((m) => {
              const info = moodInfoMap[m];
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.moodBtn, selectedMood === m && { borderColor: info.color, backgroundColor: info.color + '15' }]}
                  onPress={() => setSelectedMood(m)}
                >
                  <MaterialCommunityIcons name={info.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={28} color={selectedMood === m ? info.color : colors.textSecondary} />
                  <Text style={[styles.moodBtnText, selectedMood === m && { color: info.color }]}>{info.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={sharedStyles.label}>精力水平</Text>
          <View style={styles.optionRow}>
            {levelOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionBtn, energyLevel === opt.value && styles.optionBtnActive]}
                onPress={() => setEnergyLevel(energyLevel === opt.value ? '' : opt.value)}
              >
                <Text style={[styles.optionBtnText, energyLevel === opt.value && styles.optionBtnTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={sharedStyles.label}>食欲</Text>
          <View style={styles.optionRow}>
            {levelOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionBtn, appetite === opt.value && styles.optionBtnActive]}
                onPress={() => setAppetite(appetite === opt.value ? '' : opt.value)}
              >
                <Text style={[styles.optionBtnText, appetite === opt.value && styles.optionBtnTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={sharedStyles.label}>行为表现</Text>
          <TextInput
            style={sharedStyles.input}
            value={behavior}
            onChangeText={setBehavior}
            placeholder="如：频繁舔毛、躲角落、追尾巴"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={sharedStyles.label}>备注</Text>
          <TextInput
            style={[sharedStyles.input, { height: 60, textAlignVertical: 'top' }]}
            value={note}
            onChangeText={setNote}
            placeholder="其他观察..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          <TouchableOpacity style={sharedStyles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <MaterialCommunityIcons name="check" size={20} color={colors.card} />
            <Text style={sharedStyles.saveBtnText}>保存记录</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* 情绪知识卡片 */}
      <Text style={styles.sectionTitle}>情绪识别与护理指南</Text>
      <View style={styles.guideGrid}>
        {moodOptions.map((m) => {
          const info = moodInfoMap[m];
          return (
            <TouchableOpacity
              key={m}
              style={[styles.guideBtn, { borderColor: info.color + '40' }]}
              onPress={() => setShowCare(showCare === m ? null : m)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name={info.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={22} color={info.color} />
              <Text style={[styles.guideBtnText, { color: info.color }]}>{info.label}</Text>
              <MaterialCommunityIcons name={showCare === m ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </View>

      {showCare && (
        <Card style={{ marginTop: spacing.sm }}>
          <View style={styles.careHeader}>
            <MaterialCommunityIcons
              name={moodInfoMap[showCare].icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={28}
              color={moodInfoMap[showCare].color}
            />
            <Text style={[styles.careTitle, { color: moodInfoMap[showCare].color }]}>
              {moodInfoMap[showCare].label}状态
            </Text>
          </View>
          <Text style={styles.careDesc}>{moodInfoMap[showCare].description}</Text>

          <Text style={styles.careSubtitle}>识别特征</Text>
          {moodInfoMap[showCare].signs.map((s, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: moodInfoMap[showCare].color }]} />
              <Text style={styles.bulletText}>{s}</Text>
            </View>
          ))}

          <Text style={styles.careSubtitle}>维系方案</Text>
          {moodInfoMap[showCare].carePlan.map((s, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: colors.success }]} />
              <Text style={styles.bulletText}>{s}</Text>
            </View>
          ))}

          <Text style={styles.careSubtitle}>解决办法</Text>
          {moodInfoMap[showCare].solutions.map((s, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.bulletText}>{s}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* 情绪历史 */}
      <Text style={styles.sectionTitle}>情绪记录历史</Text>
      {records.length === 0 ? (
        <Text style={styles.emptyHint}>暂无情绪记录，点击上方按钮开始记录</Text>
      ) : (
        records.map((r) => {
          const info = moodInfoMap[r.mood] || moodInfoMap.calm;
          return (
            <TouchableOpacity
              key={r.id}
              style={styles.recordCard}
              onLongPress={() => handleDelete(r.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.recordMoodIcon, { backgroundColor: info.color + '15' }]}>
                <MaterialCommunityIcons name={info.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={22} color={info.color} />
              </View>
              <View style={styles.recordContent}>
                <View style={styles.recordTopRow}>
                  <Text style={[styles.recordMoodLabel, { color: info.color }]}>{info.label}</Text>
                  <Text style={styles.recordTime}>{formatDate(r.recorded_at)}</Text>
                </View>
                <View style={styles.recordMeta}>
                  {r.energy_level ? <Text style={styles.recordMetaText}>精力:{r.energy_level === 'high' ? '高' : r.energy_level === 'normal' ? '正常' : '低'}</Text> : null}
                  {r.appetite ? <Text style={styles.recordMetaText}>食欲:{r.appetite === 'high' ? '旺盛' : r.appetite === 'normal' ? '正常' : '差'}</Text> : null}
                </View>
                {r.behavior ? <Text style={styles.recordBehavior}>{r.behavior}</Text> : null}
                {r.note ? <Text style={styles.recordNote}>{r.note}</Text> : null}
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  moodBtn: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  moodBtnText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  optionRow: { flexDirection: 'row', gap: spacing.sm },
  optionBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  optionBtnTextActive: { color: colors.primary },
  guideGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  guideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    backgroundColor: colors.card,
  },
  guideBtnText: { fontSize: 13, fontWeight: '700' },
  careHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  careTitle: { fontSize: 18, fontWeight: '800' },
  careDesc: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 20 },
  careSubtitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: 6, alignItems: 'flex-start' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  bulletText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, flex: 1 },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    alignItems: 'flex-start',
    shadowColor: '#FF7EB3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1,
  },
  recordMoodIcon: { width: 44, height: 44, borderRadius: borderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  recordContent: { flex: 1, gap: 4 },
  recordTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordMoodLabel: { fontSize: 15, fontWeight: '700' },
  recordTime: { fontSize: 12, color: colors.textSecondary },
  recordMeta: { flexDirection: 'row', gap: spacing.md },
  recordMetaText: { fontSize: 12, color: colors.textSecondary },
  recordBehavior: { fontSize: 13, color: colors.text },
  recordNote: { fontSize: 12, color: colors.textSecondary },
  emptyHint: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
});
