import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { recordRepository, PetRecord } from '@/lib/recordRepository';
import { moodRepository } from '@/lib/moodRepository';
import { checkinRepository } from '@/lib/checkinRepository';
import { todoRepository, TodoItem } from '@/lib/todoRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { formatDateStr } from '@/lib/calendarUtils';
import { daysBetween, VACCINE_INTERVAL_DAYS, DEWORM_INTERVAL_DAYS, CHECKUP_INTERVAL_DAYS, DENTAL_INTERVAL_DAYS, BATH_INTERVAL_DAYS, GROOMING_INTERVAL_DAYS, NAIL_INTERVAL_DAYS } from '@/lib/dateUtils';
import Card from '@/components/Card';
import Calendar from '@/components/Calendar';

export default function CalendarFullScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = Number(params.petId || 0);

  const [pet, setPet] = useState<Pet | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDateStr(new Date()));
  const [markedDates, setMarkedDates] = useState<{ [d: string]: { dotColor?: string; marked?: boolean } }>({});
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [dayRecords, setDayRecords] = useState<PetRecord[]>([]);
  const [dayTodos, setDayTodos] = useState<TodoItem[]>([]);
  const [upcomingTodos, setUpcomingTodos] = useState<TodoItem[]>([]);
  const [overdueTodos, setOverdueTodos] = useState<TodoItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [todoTitle, setTodoTitle] = useState('');
  const [reminders, setReminders] = useState<{ text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[]>([]);

  const loadAll = useCallback(() => {
    if (!petId) return;
    const p = petRepository.getById(petId);
    setPet(p);
    setStreak(checkinRepository.getStreak(petId));
    loadCalendarData(calYear, calMonth);
    loadDayData(selectedDate);
    loadTodos();
    buildReminders();
  }, [petId, calYear, calMonth, selectedDate]);

  const buildReminders = () => {
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
  };

  const loadCalendarData = useCallback((year: number, month: number) => {
    const recordDates = recordRepository.getRecordDatesInMonth(petId, year, month);
    const moodDates = moodRepository.getMoodDatesInMonth(petId, year, month);
    const todoDates = todoRepository.getTodoDatesInMonth(petId, year, month);

    const marks: { [d: string]: { dotColor?: string; marked?: boolean } } = {};
    recordDates.forEach((d) => { marks[d] = { dotColor: colors.primary, marked: true }; });
    moodDates.forEach((d) => { marks[d] = { dotColor: colors.secondary, marked: true }; });
    todoDates.forEach((_, d) => { marks[d] = { dotColor: colors.warning, marked: true }; });
    setMarkedDates(marks);
  }, [petId]);

  const loadDayData = useCallback((dateStr: string) => {
    setDayRecords(recordRepository.getByPetIdAndDate(petId, dateStr));
    setDayTodos(todoRepository.getByDate(petId, dateStr));
  }, [petId]);

  const loadTodos = useCallback(() => {
    setUpcomingTodos(todoRepository.getUpcoming(petId, 5));
    setOverdueTodos(todoRepository.getOverdue(petId));
  }, [petId]);

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

  const handleCheckin = () => {
    // Navigate back to today for checkin (checkin is now item-based in today page)
    router.back();
  };

  const handleAddTodo = () => {
    if (!todoTitle.trim()) return;
    todoRepository.save(petId, { title: todoTitle.trim(), dueDate: selectedDate });
    setTodoTitle('');
    setShowAddTodo(false);
    loadDayData(selectedDate);
    loadTodos();
    loadCalendarData(calYear, calMonth);
  };

  const handleToggleTodo = (id: number) => {
    todoRepository.toggleDone(id);
    loadDayData(selectedDate);
    loadTodos();
    loadCalendarData(calYear, calMonth);
  };

  const handleDeleteTodo = (id: number) => {
    Alert.alert('删除待办', '确定删除？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        todoRepository.delete(id);
        loadDayData(selectedDate);
        loadTodos();
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
        <TouchableOpacity
          style={styles.checkinBtn}
          onPress={handleCheckin}
        >
          <MaterialCommunityIcons name="calendar-check" size={18} color={colors.primary} />
          <Text style={styles.checkinText}>去打卡</Text>
        </TouchableOpacity>
      </View>

      {streak > 0 && (
        <View style={styles.streakBar}>
          <MaterialCommunityIcons name="fire" size={20} color={colors.warning} />
          <Text style={styles.streakText}>连续打卡 {streak} 天</Text>
        </View>
      )}

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

      {/* Overdue + Upcoming Todos */}
      {overdueTodos.length > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionLabel}>已过期待办</Text>
          {overdueTodos.map((t) => (
            <TouchableOpacity key={t.id} style={styles.todoRow} onPress={() => handleToggleTodo(t.id)} onLongPress={() => handleDeleteTodo(t.id)}>
              <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={20} color={colors.error} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.todoTitle, { color: colors.error }]}>{t.title}</Text>
                <Text style={styles.todoDate}>{t.due_date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* Selected date detail */}
      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.sectionLabel}>
          {isToday ? '今日详情' : `${selectedDate} 详情`}
        </Text>

        {/* Day records */}
        {dayRecords.length > 0 && (
          <View style={styles.daySection}>
            <Text style={styles.daySectionTitle}>记录</Text>
            {dayRecords.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.recordRow}
                onPress={() => router.push({ pathname: '/add-record', params: { petId: String(r.pet_id), recordId: String(r.id) } })}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="circle-small" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recordTitle}>{r.title}</Text>
                  <Text style={styles.recordMeta}>{r.value_text ? `${r.value_text} · ` : ''}{r.record_type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Day todos */}
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

        {dayRecords.length === 0 && dayTodos.length === 0 && !showAddTodo && (
          <Text style={styles.emptyHint}>{isToday ? '今天暂无记录和待办' : '该日暂无记录和待办'}</Text>
        )}
      </Card>

      {/* Upcoming todos */}
      {upcomingTodos.length > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionLabel}>近期计划</Text>
          {upcomingTodos.map((t) => (
            <TouchableOpacity key={t.id} style={styles.todoRow} onPress={() => handleToggleTodo(t.id)} onLongPress={() => handleDeleteTodo(t.id)}>
              <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.todoTitle}>{t.title}</Text>
                <Text style={styles.todoDate}>{t.due_date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* Bottom action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push({ pathname: '/add-record', params: { petId: String(petId), recordType: 'body_size' } })}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="human" size={20} color={colors.card} />
          <Text style={styles.actionBtnText}>记录体型</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
          onPress={() => setShowAddTodo(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="playlist-plus" size={20} color={colors.card} />
          <Text style={styles.actionBtnText}>添加待办</Text>
        </TouchableOpacity>
      </View>
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
  checkinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1.5,
    borderColor: colors.primary, backgroundColor: colors.card,
  },
  checkinText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  streakBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.warning + '15', borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  streakText: { fontSize: 14, fontWeight: '700', color: colors.warning },
  sectionLabel: { fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: spacing.sm },
  reminderCard: { marginTop: spacing.md, backgroundColor: colors.reminderBg },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  reminderText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  daySection: { marginTop: spacing.sm },
  daySectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.xs },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  recordTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  recordMeta: { fontSize: 11, color: colors.textSecondary },
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
  todoDate: { fontSize: 11, color: colors.textSecondary },
  emptyHint: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  actionBtnText: { color: colors.card, fontSize: 15, fontWeight: '700' },
});
