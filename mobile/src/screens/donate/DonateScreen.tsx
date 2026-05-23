import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BankTransferCard } from '../../components/donations/BankTransferCard';
import { CardPaymentCard } from '../../components/donations/CardPaymentCard';
import { PayPalCard } from '../../components/donations/PayPalCard';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '../../config';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { AppThemeColors } from '../../lib/design';
export function DonateScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  function openContactEmail() {
    void Linking.openURL(CONTACT_MAILTO);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>{'\u{1F49A}'} Soutenir le projet</Text>
        <Text style={styles.heroTitle}>MDM Academy reste 100 % gratuite</Text>
        <Text style={styles.heroText}>
          Un don volontaire aide l’hébergement et la maintenance — sans jamais limiter l’accès aux parcours,
          badges ou certificats.
        </Text>
      </View>

      <Text style={styles.sectionHint}>
        Trois moyens de soutenir le projet : carte bancaire (Stripe), PayPal ou virement SEPA.
      </Text>

      <CardPaymentCard />
      <PayPalCard />
      <BankTransferCard />

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>Une question sur les dons ?</Text>
        <Text style={styles.footerText}>
          Écrivez-nous à {CONTACT_EMAIL} pour un reçu, une question ou un signalement.
        </Text>
        <Pressable style={styles.secondaryButton} onPress={openContactEmail}>
          <Text style={styles.secondaryButtonText}>Nous contacter</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 24, paddingBottom: 40 },
    backButton: { marginBottom: 12 },
    backText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
    hero: {
      backgroundColor: colors.accentSoft,
      borderRadius: colors.radiusLg,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroEyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    heroTitle: {
      color: colors.fg,
      fontSize: 22,
      fontWeight: '800',
      marginTop: 8,
      lineHeight: 28,
    },
    heroText: {
      color: colors.muted,
      marginTop: 10,
      lineHeight: 21,
      fontSize: 15,
    },
    sectionHint: {
      color: colors.muted,
      marginBottom: 16,
      lineHeight: 21,
      fontSize: 14,
    },
    footerCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    footerTitle: { color: colors.fg, fontSize: 16, fontWeight: '800' },
    footerText: { color: colors.muted, marginTop: 8, lineHeight: 21, fontSize: 14 },
    secondaryButton: {
      marginTop: 14,
      alignSelf: 'flex-start',
      backgroundColor: colors.bg,
      borderRadius: colors.radiusMd,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: { color: colors.fg, fontWeight: '800', fontSize: 15 },
  });
}
