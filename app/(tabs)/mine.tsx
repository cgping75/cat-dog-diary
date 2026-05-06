import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { recordRepository } from '@/lib/recordRepository';
import { quizRepository } from '@/lib/quizRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';

export default function MineScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasPassed, setHasPassed] = useState(false);

  const loadData = useCallback(() => {
    const allPets = petRepository.getAll();
    setPets(allPets);
    let count = 0;
    allPets.forEach((p) => { count += recordRepository.getCountByPetId(p.id); });
    setTotalRecords(count);
    setHasPassed(quizRepository.hasPassed());
  }, []);

  useFocusEffect(loadData);

  const handleDelete = (pet: Pet) => {
    Alert.alert('删除宠物', `确定要删除「${pet.name}」吗？\n该宠物的所有记录也会被删除。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => { petRepository.delete(pet.id); loadData(); } },
    ]);
  };

  const renderPet = ({ item }: { item: Pet }) => (
    <Card style={styles.petCard}>
      <View style={styles.petRow}>
        {item.photo_uri ? (
          <Image source={{ uri: item.photo_uri }} style={styles.petPhoto} />
        ) : (
          <View style={[styles.petIcon, { backgroundColor: colors.primaryLight }]}>
            <MaterialCommunityIcons name={item.pet_type === 'cat' ? 'cat' : 'dog'} size={24} color={colors.primary} />
          </View>
        )}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petMeta}>
            {item.breed || (item.pet_type === 'cat' ? '猫' : '狗')}
            {item.gender === 'male' ? ' · 公' : item.gender === 'female' ? ' · 母' : ''}
            {item.age_text ? ` · ${item.age_text}` : ''}
            {item.weight ? ` · ${item.weight}kg` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/add-pet', params: { petId: String(item.id) } })} style={styles.editBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.petDetails}>
        {item.personality ? <Text style={styles.petDetailText}>性格：{item.personality}</Text> : null}
        {item.allergies ? <Text style={styles.petDetailText}>过敏：{item.allergies}</Text> : null}
        {item.special_needs ? <Text style={styles.petDetailText}>特殊需求：{item.special_needs}</Text> : null}
        <TouchableOpacity
          style={styles.dietBtn}
          onPress={() => router.push({ pathname: '/diet-guide', params: { petType: item.pet_type, petName: item.name } })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="food-apple-outline" size={16} color={colors.primary} />
          <Text style={styles.dietBtnText}>饮食指南</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={pets}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderPet}
      ListHeaderComponent={
        <>
          <View style={styles.headerArea}>
            <Text style={styles.title}>我的宠物</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-pet')} activeOpacity={0.7}>
              <MaterialCommunityIcons name="plus" size={20} color={colors.card} />
              <Text style={styles.addBtnText}>添加宠物</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{pets.length}</Text>
              <Text style={styles.statLabel}>宠物</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{totalRecords}</Text>
              <Text style={styles.statLabel}>记录</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNumber, { color: hasPassed ? colors.success : colors.textSecondary }]}>
                {hasPassed ? '已通过' : '未完成'}
              </Text>
              <Text style={styles.statLabel}>考核</Text>
            </Card>
          </View>

          {/* Calendar settings entry */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/calendar-settings')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIcon, { backgroundColor: colors.secondaryLight }]}>
              <MaterialCommunityIcons name="calendar-month" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.settingsText}>日历设置</Text>
            <Text style={styles.settingsHint}>更换底图 · 管理打卡项</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {pets.length === 0 && (
            <EmptyState icon="paw-outline" title="还没有添加宠物" subtitle="点击上方按钮添加第一只宠物吧" />
          )}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  addBtnText: { color: colors.card, fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statNumber: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  petCard: { marginBottom: spacing.sm },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  petIcon: { width: 48, height: 48, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center' },
  petPhoto: { width: 48, height: 48, borderRadius: borderRadius.full },
  petInfo: { flex: 1 },
  petName: { fontSize: 16, fontWeight: '700', color: colors.text },
  petMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  editBtn: { padding: spacing.sm },
  deleteBtn: { padding: spacing.sm },
  petDetails: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  petDetailText: { fontSize: 12, color: colors.textSecondary },
  dietBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  dietBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  settingsHint: { fontSize: 12, color: colors.textSecondary },
});
