import { StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '@/lib/theme';

export const sharedStyles = StyleSheet.create({
  sectionLabel: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  saveBtnText: { color: colors.card, fontSize: 16, fontWeight: '700' },
});
