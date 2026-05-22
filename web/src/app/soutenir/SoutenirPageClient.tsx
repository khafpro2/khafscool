'use client';

import { DonationPanel } from '@/components/donations/DonationPanel';
import { getContactEmail, getContactMailto } from '@/lib/contact';

export function SoutenirPageClient() {
  const contactEmail = getContactEmail();
  const contactMailto = getContactMailto();

  return (
    <section style={{ padding: '1rem 0 2rem', maxWidth: 760 }}>
      <span className="section-eyebrow">Communauté</span>
      <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900, marginTop: '0.35rem' }}>
        Soutenir MDM Academy Pro
      </h1>
      <p className="muted" style={{ marginTop: '0.65rem', maxWidth: 640 }}>
        Un don optionnel pour faire vivre la plateforme — sans jamais limiter l’accès à la formation.
      </p>

      <div style={{ marginTop: '1.5rem' }}>
        <DonationPanel />
      </div>

      <p className="muted" style={{ marginTop: '1.5rem', maxWidth: 640, fontSize: '0.95rem' }}>
        Une question sur les dons ou le fonctionnement de la plateforme ?{' '}
        <a href={contactMailto} style={{ fontWeight: 700 }}>
          Assistance — {contactEmail}
        </a>
      </p>
    </section>
  );
}
