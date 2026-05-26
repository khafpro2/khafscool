import React from 'react';
import { Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { buildBankTransferShareText } from '@ama/shared/donation-bank';
import { CONTACT_MAILTO, WEB_URL } from '../../config';
import type { AppThemeColors } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { formatIbanDisplay, getDonationBankDetails } from '../../lib/donation-bank';

function BankField({
  label,
  value,
  onShare,
  styles,
}: {
  label: string;
  value: string;
  onShare: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldText}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
      <Pressable style={styles.copyButton} onPress={onShare}>
        <Text style={styles.copyButtonText}>Partager</Text>
      </Pressable>
    </View>
  );
}

export function BankTransferCard() {
  const styles = useThemedStyles(createStyles);
  const details = getDonationBankDetails();
  const ibanDisplay = formatIbanDisplay(details.iban);

  async function shareValue(label: string, value: string) {
    await Share.share({ message: `${label} : ${value}` });
  }

  async function shareAllDetails() {
    await Share.share({ message: buildBankTransferShareText(details) });
  }

  function openWebVirement() {
    void Linking.openURL(`${WEB_URL}/soutenir#virement`);
  }

  function openContactEmail() {
    void Linking.openURL(CONTACT_MAILTO);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Don par virement</Text>
      <Text style={styles.title}>Virement bancaire (SEPA)</Text>
      <Text style={styles.body}>
        Don volontaire — la plateforme reste 100 % gratuite pour tous les parcours et certificats.
      </Text>

      <BankField
        label="Bénéficiaire"
        value={details.beneficiary}
        onShare={() => void shareValue('Bénéficiaire', details.beneficiary)}
        styles={styles}
      />
      <BankField
        label="IBAN"
        value={ibanDisplay}
        onShare={() => void shareValue('IBAN', details.iban)}
        styles={styles}
      />
      <BankField
        label="BIC / SWIFT"
        value={details.bic}
        onShare={() => void shareValue('BIC', details.bic)}
        styles={styles}
      />

      <View style={styles.fieldRow}>
        <View style={styles.fieldText}>
          <Text style={styles.fieldLabel}>Banque</Text>
          <Text style={styles.fieldValue}>{details.bankName}</Text>
          <Text style={styles.fieldHint}>{details.bankAddress}</Text>
        </View>
      </View>

      <BankField
        label="Référence libre"
        value={details.paymentReference}
        onShare={() => void shareValue('Référence', details.paymentReference)}
        styles={styles}
      />

      <Pressable style={styles.primaryButton} onPress={() => void shareAllDetails()}>
        <Text style={styles.primaryButtonText}>Partager toutes les coordonnées</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={openWebVirement}>
        <Text style={styles.secondaryButtonText}>Voir sur le web (/soutenir#virement)</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={openContactEmail}>
        <Text style={styles.secondaryButtonText}>Assistance</Text>
      </Pressable>
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
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    fieldText: { flex: 1, minWidth: 0 },
    fieldLabel: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    fieldValue: { color: colors.fg, fontWeight: '700', marginTop: 4, fontSize: 15 },
    fieldHint: { color: colors.muted, marginTop: 4, fontSize: 13, lineHeight: 18 },
    copyButton: {
      backgroundColor: colors.bg,
      borderRadius: colors.radiusMd,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    copyButtonText: { color: colors.fg, fontWeight: '800', fontSize: 13 },
    primaryButton: {
      marginTop: 14,
      alignSelf: 'stretch',
      backgroundColor: colors.accent,
      borderRadius: colors.radiusMd,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, textAlign: 'center' },
    secondaryButton: {
      marginTop: 10,
      alignSelf: 'stretch',
      backgroundColor: colors.bg,
      borderRadius: colors.radiusMd,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: { color: colors.fg, fontWeight: '800', fontSize: 14, textAlign: 'center' },
  });
}
