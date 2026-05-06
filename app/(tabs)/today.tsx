import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { recordRepository, PetRecord } from '@/lib/recordRepository';
import { checkinRepository, CheckinItemWithStatus } from '@/lib/checkinRepository';
import { todoRepository, TodoItem } from '@/lib/todoRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { daysBetween, VACCINE_INTERVAL_DAYS, DEWORM_INTERVAL_DAYS, CHECKUP_INTERVAL_DAYS, DENTAL_INTERVAL_DAYS, BATH_INTERVAL_DAYS, GROOMING_INTERVAL_DAYS, NAIL_INTERVAL_DAYS } from '@/lib/dateUtils';
import { formatDateStr } from '@/lib/calendarUtils';
import { estimateWeather, getInteractionSuggestion, getCityName, fetchWeatherForCity } from '@/lib/interactionData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '@/components/Card';
import CalendarWindowCard from '@/components/CalendarWindowCard';
import QuickEntry from '@/components/QuickEntry';
import EmptyState from '@/components/EmptyState';

export default function TodayScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPetId, setCurrentPetId] = useState<number>(0);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [recentRecords, setRecentRecords] = useState<PetRecord[]>([]);
  const [reminders, setReminders] = useState<{ text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; lastDate: string; daysOver: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [checkinItems, setCheckinItems] = useState<CheckinItemWithStatus[]>([]);
  const [todayTodos, setTodayTodos] = useState<TodoItem[]>([]);
  const [nextTodo, setNextTodo] = useState<TodoItem | null>(null);
  const [calendarBgUri, setCalendarBgUri] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [realWeather, setRealWeather] = useState<{ label: string; icon: string; temp: string } | null>(null);

  const loadData = useCallback(() => {
    const allPets = petRepository.getAll();
    setPets(allPets);

    if (allPets.length === 0) {
      setCurrentPetId(0);
      setCurrentPet(null);
      setRecentRecords([]);
      setReminders([]);
      setStreak(0);
      setCheckinItems([]);
      setTodayTodos([]);
      setNextTodo(null);
      return;
    }

    const exists = allPets.find((p) => p.id === currentPetId);
    const targetId = exists ? currentPetId : allPets[0].id;
    setCurrentPetId(targetId);

    const pet = petRepository.getById(targetId);
    setCurrentPet(pet);
    setRecentRecords(recordRepository.getRecentByPetId(targetId, 3));
    setStreak(checkinRepository.getStreak(targetId));
    setCheckinItems(checkinRepository.getItemsWithStatus(targetId));

    const today = formatDateStr(new Date());
    setTodayTodos(todoRepository.getByDate(targetId, today));
    const upcoming = todoRepository.getUpcoming(targetId, 5);
    const nextUpcoming = upcoming.find((t) => t.due_date > today) || null;
    setNextTodo(nextUpcoming);

    const rems: { text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; lastDate: string; daysOver: number }[] = [];
    const now = new Date();
    const check = (type: string, interval: number, msg: string, icon: keyof typeof MaterialCommunityIcons.glyphMap) => {
      const recs = recordRepository.getByPetIdAndType(targetId, type as any);
      if (recs.length > 0) {
        const days = daysBetween(new Date(recs[0].recorded_at), now);
        if (days > interval) rems.push({ text: msg, icon, lastDate: recs[0].recorded_at.slice(0, 10), daysOver: days - interval });
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

    AsyncStorage.getItem('calendar_bg_uri').then((uri) => {
      if (uri) setCalendarBgUri(uri);
    });
    getCityName().then((c) => {
      setCity(c);
      if (c) {
        fetchWeatherForCity(c).then((w) => {
          if (w) setRealWeather({ label: w.label, icon: w.icon, temp: w.temp });
        });
      }
    });
  }, [currentPetId]);

  useFocusEffect(loadData);

  const handleToggleCheckin = (itemId: number) => {
    checkinRepository.toggleCheckin(currentPetId, itemId);
    setCheckinItems(checkinRepository.getItemsWithStatus(currentPetId));
    setStreak(checkinRepository.getStreak(currentPetId));
  };

  const handlePetSelect = (id: number) => {
    setCurrentPetId(id);
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

  const defaultWeather = estimateWeather();
  const weather = realWeather || defaultWeather;
  const suggestion = getInteractionSuggestion(currentPet);

  return (
    <View style={styles.container}>
      {/* Custom header with pet switcher */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>今日</Text>
        {pets.length > 1 && (
          <View style={styles.petTabs}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[styles.petTab, pet.id === currentPetId && styles.petTabActive]}
                onPress={() => handlePetSelect(pet.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.petTabText, pet.id === currentPetId && styles.petTabTextActive]} numberOfLines={1}>
                  {pet.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Calendar Window Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push({ pathname: '/calendar-full', params: { petId: String(currentPetId) } })}
        >
          <CalendarWindowCard
            pet={currentPet}
            streak={streak}
            checkinItems={checkinItems}
            todayTodos={todayTodos}
            nextTodo={nextTodo}
            weatherLabel={weather.label}
            weatherIcon={weather.icon}
            weatherTemp={weather.temp}
            weatherCity={city}
            suggestionTitle={suggestion.title}
            suggestionContent={suggestion.content}
            suggestionIcon={suggestion.icon}
            customBgUri={calendarBgUri}
            onToggleCheckin={handleToggleCheckin}
          />
        </TouchableOpacity>

        {/* Reminders */}
        {reminders.length > 0 && (
          <Card style={styles.reminderCard}>
            <Text style={styles.sectionTitle}>提醒事项</Text>
            {reminders.map((r, i) => (
              <View key={i} style={styles.reminderRow}>
                <MaterialCommunityIcons name={r.icon} size={20} color={colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderText}>{r.text}</Text>
                  <Text style={styles.reminderDate}>上次：{r.lastDate} · 已超{r.daysOver}天</Text>
                </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.background,
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  petTabs: { flexDirection: 'row', gap: 6, flex: 1 },
  petTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  petTabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  petTabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, maxWidth: 60, textAlign: 'center' },
  petTabTextActive: { color: colors.primary },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  reminderCard: { marginTop: spacing.md, backgroundColor: colors.reminderBg },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  reminderText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  reminderDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
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
