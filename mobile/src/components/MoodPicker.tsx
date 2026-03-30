import { Pressable, StyleSheet, Text, View } from 'react-native';
import { moods } from '../data/moods';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import type { ExpenseMoodId } from '../types/domain';

interface MoodPickerProps {
  value: ExpenseMoodId | null;
  onChange: (value: ExpenseMoodId) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <View style={styles.wrap}>
      {moods.map((mood) => {
        const isActive = mood.id === value;

        return (
          <Pressable
            key={mood.id}
            onPress={() => onChange(mood.id)}
            style={[
              styles.chip,
              isActive && {
                backgroundColor: mood.color,
                borderColor: mood.color,
              },
            ]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{mood.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
  },
});
