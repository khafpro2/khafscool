import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const DONATION_MODES = [
  { icon: '\u{1F4B3}', label: 'Carte bancaire', hint: 'Stripe Checkout — montants 5 €, 10 €, 20 € ou libre' },
  { icon: '\u{1F4B0}', label: 'PayPal', hint: 'Don volontaire — montant libre sur PayPal' },
  { icon: '\u{1F3E6}', label: 'Virement SEPA', hint: 'IBAN Revolut — copie en un clic' },
] as const;

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
              MDM Academy Pro reste gratuite pour tous. Un don volontaire aide l’hébergement — carte, PayPal ou
              virement bancaire.
            </p>
          </div>
          <div className="home-support-modes" data-testid="home-support-modes">
            {DONATION_MODES.map((mode) => (
              <div key={mode.label} className="home-support-mode">
                <span className="home-support-mode-icon" aria-hidden>
                  {mode.icon}
                </span>
                <div>
                  <p className="home-support-mode-label">{mode.label}</p>
                  <p className="home-support-mode-hint">{mode.hint}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="home-support-actions">
            <Button href="/soutenir" size="lg">
              Faire un don
            </Button>
            <Button href="/soutenir#virement" size="sm" variant="secondary">
              Voir l’IBAN
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
