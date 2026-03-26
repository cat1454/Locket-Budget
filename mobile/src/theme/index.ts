import { DefaultTheme, type Theme } from '@react-navigation/native';
import { colors } from './colors';

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;

export const typography = {
  eyebrow: 13,
  body: 15,
  bodyLarge: 17,
  title: 22,
  display: 30,
} as const;

export const elevation = {
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 8,
} as const;

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    primary: colors.accent,
    border: colors.border,
    notification: colors.accentStrong,
  },
};
