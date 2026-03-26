import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { categoryById } from '../data/categories';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/SessionContext';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import { formatCurrencyVnd, formatDateTime } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpenseDetail'>;

export function ExpenseDetailScreen({ navigation, route }: Props) {
  const { deleteExpense, getExpenseById } = useSession();
  const expense = getExpenseById(route.params.expenseId);

  if (!expense) {
    return (
      <ScreenShell>
        <Text style={styles.heading}>Expense not found</Text>
        <Text style={styles.subheading}>Khoan chi nay khong con ton tai trong local store.</Text>
      </ScreenShell>
    );
  }

  const currentExpense = expense;
  const category = categoryById[currentExpense.categoryId];

  async function handleDelete() {
    const result = await deleteExpense(currentExpense.id);

    if (!result.ok) {
      Alert.alert('Khong the xoa', result.error ?? 'Da co loi xay ra.');
      return;
    }

    navigation.goBack();
  }

  return (
    <ScreenShell>
      <Image source={{ uri: currentExpense.imageUri }} style={styles.coverImage} />

      <Text style={styles.amount}>{formatCurrencyVnd(currentExpense.amount)}</Text>
      <Text style={styles.note}>{currentExpense.note || 'Khong co ghi chu cho khoan chi nay.'}</Text>

      <View style={styles.actionRow}>
        <Pressable
          onPress={() => navigation.navigate('AddExpense', { expenseId: currentExpense.id })}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>Sua</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Alert.alert('Xoa khoan chi', 'Ban chac chan muon xoa khoan chi nay?', [
              { text: 'Huy', style: 'cancel' },
              {
                text: 'Xoa',
                style: 'destructive',
                onPress: () => {
                  void handleDelete();
                },
              },
            ]);
          }}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Xoa</Text>
        </Pressable>
      </View>

      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Danh muc</Text>
          <Text style={styles.metaValue}>{category.label}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Ngay gio</Text>
          <Text style={styles.metaValue}>{formatDateTime(currentExpense.occurredAt)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Cap nhat lan cuoi</Text>
          <Text style={styles.metaValue}>{formatDateTime(currentExpense.updatedAt)}</Text>
        </View>
      </View>
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
  },
  coverImage: {
    width: '100%',
    height: 320,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceMuted,
  },
  amount: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  note: {
    color: colors.textSecondary,
    fontSize: typography.bodyLarge,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  editButton: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.accentStrong,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
  metaCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  metaRow: {
    marginBottom: spacing.md,
  },
  metaLabel: {
    color: colors.textSoft,
    fontSize: typography.eyebrow,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: '600',
  },
});
