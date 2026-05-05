import { StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '@/lib/theme';

export const sharedStyles = StyleSheet.create({
  sectionLabel: { fontSize: 16, fontWeight: '800', color: colors.primary, marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    shadowColor: '#FF7EB3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: { color: colors.card, fontSize: 16, fontWeight: '800' },
});
