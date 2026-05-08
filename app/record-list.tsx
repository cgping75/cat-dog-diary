import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { recordRepository, PetRecord, RecordType } from '@/lib/recordRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import PetSwitcher from '@/components/PetSwitcher';
import RecordCard from '@/components/RecordCard';
import EmptyState from '@/components/EmptyState';

type FilterKey = RecordType | 'all';

const filters: { key: string; label: string }[] = [
  { key: 'all' as const, label: '全部' },
  { key: 'vaccine' as const, label: '疫苗' },
  { key: 'deworm' as const, label: '驱虫' },
  { key: 'weight' as const, label: '体重' },
  { key: 'issue' as const, label: '问题' },
  { key: 'feeding' as const, label: '喂食' },
  { key: 'checkup' as const, label: '体检' },
  { key: 'dental' as const, label: '洁牙' },
  { key: 'bath' as const, label: '洗澡' },
  { key: 'grooming' as const, label: '毛发修剪' },
  { key: 'nail' as const, label: '剪指甲' },
  { key: 'period' as const, label: '经期' },
  { key: 'heat' as const, label: '发情期' },
  { key: 'body_size' as const, label: '体型' },
] satisfies { key: FilterKey; label: string }[];

function fetchRecords(petId: number, filter: FilterKey): PetRecord[] {
  if (!petId) return [];
  return filter === 'all'
    ? recordRepository.getByPetId(petId)
    : recordRepository.getByPetIdAndType(petId, filter as RecordType);
}

export default function RecordListScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPetId, setCurrentPetId] = useState<number>(params.petId ? Number(params.petId) : 0);
  const [records, setRecords] = useState<PetRecord[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');

  const loadData = useCallback(() => {
    const allPets = petRepository.getAll();
    setPets(allPets);
    if (allPets.length > 0) {
      const exists = allPets.find((p) => p.id === currentPetId);
      const targetId = exists ? currentPetId : allPets[0].id;
      setCurrentPetId(targetId);
      setRecords(fetchRecords(targetId, filter));
    } else {
      setCurrentPetId(0);
      setRecords([]);
    }
  }, [currentPetId, filter]);

  useFocusEffect(loadData);

  const handlePetSelect = (id: number) => {
    setCurrentPetId(id);
    setRecords(fetchRecords(id, filter));
  };

  const handleFilterChange = (key: FilterKey) => {
    setFilter(key);
    setRecords(fetchRecords(currentPetId, key));
  };

  const handleDelete = (id: number) => {
    recordRepository.delete(id);
    setRecords(fetchRecords(currentPetId, filter));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>记录列表</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <RecordCard
            record={item}
            onDelete={handleDelete}
            onPress={(r) => router.push({ pathname: '/add-record', params: { petId: String(r.pet_id), recordId: String(r.id) } })}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <PetSwitcher pets={pets} selectedId={currentPetId} onSelect={handlePetSelect} />
            <View style={styles.filterRow}>
              {filters.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
                  onPress={() => handleFilterChange(f.key as FilterKey)}
                >
                  <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="notebook-outline" title="还没有记录" subtitle="点击右下角按钮添加第一条记录" />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />

      {currentPetId > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId) } })}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color={colors.card} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  list: { padding: spacing.lg, paddingBottom: 100 },
  filterRow: { flexDirection: 'row', marginBottom: spacing.lg, flexWrap: 'wrap', justifyContent: 'flex-start' },
  filterBtn: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, marginRight: spacing.sm, marginBottom: spacing.sm },
  filterBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.primary },
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
