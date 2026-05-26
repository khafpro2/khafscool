import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useQuestNavPending } from '../hooks/useQuestNavPending';

export function QuestTabDot() {
  const { colors } = useAppTheme();
  const showBadge = useQuestNavPending();

  if (!showBadge) return null;

  return (
    <View
      style={[styles.dot, { backgroundColor: colors.accent, borderColor: colors.tabBarBg }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 9,
    height: 9,
    borderRadius: 999,
    borderWidth: 2,
  },
});
