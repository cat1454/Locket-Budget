import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { categories } from '../data/categories';
import { useSession } from '../state/SessionContext';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import type { Expense, ExpenseCategoryId } from '../types/domain';
import { formatCurrencyVnd } from '../utils/format';

interface QuickExpenseSheetProps {
  imageUri: string;
  onClose: () => void;
  onOpenFullForm?: () => void;
  onSaved?: (expense: Expense) => void;
}

const ui = {
  gold: '#F6B117',
  ink: '#0E0E0E',
  panel: '#FFF8F0',
  backdrop: 'rgba(4, 4, 4, 0.56)',
} as const;

export function QuickExpenseSheet({
  imageUri,
  onClose,
  onOpenFullForm,
  onSaved,
}: QuickExpenseSheetProps) {
  const { addExpense } = useSession();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<ExpenseCategoryId>('food');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedAmount = useMemo(() => Number(amount.replace(/[^\d]/g, '')), [amount]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    const result = await addExpense({
      amount: normalizedAmount,
      categoryId,
      imageUri,
      note: note.trim(),
      occurredAt: new Date().toISOString(),
    });

    setIsSaving(false);

    if (!result.ok || !result.expense) {
      setError(result.error ?? 'Could not save expense.');
      return;
    }

    onSaved?.(result.expense);
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View style={styles.root}>
        <Pressable onPress={onClose} style={styles.backdrop} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetHost}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <Text style={styles.title}>Quick add</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons color={colors.textPrimary} name="close" size={20} />
              </Pressable>
            </View>

            <ScrollView
              bounces={false}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroRow}>
                <Image source={{ uri: imageUri }} style={styles.thumbnail} />

                <View style={styles.amountBlock}>
                  <Text style={styles.label}>Amount</Text>
                  <TextInput
                    autoFocus
                    keyboardType="numeric"
                    onChangeText={(value) => setAmount(value.replace(/[^\d]/g, ''))}
                    placeholder="45000"
                    placeholderTextColor={colors.textSoft}
                    style={styles.amountInput}
                    value={amount}
                  />
                  <Text style={styles.amountPreview}>
                    {normalizedAmount > 0 ? formatCurrencyVnd(normalizedAmount) : 'Enter amount'}
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Category</Text>
              <View style={styles.chipWrap}>
                {categories.map((category) => {
                  const active = category.id === categoryId;

                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => setCategoryId(category.id)}
                      style={[
                        styles.chip,
                        active && {
                          backgroundColor: category.color,
                          borderColor: category.color,
                        },
                      ]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {category.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Note</Text>
              <TextInput
                maxLength={100}
                onChangeText={setNote}
                placeholder="Coffee, lunch, ticket..."
                placeholderTextColor={colors.textSoft}
                style={styles.noteInput}
                value={note}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                disabled={isSaving}
                onPress={() => {
                  void handleSave();
                }}
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              >
                <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save expense'}</Text>
              </Pressable>

              <Pressable onPress={onOpenFullForm} style={styles.fullFormButton}>
                <Text style={styles.fullFormText}>Open full form</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ui.backdrop,
  },
  sheetHost: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: ui.panel,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    maxHeight: '82%',
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(36, 26, 20, 0.16)',
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '800',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(36, 26, 20, 0.08)',
  },
  content: {
    paddingBottom: spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  thumbnail: {
    width: 108,
    height: 108,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
  },
  amountBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.eyebrow,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  amountInput: {
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  amountPreview: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
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
  noteInput: {
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.accentStrong,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  saveButton: {
    borderRadius: radius.md,
    backgroundColor: ui.gold,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginBottom: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.72,
  },
  saveButtonText: {
    color: ui.ink,
    fontSize: typography.bodyLarge,
    fontWeight: '800',
  },
  fullFormButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  fullFormText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
