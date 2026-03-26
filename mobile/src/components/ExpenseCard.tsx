import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryById } from '../data/categories';
import { elevation, radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import type { Expense } from '../types/domain';
import { formatCurrencyVnd, formatDateTime } from '../utils/format';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
}

export function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
  const category = categoryById[expense.categoryId];

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <View style={styles.card}>
        {expense.imageUri ? (
          <Image source={{ uri: expense.imageUri }} style={styles.coverImage} />
        ) : (
          <LinearGradient colors={category.coverColors} style={styles.coverFallback}>
            <Text style={styles.coverFallbackText}>{category.shortLabel}</Text>
          </LinearGradient>
        )}

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.textWrap}>
              <Text style={styles.categoryText}>{category.label}</Text>
              <Text style={styles.noteText}>{expense.note || 'Khong co ghi chu'}</Text>
            </View>
            <Text style={styles.amountText}>{formatCurrencyVnd(expense.amount)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{formatDateTime(expense.occurredAt)}</Text>
            <Text style={styles.metaText}> | </Text>
            <Text style={styles.metaText}>{category.shortLabel}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation,
  },
  coverImage: {
    width: '100%',
    height: 164,
    backgroundColor: colors.surfaceMuted,
  },
  coverFallback: {
    height: 164,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackText: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  content: {
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  textWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: typography.eyebrow,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  noteText: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: '600',
  },
  amountText: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
});
