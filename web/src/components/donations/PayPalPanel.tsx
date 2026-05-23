'use client';

import { Card } from '@/components/ui/Card';
import {
  DEFAULT_DONATION_PAYPAL_REFERENCE,
  getDonationPaypalUrl,
} from '@/lib/donation-paypal';

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

export function PayPalPanel() {
  const paypalUrl = getDonationPaypalUrl();

  return (
    <Card variant="elevated" id="paypal" style={{ scrollMarginTop: '5rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <span className="section-eyebrow">Don via PayPal</span>
        <PayPalWordmark />
      </div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.5rem' }}>
        PayPal (don volontaire)
      </h2>
      <p className="muted" style={{ marginTop: '0.65rem', maxWidth: 680 }}>
        Un don via PayPal est <strong>100 % volontaire</strong> et traité de façon{' '}
        <strong>sécurisée par PayPal</strong>. MDM Academy reste{' '}
        <strong>gratuite pour tous</strong> — la plateforme ne verrouille aucun parcours.
      </p>

      {paypalUrl ? (
        <div style={{ marginTop: '1.25rem' }}>
          <a
            href={paypalUrl}
            className="btn btn-lg"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="paypal-donate-button"
          >
            Donner avec PayPal
          </a>
          <p className="muted" style={{ marginTop: '0.85rem', fontSize: '0.88rem' }}>
            Ouverture dans un nouvel onglet — vous choisissez le montant sur la page PayPal.
            Référence optionnelle : « {DEFAULT_DONATION_PAYPAL_REFERENCE} ».
          </p>
        </div>
      ) : (
        <div
          role="status"
          data-testid="paypal-unavailable"
          style={{
            marginTop: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-soft)',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ fontWeight: 700 }}>PayPal bientôt disponible</p>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            Le lien de don PayPal n’est pas encore configuré. Utilisez la carte bancaire ou le virement
            SEPA en attendant.
          </p>
        </div>
      )}
    </Card>
  );
}
