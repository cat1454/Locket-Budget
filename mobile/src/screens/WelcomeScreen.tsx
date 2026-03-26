import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import type { AuthStackParamList } from '../navigation/types';
import { elevation, radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenShell>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Phase 1 MVP</Text>
      </View>

      <Text style={styles.heading}>Locket Budget</Text>
      <Text style={styles.subheading}>
        Luu chi tieu nhu mot nhat ky hinh anh, nhe nhu Locket va de quay lai moi ngay.
      </Text>

      <LinearGradient colors={['#F8D9B2', '#EF7D57']} style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Photo-first expense diary</Text>
        <Text style={styles.heroTitle}>Nhanh de luu, de nho, de tiet kiem hon.</Text>
        <Text style={styles.heroBody}>
          App da co local auth, expense CRUD va timeline thong ke chay tren du lieu that.
        </Text>
      </LinearGradient>

      <View style={styles.featureList}>
        <Text style={styles.featureItem}>- Dang ky va dang nhap bang local session.</Text>
        <Text style={styles.featureItem}>- Them khoan chi co anh, so tien, note va danh muc.</Text>
        <Text style={styles.featureItem}>- Timeline, detail, sua, xoa va thong ke da noi chung state.</Text>
      </View>

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Dang nhap</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Register')} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Tao tai khoan moi</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: typography.eyebrow,
    fontWeight: '700',
  },
  heading: {
    color: colors.textPrimary,
    fontSize: typography.display,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  subheading: {
    color: colors.textSecondary,
    fontSize: typography.bodyLarge,
    lineHeight: 25,
    marginBottom: spacing.xl,
  },
  heroCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...elevation,
  },
  heroEyebrow: {
    color: colors.white,
    fontSize: typography.eyebrow,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  heroBody: {
    color: colors.white,
    fontSize: typography.body,
    lineHeight: 22,
  },
  featureList: {
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  featureItem: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  primaryButton: {
    borderRadius: radius.md,
    backgroundColor: colors.accentStrong,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: '600',
  },
});
