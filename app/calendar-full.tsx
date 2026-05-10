import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { recordRepository, PetRecord } from '@/lib/recordRepository';
import { todoRepository, TodoItem } from '@/lib/todoRepository';
import { documentRepository } from '@/lib/documentRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { formatDateStr } from '@/lib/calendarUtils';
import { daysBetween, VACCINE_INTERVAL_DAYS, DEWORM_INTERVAL_DAYS, CHECKUP_INTERVAL_DAYS, DENTAL_INTERVAL_DAYS, BATH_INTERVAL_DAYS, GROOMING_INTERVAL_DAYS, NAIL_INTERVAL_DAYS } from '@/lib/dateUtils';
import Card from '@/components/Card';
import Calendar from '@/components/Calendar';

type CalendarEvent = {
  id: string;
  type: 'record' | 'todo' | 'reminder';
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  title: string;
  detail: string;
};

const recordTypeIcons: Record<string, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; label: string }> = {
  vaccine: { icon: 'needle', color: colors.vaccine, label: '疫苗' },
  deworm: { icon: 'pill', color: colors.deworm, label: '驱虫' },
  weight: { icon: 'scale-bathroom', color: colors.weight, label: '体重' },
  issue: { icon: 'alert-circle-outline', color: colors.issue, label: '问题' },
  feeding: { icon: 'food-outline', color: colors.feeding, label: '喂食' },
  checkup: { icon: 'stethoscope', color: colors.checkup, label: '体检' },
  dental: { icon: 'tooth-outline', color: colors.dental, label: '洁牙' },
  bath: { icon: 'shower-head', color: colors.bath, label: '洗澡' },
  grooming: { icon: 'content-cut', color: colors.grooming, label: '毛发修剪' },
  nail: { icon: 'hand-back-right-outline', color: colors.nail, label: '剪指甲' },
  period: { icon: 'water', color: colors.period, label: '经期' },
  heat: { icon: 'heart-pulse', color: colors.heat, label: '发情期' },
  body_size: { icon: 'human', color: colors.bodySize, label: '体型' },
};

export default function CalendarFullScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = Number(params.petId || 0);

  const [pet, setPet] = useState<Pet | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDateStr(new Date()));
  const [markedDates, setMarkedDates] = useState<{ [d: string]: { dotColor?: string; marked?: boolean } }>({});
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [dayTodos, setDayTodos] = useState<TodoItem[]>([]);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [todoTitle, setTodoTitle] = useState('');
  const [reminders, setReminders] = useState<{ text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[]>([]);

  const buildReminders = useCallback(() => {
    const rems: { text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [];
    const now = new Date();
    const check = (type: string, interval: number, msg: string, icon: keyof typeof MaterialCommunityIcons.glyphMap) => {
      const recs = recordRepository.getByPetIdAndType(petId, type as any);
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
  }, [petId]);

  const loadCalendarData = useCallback((year: number, month: number) => {
    const recordDates = recordRepository.getRecordDatesInMonth(petId, year, month);
    const todoDates = todoRepository.getTodoDatesInMonth(petId, year, month);

    const marks: { [d: string]: { dotColor?: string; marked?: boolean } } = {};
    recordDates.forEach((d) => { marks[d] = { dotColor: colors.primary, marked: true }; });
    todoDates.forEach((_count, d) => { marks[d] = { dotColor: colors.warning, marked: true }; });

    // 标记周期提醒到期日
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const periodicChecks: { type: string; interval: number; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
      { type: 'vaccine', interval: VACCINE_INTERVAL_DAYS, icon: 'needle' },
      { type: 'deworm', interval: DEWORM_INTERVAL_DAYS, icon: 'pill' },
      { type: 'checkup', interval: CHECKUP_INTERVAL_DAYS, icon: 'stethoscope' },
      { type: 'dental', interval: DENTAL_INTERVAL_DAYS, icon: 'tooth-outline' },
      { type: 'bath', interval: BATH_INTERVAL_DAYS, icon: 'shower-head' },
      { type: 'grooming', interval: GROOMING_INTERVAL_DAYS, icon: 'content-cut' },
      { type: 'nail', interval: NAIL_INTERVAL_DAYS, icon: 'hand-back-right-outline' },
    ];
    for (const check of periodicChecks) {
      const recs = recordRepository.getByPetIdAndType(petId, check.type as any);
      if (recs.length > 0) {
        const lastDate = new Date(recs[0].recorded_at);
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + check.interval);
        const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
        if (nextStr.startsWith(prefix)) {
          marks[nextStr] = { dotColor: '#FF7043', marked: true };
        }
      }
    }

    setMarkedDates(marks);
  }, [petId]);

  const loadDayData = useCallback((dateStr: string) => {
    // Build events list
    const records = recordRepository.getByPetIdAndDate(petId, dateStr);
    const todos = todoRepository.getByDate(petId, dateStr);

    const events: CalendarEvent[] = records.map((r) => {
      const meta = recordTypeIcons[r.record_type] || { icon: 'notebook-outline' as const, color: colors.primary, label: r.record_type };
      return {
        id: `record-${r.id}`,
        type: 'record' as const,
        icon: meta.icon,
        color: meta.color,
        title: r.title,
        detail: [meta.label, r.value_text].filter(Boolean).join(' · '),
      };
    });

    // 检查该日期是否有周期提醒到期
    const periodicChecks: { type: string; label: string; interval: number; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }[] = [
      { type: 'vaccine', label: '疫苗到期', interval: VACCINE_INTERVAL_DAYS, icon: 'needle', color: colors.vaccine },
      { type: 'deworm', label: '驱虫到期', interval: DEWORM_INTERVAL_DAYS, icon: 'pill', color: colors.deworm },
      { type: 'checkup', label: '体检到期', interval: CHECKUP_INTERVAL_DAYS, icon: 'stethoscope', color: colors.checkup },
      { type: 'dental', label: '洁牙到期', interval: DENTAL_INTERVAL_DAYS, icon: 'tooth-outline', color: colors.dental },
      { type: 'bath', label: '洗澡到期', interval: BATH_INTERVAL_DAYS, icon: 'shower-head', color: colors.bath },
      { type: 'grooming', label: '毛发修剪到期', interval: GROOMING_INTERVAL_DAYS, icon: 'content-cut', color: colors.grooming },
      { type: 'nail', label: '剪指甲到期', interval: NAIL_INTERVAL_DAYS, icon: 'hand-back-right-outline', color: colors.nail },
    ];
    for (const check of periodicChecks) {
      const recs = recordRepository.getByPetIdAndType(petId, check.type as any);
      if (recs.length > 0) {
        const lastDate = new Date(recs[0].recorded_at);
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + check.interval);
        const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
        if (nextStr === dateStr) {
          events.push({
            id: `reminder-${check.type}`,
            type: 'reminder',
            icon: check.icon,
            color: '#FF7043',
            title: check.label,
            detail: `上次：${recs[0].recorded_at.slice(0, 10)}`,
          });
        }
      }
    }

    setDayEvents(events);
    setDayTodos(todos);
  }, [petId]);

  const loadAll = useCallback(() => {
    if (!petId) return;
    const p = petRepository.getById(petId);
    setPet(p);
    loadCalendarData(calYear, calMonth);
    loadDayData(selectedDate);
    buildReminders();
  }, [petId, calYear, calMonth, selectedDate, loadCalendarData, loadDayData, buildReminders]);

  useFocusEffect(loadAll);

  const handleDayPress = (dateStr: string) => {
    setSelectedDate(dateStr);
    loadDayData(dateStr);
  };

  const handleMonthChange = (year: number, month: number) => {
    setCalYear(year);
    setCalMonth(month);
    loadCalendarData(year, month);
  };

  const handleAddTodo = () => {
    if (!todoTitle.trim()) return;
    todoRepository.save(petId, { title: todoTitle.trim(), dueDate: selectedDate });
    setTodoTitle('');
    setShowAddTodo(false);
    loadDayData(selectedDate);
    loadCalendarData(calYear, calMonth);
  };

  const handleToggleTodo = (id: number) => {
    todoRepository.toggleDone(id);
    loadDayData(selectedDate);
    loadCalendarData(calYear, calMonth);
  };

  const handleDeleteTodo = (id: number) => {
    Alert.alert('删除待办', '确定删除？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        todoRepository.delete(id);
        loadDayData(selectedDate);
        loadCalendarData(calYear, calMonth);
      }},
    ]);
  };

  const isToday = selectedDate === formatDateStr(new Date());

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pet?.name}的日历</Text>
      </View>

      {/* Calendar */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        selectedDate={selectedDate}
        onMonthChange={handleMonthChange}
      />

      {/* Reminders */}
      {reminders.length > 0 && (
        <Card style={styles.reminderCard}>
          <Text style={styles.sectionLabel}>提醒事项</Text>
          {reminders.map((r, i) => (
            <View key={i} style={styles.reminderRow}>
              <MaterialCommunityIcons name={r.icon} size={18} color={colors.warning} />
              <Text style={styles.reminderText}>{r.text}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Selected date detail */}
      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.sectionLabel}>
          {isToday ? '今日事件' : `${selectedDate} 事件`}
        </Text>

        {/* Events */}
        {dayEvents.length > 0 && (
          <View style={styles.daySection}>
            <Text style={styles.daySectionTitle}>记录</Text>
            {dayEvents.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={styles.eventRow}
                onPress={() => {
                  if (e.type === 'record') {
                    const recordId = e.id.replace('record-', '');
                    router.push({ pathname: '/add-record', params: { petId: String(petId), recordId } });
                  } else if (e.type === 'reminder') {
                    const recordType = e.id.replace('reminder-', '');
                    router.push({ pathname: '/add-record', params: { petId: String(petId), recordType } });
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.eventIconBg, { backgroundColor: e.color + '18' }]}>
                  <MaterialCommunityIcons name={e.icon} size={16} color={e.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{e.title}</Text>
                  <Text style={styles.eventDetail}>{e.detail}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Todos */}
        <View style={styles.daySection}>
          <View style={styles.todoHeader}>
            <Text style={styles.daySectionTitle}>待办事项</Text>
            <TouchableOpacity onPress={() => setShowAddTodo(!showAddTodo)}>
              <MaterialCommunityIcons name={showAddTodo ? 'close' : 'plus'} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {showAddTodo && (
            <View style={styles.addTodoRow}>
              <TextInput
                style={styles.todoInput}
                value={todoTitle}
                onChangeText={setTodoTitle}
                placeholder="添加待办事项..."
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity style={styles.todoAddBtn} onPress={handleAddTodo}>
                <MaterialCommunityIcons name="check" size={18} color={colors.card} />
              </TouchableOpacity>
            </View>
          )}
          {dayTodos.length === 0 && !showAddTodo ? (
            <Text style={styles.emptyHint}>暂无待办</Text>
          ) : (
            dayTodos.map((t) => (
              <TouchableOpacity key={t.id} style={styles.todoRow} onPress={() => handleToggleTodo(t.id)} onLongPress={() => handleDeleteTodo(t.id)}>
                <MaterialCommunityIcons
                  name={t.is_done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                  size={20}
                  color={t.is_done ? colors.success : colors.primary}
                />
                <Text style={[styles.todoTitle, t.is_done ? styles.todoDone : null]}>{t.title}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {dayEvents.length === 0 && dayTodos.length === 0 && !showAddTodo && (
          <Text style={styles.emptyHint}>{isToday ? '今天暂无事件' : '该日暂无事件'}</Text>
        )}
      </Card>

      {/* Bottom action */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => setShowAddTodo(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="playlist-plus" size={20} color={colors.card} />
        <Text style={styles.actionBtnText}>添加待办</Text>
      </TouchableOpacity>
    </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  backBtn: { padding: spacing.xs },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.text },
  sectionLabel: { fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: spacing.sm },
  reminderCard: { marginTop: spacing.md, backgroundColor: colors.reminderBg },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  reminderText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  daySection: { marginTop: spacing.sm },
  daySectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.xs },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  eventIconBg: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  eventTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  eventDetail: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  todoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  addTodoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  todoInput: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: 14, color: colors.text, backgroundColor: colors.background,
  },
  todoAddBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  todoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  todoTitle: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 },
  todoDone: { textDecorationLine: 'line-through', color: colors.textSecondary },
  emptyHint: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.sm },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.secondary, borderRadius: borderRadius.lg,
    paddingVertical: spacing.md, marginTop: spacing.lg,
    shadowColor: '#A78BFA', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  actionBtnText: { color: colors.card, fontSize: 15, fontWeight: '700' },
});
