'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBillingCheckout, type CheckoutPlan } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

type CheckoutStatus = {
  tone: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  checkoutUrl?: string;
};

const PLANS: {
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  checkoutPlan: CheckoutPlan;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    name: 'Mensuel',
    price: '19 €',
    period: '/ mois',
    description: 'Pour préparer une certification et suivre une progression personnelle complète.',
    cta: 'Démarrer le checkout mensuel',
    checkoutPlan: 'monthly',
    features: [
      'Tous les modules Apple, Jamf, Intune et ServiceNow',
      'Sprint Certification 7 ou 14 jours',
      'Ressources officielles et liens de révision',
      'Badges, progression et reprise sur dashboard/mobile',
    ],
  },
  {
    name: 'Annuel',
    price: '190 €',
    period: '/ an',
    description: 'Pour s’engager sur une année complète de préparation et garder un rythme régulier.',
    cta: 'Démarrer le checkout annuel',
    checkoutPlan: 'yearly',
    features: [
      'Tous les modules Apple, Jamf, Intune et ServiceNow',
      'Sprint Certification 7 ou 14 jours',
      'Ressources officielles et liens de révision',
      'Deux mois offerts par rapport au mensuel',
    ],
    highlight: true,
  },
  {
    name: 'Entreprise',
    price: 'Sur devis',
    period: '',
    description: 'Pour former une équipe support, standardiser les pratiques et piloter l’adoption.',
    cta: 'Démarrer le checkout entreprise',
    checkoutPlan: 'enterprise',
    features: [
      'Parcours alignés Apple, Jamf, Intune et ServiceNow',
      'Plan de sprint partagé pour cohortes support',
      'Ressources officielles pour onboarding et montée en compétence',
      'Suivi équipe à brancher sur le dashboard admin',
    ],
  },
];

const MVP_FEATURES = [
  'Parcours guidés Apple, Jamf, Intune et ServiceNow',
  'Sprint Certification pour transformer les modules en plan de révision',
  'Mini-jeu ServiceNow pour s’entraîner à qualifier et prioriser les tickets',
  'Ressources officielles centralisées pour préparer les examens',
  'Dashboard responsive utilisable côté web et mobile',
];

export default function PricingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [pendingPlan, setPendingPlan] = useState<CheckoutPlan | null>(null);

  async function handleCheckout(plan: CheckoutPlan) {
    const token = getAccessToken();

    if (!token) {
      setStatus({
        tone: 'warning',
        title: 'Connexion requise',
        message: 'Connecte-toi ou crée un compte gratuit pour lancer un checkout lié à ton profil.',
      });
      router.push('/auth');
      return;
    }

    setPendingPlan(plan);
    setStatus({
      tone: 'info',
      title: 'Préparation du checkout',
      message: 'Création de la session de paiement en cours...',
    });

    try {
      const checkout = await createBillingCheckout(token, plan);

      if (checkout.checkoutUrl && checkout.mode !== 'demo') {
        setStatus({
          tone: 'success',
          title: 'Checkout prêt',
          message: 'Redirection vers la page de paiement sécurisée...',
        });
        window.location.assign(checkout.checkoutUrl);
        return;
      }

      if (checkout.mode === 'demo') {
        setStatus({
          tone: 'warning',
          title: 'Checkout démo prêt',
          message:
            checkout.message ??
            'Le backend a créé une réponse de démonstration. Le paiement réel sera activé quand Stripe sera branché.',
          checkoutUrl: checkout.checkoutUrl,
        });
        return;
      }

      setStatus({
        tone: checkout.checkoutUrl ? 'success' : 'warning',
        title: checkout.checkoutUrl ? 'Checkout prêt' : 'Checkout incomplet',
        message: checkout.checkoutUrl
          ? 'Ouvre le lien de paiement pour continuer.'
          : 'Le backend a répondu sans URL de paiement. Réessaie plus tard ou contacte l’équipe.',
        checkoutUrl: checkout.checkoutUrl,
      });
    } catch {
      setStatus({
        tone: 'error',
        title: 'Checkout indisponible',
        message: 'Impossible de créer la session de paiement. Reconnecte-toi puis réessaie.',
      });
    } finally {
      setPendingPlan(null);
    }
  }

  return (
    <section style={{ padding: '2rem 0' }}>
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eef6ff 55%, #fff8e6 100%)',
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          padding: '1.75rem',
        }}
      >
        <div>
          <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Tarifs MVP
          </p>
          <h1 style={{ fontSize: '2.35rem', fontWeight: 800, lineHeight: 1.12, marginTop: '0.35rem' }}>
            Choisis le bon niveau pour apprendre Apple MDM
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginTop: '0.75rem', maxWidth: 760 }}>
            Apple MDM Academy combine parcours métier, sprint de certification, mini-jeu ServiceNow et ressources
            officielles. Les offres ci-dessous appellent maintenant le backend checkout; en mode MVP, Stripe renvoie
            une réponse de démonstration claire.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link className="btn" href="/auth">
              Essayer gratuitement
            </Link>
            <Link className="btn" href="/courses" style={{ background: '#1d1d1f' }}>
              Explorer les cours
            </Link>
          </div>
        </div>
        <aside
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '1rem',
          }}
        >
          <strong>Inclus dans le MVP</strong>
          <ul style={{ color: 'var(--muted)', marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
            {MVP_FEATURES.map((feature) => (
              <li key={feature} style={{ marginBottom: '0.45rem' }}>
                {feature}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div
        style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className="card"
            style={{
              borderColor: plan.highlight ? 'var(--accent)' : 'var(--border)',
              borderWidth: plan.highlight ? 2 : 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {plan.highlight && (
              <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Recommandé
              </p>
            )}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{plan.name}</h2>
            <p style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>{plan.price}</span>
              <span style={{ color: 'var(--muted)' }}> {plan.period}</span>
            </p>
            <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>{plan.description}</p>
            <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', color: 'var(--muted)' }}>
              {plan.features.map((f) => (
                <li key={f} style={{ marginBottom: '0.35rem' }}>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className="btn"
              type="button"
              disabled={pendingPlan !== null}
              onClick={() => handleCheckout(plan.checkoutPlan)}
              style={{ marginTop: 'auto', textAlign: 'center', width: '100%' }}
            >
              {pendingPlan === plan.checkoutPlan ? 'Préparation...' : plan.cta}
            </button>
          </article>
        ))}
      </div>

      {status && (
        <section
          aria-live="polite"
          className="card"
          style={{
            background: statusBackground(status.tone),
            borderColor: statusBorder(status.tone),
            marginTop: '1.5rem',
          }}
        >
          <strong>{status.title}</strong>
          <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>{status.message}</p>
          {status.checkoutUrl && (
            <a
              className="btn"
              href={status.checkoutUrl}
              rel="noreferrer"
              target="_blank"
              style={{ display: 'inline-block', marginTop: '1rem' }}
            >
              Ouvrir le lien de checkout
            </a>
          )}
        </section>
      )}

      <section className="card" style={{ background: '#eef6ff', borderColor: '#85bfff', marginTop: '1.5rem' }}>
        <strong>Checkout MVP</strong>
        <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
          Les boutons appellent `POST /billing/checkout` avec le token local `ama_access` quand il existe. Sans
          session, la page te renvoie vers l’inscription; avec le backend de démonstration, elle affiche le lien Stripe
          simulé sans quitter la page.
        </p>
      </section>
    </section>
  );
}

function statusBackground(tone: CheckoutStatus['tone']) {
  if (tone === 'error') return '#fff1f2';
  if (tone === 'success') return '#ecfdf3';
  if (tone === 'warning') return '#fff8e6';
  return '#eef6ff';
}

function statusBorder(tone: CheckoutStatus['tone']) {
  if (tone === 'error') return '#f1a8b4';
  if (tone === 'success') return '#8fd7a5';
  if (tone === 'warning') return '#f0cf7a';
  return '#85bfff';
}
