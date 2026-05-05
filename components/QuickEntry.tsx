import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '@/lib/theme';

type QuickEntryProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  style?: ViewStyle;
};

export default function QuickEntry({ icon, label, color, onPress, style }: QuickEntryProps) {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
