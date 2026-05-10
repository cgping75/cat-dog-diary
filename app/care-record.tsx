import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recordRepository, PetRecord } from '@/lib/recordRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';

const careTypes = [
  { type: 'bath' as const, label: '洗澡', icon: 'shower-head' as const, color: colors.bath },
  { type: 'grooming' as const, label: '毛发修剪', icon: 'content-cut' as const, color: colors.grooming },
  { type: 'nail' as const, label: '剪指甲', icon: 'hand-back-right-outline' as const, color: colors.nail },
];

export default function CareRecordScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const id = Number(petId);
  const [records, setRecords] = useState<PetRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const all: PetRecord[] = [];
      for (const ct of careTypes) {
        all.push(...recordRepository.getByPetIdAndType(id, ct.type));
      }
      all.sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
      setRecords(all.slice(0, 10));
    }, [id])
  );

  const typeMap = Object.fromEntries(careTypes.map((c) => [c.type, c]));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>护理记录</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Entry cards */}
        <View style={styles.entryGrid}>
          {careTypes.map((ct) => (
            <TouchableOpacity
              key={ct.type}
              style={styles.entryCard}
              onPress={() => router.push({ pathname: '/add-record', params: { petId: String(id), recordType: ct.type } })}
              activeOpacity={0.7}
            >
              <View style={[styles.entryIconBg, { backgroundColor: ct.color + '18' }]}>
                <MaterialCommunityIcons name={ct.icon} size={32} color={ct.color} />
              </View>
              <Text style={styles.entryLabel}>{ct.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent records */}
        <Text style={styles.sectionTitle}>最近护理记录</Text>
        {records.length === 0 ? (
          <Text style={styles.emptyText}>暂无护理记录，点击上方入口添加</Text>
        ) : (
          records.map((r) => {
            const ct = typeMap[r.record_type];
            return (
              <TouchableOpacity
                key={r.id}
                style={styles.recordItem}
                onPress={() => router.push({ pathname: '/add-record', params: { petId: String(id), recordId: String(r.id) } })}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={ct?.icon || 'dots-horizontal'}
                  size={22}
                  color={ct?.color || colors.textSecondary}
                />
                <View style={styles.recordContent}>
                  <Text style={styles.recordTitle}>{r.title}</Text>
                  <Text style={styles.recordMeta}>
                    {ct?.label || r.record_type}{r.value_text ? ` · ${r.value_text}` : ''} · {r.recorded_at.slice(0, 10)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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

  entryGrid: {
    flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg,
  },
  entryCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: 20,
    padding: spacing.lg, alignItems: 'center', gap: spacing.sm,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 2,
  },
  entryIconBg: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  entryLabel: { fontSize: 13, fontWeight: '700', color: colors.text },

  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: colors.text,
    marginBottom: spacing.sm, marginTop: spacing.sm,
  },
  emptyText: {
    fontSize: 14, color: colors.textSecondary, textAlign: 'center',
    marginTop: spacing.lg,
  },
  recordItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.card, borderRadius: 18, padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 1,
  },
  recordContent: { flex: 1 },
  recordTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  recordMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
