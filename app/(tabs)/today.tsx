import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { recordRepository, PetRecord } from '@/lib/recordRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { daysBetween, VACCINE_INTERVAL_DAYS, DEWORM_INTERVAL_DAYS, CHECKUP_INTERVAL_DAYS, DENTAL_INTERVAL_DAYS, BATH_INTERVAL_DAYS, GROOMING_INTERVAL_DAYS, NAIL_INTERVAL_DAYS } from '@/lib/dateUtils';
import Card from '@/components/Card';
import PetSwitcher from '@/components/PetSwitcher';
import QuickEntry from '@/components/QuickEntry';
import EmptyState from '@/components/EmptyState';

export default function TodayScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPetId, setCurrentPetId] = useState<number>(0);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [recentRecords, setRecentRecords] = useState<PetRecord[]>([]);
  const [reminders, setReminders] = useState<{ text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[]>([]);

  const loadData = useCallback(() => {
    const allPets = petRepository.getAll();
    setPets(allPets);

    if (allPets.length === 0) {
      setCurrentPetId(0);
      setCurrentPet(null);
      setRecentRecords([]);
      setReminders([]);
      return;
    }

    const exists = allPets.find((p) => p.id === currentPetId);
    const targetId = exists ? currentPetId : allPets[0].id;
    setCurrentPetId(targetId);

    const pet = petRepository.getById(targetId);
    setCurrentPet(pet);
    setRecentRecords(recordRepository.getRecentByPetId(targetId, 3));

    const rems: { text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [];
    const now = new Date();
    const vaccines = recordRepository.getByPetIdAndType(targetId, 'vaccine');
    if (vaccines.length > 0) {
      const days = daysBetween(new Date(vaccines[0].recorded_at), now);
      if (days > VACCINE_INTERVAL_DAYS) rems.push({ text: '该打疫苗了', icon: 'needle' });
    }
    const deworms = recordRepository.getByPetIdAndType(targetId, 'deworm');
    if (deworms.length > 0) {
      const days = daysBetween(new Date(deworms[0].recorded_at), now);
      if (days > DEWORM_INTERVAL_DAYS) rems.push({ text: '该驱虫了', icon: 'pill' });
    }
    const checkups = recordRepository.getByPetIdAndType(targetId, 'checkup');
    if (checkups.length > 0) {
      const days = daysBetween(new Date(checkups[0].recorded_at), now);
      if (days > CHECKUP_INTERVAL_DAYS) rems.push({ text: '该体检了', icon: 'stethoscope' });
    }
    const dentals = recordRepository.getByPetIdAndType(targetId, 'dental');
    if (dentals.length > 0) {
      const days = daysBetween(new Date(dentals[0].recorded_at), now);
      if (days > DENTAL_INTERVAL_DAYS) rems.push({ text: '该洁牙了', icon: 'tooth-outline' });
    }
    const baths = recordRepository.getByPetIdAndType(targetId, 'bath');
    if (baths.length > 0) {
      const days = daysBetween(new Date(baths[0].recorded_at), now);
      if (days > BATH_INTERVAL_DAYS) rems.push({ text: '该洗澡了', icon: 'shower-head' });
    }
    const groomings = recordRepository.getByPetIdAndType(targetId, 'grooming');
    if (groomings.length > 0) {
      const days = daysBetween(new Date(groomings[0].recorded_at), now);
      if (days > GROOMING_INTERVAL_DAYS) rems.push({ text: '该修剪毛发了', icon: 'content-cut' });
    }
    const nails = recordRepository.getByPetIdAndType(targetId, 'nail');
    if (nails.length > 0) {
      const days = daysBetween(new Date(nails[0].recorded_at), now);
      if (days > NAIL_INTERVAL_DAYS) rems.push({ text: '该剪指甲了', icon: 'hand-back-right-outline' });
    }
    setReminders(rems);
  }, [currentPetId]);

  useFocusEffect(loadData);

  if (pets.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <EmptyState icon="paw-outline" title="还没有添加宠物" subtitle="快来给你的小可爱建个档案吧" />
        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/add-pet')} activeOpacity={0.8}>
          <Text style={styles.emptyBtnText}>添加宠物</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const genderLabel = currentPet?.gender === 'male' ? '♂ 公' : currentPet?.gender === 'female' ? '♀ 母' : '';
  const neuteredLabel = currentPet?.is_neutered === 'yes' ? '已绝育' : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PetSwitcher pets={pets} selectedId={currentPetId} onSelect={setCurrentPetId} />

      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={[styles.petAvatar, { backgroundColor: colors.primaryLight }]}>
            <MaterialCommunityIcons
              name={currentPet?.pet_type === 'cat' ? 'cat' : 'dog'}
              size={32}
              color={colors.primary}
            />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.petName}>{currentPet?.name}</Text>
            <Text style={styles.petMeta}>
              {currentPet?.breed || (currentPet?.pet_type === 'cat' ? '猫' : '狗')}
              {genderLabel ? ` · ${genderLabel}` : ''}
              {currentPet?.age_text ? ` · ${currentPet.age_text}` : ''}
              {neuteredLabel ? ` · ${neuteredLabel}` : ''}
            </Text>
          </View>
        </View>
      </Card>

      {reminders.length > 0 && (
        <Card style={styles.reminderCard}>
          <Text style={styles.sectionTitle}>今日提醒</Text>
          {reminders.map((r, i) => (
            <View key={i} style={styles.reminderRow}>
              <MaterialCommunityIcons name={r.icon} size={20} color={colors.warning} />
              <Text style={styles.reminderText}>{r.text}</Text>
            </View>
          ))}
        </Card>
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>快捷入口</Text>
      <View style={styles.quickGrid}>
        <QuickEntry icon="needle" label="疫苗" color={colors.vaccine}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'vaccine' } })}
          style={{ flex: 1 }} />
        <QuickEntry icon="pill" label="驱虫" color={colors.deworm}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'deworm' } })}
          style={{ flex: 1 }} />
        <QuickEntry icon="scale-bathroom" label="体重" color={colors.weight}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'weight' } })}
          style={{ flex: 1 }} />
        <QuickEntry icon="shower-head" label="洗澡" color={colors.bath}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'bath' } })}
          style={{ flex: 1 }} />
      </View>
      <View style={[styles.quickGrid, { marginTop: spacing.sm }]}>
        <QuickEntry icon="content-cut" label="毛发修剪" color={colors.grooming}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'grooming' } })}
          style={{ flex: 1 }} />
        <QuickEntry icon="hand-back-right-outline" label="剪指甲" color={colors.nail}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'nail' } })}
          style={{ flex: 1 }} />
        <QuickEntry icon="water" label="经期" color={colors.period}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'period' } })}
          style={{ flex: 1 }} />
        <QuickEntry icon="heart-pulse" label="发情期" color={colors.heat}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'heat' } })}
          style={{ flex: 1 }} />
      </View>
      <View style={[styles.quickGrid, { marginTop: spacing.sm }]}>
        <QuickEntry icon="alert-circle-outline" label="问题" color={colors.issue}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'issue' } })}
          style={{ flex: 1 }} />
        <QuickEntry icon="emoticon-happy-outline" label="情绪" color={colors.secondary}
          onPress={() => router.push({ pathname: '/mood-tracker', params: { petId: String(currentPetId) } })}
          style={{ flex: 1 }} />
        <View style={{ flex: 1 }} />
        <View style={{ flex: 1 }} />
      </View>

      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>最近记录</Text>
      {recentRecords.length === 0 ? (
        <Text style={styles.emptyHint}>暂无记录，点击上方入口添加</Text>
      ) : (
        recentRecords.map((r) => (
          <Card key={r.id} style={styles.recordItem}>
            <Text style={styles.recordTitle}>{r.title}</Text>
            <Text style={styles.recordMeta}>
              {r.value_text ? `${r.value_text} · ` : ''}{r.recorded_at.slice(0, 10)}
            </Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  infoCard: { marginTop: spacing.sm },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  petAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
  infoText: { flex: 1 },
  petName: { fontSize: 20, fontWeight: '800', color: colors.text },
  petMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  reminderCard: { marginTop: spacing.md, backgroundColor: colors.reminderBg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  reminderText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', gap: spacing.sm },
  emptyHint: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
  recordItem: { marginBottom: spacing.sm, padding: spacing.md },
  recordTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  recordMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    shadowColor: '#FF7EB3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyBtnText: { color: colors.card, fontSize: 16, fontWeight: '700' },
});
