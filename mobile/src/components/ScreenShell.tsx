import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../theme';
import { colors } from '../theme/colors';

interface ScreenShellProps extends PropsWithChildren {
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function ScreenShell({
  children,
  scroll = true,
  contentContainerStyle,
}: ScreenShellProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.scrollContent, contentContainerStyle]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFF7EE', '#F5EEE6']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.blobOne} />
      <View style={styles.blobTwo} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {content}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  blobOne: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(239, 125, 87, 0.14)',
  },
  blobTwo: {
    position: 'absolute',
    top: 220,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(122, 166, 217, 0.10)',
  },
});
