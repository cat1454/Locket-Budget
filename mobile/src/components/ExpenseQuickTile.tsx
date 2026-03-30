import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryById } from '../data/categories';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import type { Expense } from '../types/domain';
import { formatCurrencyVnd } from '../utils/format';

interface ExpenseQuickTileProps {
  expense: Expense;
  onPress?: () => void;
}

export function ExpenseQuickTile({ expense, onPress }: ExpenseQuickTileProps) {
  const category = categoryById[expense.categoryId];

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <View style={styles.tile}>
        <View style={styles.mediaWrap}>
          {expense.imageUri ? (
            <Image source={{ uri: expense.imageUri }} style={styles.coverImage} />
          ) : (
            <LinearGradient colors={category.coverColors} style={styles.coverFallback}>
              <Text style={styles.coverFallbackText}>{category.shortLabel}</Text>
            </LinearGradient>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(8, 8, 8, 0.14)', 'rgba(8, 8, 8, 0.8)']}
            locations={[0, 0.48, 1]}
            style={styles.amountOverlay}
          >
            <Text numberOfLines={1} style={styles.amountText}>
              {formatCurrencyVnd(expense.amount)}
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '48.4%',
    marginBottom: spacing.md,
  },
  tile: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(14, 14, 14, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mediaWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceMuted,
  },
  coverFallback: {
    ...StyleSheet.absoluteFillObject,
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
  amountOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  amountText: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: '800',
  },
});
