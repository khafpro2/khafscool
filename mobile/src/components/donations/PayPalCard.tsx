import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppThemeColors } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { getDonationPaypalUrl } from '../../lib/donation-paypal';

function PayPalWordmark() {
  return (
    <Text style={{ fontWeight: '800', fontSize: 15, letterSpacing: -0.3 }}>
      <Text style={{ color: '#003087' }}>Pay</Text>
      <Text style={{ color: '#009cde' }}>Pal</Text>
    </Text>
  );
}

export function PayPalCard() {
  const styles = useThemedStyles(createStyles);
  const paypalUrl = getDonationPaypalUrl();

  function openPayPalDonation() {
    if (!paypalUrl) return;
    void Linking.openURL(paypalUrl);
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>Don via PayPal</Text>
        <PayPalWordmark />
      </View>
      <Text style={styles.title}>PayPal (don volontaire)</Text>
      <Text style={styles.body}>
        Don sécurisé via PayPal — montant libre, sans abonnement. MDM Academy reste 100 % gratuite
        pour tous les parcours.
      </Text>

      {paypalUrl ? (
        <>
          <Pressable style={styles.primaryButton} onPress={openPayPalDonation}>
            <Text style={styles.primaryButtonText}>Donner avec PayPal</Text>
          </Pressable>
          <Text style={styles.hint}>Ouverture dans le navigateur — vous choisissez le montant sur PayPal.</Text>
        </>
      ) : (
        <View style={styles.unavailableBox}>
          <Text style={styles.unavailableTitle}>PayPal bientôt disponible</Text>
          <Text style={styles.hint}>
            Utilisez la carte bancaire ou le virement SEPA en attendant.
          </Text>
        </View>
      )}
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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
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
    unavailableBox: {
      marginTop: 14,
      padding: 12,
      borderRadius: colors.radiusMd,
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unavailableTitle: { color: colors.fg, fontWeight: '800', fontSize: 14 },
  });
}
