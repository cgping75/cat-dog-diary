import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { recordRepository, PetRecord } from '@/lib/recordRepository';
import { daysBetween, VACCINE_INTERVAL_DAYS } from '@/lib/dateUtils';
import { colors, borderRadius, spacing } from '@/lib/theme';

type VaccineGroup = {
  title: string;
  records: PetRecord[];
  nextDue: string | null;
  isOverdue: boolean;
};

export default function VaccineArchiveScreen() {
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPetId, setCurrentPetId] = useState(0);
  const [groups, setGroups] = useState<VaccineGroup[]>([]);

  useFocusEffect(
    useCallback(() => {
      const allPets = petRepository.getAll();
      setPets(allPets);
      if (allPets.length === 0) return;

      const id = petId ? Number(petId) : allPets[0].id;
      const exists = allPets.find((p) => p.id === id);
      const targetId = exists ? id : allPets[0].id;
      setCurrentPetId(targetId);
      setGroups(buildGroups(targetId));
    }, [petId])
  );

  const buildGroups = (petId: number): VaccineGroup[] => {
    const records = recordRepository.getByPetIdAndType(petId, 'vaccine');
    const map = new Map<string, PetRecord[]>();
    for (const r of records) {
      const key = r.title || '未命名疫苗';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }

    const now = new Date();
    return Array.from(map.entries()).map(([title, recs]) => {
      recs.sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
      const latest = recs[0];
      const nextDueDate = new Date(latest.recorded_at);
      nextDueDate.setDate(nextDueDate.getDate() + VACCINE_INTERVAL_DAYS);
      const nextDue = `${nextDueDate.getFullYear()}-${String(nextDueDate.getMonth() + 1).padStart(2, '0')}-${String(nextDueDate.getDate()).padStart(2, '0')}`;
      const isOverdue = nextDueDate < now;

      return { title, records: recs, nextDue, isOverdue };
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>疫苗档案</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'vaccine' } })}
          style={styles.addBtn}
        >
          <MaterialCommunityIcons name="plus" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Pet tabs */}
      {pets.length > 1 && (
        <View style={styles.petTabs}>
          {pets.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.petTab, p.id === currentPetId && styles.petTabActive]}
              onPress={() => {
                setCurrentPetId(p.id);
                setGroups(buildGroups(p.id));
              }}
            >
              <Text style={[styles.petTabText, p.id === currentPetId && styles.petTabTextActive]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {groups.length === 0 ? (
          <View style={styles.center}>
            <MaterialCommunityIcons name="needle" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>暂无疫苗记录</Text>
            <Text style={styles.emptyText}>点击右上角 + 添加疫苗接种记录</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.title} style={styles.groupCard}>
              {/* Group header */}
              <View style={styles.groupHeader}>
                <View style={styles.groupHeaderLeft}>
                  <MaterialCommunityIcons name="needle" size={20} color={colors.vaccine} />
                  <Text style={styles.groupTitle}>{group.title}</Text>
                </View>
                <Text style={styles.groupCount}>{group.records.length}针</Text>
              </View>

              {/* Next due reminder */}
              <View style={[styles.reminderBar, group.isOverdue ? styles.reminderOverdue : styles.reminderNormal]}>
                <MaterialCommunityIcons
                  name={group.isOverdue ? 'alert-circle' : 'clock-outline'}
                  size={16}
                  color={group.isOverdue ? colors.error : colors.success}
                />
                <Text style={[styles.reminderText, group.isOverdue && { color: colors.error }]}>
                  {group.isOverdue ? '已超过建议接种时间' : '下次接种'}：{group.nextDue}
                  {group.isOverdue ? '' : `（还有${Math.max(0, Math.ceil((new Date(group.nextDue!).getTime() - Date.now()) / 86400000))}天）`}
                </Text>
              </View>

              {/* Timeline */}
              <View style={styles.timeline}>
                {group.records.map((r, i) => (
                  <View key={r.id} style={styles.timelineItem}>
                    <View style={styles.timelineDotRow}>
                      <View style={[styles.timelineDot, i === 0 && styles.timelineDotLatest]} />
                      {i < group.records.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineDate}>{r.recorded_at.slice(0, 10)}</Text>
                      {r.value_text ? <Text style={styles.timelineValue}>{r.value_text}</Text> : null}
                      {r.note ? <Text style={styles.timelineNote}>{r.note}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
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
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text, flex: 1 },
  addBtn: { padding: 4 },
  petTabs: {
    flexDirection: 'row', gap: 6, paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  petTab: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full,
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
  },
  petTabActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  petTabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  petTabTextActive: { color: colors.primary },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textSecondary },

  groupCard: {
    backgroundColor: colors.card, borderRadius: 18, padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 1,
  },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  groupHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  groupCount: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },

  reminderBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    marginBottom: spacing.md,
  },
  reminderNormal: { backgroundColor: '#E8F5E9' },
  reminderOverdue: { backgroundColor: '#FFEBEE' },
  reminderText: { fontSize: 13, fontWeight: '600', color: '#66BB6A' },

  timeline: {},
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineDotRow: { alignItems: 'center', width: 16 },
  timelineDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#DDD',
    marginTop: 4,
  },
  timelineDotLatest: { backgroundColor: colors.vaccine },
  timelineLine: {
    width: 2, flex: 1, backgroundColor: '#EEE', marginTop: 2,
  },
  timelineContent: { flex: 1, paddingBottom: spacing.md },
  timelineDate: { fontSize: 14, fontWeight: '700', color: colors.text },
  timelineValue: { fontSize: 13, color: colors.vaccine, fontWeight: '600', marginTop: 2 },
  timelineNote: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
