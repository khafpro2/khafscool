'use client';

import { BankTransferPanel } from '@/components/donations/BankTransferPanel';
import { DonationPanel } from '@/components/donations/DonationPanel';
import { PayPalPanel } from '@/components/donations/PayPalPanel';
import { getContactEmail, getContactMailto } from '@/lib/contact';

const DONATION_FAQ = [
  {
    question: 'La plateforme est-elle vraiment gratuite ?',
    answer:
      'Oui. MDM Academy Pro reste 100 % gratuite : tous les parcours, quiz, examens blancs et outils de progression sont accessibles sans don. Les contributions servent uniquement à financer l’hébergement et la maintenance.',
  },
  {
    question: 'Puis-je me faire rembourser un don ?',
    answer:
      'Les dons sont volontaires et généralement non remboursables une fois le paiement confirmé. En cas d’erreur de montant ou de double prélèvement, contactez-nous rapidement à l’adresse assistance — nous examinerons votre demande au cas par cas.',
  },
  {
    question: 'Puis-je obtenir un reçu fiscal ?',
    answer:
      'Non, pas pour l’instant. MDM Academy Pro n’est pas configurée comme association ou organisme éligible aux reçus fiscaux (Cerfa). Vous recevrez uniquement la confirmation Stripe ou PayPal comme justificatif de paiement.',
  },
  {
    question: 'Comment obtenir le badge Supporter ?',
    answer:
      'Connectez-vous à votre compte, puis faites un don par carte (Stripe), PayPal ou virement depuis cette page. Le badge Supporter est attribué automatiquement après confirmation du paiement carte ; pour PayPal ou virement, contactez-nous avec votre identifiant compte si le badge n’apparaît pas sous 48 h.',
  },
  {
    question: 'Où va mon don ?',
    answer:
      'Votre contribution couvre les frais d’hébergement (API, base de données, front web), la maintenance technique et l’enrichissement du contenu pédagogique. Aucun contenu payant n’est créé — la formation reste ouverte à tous.',
  },
] as const;

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

      <div className="donation-methods-grid" style={{ marginTop: '1.5rem' }}>
        <DonationPanel />
        <PayPalPanel />
        <BankTransferPanel />
      </div>

      <section aria-labelledby="donation-faq-heading" style={{ marginTop: '2.5rem' }}>
        <span className="section-eyebrow">Questions fréquentes</span>
        <h2 id="donation-faq-heading" style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem' }}>
          FAQ dons
        </h2>
        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          {DONATION_FAQ.map(({ question, answer }) => (
            <details
              key={question}
              className="card"
              style={{
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-md, 12px)',
                background: 'var(--surface)',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 700, listStyle: 'none' }}>{question}</summary>
              <p className="muted" style={{ marginTop: '0.65rem', fontSize: '0.95rem', lineHeight: 1.55 }}>
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <p className="muted" style={{ marginTop: '1.5rem', maxWidth: 640, fontSize: '0.95rem' }}>
        Une question sur les dons ou le fonctionnement de la plateforme ?{' '}
        <a href={contactMailto} style={{ fontWeight: 700 }}>
          Assistance — {contactEmail}
        </a>
      </p>
    </section>
  );
}
