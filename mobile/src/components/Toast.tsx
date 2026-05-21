import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import type { AppThemeColors } from '../lib/design';
import { dismissToast, getToasts, subscribeToasts, type ToastKind, type ToastRecord } from '../lib/toast-store';

const KIND_META: Record<
  ToastKind,
  { icon: string; label: string; accentKey: 'accent' | 'warning' | 'success' }
> = {
  points: { icon: '\u2B50', label: 'Points gagnés', accentKey: 'warning' },
  badge: { icon: '\u{1F3C6}', label: 'Badge débloqué', accentKey: 'success' },
  quest: { icon: '\u{1F3AF}', label: 'Quête accomplie', accentKey: 'accent' },
};

export function Toaster() {
  const insets = useSafeAreaInsets();
  const { colors, resolved } = useAppTheme();
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);

  if (!toasts.length) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.viewport, { top: insets.top + 8 }]}
      accessibilityLiveRegion="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} colors={colors} isDark={resolved === 'dark'} />
      ))}
    </View>
  );
}

function ToastItem({
  toast,
  colors,
  isDark,
}: {
  toast: ToastRecord;
  colors: AppThemeColors;
  isDark: boolean;
}) {
  const meta = KIND_META[toast.kind];
  const accent = colors[meta.accentKey];
  const translateY = useRef(new Animated.Value(-16)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: isDark ? '#1e293b' : colors.bgSoft,
          borderColor: isDark ? '#334155' : colors.border,
          shadowColor: isDark ? '#000000' : '#0f172a',
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessibilityRole="text"
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
        <Text style={styles.icon}>{meta.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.eyebrow, { color: accent }]}>{meta.label}</Text>
        <Text style={[styles.title, { color: colors.fg }]}>{toast.title}</Text>
        {toast.body ? (
          <Text style={[styles.message, { color: colors.muted }]} numberOfLines={3}>
            {toast.body}
          </Text>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer la notification"
        hitSlop={8}
        onPress={() => dismissToast(toast.id)}
        style={styles.dismiss}
      >
        <Text style={[styles.dismissText, { color: colors.muted }]}>×</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  body: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  title: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  message: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  dismiss: { padding: 2 },
  dismissText: { fontSize: 22, lineHeight: 22, fontWeight: '300' },
});
