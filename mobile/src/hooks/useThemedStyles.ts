import { useMemo } from 'react';
import type { StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import type { AppThemeColors } from '../lib/design';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: AppThemeColors) => T
): T {
  const { colors } = useAppTheme();
  return useMemo(() => factory(colors), [colors]);
}
