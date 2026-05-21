import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { shouldShowStreakNav } from '../lib/streak-nav-badge';
import { useStreakNavDays } from '../hooks/useStreakNav';

export function StreakNavBadge() {
  const { colors } = useAppTheme();
  const currentDays = useStreakNavDays();

  if (!shouldShowStreakNav(currentDays)) return null;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.demoBannerBg,
          borderColor: colors.demoBannerBorder,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Série d'apprentissage : ${currentDays} jour${currentDays > 1 ? 's' : ''}`}
    >
      <Text style={styles.icon} accessibilityElementsHidden>
        {'\u{1F525}'}
      </Text>
      <Text style={[styles.days, { color: colors.demoBannerText }]}>{currentDays}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  icon: {
    fontSize: 13,
    lineHeight: 16,
  },
  days: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
});
