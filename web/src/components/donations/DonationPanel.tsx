'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createDonationCheckout, fetchDonationStatus } from '@/lib/api/client';
import type { DonationStatusResponse } from '@/lib/api/types';
import { getAccessToken } from '@/lib/auth';

const DEFAULT_AMOUNTS = [500, 1000, 2000];

const DEFAULT_DONATION_STATUS: DonationStatusResponse = {
  mode: 'unavailable',
  stripe: { configured: false, checkoutEnabled: false },
  fallbackUrl: null,
  suggestedAmountsCents: DEFAULT_AMOUNTS,
  message: 'Bientôt disponible — merci pour votre intérêt !',
};

function formatEuros(amountCents: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

export function DonationPanel() {
  const [checkoutResult, setCheckoutResult] = useState<string | null>(null);
  const [status, setStatus] = useState<DonationStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCheckoutResult(params.get('checkout'));
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

  async function handleDonate() {
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

      setError('Impossible d’ouvrir le paiement. Réessaie plus tard.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du don.');
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

  const mode = status?.mode ?? 'unavailable';
  const fallbackUrl = status?.fallbackUrl;

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
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

      <Card variant="elevated">
        <span className="section-eyebrow">Don volontaire</span>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.5rem' }}>
          Contribuer au projet
        </h2>
        <p className="muted" style={{ marginTop: '0.65rem', maxWidth: 680 }}>
          MDM Academy reste <strong>100 % gratuite</strong> : tous les parcours, quiz, badges et
          certificats sont accessibles sans abonnement. Un don est <strong>optionnel</strong> et aide
          à couvrir l’hébergement, la maintenance et de nouveaux contenus pédagogiques.
        </p>

        {mode === 'unavailable' ? (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-soft)',
              border: '1px solid var(--border)',
            }}
          >
            <p style={{ fontWeight: 700 }}>Bientôt disponible</p>
            <p className="muted" style={{ marginTop: '0.35rem' }}>
              {status?.message ?? 'Les dons en ligne seront activés prochainement.'}
            </p>
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.75rem',
            marginTop: '1.25rem',
          }}
        >
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
              }}
              disabled={submitting || mode === 'unavailable'}
              aria-pressed={!useCustomAmount && selectedAmount === amount}
            >
              <span className="donation-amount-value">{formatEuros(amount)}</span>
              <span className="donation-amount-label">Don unique</span>
            </button>
          ))}
        </div>

        <label style={{ display: 'block', marginTop: '1rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Montant libre (€)</span>
          <input
            type="number"
            min={1}
            max={1000}
            step={1}
            value={customAmount}
            placeholder="Ex. 15"
            onChange={(event) => {
              setUseCustomAmount(true);
              setCustomAmount(event.target.value);
            }}
            onFocus={() => setUseCustomAmount(true)}
            style={{
              marginTop: '0.35rem',
              maxWidth: 200,
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--fg)',
            }}
            disabled={submitting || mode === 'unavailable'}
          />
        </label>

        {error ? (
          <p role="alert" style={{ color: 'var(--danger)', marginTop: '0.75rem' }}>
            {error}
          </p>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          {mode === 'live' ? (
            <Button
              type="button"
              size="lg"
              onClick={() => void handleDonate()}
              disabled={submitting}
            >
              {submitting ? 'Redirection…' : 'Donner via Stripe'}
            </Button>
          ) : fallbackUrl ? (
            <a
              href={fallbackUrl}
              className="btn btn-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Faire un don (lien externe)
            </a>
          ) : null}
          <Button href="/courses" variant="secondary" size="lg">
            Continuer gratuitement
          </Button>
        </div>
      </Card>

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
