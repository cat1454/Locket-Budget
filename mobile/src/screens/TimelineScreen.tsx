import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExpenseCard } from '../components/ExpenseCard';
import { ScreenShell } from '../components/ScreenShell';
import type { AppTabParamList, RootStackParamList } from '../navigation/types';
import { useSession } from '../state/SessionContext';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';

type Props = BottomTabScreenProps<AppTabParamList, 'Timeline'>;

export function TimelineScreen({ navigation }: Props) {
  const { expenses } = useSession();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenShell>
      <Text style={styles.heading}>Expense timeline</Text>
      <Text style={styles.subheading}>
        Xem lai cac khoan chi theo dang journal hinh anh, moi item la mot lan chi tieu that.
      </Text>

      {expenses.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Timeline dang trong</Text>
          <Text style={styles.emptyBody}>
            Ban chua luu khoan chi nao. Hay them mot item de bat dau nhat ky chi tieu.
          </Text>
          <Pressable
            onPress={() => rootNavigation?.navigate('AddExpense')}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Them khoan chi</Text>
          </Pressable>
        </View>
      ) : (
        expenses.map((expense) => (
          <ExpenseCard
            expense={expense}
            key={expense.id}
            onPress={() => rootNavigation?.navigate('ExpenseDetail', { expenseId: expense.id })}
          />
        ))
      )}
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
  emptyCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyBody: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: colors.accentStrong,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
