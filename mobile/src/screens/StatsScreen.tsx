import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { StatCard } from '../components/StatCard';
import type { AppTabParamList } from '../navigation/types';
import { useSession } from '../state/SessionContext';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import { getCategorySummaries, getPeakWindowLabel, getPeriodTotals } from '../utils/analytics';
import { formatCurrencyVnd } from '../utils/format';

type Props = BottomTabScreenProps<AppTabParamList, 'Stats'>;

export function StatsScreen(_: Props) {
  const { expenses } = useSession();
  const totals = getPeriodTotals(expenses);
  const categorySummaries = getCategorySummaries(expenses);
  const peakWindowLabel = getPeakWindowLabel(expenses);

  return (
    <ScreenShell>
      <Text style={styles.heading}>Thong ke</Text>
      <Text style={styles.subheading}>
        Tong hop chi tieu theo ngay, tuan, thang va nhin nhanh danh muc chi nhieu nhat.
      </Text>

      <View style={styles.statsRow}>
        <StatCard label="Hom nay" value={formatCurrencyVnd(totals.day)} />
        <StatCard label="Thang nay" value={formatCurrencyVnd(totals.month)} tone="success" />
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightEyebrow}>Simple insight</Text>
        <Text style={styles.insightTitle}>Khung gio chi tieu noi bat</Text>
        <Text style={styles.insightBody}>{peakWindowLabel}</Text>
      </View>

      <Text style={styles.sectionTitle}>Top categories</Text>
      {categorySummaries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Chua co du lieu de thong ke. Hay them vai khoan chi dau tien.</Text>
        </View>
      ) : (
        categorySummaries.map((summary) => (
          <View key={summary.categoryId} style={styles.categoryRow}>
            <View style={styles.categoryTextWrap}>
              <View style={[styles.colorDot, { backgroundColor: summary.color }]} />
              <View>
                <Text style={styles.categoryLabel}>{summary.label}</Text>
                <Text style={styles.categoryMeta}>{summary.count} khoan chi</Text>
              </View>
            </View>
            <Text style={styles.categoryAmount}>{formatCurrencyVnd(summary.amount)}</Text>
          </View>
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  insightCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  insightEyebrow: {
    color: colors.textSoft,
    fontSize: typography.eyebrow,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  insightTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  insightBody: {
    color: colors.textSecondary,
    fontSize: typography.bodyLarge,
    lineHeight: 23,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  emptyCard: {
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  categoryTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryLabel: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: '600',
  },
  categoryMeta: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  categoryAmount: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    marginLeft: spacing.md,
  },
});
