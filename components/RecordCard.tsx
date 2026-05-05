import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PetRecord, RecordType } from '@/lib/recordRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';

type RecordCardProps = {
  record: PetRecord;
  onDelete?: (id: number) => void;
  onPress?: (record: PetRecord) => void;
};

const typeConfig: { [K in RecordType]: { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; label: string } } = {
  vaccine: { icon: 'needle', color: '#4CAF50', label: '疫苗' },
  deworm: { icon: 'pill', color: '#FF9800', label: '驱虫' },
  weight: { icon: 'scale-bathroom', color: '#2196F3', label: '体重' },
  issue: { icon: 'alert-circle-outline', color: '#F44336', label: '问题' },
  feeding: { icon: 'food-outline', color: '#8D6E63', label: '喂食' },
  checkup: { icon: 'stethoscope', color: '#7E57C2', label: '体检' },
  dental: { icon: 'tooth-outline', color: '#26A69A', label: '洁牙' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function RecordCard({ record, onDelete, onPress }: RecordCardProps) {
  const config = typeConfig[record.record_type] || typeConfig.issue;

  const handleLongPress = () => {
    if (!onDelete) return;
    Alert.alert('删除记录', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => onDelete(record.id) },
    ]);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(record)} onLongPress={handleLongPress} activeOpacity={0.8}>
      <View style={[styles.iconWrap, { backgroundColor: config.color + '18' }]}>
        <MaterialCommunityIcons name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>{record.title}</Text>
          <View style={[styles.badge, { backgroundColor: config.color + '18' }]}>
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.date}>{formatDate(record.recorded_at)}</Text>
          {record.value_text ? (
            <Text style={styles.value}>{record.value_text}</Text>
          ) : null}
        </View>
        {record.note ? <Text style={styles.note} numberOfLines={1}>{record.note}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
    shadowColor: '#FF7EB3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
