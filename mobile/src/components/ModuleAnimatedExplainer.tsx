import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { AppThemeColors } from '../lib/design';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function ModuleAnimatedExplainer({ title }: { title?: string }) {
  const styles = useThemedStyles(createStyles);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const dotScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] });
  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return (
    <View style={styles.root} accessibilityRole="image" accessibilityLabel={title ?? 'Schéma animé du flux ABM vers MDM'}>
      <View style={styles.row}>
        <View style={styles.node}>
          <Text style={styles.nodeTitle}>Apple Business</Text>
          <Text style={styles.nodeSub}>Manager</Text>
        </View>
        <Animated.View style={[styles.dot, { opacity: dotOpacity, transform: [{ scale: dotScale }] }]} />
        <View style={styles.node}>
          <Text style={styles.nodeTitle}>Serveur MDM</Text>
          <Text style={styles.nodeSub}>Jamf / Intune</Text>
        </View>
        <Animated.View style={[styles.dot, { opacity: dotOpacity, transform: [{ scale: dotScale }] }]} />
        <View style={[styles.node, styles.nodeAccent]}>
          <Text style={[styles.nodeTitle, styles.nodeTitleLight]}>Appareil</Text>
          <Text style={[styles.nodeSub, styles.nodeSubLight]}>Supervisé</Text>
        </View>
      </View>
      <Text style={styles.caption}>
        Flux simplifié : achat ABM → assignation MDM → enrôlement ADE à l&apos;assistant de configuration.
      </Text>
    </View>
  );
}

const createStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    root: {
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgSoft,
      gap: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    node: {
      flex: 1,
      minHeight: 72,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    nodeAccent: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    nodeTitle: {
      color: colors.fg,
      fontWeight: '800',
      fontSize: 11,
      textAlign: 'center',
    },
    nodeTitleLight: {
      color: '#fff',
    },
    nodeSub: {
      color: colors.muted,
      fontSize: 10,
      marginTop: 2,
      textAlign: 'center',
    },
    nodeSubLight: {
      color: 'rgba(255,255,255,0.85)',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.accent,
    },
    caption: {
      color: colors.muted,
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 17,
    },
  });
