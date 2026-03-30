import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { categories } from '../data/categories';
import { MoodPicker } from '../components/MoodPicker';
import { useSession } from '../state/SessionContext';
import { elevation, radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import type { Expense, ExpenseCategoryId, ExpenseDraft, ExpenseMoodId } from '../types/domain';
import { formatCurrencyVnd, formatDateTime } from '../utils/format';
import { cropImageToSquare } from '../utils/image';

type ComposerVariant = 'inline' | 'screen';
type SaveAction = 'created' | 'updated';

interface ExpenseComposerProps {
  editingExpense?: Expense | null;
  draftSeed?: Partial<ExpenseDraft>;
  heading: string;
  subheading?: string;
  variant?: ComposerVariant;
  resetOnCreate?: boolean;
  onSaved?: (expense: Expense, action: SaveAction) => void;
}

function createEmptyState(draftSeed?: Partial<ExpenseDraft>) {
  return {
    selectedCategory: draftSeed?.categoryId ?? ('food' as ExpenseCategoryId),
    selectedMood: draftSeed?.moodId ?? ('neutral' as ExpenseMoodId),
    amount:
      typeof draftSeed?.amount === 'number' && Number.isFinite(draftSeed.amount)
        ? String(draftSeed.amount)
        : '',
    note: draftSeed?.note ?? '',
    imageUri: draftSeed?.imageUri ?? '',
    occurredAt: draftSeed?.occurredAt ?? new Date().toISOString(),
  };
}

export function ExpenseComposer({
  editingExpense,
  draftSeed,
  heading,
  subheading,
  variant = 'screen',
  resetOnCreate = false,
  onSaved,
}: ExpenseComposerProps) {
  const { addExpense, updateExpense } = useSession();
  const initialState = createEmptyState(draftSeed);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryId>(
    editingExpense?.categoryId ?? initialState.selectedCategory,
  );
  const [selectedMood, setSelectedMood] = useState<ExpenseMoodId | null>(
    editingExpense ? editingExpense.moodId : initialState.selectedMood,
  );
  const [amount, setAmount] = useState(editingExpense ? String(editingExpense.amount) : initialState.amount);
  const [note, setNote] = useState(editingExpense?.note ?? initialState.note);
  const [imageUri, setImageUri] = useState(editingExpense?.imageUri ?? initialState.imageUri);
  const [occurredAt, setOccurredAt] = useState(editingExpense?.occurredAt ?? initialState.occurredAt);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setSelectedCategory(editingExpense.categoryId);
      setSelectedMood(editingExpense.moodId);
      setAmount(String(editingExpense.amount));
      setNote(editingExpense.note);
      setImageUri(editingExpense.imageUri);
      setOccurredAt(editingExpense.occurredAt);
      setError(null);
      return;
    }

    const emptyState = createEmptyState(draftSeed);
    setSelectedCategory(emptyState.selectedCategory);
    setSelectedMood(emptyState.selectedMood);
    setAmount(emptyState.amount);
    setNote(emptyState.note);
    setImageUri(emptyState.imageUri);
    setOccurredAt(emptyState.occurredAt);
    setError(null);
  }, [draftSeed, editingExpense]);

  async function pickImageFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Can cap quyen', 'Ung dung can quyen thu vien de chon anh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const squaredUri = await cropImageToSquare({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });

      setImageUri(squaredUri);
      setError(null);
    }
  }

  async function captureImage() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Can cap quyen', 'Ung dung can quyen camera de chup anh.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      cameraType: ImagePicker.CameraType.back,
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const squaredUri = await cropImageToSquare({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });

      setImageUri(squaredUri);
      setError(null);
    }
  }

  function resetComposer() {
    const emptyState = createEmptyState(draftSeed);
    setSelectedCategory(emptyState.selectedCategory);
    setSelectedMood(emptyState.selectedMood);
    setAmount(emptyState.amount);
    setNote(emptyState.note);
    setImageUri(emptyState.imageUri);
    setOccurredAt(emptyState.occurredAt);
    setError(null);
  }

  async function handleSave() {
    const normalizedAmount = Number(amount.replace(/[^\d]/g, ''));

    setIsSaving(true);
    setError(null);

    const draft = {
      categoryId: selectedCategory,
      moodId: selectedMood,
      amount: normalizedAmount,
      note: note.trim(),
      imageUri,
      occurredAt,
    };

    const action: SaveAction = editingExpense ? 'updated' : 'created';
    const result = editingExpense
      ? await updateExpense(editingExpense.id, draft)
      : await addExpense(draft);

    setIsSaving(false);

    if (!result.ok || !result.expense) {
      setError(result.error ?? 'Khong the luu khoan chi.');
      return;
    }

    onSaved?.(result.expense, action);

    if (action === 'created' && resetOnCreate) {
      resetComposer();
    }
  }

  const normalizedAmount = Number(amount.replace(/[^\d]/g, ''));
  const amountPreview =
    normalizedAmount > 0 ? formatCurrencyVnd(normalizedAmount) : 'Nhap so tien de xem preview';

  return (
    <View style={[styles.container, variant === 'inline' && styles.inlineContainer]}>
      <Text style={[styles.heading, variant === 'inline' && styles.inlineHeading]}>{heading}</Text>
      {subheading ? <Text style={styles.subheading}>{subheading}</Text> : null}

      <Pressable
        onPress={() => {
          void captureImage();
        }}
        style={[styles.previewShell, variant === 'inline' && styles.previewShellInline]}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>Chup lai</Text>
            </View>
          </>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoTitle}>Mo camera de luu khoan chi ngay</Text>
            <Text style={styles.photoBody}>
              Tap vao khung anh hoac nut ben duoi. MVP van giu photo-first nen moi khoan chi deu co anh.
            </Text>
          </View>
        )}
      </Pressable>

      <View style={styles.photoActions}>
        <Pressable
          onPress={() => {
            void captureImage();
          }}
          style={styles.photoButton}
        >
          <Text style={styles.photoButtonText}>Chup ngay</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void pickImageFromLibrary();
          }}
          style={styles.photoButtonSecondary}
        >
          <Text style={styles.photoButtonSecondaryText}>Thu vien</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>So tien</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={(value) => setAmount(value.replace(/[^\d]/g, ''))}
        placeholder="45000"
        placeholderTextColor={colors.textSoft}
        style={styles.input}
        value={amount}
      />
      <Text style={styles.amountPreview}>{amountPreview}</Text>

      <Text style={styles.label}>Ghi chu ngan</Text>
      <TextInput
        maxLength={140}
        multiline
        onChangeText={setNote}
        placeholder="Vi du: ca phe voi ban, mua sach, bua trua..."
        placeholderTextColor={colors.textSoft}
        style={[styles.input, styles.multilineInput]}
        value={note}
      />

      <Text style={styles.label}>Danh muc</Text>
      <View style={styles.chipWrap}>
        {categories.map((category) => {
          const isActive = category.id === selectedCategory;

          return (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.chip,
                isActive && {
                  backgroundColor: category.color,
                  borderColor: category.color,
                },
              ]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Mood</Text>
      <MoodPicker onChange={setSelectedMood} value={selectedMood} />

      <Text style={styles.label}>Ngay gio</Text>
      <View style={styles.dateRow}>
        <Text style={styles.dateValue}>{formatDateTime(occurredAt)}</Text>
        <Text style={styles.dateHint}>
          Dang luu theo thoi diem hien tai. Phase tiep theo co the mo them date picker.
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        disabled={isSaving}
        onPress={() => {
          void handleSave();
        }}
        style={[styles.saveButton, isSaving && styles.buttonDisabled]}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Dang luu...' : editingExpense ? 'Cap nhat khoan chi' : 'Luu khoan chi'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inlineContainer: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 251, 246, 0.92)',
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...elevation,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: typography.display,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  inlineHeading: {
    fontSize: 26,
  },
  subheading: {
    color: colors.textSecondary,
    fontSize: typography.bodyLarge,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  previewShell: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  previewShellInline: {
    borderRadius: radius.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceMuted,
  },
  previewBadge: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(47, 36, 30, 0.78)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  previewBadgeText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },
  photoPlaceholder: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.card,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  photoBody: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  photoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  photoButton: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.accentStrong,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  photoButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },
  photoButtonSecondary: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  photoButtonSecondaryText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.eyebrow,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    marginBottom: spacing.sm,
  },
  amountPreview: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginBottom: spacing.lg,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  dateRow: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  dateValue: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  dateHint: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  errorText: {
    color: colors.accentStrong,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  saveButton: {
    borderRadius: radius.md,
    backgroundColor: colors.accentStrong,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
});
