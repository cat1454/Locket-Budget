import { StyleSheet, Text, View } from 'react-native';
import { elevation, radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'accent' | 'surface' | 'success';
}

export function StatCard({ label, value, hint, tone = 'surface' }: StatCardProps) {
  const isColored = tone !== 'surface';
  const cardStyle = tone === 'accent'
    ? styles.accentCard
    : tone === 'success'
      ? styles.successCard
      : styles.surfaceCard;

  return (
    <View style={[styles.card, cardStyle]}>
      <Text style={[styles.label, isColored && styles.inverseLabel]}>{label}</Text>
      <Text style={[styles.value, isColored && styles.inverseValue]}>{value}</Text>
      {hint ? <Text style={[styles.hint, isColored && styles.inverseHint]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 112,
    borderRadius: radius.md,
    padding: spacing.md,
    ...elevation,
  },
  surfaceCard: {
    backgroundColor: colors.card,
  },
  accentCard: {
    backgroundColor: colors.accentStrong,
  },
  successCard: {
    backgroundColor: colors.success,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.eyebrow,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
  },
  inverseLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
  },
  inverseValue: {
    color: colors.white,
  },
  inverseHint: {
    color: 'rgba(255, 255, 255, 0.82)',
  },
});
