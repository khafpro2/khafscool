import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WEB_URL } from '../../config';
import type { AppThemeColors } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export function CardPaymentCard() {
  const styles = useThemedStyles(createStyles);

  function openCardCheckout() {
    void Linking.openURL(`${WEB_URL}/soutenir#carte`);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Don par carte bancaire</Text>
      <Text style={styles.title}>Visa, Mastercard et autres cartes</Text>
      <Text style={styles.body}>
        Paiement sécurisé via Stripe Checkout — don unique, sans abonnement. MDM Academy reste 100 %
        gratuite pour tous les parcours.
      </Text>
      <View style={styles.brandsRow} accessibilityElementsHidden importantForAccessibility="no">
        <Text style={styles.brandPill}>Visa</Text>
        <Text style={styles.brandPill}>Mastercard</Text>
        <Text style={styles.brandPill}>Amex</Text>
      </View>
      <Pressable style={styles.primaryButton} onPress={openCardCheckout}>
        <Text style={styles.primaryButtonText}>Donner par carte bancaire</Text>
      </Pressable>
      <Text style={styles.hint}>Redirection vers la page web /soutenir (Stripe Checkout).</Text>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    eyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    title: { color: colors.fg, fontSize: 18, fontWeight: '800', marginTop: 6 },
    body: { color: colors.muted, marginTop: 8, lineHeight: 21, fontSize: 14 },
    brandsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    brandPill: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: colors.radiusPill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    primaryButton: {
      marginTop: 14,
      alignSelf: 'stretch',
      backgroundColor: colors.accent,
      borderRadius: colors.radiusMd,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, textAlign: 'center' },
    hint: { color: colors.muted, marginTop: 10, fontSize: 12, lineHeight: 18 },
  });
}
