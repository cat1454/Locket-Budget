import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { ExpenseComposer } from '../components/ExpenseComposer';
import { ScreenShell } from '../components/ScreenShell';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/SessionContext';
import { spacing, typography } from '../theme';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

export function AddExpenseScreen({ navigation, route }: Props) {
  const { getExpenseById } = useSession();
  const editingExpense = route.params?.expenseId ? getExpenseById(route.params.expenseId) : null;
  const draftSeed = route.params?.prefilledImageUri
    ? {
        imageUri: route.params.prefilledImageUri,
        occurredAt: new Date().toISOString(),
      }
    : undefined;

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
      <ExpenseComposer
        draftSeed={draftSeed}
        editingExpense={editingExpense}
        heading={editingExpense ? 'Sua khoan chi' : 'Them khoan chi'}
        onSaved={(expense, action) => {
          if (action === 'updated') {
            navigation.goBack();
            return;
          }

          navigation.replace('ExpenseDetail', { expenseId: expense.id });
        }}
        subheading={
          editingExpense
            ? 'Cap nhat lai anh, so tien hoac ghi chu de timeline luon dung voi thuc te.'
            : 'Mo camera, nhap so tien va luu vao timeline neu ban dang them tu tab khac.'
        }
      />
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
});
