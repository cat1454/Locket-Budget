import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { foundationDecisions, phaseOnePriority, phaseZeroOutputs } from '../data/projectInfo';
import type { AppTabParamList } from '../navigation/types';
import { useSession } from '../state/SessionContext';
import { getPeriodTotals } from '../utils/analytics';
import { formatCurrencyVnd, formatShortDate } from '../utils/format';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';

type Props = BottomTabScreenProps<AppTabParamList, 'Profile'>;

export function ProfileScreen(_: Props) {
  const { user, expenses, signOut } = useSession();
  const totals = getPeriodTotals(expenses);

  return (
    <ScreenShell>
      <LinearGradient colors={user?.avatarGradient ?? ['#F4BA78', '#EF7D57']} style={styles.profileCard}>
        <Text style={styles.profileEyebrow}>Current user</Text>
        <Text style={styles.profileName}>{user?.displayName ?? 'Guest'}</Text>
        <Text style={styles.profileEmail}>{user?.email ?? 'No email'}</Text>
        <Text style={styles.profileMeta}>
          Tham gia tu {user ? formatShortDate(user.joinedAt) : '--'} | {expenses.length} khoan chi
        </Text>
      </LinearGradient>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Thang nay</Text>
          <Text style={styles.summaryValue}>{formatCurrencyVnd(totals.month)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Hom nay</Text>
          <Text style={styles.summaryValue}>{formatCurrencyVnd(totals.day)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Phase 0 outputs</Text>
      <View style={styles.blockCard}>
        {phaseZeroOutputs.map((item) => (
          <Text key={item} style={styles.listItem}>
            - {item}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Decisions that are locked</Text>
      <View style={styles.blockCard}>
        {foundationDecisions.map((decision) => (
          <View key={decision.label} style={styles.decisionRow}>
            <Text style={styles.decisionLabel}>{decision.label}</Text>
            <Text style={styles.decisionValue}>{decision.value}</Text>
            <Text style={styles.decisionNote}>{decision.note}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Phase 1 focus</Text>
      <View style={styles.blockCard}>
        {phaseOnePriority.map((item) => (
          <Text key={item} style={styles.listItem}>
            - {item}
          </Text>
        ))}
      </View>

      <Pressable
        onPress={() => {
          void signOut();
        }}
        style={styles.signOutButton}
      >
        <Text style={styles.signOutText}>Dang xuat</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileEyebrow: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: typography.eyebrow,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  profileName: {
    color: colors.white,
    fontSize: typography.display,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  profileEmail: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    marginBottom: spacing.sm,
  },
  profileMeta: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: typography.body,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryLabel: {
    color: colors.textSoft,
    fontSize: typography.eyebrow,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  blockCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  listItem: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  decisionRow: {
    marginBottom: spacing.md,
  },
  decisionLabel: {
    color: colors.textSoft,
    fontSize: typography.eyebrow,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  decisionValue: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  decisionNote: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
  },
  signOutButton: {
    borderRadius: radius.md,
    backgroundColor: colors.accentStrong,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
});
