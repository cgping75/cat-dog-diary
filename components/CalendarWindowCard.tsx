import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';
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
  weatherCity: string;
  suggestionTitle: string;
  suggestionContent: string;
  suggestionIcon: string;
  customBgUri?: string;
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
  weatherCity,
  suggestionTitle,
  suggestionContent,
  suggestionIcon,
  customBgUri,
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

  const hasBg = !!customBgUri;

  const content = (
    <>
      {/* Top tear line */}
      <View style={styles.tearLine}>
        {Array.from({ length: 28 }).map((_, i) => (
          <View key={i} style={styles.tearDot} />
        ))}
      </View>

      {/* Pet info row — no avatar */}
      {pet && (
        <View style={styles.petRow}>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petMeta}>
              {pet.breed || (pet.pet_type === 'cat' ? '猫' : '狗')}
              {pet.gender === 'male' ? ' · ♂公' : pet.gender === 'female' ? ' · ♀母' : ''}
              {pet.age_text ? ` · ${pet.age_text}` : ''}
              {pet.weight ? ` · ${pet.weight}kg` : ''}
            </Text>
          </View>
          <View style={[styles.streakBadge, allSystemDone && styles.streakBadgeDone]}>
            <MaterialCommunityIcons name="fire" size={18} color={allSystemDone ? '#FFD700' : '#C4A882'} />
            <Text style={[styles.streakNum, allSystemDone && { color: '#FFD700' }]}>{streak}</Text>
          </View>
        </View>
      )}

      {/* Main body: date + checkin */}
      <View style={styles.body}>
        <View style={styles.dateSection}>
          <Text style={styles.monthText}>{month}月</Text>
          <Text style={styles.dayText}>{day}</Text>
          <Text style={styles.weekdayText}>{weekday}</Text>
          <Text style={styles.yearText}>{year}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.checkinSection}>
          <Text style={styles.checkinTitle}>今日打卡</Text>
          {systemItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkinItemRow}
              onPress={() => onToggleCheckin(item.id)}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons
                name={item.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                size={24}
                color={item.done ? colors.success : '#C4A882'}
              />
              <Text style={[styles.checkinItemLabel, item.done && styles.checkinItemDone]}>
                {item.label}
              </Text>
              <Text style={styles.systemTag}>固定</Text>
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
                size={24}
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
          <MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#8B7B6E" />
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
              size={16}
              color={t.is_done ? colors.success : '#C4A882'}
            />
            <Text style={[styles.todoText, t.is_done ? styles.todoTextDone : null]} numberOfLines={1}>{t.title}</Text>
          </View>
        ))}
        {todayTodos.length === 0 && nextTodo && (
          <View style={styles.todoRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.warning} />
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
          {weatherCity !== '' && (
            <>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color="#8B7B6E" />
              <Text style={styles.weatherText}>{weatherCity}</Text>
            </>
          )}
          <MaterialCommunityIcons
            name={weatherIcon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={16}
            color="#8B7B6E"
          />
          <Text style={styles.weatherText}>{weatherLabel} {weatherTemp}</Text>
        </View>
        <View style={styles.suggestionRow}>
          <MaterialCommunityIcons
            name={suggestionIcon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={16}
            color={colors.primary}
          />
          <Text style={styles.suggestionText} numberOfLines={2}>
            {suggestionTitle}：{suggestionContent}
          </Text>
        </View>
      </View>

      {/* Bottom tear line */}
      <View style={[styles.tearLine, styles.tearLineBottom]}>
        {Array.from({ length: 28 }).map((_, i) => (
          <View key={i} style={styles.tearDot} />
        ))}
      </View>
    </>
  );

  if (hasBg) {
    return (
      <ImageBackground
        source={{ uri: customBgUri }}
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
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#B0B0B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  bgImage: {
    borderRadius: 24,
    resizeMode: 'cover',
  },
  bgOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  tearLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tearLineBottom: {},
  tearDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E0E0E0',
  },

  // Pet info — no avatar
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },
  petInfo: { flex: 1 },
  petName: { fontSize: 20, fontWeight: '800', color: '#333333' },
  petMeta: { fontSize: 13, color: '#888888', marginTop: 3 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  streakBadgeDone: {
    backgroundColor: '#FFF3CD',
  },
  streakNum: { fontSize: 18, fontWeight: '800', color: '#C4A882' },

  // Date + checkin
  body: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dateSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#999999',
    letterSpacing: 2,
  },
  dayText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#333333',
    lineHeight: 70,
    marginTop: -2,
  },
  weekdayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666666',
    marginTop: -2,
  },
  yearText: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 4,
  },
  divider: {
    width: 1.5,
    backgroundColor: '#E8E8E8',
    alignSelf: 'stretch',
    marginHorizontal: 16,
  },
  checkinSection: {
    flex: 1,
    gap: 12,
  },
  checkinTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 4,
  },
  checkinItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkinItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444444',
    flex: 1,
  },
  checkinItemDone: {
    color: colors.success,
    textDecorationLine: 'line-through',
  },
  systemTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BBBBBB',
  },

  // Todos
  todoSection: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    marginHorizontal: 16,
    gap: 8,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todoText: {
    fontSize: 14,
    color: '#444444',
    flex: 1,
  },
  todoTextDone: {
    textDecorationLine: 'line-through',
    color: '#BBBBBB',
  },
  todoMore: {
    fontSize: 12,
    color: '#BBBBBB',
    marginLeft: 24,
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    paddingTop: 6,
    gap: 8,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherText: {
    fontSize: 14,
    color: '#888888',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 20,
    flex: 1,
  },
});
