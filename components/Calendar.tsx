import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getMonthDays, getMonthLabel, getWeekDays } from '@/lib/calendarUtils';
import { colors, borderRadius, spacing } from '@/lib/theme';

type MarkedDates = {
  [dateString: string]: { dotColor?: string; marked?: boolean };
};

type CalendarProps = {
  onDayPress?: (dateString: string) => void;
  markedDates?: MarkedDates;
  selectedDate?: string;
  onMonthChange?: (year: number, month: number) => void;
};

export default function Calendar({ onDayPress, markedDates = {}, selectedDate, onMonthChange }: CalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const weekDays = getWeekDays();

  const setYM = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    onMonthChange?.(y, m);
  };

  const goPrev = () => {
    if (month === 0) setYM(year - 1, 11);
    else setYM(year, month - 1);
  };

  const goNext = () => {
    if (month === 11) setYM(year + 1, 0);
    else setYM(year, month + 1);
  };

  const goToday = () => {
    setYM(now.getFullYear(), now.getMonth());
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrev} style={styles.navBtn}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToday}>
          <Text style={styles.monthLabel}>{getMonthLabel(year, month)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} style={styles.navBtn}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Week day labels */}
      <View style={styles.weekRow}>
        {weekDays.map((wd, i) => (
          <Text key={i} style={[styles.weekDay, (i === 0 || i === 6) && styles.weekDayWeekend]}>{wd}</Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.dayGrid}>
        {days.map((d, i) => {
          const mark = markedDates[d.dateString];
          const isSelected = selectedDate === d.dateString;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayCell,
                d.isToday && styles.dayCellToday,
                isSelected && styles.dayCellSelected,
                !d.isCurrentMonth && styles.dayCellOther,
              ]}
              onPress={() => onDayPress?.(d.dateString)}
              activeOpacity={0.6}
            >
              <Text style={[
                styles.dayText,
                d.isToday && styles.dayTextToday,
                isSelected && styles.dayTextSelected,
                !d.isCurrentMonth && styles.dayTextOther,
              ]}>
                {d.day}
              </Text>
              {mark?.marked && (
                <View style={[styles.dot, { backgroundColor: mark.dotColor || colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.md,
    shadowColor: '#FF7EB3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  navBtn: { padding: spacing.xs },
  monthLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  weekDayWeekend: { color: colors.primary },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayCellToday: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  dayCellOther: { opacity: 0.3 },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dayTextToday: { color: colors.primary, fontWeight: '800' },
  dayTextSelected: { color: colors.card, fontWeight: '800' },
  dayTextOther: { color: colors.textSecondary },
  dot: {
    position: 'absolute',
    bottom: 3,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
