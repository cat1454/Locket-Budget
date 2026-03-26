import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenShell } from '../components/ScreenShell';
import { categories } from '../data/categories';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/SessionContext';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import type { ExpenseCategoryId } from '../types/domain';
import { formatDateTime } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

export function AddExpenseScreen({ navigation, route }: Props) {
  const { addExpense, getExpenseById, updateExpense } = useSession();
  const editingExpense = route.params?.expenseId ? getExpenseById(route.params.expenseId) : null;

  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryId>(
    editingExpense?.categoryId ?? 'food',
  );
  const [amount, setAmount] = useState(editingExpense ? String(editingExpense.amount) : '');
  const [note, setNote] = useState(editingExpense?.note ?? '');
  const [imageUri, setImageUri] = useState(editingExpense?.imageUri ?? '');
  const [occurredAt, setOccurredAt] = useState(editingExpense?.occurredAt ?? new Date().toISOString());
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setSelectedCategory(editingExpense.categoryId);
      setAmount(String(editingExpense.amount));
      setNote(editingExpense.note);
      setImageUri(editingExpense.imageUri);
      setOccurredAt(editingExpense.occurredAt);
      setError(null);
      return;
    }

    setSelectedCategory('food');
    setAmount('');
    setNote('');
    setImageUri('');
    setOccurredAt(new Date().toISOString());
    setError(null);
  }, [editingExpense]);

  async function pickImageFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Can cap quyen', 'Ung dung can quyen thu vien de chon anh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 5],
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
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
      aspect: [4, 5],
      cameraType: ImagePicker.CameraType.back,
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setError(null);
    }
  }

  async function handleSave() {
    const normalizedAmount = Number(amount.replace(/[^\d]/g, ''));

    setIsSaving(true);
    setError(null);

    const draft = {
      categoryId: selectedCategory,
      amount: normalizedAmount,
      note: note.trim(),
      imageUri,
      occurredAt,
    };

    const result = editingExpense
      ? await updateExpense(editingExpense.id, draft)
      : await addExpense(draft);

    if (!result.ok || !result.expense) {
      setError(result.error ?? 'Khong the luu khoan chi.');
      setIsSaving(false);
      return;
    }

    setIsSaving(false);

    if (editingExpense) {
      navigation.goBack();
      return;
    }

    navigation.replace('ExpenseDetail', { expenseId: result.expense.id });
  }

  if (route.params?.expenseId && !editingExpense) {
    return (
      <ScreenShell>
        <Text style={styles.heading}>Khong tim thay khoan chi</Text>
        <Text style={styles.subheading}>Ban ghi can sua da khong con ton tai.</Text>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <Text style={styles.heading}>{editingExpense ? 'Sua khoan chi' : 'Them khoan chi'}</Text>
      <Text style={styles.subheading}>
        Chup anh hoac chon anh, nhap so tien, note ngan va danh muc de luu vao timeline.
      </Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoTitle}>Anh cho khoan chi nay</Text>
          <Text style={styles.photoBody}>MVP yeu cau moi khoan chi phai co anh.</Text>
        </View>
      )}

      <View style={styles.photoActions}>
        <Pressable onPress={() => void captureImage()} style={styles.photoButton}>
          <Text style={styles.photoButtonText}>Chup anh</Text>
        </Pressable>
        <Pressable onPress={() => void pickImageFromLibrary()} style={styles.photoButtonSecondary}>
          <Text style={styles.photoButtonSecondaryText}>Chon tu thu vien</Text>
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

      <Text style={styles.label}>Ghi chu ngan</Text>
      <TextInput
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

      <Text style={styles.label}>Ngay gio</Text>
      <View style={styles.dateRow}>
        <Text style={styles.dateValue}>{formatDateTime(occurredAt)}</Text>
        <Text style={styles.dateHint}>Phase 1 luu theo thoi diem tao. Phase sau co the them date picker.</Text>
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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colors.textPrimary,
    fontSize: typography.display,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  subheading: {
    color: colors.textSecondary,
    fontSize: typography.bodyLarge,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  photoPlaceholder: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  photoTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.xs,
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
    marginBottom: spacing.md,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
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
