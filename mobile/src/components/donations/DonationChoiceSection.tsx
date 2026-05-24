import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  buildDonationBankReference,
  buildPaypalUrlWithAmount,
  formatDonationEuros,
  PRESET_DONATION_AMOUNTS_CENTS,
} from '@ama/shared/donation-amounts';
import { buildBankTransferShareText } from '@ama/shared/donation-bank';
import { DEFAULT_DONATION_PAYPAL_REFERENCE } from '@ama/shared/donation-methods';
import { CONTACT_MAILTO, WEB_URL } from '../../config';
import { useAppTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { AppThemeColors } from '../../lib/design';
import { formatIbanDisplay, getDonationBankDetails } from '../../lib/donation-bank';
import { getDonationPaypalUrl } from '../../lib/donation-paypal';
import {
  createDonationCheckout,
  fetchDonationStatus,
  type DonationStatusResponse,
} from '../../services/donations';

import { DONATION_PAYMENT_MODES, type DonationPaymentModeId } from '@ama/shared/donation-payment-modes';

type PaymentMode = DonationPaymentModeId;

type DonationChoiceSectionProps = {
  initialAmountEuros?: string;
  initialPaymentMode?: DonationPaymentModeId;
};

function resolveInitialAmountCents(initialAmountEuros?: string): {
  selectedAmount: number;
  useCustomAmount: boolean;
  customAmount: string;
} {
  if (!initialAmountEuros?.trim()) {
    return { selectedAmount: 1000, useCustomAmount: false, customAmount: '' };
  }
  const parsed = Number.parseInt(initialAmountEuros.trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1000) {
    return { selectedAmount: 1000, useCustomAmount: false, customAmount: '' };
  }
  const cents = parsed * 100;
  if ((PRESET_DONATION_AMOUNTS_CENTS as readonly number[]).includes(cents)) {
    return { selectedAmount: cents, useCustomAmount: false, customAmount: '' };
  }
  return { selectedAmount: 1000, useCustomAmount: true, customAmount: String(parsed) };
}

export function DonationChoiceSection({
  initialAmountEuros,
  initialPaymentMode,
}: DonationChoiceSectionProps) {
  const initialAmount = resolveInitialAmountCents(initialAmountEuros);
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount.selectedAmount);
  const [customAmount, setCustomAmount] = useState(initialAmount.customAmount);
  const [useCustomAmount, setUseCustomAmount] = useState(initialAmount.useCustomAmount);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(initialPaymentMode ?? 'carte');
  const [donationStatus, setDonationStatus] = useState<DonationStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submittingCard, setSubmittingCard] = useState(false);

  useEffect(() => {
    void fetchDonationStatus()
      .then(setDonationStatus)
      .finally(() => setLoadingStatus(false));
  }, []);

  const checkoutEnabled = donationStatus?.mode === 'live';
  const fallbackUrl = donationStatus?.fallbackUrl;
  const paypalConfigured = donationStatus?.paypal?.status === 'configured';

  const bankDetails = getDonationBankDetails();
  const paypalBaseUrl = getDonationPaypalUrl();

  const effectiveAmountCents = useMemo(() => {
    if (!useCustomAmount) return selectedAmount;
    const parsed = Number.parseInt(customAmount, 10);
    if (!Number.isFinite(parsed)) return null;
    return parsed * 100;
  }, [customAmount, selectedAmount, useCustomAmount]);

  const formattedAmount =
    effectiveAmountCents != null ? formatDonationEuros(effectiveAmountCents) : null;

  const bankReference =
    effectiveAmountCents != null
      ? buildDonationBankReference(bankDetails.paymentReference, effectiveAmountCents)
      : bankDetails.paymentReference;

  const paypalLink = useMemo(() => {
    if (!paypalBaseUrl) return null;
    if (effectiveAmountCents == null) {
      return { url: paypalBaseUrl, amountInUrl: false };
    }
    return buildPaypalUrlWithAmount(paypalBaseUrl, effectiveAmountCents);
  }, [effectiveAmountCents, paypalBaseUrl]);

  function openCardCheckout() {
    const amountQuery =
      effectiveAmountCents != null ? `?amount=${effectiveAmountCents / 100}` : '';
    if (fallbackUrl) {
      void Linking.openURL(fallbackUrl);
      return;
    }
    void Linking.openURL(`${WEB_URL}/soutenir${amountQuery}#carte`);
  }

  async function handleCardPayment() {
    if (effectiveAmountCents == null || effectiveAmountCents < 100) {
      Alert.alert('Montant invalide', 'Indique un montant d’au moins 1 €.');
      return;
    }

    if (!checkoutEnabled) {
      openCardCheckout();
      return;
    }

    setSubmittingCard(true);
    try {
      const response = await createDonationCheckout(effectiveAmountCents);
      if (response.checkoutUrl) {
        await Linking.openURL(response.checkoutUrl);
        return;
      }
      openCardCheckout();
    } catch {
      Alert.alert(
        'Paiement indisponible',
        'Impossible d’ouvrir Stripe pour le moment. Réessaie ou choisis PayPal / virement.'
      );
    } finally {
      setSubmittingCard(false);
    }
  }

  function openPayPal() {
    if (!paypalLink) return;
    void Linking.openURL(paypalLink.url);
  }

  async function shareBankDetails() {
    await Share.share({
      message: buildBankTransferShareText({ ...bankDetails, paymentReference: bankReference }),
    });
  }

  function openWebVirement() {
    const amountQuery =
      effectiveAmountCents != null ? `?amount=${effectiveAmountCents / 100}` : '';
    void Linking.openURL(`${WEB_URL}/soutenir${amountQuery}#virement`);
  }

  function openContactEmail() {
    void Linking.openURL(CONTACT_MAILTO);
  }

  return (
    <View style={styles.root}>
      {loadingStatus ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.hint}>Chargement des options de don…</Text>
        </View>
      ) : null}

      <Text style={styles.stepTitle}>1. Choisissez un montant</Text>
      <View style={styles.amountRow}>
        {PRESET_DONATION_AMOUNTS_CENTS.map((amount) => {
          const selected = !useCustomAmount && selectedAmount === amount;
          return (
            <Pressable
              key={amount}
              style={[styles.amountChip, selected && styles.chipSelected]}
              onPress={() => {
                setUseCustomAmount(false);
                setSelectedAmount(amount);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.amountChipText, selected && styles.chipTextSelected]}>
                {formatDonationEuros(amount)}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          style={[styles.amountChip, useCustomAmount && styles.chipSelected]}
          onPress={() => setUseCustomAmount(true)}
          accessibilityRole="button"
          accessibilityState={{ selected: useCustomAmount }}
        >
          <Text style={[styles.amountChipText, useCustomAmount && styles.chipTextSelected]}>Autre</Text>
        </Pressable>
      </View>

      {useCustomAmount ? (
        <TextInput
          style={styles.customInput}
          keyboardType="number-pad"
          placeholder="Montant libre (€)"
          placeholderTextColor={colors.muted}
          value={customAmount}
          onChangeText={setCustomAmount}
        />
      ) : null}

      <Text style={styles.stepTitle}>2. Choisissez un mode de paiement</Text>
      <View style={styles.modeRow} accessibilityRole="radiogroup" accessibilityLabel="Mode de paiement">
        {DONATION_PAYMENT_MODES.map(({ id, icon, label, hint }) => {
          const selected = paymentMode === id;
          return (
            <Pressable
              key={id}
              style={[styles.modeChip, selected && styles.chipSelected]}
              onPress={() => setPaymentMode(id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
            >
              {selected ? <Text style={styles.modeCheck}>✓</Text> : null}
              <Text style={styles.modeIcon}>{icon}</Text>
              <Text style={[styles.modeLabel, selected && styles.chipTextSelected]}>{label}</Text>
              <Text style={styles.modeHint}>{hint}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.stepTitle}>
        3. Finalisez{formattedAmount ? ` — ${formattedAmount}` : ''}
      </Text>

      {paymentMode === 'carte' ? (
        <View style={styles.actionCard}>
          <Text style={styles.actionEyebrow}>Carte bancaire (Stripe)</Text>
          <Text style={styles.actionBody}>
            {checkoutEnabled
              ? 'Paiement sécurisé via Stripe Checkout — don unique.'
              : donationStatus?.message ??
                'Paiement par carte via la page web Soutenir ou lien externe.'}
          </Text>
          <Pressable
            style={[styles.primaryButton, submittingCard ? styles.buttonDisabled : null]}
            onPress={() => void handleCardPayment()}
            disabled={submittingCard}
          >
            <Text style={styles.primaryButtonText}>
              {submittingCard
                ? 'Ouverture Stripe…'
                : formattedAmount
                  ? `Payer ${formattedAmount} par carte`
                  : 'Payer par carte'}
            </Text>
          </Pressable>
          <Text style={styles.hint}>
            {checkoutEnabled
              ? 'Redirection vers Stripe Checkout dans le navigateur.'
              : 'Redirection vers la page web /soutenir.'}
          </Text>
        </View>
      ) : null}

      {paymentMode === 'paypal' ? (
        <View style={styles.actionCard}>
          <Text style={styles.actionEyebrow}>PayPal</Text>
          <Text style={styles.actionBody}>
            {paypalConfigured
              ? `Don sécurisé via PayPal — montant ${formattedAmount ?? 'libre'}.`
              : 'PayPal non configuré — utilise la page web Soutenir.'}
          </Text>
          {paypalLink && paypalConfigured ? (
            <>
              <Pressable style={styles.primaryButton} onPress={openPayPal}>
                <Text style={styles.primaryButtonText}>Ouvrir PayPal</Text>
              </Pressable>
              <Text style={styles.hint}>
                {paypalLink.amountInUrl && formattedAmount
                  ? `Montant ${formattedAmount} pré-rempli sur PayPal.`
                  : 'Montant libre sur PayPal.'}{' '}
                Référence : « {DEFAULT_DONATION_PAYPAL_REFERENCE} ».
              </Text>
            </>
          ) : (
            <Text style={styles.hint}>PayPal bientôt disponible — utilisez carte ou virement.</Text>
          )}
        </View>
      ) : null}

      {paymentMode === 'virement' ? (
        <View style={styles.actionCard}>
          <Text style={styles.actionEyebrow}>Virement SEPA</Text>
          <Text style={styles.actionBody}>IBAN Revolut — référence : {bankReference}</Text>
          <View style={styles.bankField}>
            <Text style={styles.bankLabel}>IBAN</Text>
            <Text style={styles.bankValue}>{formatIbanDisplay(bankDetails.iban)}</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => void shareBankDetails()}>
            <Text style={styles.primaryButtonText}>Copier IBAN</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={openWebVirement}>
            <Text style={styles.secondaryButtonText}>Voir sur le web</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={openContactEmail}>
            <Text style={styles.secondaryButtonText}>Assistance</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    root: { gap: 12 },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 4,
    },
    stepTitle: {
      color: colors.fg,
      fontSize: 15,
      fontWeight: '800',
      marginTop: 4,
    },
    amountRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    modeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    amountChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: colors.radiusMd,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.bgSoft,
    },
    modeChip: {
      position: 'relative',
      flex: 1,
      minWidth: 100,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: colors.radiusMd,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.bgSoft,
      alignItems: 'center',
    },
    chipSelected: {
      borderColor: '#2563EB',
      backgroundColor: colors.accentSoft,
    },
    modeCheck: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#2563EB',
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
      textAlign: 'center',
      lineHeight: 18,
      overflow: 'hidden',
    },
    amountChipText: {
      color: colors.fg,
      fontWeight: '800',
      fontSize: 15,
    },
    chipTextSelected: {
      color: colors.accent,
    },
    modeIcon: { fontSize: 20, marginBottom: 4 },
    modeLabel: {
      color: colors.fg,
      fontWeight: '800',
      fontSize: 13,
      textAlign: 'center',
    },
    modeHint: {
      color: colors.muted,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 2,
      lineHeight: 15,
    },
    customInput: {
      marginTop: 4,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: colors.radiusMd,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      color: colors.fg,
      fontSize: 15,
      maxWidth: 180,
    },
    actionCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionEyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    actionBody: { color: colors.muted, marginTop: 8, lineHeight: 21, fontSize: 14 },
    primaryButton: {
      marginTop: 14,
      alignSelf: 'stretch',
      backgroundColor: colors.accent,
      borderRadius: colors.radiusMd,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    buttonDisabled: { opacity: 0.65 },
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
    hint: { color: colors.muted, marginTop: 10, fontSize: 12, lineHeight: 18 },
    bankField: {
      marginTop: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    bankLabel: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    bankValue: { color: colors.fg, fontWeight: '700', marginTop: 4, fontSize: 15 },
  });
}
