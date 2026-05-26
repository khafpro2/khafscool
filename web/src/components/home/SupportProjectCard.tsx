import Link from 'next/link';
import { PRESET_DONATION_AMOUNTS_CENTS } from '@ama/shared/donation-amounts';
import { DONATION_PAYMENT_MODES } from '@ama/shared/donation-payment-modes';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const PRESET_AMOUNTS = PRESET_DONATION_AMOUNTS_CENTS.map((cents) => ({
  euros: cents / 100,
  label: `${cents / 100}\u00a0€`,
}));

export function SupportProjectCard() {
  return (
    <section
      className="section container home-support"
      aria-labelledby="home-support-title"
      data-testid="home-support-section"
    >
      <Card variant="elevated" className="home-support-card">
        <div className="home-support-layout">
          <div className="home-support-copy">
            <span className="section-eyebrow">Communauté</span>
            <h2 id="home-support-title" style={{ fontSize: '1.45rem', fontWeight: 900, marginTop: '0.35rem' }}>
              Soutenir le projet
            </h2>
            <p className="muted" style={{ marginTop: '0.5rem', maxWidth: 520 }}>
              MDM Academy Pro reste gratuite pour tous. Choisissez un montant, puis le mode de paiement sur la
              page Soutenir.
            </p>
          </div>

          <div>
            <p className="home-support-amounts-label">Montants suggérés</p>
            <div className="home-support-amounts" data-testid="home-support-amounts">
              {PRESET_AMOUNTS.map(({ euros, label }) => (
                <Link
                  key={euros}
                  href={`/soutenir?amount=${euros}`}
                  className="home-support-amount-chip"
                  data-testid={`home-support-amount-${euros}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="home-support-amounts-label">Modes de paiement</p>
            <div className="home-support-modes" data-testid="home-support-modes">
              {DONATION_PAYMENT_MODES.map(({ id, icon, label, hint }) => (
                <Link
                  key={id}
                  href={`/soutenir?amount=10#${id}`}
                  className="home-support-mode"
                  data-testid={`home-support-mode-${id}`}
                >
                  <span className="home-support-mode-icon" aria-hidden>
                    {icon}
                  </span>
                  <span>
                    <span className="home-support-mode-label">{label}</span>
                    <p className="home-support-mode-hint">{hint}</p>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="home-support-actions">
            <Button href="/soutenir?amount=10" size="lg">
              Choisir mode de paiement
            </Button>
            <Button href="/soutenir?amount=10#virement" size="sm" variant="secondary">
              Voir l’IBAN
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
