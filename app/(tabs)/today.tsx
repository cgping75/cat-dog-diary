import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { recordRepository, PetRecord } from '@/lib/recordRepository';
import { checkinRepository } from '@/lib/checkinRepository';
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
  const [isCheckedin, setIsCheckedin] = useState(false);
  const [streak, setStreak] = useState(0);

  const loadData = useCallback(() => {
    const allPets = petRepository.getAll();
    setPets(allPets);

    if (allPets.length === 0) {
      setCurrentPetId(0);
      setCurrentPet(null);
      setRecentRecords([]);
      setReminders([]);
      setIsCheckedin(false);
      setStreak(0);
      return;
    }

    const exists = allPets.find((p) => p.id === currentPetId);
    const targetId = exists ? currentPetId : allPets[0].id;
    setCurrentPetId(targetId);

    const pet = petRepository.getById(targetId);
    setCurrentPet(pet);
    setRecentRecords(recordRepository.getRecentByPetId(targetId, 3));
    setIsCheckedin(checkinRepository.isCheckedinToday(targetId));
    setStreak(checkinRepository.getStreak(targetId));

    const rems: { text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [];
    const now = new Date();
    const check = (type: string, interval: number, msg: string, icon: keyof typeof MaterialCommunityIcons.glyphMap) => {
      const recs = recordRepository.getByPetIdAndType(targetId, type as any);
      if (recs.length > 0) {
        const days = daysBetween(new Date(recs[0].recorded_at), now);
        if (days > interval) rems.push({ text: msg, icon });
      }
    };
    check('vaccine', VACCINE_INTERVAL_DAYS, '该打疫苗了', 'needle');
    check('deworm', DEWORM_INTERVAL_DAYS, '该驱虫了', 'pill');
    check('checkup', CHECKUP_INTERVAL_DAYS, '该体检了', 'stethoscope');
    check('dental', DENTAL_INTERVAL_DAYS, '该洁牙了', 'tooth-outline');
    check('bath', BATH_INTERVAL_DAYS, '该洗澡了', 'shower-head');
    check('grooming', GROOMING_INTERVAL_DAYS, '该修剪毛发了', 'content-cut');
    check('nail', NAIL_INTERVAL_DAYS, '该剪指甲了', 'hand-back-right-outline');
    setReminders(rems);
  }, [currentPetId]);

  useFocusEffect(loadData);

  const handleCheckin = () => {
    if (!currentPetId) return;
    checkinRepository.checkin(currentPetId);
    setIsCheckedin(true);
    setStreak(checkinRepository.getStreak(currentPetId));
  };

  const handleQuickCheckin = () => {
    handleCheckin();
    // Navigate to full calendar after checkin
    router.push({ pathname: '/calendar-full', params: { petId: String(currentPetId) } });
  };

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

      {/* Pet info card */}
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
              {currentPet?.weight ? ` · ${currentPet.weight}kg` : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.checkinBtn, isCheckedin && styles.checkinBtnDone]}
            onPress={handleQuickCheckin}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isCheckedin ? 'check-circle' : 'calendar-check'}
              size={20}
              color={isCheckedin ? colors.card : colors.primary}
            />
            <Text style={[styles.checkinText, isCheckedin && styles.checkinTextDone]}>
              {isCheckedin ? '已打卡' : '打卡'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Streak - clickable to calendar */}
        <TouchableOpacity
          style={styles.streakRow}
          onPress={() => router.push({ pathname: '/calendar-full', params: { petId: String(currentPetId) } })}
          activeOpacity={0.6}
        >
          <MaterialCommunityIcons name="fire" size={16} color={streak > 0 ? colors.warning : colors.textSecondary} />
          <Text style={[styles.streakText, streak === 0 && { color: colors.textSecondary }]}>
            {streak > 0 ? `连续打卡 ${streak} 天` : '点击进入日历'}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      {/* Reminders */}
      {reminders.length > 0 && (
        <Card style={styles.reminderCard}>
          <Text style={styles.sectionTitle}>提醒事项</Text>
          {reminders.map((r, i) => (
            <View key={i} style={styles.reminderRow}>
              <MaterialCommunityIcons name={r.icon} size={20} color={colors.warning} />
              <Text style={styles.reminderText}>{r.text}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Quick entries */}
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
        <QuickEntry icon="human" label="体型" color={colors.bodySize}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'body_size' } })}
          style={{ flex: 1 }} />
        <QuickEntry icon="alert-circle-outline" label="问题" color={colors.issue}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(currentPetId), recordType: 'issue' } })}
          style={{ flex: 1 }} />
        <QuickEntry icon="emoticon-happy-outline" label="情绪" color={colors.secondary}
          onPress={() => router.push({ pathname: '/mood-tracker', params: { petId: String(currentPetId) } })}
          style={{ flex: 1 }} />
        <View style={{ flex: 1 }} />
      </View>

      {/* Recent records */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>最近记录</Text>
      {recentRecords.length === 0 ? (
        <Text style={styles.emptyHint}>暂无记录，点击上方入口添加</Text>
      ) : (
        recentRecords.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={styles.recordItem}
            onPress={() => router.push({ pathname: '/add-record', params: { petId: String(r.pet_id), recordId: String(r.id) } })}
            activeOpacity={0.7}
          >
            <Text style={styles.recordTitle}>{r.title}</Text>
            <Text style={styles.recordMeta}>
              {r.value_text ? `${r.value_text} · ` : ''}{r.recorded_at.slice(0, 10)}
            </Text>
          </TouchableOpacity>
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
  checkinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1.5,
    borderColor: colors.primary, backgroundColor: colors.card,
  },
  checkinBtnDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkinText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  checkinTextDone: { color: colors.card },
  streakRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: spacing.sm, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  streakText: { fontSize: 13, fontWeight: '700', color: colors.warning, flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  reminderCard: { marginTop: spacing.md, backgroundColor: colors.reminderBg },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  reminderText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', gap: spacing.sm },
  emptyHint: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
  recordItem: {
    backgroundColor: colors.card, borderRadius: 18, padding: spacing.md, marginBottom: spacing.sm,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 1,
  },
  recordTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  recordMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md, borderRadius: borderRadius.full, marginTop: spacing.md,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  emptyBtnText: { color: colors.card, fontSize: 16, fontWeight: '700' },
});
