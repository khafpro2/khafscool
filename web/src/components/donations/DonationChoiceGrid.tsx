'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildDonationBankReference,
  buildPaypalUrlWithAmount,
  formatDonationEuros,
  parseDonationAmountQuery,
  PRESET_DONATION_AMOUNTS_CENTS,
} from '@ama/shared/donation-amounts';
import { buildBankTransferShareText } from '@ama/shared/donation-bank';
import {
  DONATION_PAYMENT_MODES,
  isDonationPaymentModeId,
  type DonationPaymentModeId,
} from '@ama/shared/donation-payment-modes';
import { DEFAULT_DONATION_PAYPAL_REFERENCE } from '@ama/shared/donation-methods';
import { CardBrandIcons } from '@/components/donations/CardBrandIcons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createDonationCheckout, fetchDonationStatus } from '@/lib/api/client';
import type { DonationStatusResponse } from '@/lib/api/types';
import { getAccessToken } from '@/lib/auth';
import { AuthRequestError } from '@/lib/auth-errors';
import { getContactMailto } from '@/lib/contact';
import { formatIbanDisplay, getDonationBankDetails } from '@/lib/donation-bank';
import { getDonationPaypalUrl } from '@/lib/donation-paypal';

const DONATIONS_DOCS_URL =
  'https://github.com/khafpro2/khafscool/blob/main/docs/DONATIONS.md';

const DEFAULT_AMOUNTS = [...PRESET_DONATION_AMOUNTS_CENTS];

const DEFAULT_DONATION_STATUS: DonationStatusResponse = {
  mode: 'unavailable',
  stripe: { configured: false, checkoutEnabled: false },
  fallbackUrl: null,
  suggestedAmountsCents: DEFAULT_AMOUNTS,
  message: 'Bientôt disponible — merci pour votre intérêt !',
};

type PaymentMode = DonationPaymentModeId;

function StripeCheckoutSpinner() {
  return (
    <span
      aria-hidden
      style={{
        width: '1rem',
        height: '1rem',
        borderRadius: '50%',
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        animation: 'ama-spin 0.8s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

function stripeCheckoutErrorMessage(error: unknown): string {
  if (error instanceof AuthRequestError) {
    return error.message;
  }
  if (error instanceof Error) {
    if (error.message.startsWith('Erreur API') || error.message === 'Failed to fetch') {
      return 'Impossible d’ouvrir le paiement par carte pour le moment. Réessayez dans quelques instants ou choisissez PayPal / virement.';
    }
  }
  return 'Impossible d’ouvrir le paiement par carte. Réessayez plus tard ou contactez-nous.';
}

function PayPalWordmark() {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 800,
        fontSize: '0.95rem',
        letterSpacing: '-0.02em',
        color: '#003087',
      }}
    >
      Pay<span style={{ color: '#009cde' }}>Pal</span>
    </span>
  );
}

type CopyFieldProps = {
  label: string;
  value: string;
  copyValue?: string;
  copyLabel: string;
  testId?: string;
};

function CopyField({ label, value, copyValue, copyLabel, testId }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="donation-copy-field">
      <div className="donation-copy-field-text">
        <p className="donation-copy-field-label">{label}</p>
        <p className="donation-copy-field-value" data-testid={testId}>
          {value}
        </p>
      </div>
      <Button type="button" size="sm" variant="secondary" onClick={() => void handleCopy()}>
        {copied ? 'Copié !' : copyLabel}
      </Button>
    </div>
  );
}

function parseHashMode(hash: string): PaymentMode | null {
  const value = hash.replace(/^#/, '').toLowerCase();
  return isDonationPaymentModeId(value) ? value : null;
}

export function DonationChoiceGrid() {
  const [checkoutResult, setCheckoutResult] = useState<string | null>(null);
  const [status, setStatus] = useState<DonationStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('carte');
  const [ibanCopied, setIbanCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactMailto = getContactMailto();
  const bankDetails = getDonationBankDetails();
  const paypalBaseUrl = getDonationPaypalUrl();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCheckoutResult(params.get('checkout'));

    const amountFromQuery = parseDonationAmountQuery(params.get('amount'));
    if (amountFromQuery != null) {
      if (DEFAULT_AMOUNTS.includes(amountFromQuery as (typeof DEFAULT_AMOUNTS)[number])) {
        setSelectedAmount(amountFromQuery);
        setUseCustomAmount(false);
      } else {
        setUseCustomAmount(true);
        setCustomAmount(String(amountFromQuery / 100));
      }
    }

    const hashMode = parseHashMode(window.location.hash);
    if (hashMode) setPaymentMode(hashMode);
  }, []);

  useEffect(() => {
    void fetchDonationStatus()
      .then(setStatus)
      .catch(() => setStatus(DEFAULT_DONATION_STATUS))
      .finally(() => setLoadingStatus(false));
  }, []);

  const suggestedAmounts = status?.suggestedAmountsCents ?? DEFAULT_AMOUNTS;

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

  const mode = status?.mode ?? 'unavailable';
  const fallbackUrl = status?.fallbackUrl;
  const stripeConfigured = status?.stripe.configured ?? false;
  const checkoutEnabled = mode === 'live';
  const cardCheckoutUnavailable = !checkoutEnabled && !fallbackUrl;

  useEffect(() => {
    if (!ibanCopied) return;
    const timer = window.setTimeout(() => setIbanCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [ibanCopied]);

  async function handleCopyIban() {
    try {
      await navigator.clipboard.writeText(bankDetails.iban);
      setIbanCopied(true);
    } catch {
      setIbanCopied(false);
    }
  }

  async function handleStripeDonate() {
    setError(null);

    if (effectiveAmountCents == null || effectiveAmountCents < 100) {
      setError('Indique un montant valide (minimum 1 €).');
      return;
    }

    setSubmitting(true);
    try {
      const token = getAccessToken();
      const response = await createDonationCheckout(effectiveAmountCents, token ?? undefined);

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
        return;
      }

      setError('Impossible d’ouvrir le paiement par carte. Réessayez dans quelques instants.');
    } catch (err) {
      setError(stripeCheckoutErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingStatus) {
    return (
      <Card variant="soft">
        <p className="muted">Chargement des options de don…</p>
      </Card>
    );
  }

  return (
    <div className="donation-choice-grid" data-testid="donation-choice-grid">
      {checkoutResult === 'success' ? (
        <Card variant="soft" style={{ borderColor: 'var(--accent)' }}>
          <Badge tone="success">Merci !</Badge>
          <p style={{ marginTop: '0.75rem', fontWeight: 700 }}>
            Votre don contribue à maintenir MDM Academy Pro gratuit pour tous.
          </p>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            La formation reste 100 % gratuite — aucun contenu n’est verrouillé.
          </p>
        </Card>
      ) : null}

      {checkoutResult === 'cancel' ? (
        <Card variant="soft">
          <p className="muted">Paiement annulé — vous pouvez réessayer quand vous le souhaitez.</p>
        </Card>
      ) : null}

      <section className="donation-choice-section" aria-labelledby="donation-amount-heading">
        <h2 id="donation-amount-heading" className="donation-choice-heading">
          1. Choisissez un montant
        </h2>
        <div className="donation-amount-grid" role="group" aria-label="Montants de don">
          {suggestedAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              className={`donation-amount-card${
                !useCustomAmount && selectedAmount === amount ? ' is-selected' : ''
              }`}
              onClick={() => {
                setUseCustomAmount(false);
                setSelectedAmount(amount);
                setError(null);
              }}
              aria-pressed={!useCustomAmount && selectedAmount === amount}
              data-testid={`donation-amount-${amount / 100}`}
            >
              <span className="donation-amount-value">{formatDonationEuros(amount)}</span>
              <span className="donation-amount-label">Don unique</span>
            </button>
          ))}
          <button
            type="button"
            className={`donation-amount-card donation-amount-card--custom${
              useCustomAmount ? ' is-selected' : ''
            }`}
            onClick={() => {
              setUseCustomAmount(true);
              setError(null);
            }}
            aria-pressed={useCustomAmount}
            data-testid="donation-amount-custom"
          >
            <span className="donation-amount-value">Autre</span>
            <span className="donation-amount-label">Montant libre</span>
          </button>
        </div>
        {useCustomAmount ? (
          <label className="donation-custom-amount">
            <span className="donation-custom-amount-label">Montant libre (€)</span>
            <input
              type="number"
              min={1}
              max={1000}
              step={1}
              value={customAmount}
              placeholder="Ex. 15"
              onChange={(event) => setCustomAmount(event.target.value)}
              autoFocus
              data-testid="donation-custom-input"
            />
          </label>
        ) : null}
      </section>

      <section className="donation-choice-section" aria-labelledby="donation-mode-heading">
        <h2 id="donation-mode-heading" className="donation-choice-heading">
          2. Choisissez un mode de paiement
        </h2>
        <div className="donation-mode-grid" role="radiogroup" aria-label="Mode de paiement">
          {DONATION_PAYMENT_MODES.map(({ id, icon, label, hint }) => {
            const selected = paymentMode === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                id={id}
                className={`donation-mode-card${selected ? ' is-selected' : ''}`}
                onClick={() => {
                  setPaymentMode(id);
                  setError(null);
                }}
                data-testid={`donation-mode-${id}`}
              >
                {selected ? (
                  <span className="donation-mode-check" aria-hidden>
                    ✓
                  </span>
                ) : null}
                <span className="donation-mode-icon" aria-hidden>
                  {icon}
                </span>
                <span className="donation-mode-label">{label}</span>
                <span className="donation-mode-hint">{hint}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="donation-choice-section" aria-labelledby="donation-action-heading">
        <h2 id="donation-action-heading" className="donation-choice-heading">
          3. Finalisez votre don
          {formattedAmount ? (
            <span className="donation-choice-amount-badge">{formattedAmount}</span>
          ) : null}
        </h2>

        {paymentMode === 'carte' ? (
          <Card variant="elevated" className="donation-action-panel" id="carte" style={{ scrollMarginTop: '5rem' }}>
            <div className="donation-action-header">
              <span className="section-eyebrow">Carte bancaire (Stripe)</span>
              <CardBrandIcons />
            </div>
            <p className="muted" style={{ marginTop: '0.65rem', maxWidth: 680 }}>
              Paiement <strong>sécurisé via Stripe</strong> — don unique, sans abonnement. MDM Academy reste{' '}
              <strong>100 % gratuite</strong>.
            </p>

            {cardCheckoutUnavailable ? (
              <div className="donation-unavailable-box" role="status">
                <p style={{ fontWeight: 700 }}>
                  {stripeConfigured
                    ? 'Paiement par carte temporairement indisponible'
                    : 'Paiement par carte non activé'}
                </p>
                <p className="muted" style={{ marginTop: '0.35rem' }}>
                  {stripeConfigured
                    ? (status?.message ??
                      'Stripe est configuré mais le checkout n’est pas disponible pour le moment.')
                    : 'Sans clé Stripe (`STRIPE_SECRET_KEY`), aucun paiement CB n’est proposé.'}
                </p>
                {!stripeConfigured ? (
                  <p className="muted" style={{ marginTop: '0.5rem' }}>
                    Configuration :{' '}
                    <a href={DONATIONS_DOCS_URL} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>
                      docs/DONATIONS.md
                    </a>
                  </p>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="donation-error">
                {error}
              </p>
            ) : null}

            <div className="donation-action-buttons">
              {checkoutEnabled && formattedAmount ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={() => void handleStripeDonate()}
                  disabled={submitting || effectiveAmountCents == null}
                  aria-busy={submitting}
                  data-testid="stripe-donate-button"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    {submitting ? <StripeCheckoutSpinner /> : null}
                    {submitting ? 'Redirection vers Stripe…' : `Payer ${formattedAmount} par carte`}
                  </span>
                </Button>
              ) : fallbackUrl ? (
                <a href={fallbackUrl} className="btn btn-lg" target="_blank" rel="noopener noreferrer">
                  Faire un don (lien externe)
                </a>
              ) : null}
              <Button href="/courses" variant="secondary" size="lg">
                Continuer gratuitement
              </Button>
            </div>

            {checkoutEnabled ? (
              <p className="muted donation-action-hint">
                Redirection vers Stripe Checkout — cartes Visa, Mastercard, Amex et autres moyens activés.
              </p>
            ) : null}
          </Card>
        ) : null}

        {paymentMode === 'paypal' ? (
          <Card variant="elevated" className="donation-action-panel" id="paypal" style={{ scrollMarginTop: '5rem' }}>
            <div className="donation-action-header">
              <span className="section-eyebrow">Don via PayPal</span>
              <PayPalWordmark />
            </div>
            <p className="muted" style={{ marginTop: '0.65rem', maxWidth: 680 }}>
              Un don via PayPal est <strong>100 % volontaire</strong> et traité de façon{' '}
              <strong>sécurisée par PayPal</strong>.
            </p>

            {paypalLink ? (
              <div className="donation-action-buttons">
                <a
                  href={paypalLink.url}
                  className="btn btn-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="paypal-donate-button"
                >
                  Ouvrir PayPal
                </a>
                <p className="muted donation-action-hint">
                  {paypalLink.amountInUrl && formattedAmount
                    ? `Montant ${formattedAmount} pré-rempli sur PayPal.`
                    : 'Montant libre sur PayPal — vous choisissez sur la page PayPal.'}
                  {' '}Référence optionnelle : « {DEFAULT_DONATION_PAYPAL_REFERENCE} ».
                </p>
              </div>
            ) : (
              <div className="donation-unavailable-box" role="status" data-testid="paypal-unavailable">
                <p style={{ fontWeight: 700 }}>PayPal bientôt disponible</p>
                <p className="muted" style={{ marginTop: '0.35rem' }}>
                  Utilisez la carte bancaire ou le virement SEPA en attendant.
                </p>
              </div>
            )}
          </Card>
        ) : null}

        {paymentMode === 'virement' ? (
          <Card variant="elevated" className="donation-action-panel" id="virement" style={{ scrollMarginTop: '5rem' }}>
            <span className="section-eyebrow">Don par virement SEPA</span>
            <p className="muted" style={{ marginTop: '0.65rem', maxWidth: 680 }}>
              Un don par virement est <strong>100 % volontaire</strong>. Indiquez la référence ci-dessous pour
              faciliter le suivi.
            </p>

            <div className="donation-action-buttons" style={{ marginTop: '1rem' }}>
              <Button
                type="button"
                size="lg"
                onClick={() => void handleCopyIban()}
                data-testid="bank-copy-iban-button"
              >
                {ibanCopied ? 'IBAN copié !' : 'Copier IBAN'}
              </Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <CopyField
                label="Bénéficiaire"
                value={bankDetails.beneficiary}
                copyLabel="Copier"
                testId="bank-beneficiary"
              />
              <CopyField
                label="IBAN"
                value={formatIbanDisplay(bankDetails.iban)}
                copyValue={bankDetails.iban}
                copyLabel="Copier l’IBAN"
                testId="bank-iban"
              />
              <CopyField label="BIC / SWIFT" value={bankDetails.bic} copyLabel="Copier" testId="bank-bic" />
              <div className="donation-copy-field" style={{ borderBottom: 'none' }}>
                <div className="donation-copy-field-text">
                  <p className="donation-copy-field-label">Référence libre</p>
                  <p className="donation-copy-field-value" data-testid="bank-reference">
                    {bankReference}
                  </p>
                  <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.92rem' }}>
                    {formattedAmount
                      ? `Montant choisi : ${formattedAmount} — indiquez cette référence dans le libellé.`
                      : 'Indiquez cette mention dans le libellé du virement.'}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    void navigator.clipboard.writeText(bankReference).catch(() => undefined)
                  }
                >
                  Copier
                </Button>
              </div>
            </div>

            <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.92rem' }}>
              Besoin d’un reçu ?{' '}
              <a href={contactMailto} style={{ fontWeight: 700 }}>
                Nous contacter
              </a>
            </p>

            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Coordonnées complètes à copier</summary>
              <pre className="donation-bank-pre">
                {buildBankTransferShareText({ ...bankDetails, paymentReference: bankReference })}
              </pre>
            </details>
          </Card>
        ) : null}
      </section>

      <Card variant="soft">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Ce qui ne change pas</h3>
        <ul className="muted" style={{ marginTop: '0.65rem', paddingLeft: '1.2rem', lineHeight: 1.7 }}>
          <li>Aucun paywall — pas de page tarifs ni d’abonnement obligatoire.</li>
          <li>Tous les parcours Apple, Jamf et Intune restent ouverts.</li>
          <li>Les dons n’accordent aucun avantage payant : c’est un soutien pur au projet.</li>
        </ul>
      </Card>
    </div>
  );
}
