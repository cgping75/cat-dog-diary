import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { TodoItem } from '@/lib/todoRepository';

const weekDayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

type CalendarWindowCardProps = {
  isCheckedin: boolean;
  streak: number;
  todayTodos: TodoItem[];
  nextTodo: TodoItem | null;
  weatherLabel: string;
  weatherIcon: string;
  weatherTemp: string;
  suggestionTitle: string;
  suggestionContent: string;
  suggestionIcon: string;
};

export default function CalendarWindowCard({
  isCheckedin,
  streak,
  todayTodos,
  nextTodo,
  weatherLabel,
  weatherIcon,
  weatherTemp,
  suggestionTitle,
  suggestionContent,
  suggestionIcon,
}: CalendarWindowCardProps) {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const weekday = weekDayNames[now.getDay()];
  const undoneToday = todayTodos.filter((t) => !t.is_done);

  return (
    <View style={styles.container}>
      {/* Top tear line */}
      <View style={styles.tearLine}>
        {Array.from({ length: 24 }).map((_, i) => (
          <View key={i} style={styles.tearDot} />
        ))}
      </View>

      {/* Calendar body */}
      <View style={styles.body}>
        {/* Left: Big date */}
        <View style={styles.dateSection}>
          <Text style={styles.monthText}>{month}月</Text>
          <Text style={styles.dayText}>{day}</Text>
          <Text style={styles.weekdayText}>{weekday}</Text>
          <Text style={styles.yearText}>{year}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Right: Info panel */}
        <View style={styles.infoSection}>
          {/* Checkin status */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name={isCheckedin ? 'check-circle' : 'checkbox-blank-circle-outline'}
              size={16}
              color={isCheckedin ? colors.success : colors.textSecondary}
            />
            <Text style={[styles.infoLabel, isCheckedin && { color: colors.success }]}>
              {isCheckedin ? `已打卡 · 连续${streak}天` : '未打卡'}
            </Text>
          </View>

          {/* Today todos */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>
              {todayTodos.length === 0
                ? '今日无待办'
                : undoneToday.length === 0
                  ? '今日待办已完成'
                  : `${undoneToday.length}项待办未完成`}
            </Text>
          </View>

          {/* Next todo reminder */}
          {nextTodo && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.warning} />
              <Text style={[styles.infoLabel, { color: colors.warning }]} numberOfLines={1}>
                下一待办：{nextTodo.title}（{nextTodo.due_date.slice(5)}）
              </Text>
            </View>
          )}

          {/* Weather */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name={weatherIcon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={16}
              color={colors.secondary}
            />
            <Text style={styles.infoLabel}>
              {weatherLabel} {weatherTemp}
            </Text>
          </View>
        </View>
      </View>

      {/* Interaction suggestion */}
      <View style={styles.suggestionSection}>
        <View style={styles.suggestionHeader}>
          <MaterialCommunityIcons
            name={suggestionIcon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={16}
            color={colors.primary}
          />
          <Text style={styles.suggestionTitle}>{suggestionTitle}</Text>
        </View>
        <Text style={styles.suggestionContent}>{suggestionContent}</Text>
      </View>

      {/* Bottom tear line */}
      <View style={[styles.tearLine, styles.tearLineBottom]}>
        {Array.from({ length: 24 }).map((_, i) => (
          <View key={i} style={styles.tearDot} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFBF0',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  tearLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tearLineBottom: {
    marginTop: 0,
  },
  tearDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8DCC8',
  },
  body: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dateSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B8860B',
    letterSpacing: 1,
  },
  dayText: {
    fontSize: 52,
    fontWeight: '900',
    color: '#8B4513',
    lineHeight: 58,
    marginTop: -2,
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CD853F',
    marginTop: -2,
  },
  yearText: {
    fontSize: 11,
    color: '#C4A882',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#E8DCC8',
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5B4E',
    flex: 1,
  },
  suggestionSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E8DCC8',
    marginHorizontal: spacing.md,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  suggestionContent: {
    fontSize: 12,
    color: '#8B7B6E',
    lineHeight: 18,
  },
});
