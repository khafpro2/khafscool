'use client';

import { useEffect, useState } from 'react';
import { buildBankTransferShareText } from '@ama/shared/donation-bank';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getContactMailto } from '@/lib/contact';
import { formatIbanDisplay, getDonationBankDetails } from '@/lib/donation-bank';

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
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.65rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ minWidth: 0, flex: '1 1 12rem' }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </p>
        <p
          style={{ marginTop: '0.25rem', fontWeight: 700, wordBreak: 'break-word' }}
          data-testid={testId}
        >
          {value}
        </p>
      </div>
      <Button type="button" size="sm" variant="secondary" onClick={() => void handleCopy()}>
        {copied ? 'Copié !' : copyLabel}
      </Button>
    </div>
  );
}

export function BankTransferPanel() {
  const details = getDonationBankDetails();
  const contactMailto = getContactMailto();
  const ibanDisplay = formatIbanDisplay(details.iban);

  return (
    <Card variant="elevated" id="virement" style={{ scrollMarginTop: '5rem' }}>
      <span className="section-eyebrow">Don par virement</span>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.5rem' }}>
        Virement bancaire (SEPA)
      </h2>
      <p className="muted" style={{ marginTop: '0.65rem', maxWidth: 680 }}>
        Un don par virement est <strong>100 % volontaire</strong>. MDM Academy reste{' '}
        <strong>gratuite pour tous</strong> — aucun contenu n’est réservé aux donateurs.
      </p>

      <div style={{ marginTop: '1rem' }}>
        <CopyField
          label="Bénéficiaire"
          value={details.beneficiary}
          copyLabel="Copier"
          testId="bank-beneficiary"
        />
        <CopyField
          label="IBAN"
          value={ibanDisplay}
          copyValue={details.iban}
          copyLabel="Copier l’IBAN"
          testId="bank-iban"
        />
        <CopyField label="BIC / SWIFT" value={details.bic} copyLabel="Copier" testId="bank-bic" />
        <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Banque
          </p>
          <p style={{ marginTop: '0.25rem', fontWeight: 700 }}>{details.bankName}</p>
          <p className="muted" style={{ marginTop: '0.2rem', fontSize: '0.92rem' }}>
            {details.bankAddress}
          </p>
        </div>
        <CopyField
          label="Banque correspondante BIC"
          value={details.correspondentBic}
          copyLabel="Copier"
        />
        <div style={{ padding: '0.75rem 0' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Référence libre
          </p>
          <p style={{ marginTop: '0.25rem', fontWeight: 700 }} data-testid="bank-reference">
            {details.paymentReference}
          </p>
          <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.92rem' }}>
            Indiquez cette mention dans le libellé du virement pour faciliter le suivi.
          </p>
        </div>
      </div>

      <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.92rem' }}>
        Besoin d’un reçu ou d’une confirmation ?{' '}
        <a href={contactMailto} style={{ fontWeight: 700 }}>
          Nous contacter
        </a>
      </p>

      <details style={{ marginTop: '1rem' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Coordonnées complètes à copier</summary>
        <pre
          style={{
            marginTop: '0.65rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-soft)',
            border: '1px solid var(--border)',
            whiteSpace: 'pre-wrap',
            fontSize: '0.85rem',
            lineHeight: 1.6,
          }}
        >
          {buildBankTransferShareText(details)}
        </pre>
      </details>
    </Card>
  );
}
