import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExpenseCard } from '../components/ExpenseCard';
import { ScreenShell } from '../components/ScreenShell';
import { StatCard } from '../components/StatCard';
import type { AppTabParamList, RootStackParamList } from '../navigation/types';
import { useSession } from '../state/SessionContext';
import { elevation, radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import { getHeroSummary, getPeriodTotals, getRecentExpenses } from '../utils/analytics';
import { formatCurrencyVnd } from '../utils/format';

type Props = BottomTabScreenProps<AppTabParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user, expenses } = useSession();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const totals = getPeriodTotals(expenses);
  const recentExpenses = getRecentExpenses(expenses, 2);
  const heroSummary = getHeroSummary(expenses);

  return (
    <ScreenShell>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.displayName ?? 'ban'}</Text>
          <Text style={styles.caption}>Photo-first dashboard cho chi tieu hang ngay.</Text>
        </View>

        <LinearGradient colors={user?.avatarGradient ?? ['#F4BA78', '#EF7D57']} style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.displayName.slice(0, 1).toUpperCase() ?? 'U'}</Text>
        </LinearGradient>
      </View>

      <LinearGradient colors={['#2F241E', '#5C4332']} style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Today snapshot</Text>
        <Text style={styles.heroAmount}>{formatCurrencyVnd(totals.day)}</Text>
        <Text style={styles.heroBody}>
          {totals.entriesToday} khoan chi hom nay. {heroSummary}
        </Text>

        <Pressable
          onPress={() => rootNavigation?.navigate('AddExpense')}
          style={styles.heroButton}
        >
          <Text style={styles.heroButtonText}>Them khoan chi</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard
          label="Hom nay"
          value={formatCurrencyVnd(totals.day)}
          hint={`${totals.entriesToday} khoan chi`}
        />
        <StatCard label="Tuan nay" value={formatCurrencyVnd(totals.week)} tone="accent" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent journal</Text>
        <Pressable onPress={() => navigation.navigate('Timeline')}>
          <Text style={styles.sectionAction}>Xem tat ca</Text>
        </Pressable>
      </View>

      {recentExpenses.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Chua co khoan chi nao</Text>
          <Text style={styles.emptyBody}>
            Bat dau bang mot tam anh va so tien de mo timeline chi tieu cua ban.
          </Text>
          <Pressable
            onPress={() => rootNavigation?.navigate('AddExpense')}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Them khoan chi dau tien</Text>
          </Pressable>
        </View>
      ) : (
        recentExpenses.map((expense) => (
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: typography.display,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: '800',
  },
  heroCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...elevation,
  },
  heroEyebrow: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: typography.eyebrow,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  heroAmount: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  heroBody: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: typography.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  heroButtonText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },
  sectionAction: {
    color: colors.accentStrong,
    fontSize: typography.body,
    fontWeight: '700',
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
