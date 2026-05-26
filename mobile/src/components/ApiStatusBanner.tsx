import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL, WEB_URL } from '../config';
import { useAppTheme } from '../context/ThemeContext';
import { useApiUnavailable } from '../lib/api-health';

export function ApiStatusBanner() {
  const unavailable = useApiUnavailable();
  const { resolved } = useAppTheme();

  if (!unavailable) return null;

  const bannerStyles = resolved === 'dark'
    ? {
        backgroundColor: '#3f1d1d',
        borderColor: '#7f1d1d',
        textColor: '#fca5a5',
      }
    : {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
        textColor: '#b91c1c',
      };

  async function openDiagnostics() {
    await WebBrowser.openBrowserAsync(`${WEB_URL}/diagnostics`);
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        {
          backgroundColor: bannerStyles.backgroundColor,
          borderBottomColor: bannerStyles.borderColor,
        },
      ]}
    >
      <View style={styles.inner} accessibilityRole="alert">
        <Text style={[styles.message, { color: bannerStyles.textColor }]}>
          API indisponible — vérifiez EXPO_PUBLIC_API_URL ({API_URL})
        </Text>
        <Pressable
          onPress={() => void openDiagnostics()}
          accessibilityRole="link"
          accessibilityLabel="Ouvrir les diagnostics"
        >
          <Text style={[styles.link, { color: bannerStyles.textColor }]}>Diagnostics</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  link: {
    fontSize: 12,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
