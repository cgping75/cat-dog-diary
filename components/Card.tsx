import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '@/lib/theme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
});
