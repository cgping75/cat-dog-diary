import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { CheckinItemWithStatus } from '@/lib/checkinRepository';
import { TodoItem } from '@/lib/todoRepository';
import { Pet } from '@/lib/petRepository';

const weekDayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

type CalendarWindowCardProps = {
  pet: Pet | null;
  streak: number;
  checkinItems: CheckinItemWithStatus[];
  todayTodos: TodoItem[];
  nextTodo: TodoItem | null;
  weatherLabel: string;
  weatherIcon: string;
  weatherTemp: string;
  suggestionTitle: string;
  suggestionContent: string;
  suggestionIcon: string;
  onToggleCheckin: (itemId: number) => void;
};

export default function CalendarWindowCard({
  pet,
  streak,
  checkinItems,
  todayTodos,
  nextTodo,
  weatherLabel,
  weatherIcon,
  weatherTemp,
  suggestionTitle,
  suggestionContent,
  suggestionIcon,
  onToggleCheckin,
}: CalendarWindowCardProps) {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const weekday = weekDayNames[now.getDay()];
  const undoneToday = todayTodos.filter((t) => !t.is_done);
  const systemItems = checkinItems.filter((i) => i.is_system);
  const customItems = checkinItems.filter((i) => !i.is_system);
  const allSystemDone = systemItems.length > 0 && systemItems.every((i) => i.done);

  const hasPhoto = !!pet?.photo_uri;

  const content = (
    <>
      {/* Top tear line */}
      <View style={styles.tearLine}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={i} style={styles.tearDot} />
        ))}
      </View>

      {/* Pet info row */}
      {pet && (
        <View style={styles.petRow}>
          <View style={styles.petAvatarWrap}>
            {hasPhoto ? (
              <ImageBackground source={{ uri: pet.photo_uri }} style={styles.petAvatar} imageStyle={styles.petAvatarImg} />
            ) : (
              <View style={[styles.petAvatar, styles.petAvatarDefault]}>
                <MaterialCommunityIcons name={pet.pet_type === 'cat' ? 'cat' : 'dog'} size={24} color={colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petMeta}>
              {pet.breed || (pet.pet_type === 'cat' ? '猫' : '狗')}
              {pet.gender === 'male' ? ' · ♂' : pet.gender === 'female' ? ' · ♀' : ''}
              {pet.age_text ? ` · ${pet.age_text}` : ''}
              {pet.weight ? ` · ${pet.weight}kg` : ''}
            </Text>
          </View>
          <View style={[styles.streakBadge, allSystemDone && styles.streakBadgeDone]}>
            <MaterialCommunityIcons name="fire" size={14} color={allSystemDone ? '#FFD700' : '#C4A882'} />
            <Text style={[styles.streakNum, allSystemDone && { color: '#FFD700' }]}>{streak}</Text>
          </View>
        </View>
      )}

      {/* Main body: date + checkin */}
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

        {/* Right: Checkin items */}
        <View style={styles.checkinSection}>
          <Text style={styles.checkinTitle}>每日打卡</Text>
          {systemItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkinItemRow}
              onPress={() => onToggleCheckin(item.id)}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons
                name={item.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                size={20}
                color={item.done ? colors.success : '#C4A882'}
              />
              <Text style={[styles.checkinItemLabel, item.done && styles.checkinItemDone]}>
                {item.label}
              </Text>
              <View style={styles.systemBadge}>
                <Text style={styles.systemBadgeText}>固定</Text>
              </View>
            </TouchableOpacity>
          ))}
          {customItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkinItemRow}
              onPress={() => onToggleCheckin(item.id)}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons
                name={item.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                size={20}
                color={item.done ? colors.success : '#C4A882'}
              />
              <Text style={[styles.checkinItemLabel, item.done && styles.checkinItemDone]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Todo section */}
      <View style={styles.todoSection}>
        <View style={styles.todoHeader}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={14} color="#8B7B6E" />
          <Text style={styles.todoTitle}>
            {todayTodos.length === 0
              ? '今日无待办'
              : undoneToday.length === 0
                ? '今日待办已完成'
                : `${undoneToday.length}项待办未完成`}
          </Text>
        </View>
        {todayTodos.length > 0 && todayTodos.slice(0, 3).map((t) => (
          <View key={t.id} style={styles.todoRow}>
            <MaterialCommunityIcons
              name={t.is_done ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={14}
              color={t.is_done ? colors.success : '#C4A882'}
            />
            <Text style={[styles.todoText, t.is_done ? styles.todoTextDone : null]} numberOfLines={1}>{t.title}</Text>
          </View>
        ))}
        {todayTodos.length === 0 && nextTodo && (
          <View style={styles.todoRow}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.warning} />
            <Text style={[styles.todoText, { color: colors.warning }]} numberOfLines={1}>
              下一待办：{nextTodo.title}（{nextTodo.due_date.slice(5)}）
            </Text>
          </View>
        )}
        {todayTodos.length > 3 && (
          <Text style={styles.todoMore}>还有 {todayTodos.length - 3} 项...</Text>
        )}
      </View>

      {/* Weather + suggestion */}
      <View style={styles.bottomSection}>
        <View style={styles.weatherRow}>
          <MaterialCommunityIcons
            name={weatherIcon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={14}
            color="#8B7B6E"
          />
          <Text style={styles.weatherText}>{weatherLabel} {weatherTemp}</Text>
        </View>
        <View style={styles.suggestionRow}>
          <MaterialCommunityIcons
            name={suggestionIcon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={14}
            color={colors.primary}
          />
          <Text style={styles.suggestionText} numberOfLines={2}>
            {suggestionTitle}：{suggestionContent}
          </Text>
        </View>
      </View>

      {/* Bottom tear line */}
      <View style={[styles.tearLine, styles.tearLineBottom]}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={i} style={styles.tearDot} />
        ))}
      </View>
    </>
  );

  if (hasPhoto) {
    return (
      <ImageBackground
        source={{ uri: pet!.photo_uri }}
        style={styles.container}
        imageStyle={styles.bgImage}
      >
        <View style={styles.bgOverlay}>
          {content}
        </View>
      </ImageBackground>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  bgImage: {
    borderRadius: 20,
    resizeMode: 'cover',
  },
  bgOverlay: {
    backgroundColor: 'rgba(255, 251, 240, 0.92)',
  },
  tearLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tearLineBottom: {},
  tearDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8DCC8',
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  petAvatarWrap: {},
  petAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  petAvatarImg: {
    borderRadius: 20,
  },
  petAvatarDefault: {
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: { flex: 1 },
  petName: { fontSize: 16, fontWeight: '800', color: '#5D4037' },
  petMeta: { fontSize: 11, color: '#A89279', marginTop: 1 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakBadgeDone: {
    backgroundColor: '#FFF3CD',
  },
  streakNum: { fontSize: 14, fontWeight: '800', color: '#C4A882' },
  body: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  dateSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B8860B',
    letterSpacing: 1,
  },
  dayText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#8B4513',
    lineHeight: 54,
    marginTop: -2,
  },
  weekdayText: {
    fontSize: 13,
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
    marginHorizontal: spacing.sm,
  },
  checkinSection: {
    flex: 1,
    gap: 6,
  },
  checkinTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B7B6E',
    marginBottom: 2,
  },
  checkinItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkinItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5B4E',
    flex: 1,
  },
  checkinItemDone: {
    color: colors.success,
    textDecorationLine: 'line-through',
  },
  systemBadge: {
    backgroundColor: '#E8DCC8',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  systemBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B7B6E',
  },
  todoSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E8DCC8',
    marginHorizontal: spacing.md,
    gap: 4,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B7B6E',
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todoText: {
    fontSize: 12,
    color: '#6B5B4E',
    flex: 1,
  },
  todoTextDone: {
    textDecorationLine: 'line-through',
    color: '#C4A882',
  },
  todoMore: {
    fontSize: 11,
    color: '#C4A882',
    marginLeft: 20,
  },
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    gap: 4,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherText: {
    fontSize: 12,
    color: '#8B7B6E',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  suggestionText: {
    fontSize: 12,
    color: '#8B7B6E',
    lineHeight: 17,
    flex: 1,
  },
});
