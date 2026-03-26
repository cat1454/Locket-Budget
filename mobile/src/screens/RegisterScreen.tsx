import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import type { AuthStackParamList } from '../navigation/types';
import { useSession } from '../state/SessionContext';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useSession();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const result = await register(displayName, email, password);

    if (!result.ok) {
      setError(result.error ?? 'Dang ky that bai.');
    }

    setIsSubmitting(false);
  }

  return (
    <ScreenShell>
      <Text style={styles.heading}>Tao tai khoan</Text>
      <Text style={styles.subheading}>
        Phase 1 da cho phep tao tai khoan local de demo luong auth, session va quan ly chi tieu.
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Ten hien thi</Text>
        <TextInput
          onChangeText={setDisplayName}
          placeholder="Linh"
          placeholderTextColor={colors.textSoft}
          style={styles.input}
          value={displayName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="linh@example.com"
          placeholderTextColor={colors.textSoft}
          style={styles.input}
          value={email}
        />

        <Text style={styles.label}>Mat khau</Text>
        <TextInput
          onChangeText={setPassword}
          placeholder="It nhat 6 ky tu"
          placeholderTextColor={colors.textSoft}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          disabled={isSubmitting}
          onPress={() => {
            void handleSubmit();
          }}
          style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Dang ky</Text>
          )}
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
        <Text style={styles.linkText}>Da co tai khoan? Quay ve dang nhap</Text>
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
    marginBottom: spacing.xl,
  },
  formCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
  errorText: {
    color: colors.accentStrong,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  primaryButton: {
    borderRadius: radius.md,
    backgroundColor: colors.accentStrong,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: colors.accentStrong,
    fontSize: typography.body,
    fontWeight: '600',
  },
});
