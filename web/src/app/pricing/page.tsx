'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBillingCheckout, fetchBillingStatus, type CheckoutPlan } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getTrackVisual } from '@/lib/design';

type CheckoutStatus = {
  tone: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  checkoutUrl?: string;
};

type PlanConfig = {
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  features: string[];
  highlight?: boolean;
  checkoutPlan?: CheckoutPlan;
  free?: boolean;
};

const PLANS: PlanConfig[] = [
  {
    name: 'Gratuit',
    price: '0 €',
    period: '',
    description: 'Découvre les parcours Apple, Jamf et Intune et valide tes premières unités.',
    cta: 'Créer un compte gratuit',
    free: true,
    features: [
      'Accès au catalogue de parcours en lecture',
      'Premières unités et quiz de découverte',
      'Tableau de bord et classement en mode démo',
      'Ressources officielles Apple, Jamf et Intune',
    ],
  },
  {
    name: 'Pro',
    price: '19 €',
    period: '/ mois',
    description: 'Pour préparer une certification et suivre une progression personnelle complète.',
    cta: 'Passer au plan Pro',
    checkoutPlan: 'monthly',
    highlight: true,
    features: [
      'Toutes les unités Apple, Jamf et Intune',
      'Sprint certification 7 ou 14 jours',
      'Badges, points et quêtes hebdomadaires',
      'Progression sauvegardée web et mobile',
    ],
  },
  {
    name: 'Équipe',
    price: 'Sur devis',
    period: '',
    description: 'Pour former une équipe support et standardiser les pratiques MDM.',
    cta: 'Demander un devis équipe',
    checkoutPlan: 'enterprise',
    features: [
      'Parcours alignés Apple, Jamf et Intune',
      'Sprints partagés pour cohortes support',
      'Ressources officielles pour onboarding',
      'Suivi équipe (dashboard admin à venir)',
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: 'Le paiement Stripe est-il déjà actif ?',
    answer:
      'En mode MVP, le backend peut renvoyer une session de démonstration. Tu verras un message clair et un lien simulé tant que Stripe n’est pas branché en production.',
  },
  {
    question: 'Puis-je annuler mon abonnement Pro ?',
    answer:
      'Oui. Une fois Stripe activé, tu pourras gérer ton abonnement depuis l’espace client. En attendant, contacte l’équipe pour toute question.',
  },
  {
    question: 'Le plan Gratuit suffit-il pour préparer une certification ?',
    answer:
      'Le plan Gratuit permet d’explorer le catalogue et les ressources. Le plan Pro débloque toutes les unités, les sprints guidés et la sauvegarde complète de ta progression.',
  },
  {
    question: 'Quelle différence entre Pro et Équipe ?',
    answer:
      'Pro cible un apprenant individuel. Équipe s’adresse aux organisations qui veulent former plusieurs techniciens avec des parcours et sprints alignés.',
  },
];

const PRICING_GRADIENT = getTrackVisual('DEFAULT').gradient;

export default function PricingPage() {
  const router = useRouter();
  const [billingMode, setBillingMode] = useState<'demo' | 'live' | 'loading'>('loading');
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [pendingPlan, setPendingPlan] = useState<CheckoutPlan | null>(null);

  useEffect(() => {
    fetchBillingStatus()
      .then((billing) => setBillingMode(billing.mode))
      .catch(() => setBillingMode('demo'));
  }, []);

  async function handleCheckout(plan: CheckoutPlan) {
    const token = getAccessToken();

    if (!token) {
      setStatus({
        tone: 'warning',
        title: 'Connexion requise',
        message: 'Connecte-toi ou crée un compte gratuit pour lancer un paiement lié à ton profil.',
      });
      router.push('/auth');
      return;
    }

    setPendingPlan(plan);
    setStatus({
      tone: 'info',
      title: 'Préparation du paiement',
      message: 'Création de la session de paiement en cours…',
    });

    try {
      const checkout = await createBillingCheckout(token, plan);

      if (checkout.checkoutUrl && checkout.mode !== 'demo') {
        setStatus({
          tone: 'success',
          title: 'Paiement prêt',
          message: 'Redirection vers la page de paiement sécurisée…',
        });
        window.location.assign(checkout.checkoutUrl);
        return;
      }

      if (checkout.demo || checkout.mode === 'demo') {
        setBillingMode('demo');
        setStatus({
          tone: 'warning',
          title: 'Paiement démo prêt',
          message:
            checkout.message ??
            'Le backend a créé une réponse de démonstration. Le paiement réel sera activé quand Stripe sera branché.',
          checkoutUrl: checkout.checkoutUrl,
        });
        return;
      }

      setBillingMode('live');

      setStatus({
        tone: checkout.checkoutUrl ? 'success' : 'warning',
        title: checkout.checkoutUrl ? 'Paiement prêt' : 'Paiement incomplet',
        message: checkout.checkoutUrl
          ? 'Ouvre le lien de paiement pour continuer.'
          : 'Le backend a répondu sans URL de paiement. Réessaie plus tard ou contacte l’équipe.',
        checkoutUrl: checkout.checkoutUrl,
      });
    } catch {
      setStatus({
        tone: 'error',
        title: 'Paiement indisponible',
        message:
          'Impossible de créer la session de paiement pour le moment. Tu peux réessayer après connexion ou utiliser le plan Gratuit en attendant.',
      });
    } finally {
      setPendingPlan(null);
    }
  }

  function handlePlanCta(plan: PlanConfig) {
    if (plan.free) {
      router.push('/auth');
      return;
    }
    if (plan.checkoutPlan) {
      void handleCheckout(plan.checkoutPlan);
    }
  }

  return (
    <section style={{ padding: '1rem 0 2rem' }}>
      <PricingHero billingMode={billingMode} />

      <div
        style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          alignItems: 'stretch',
        }}
      >
        {PLANS.map((plan) => (
          <PricingPlanCard
            key={plan.name}
            plan={plan}
            pending={plan.checkoutPlan ? pendingPlan === plan.checkoutPlan : false}
            disabled={pendingPlan !== null}
            onSelect={() => handlePlanCta(plan)}
          />
        ))}
      </div>

      {status && (
        <Card
          aria-live="polite"
          style={{
            background: statusBackground(status.tone),
            borderColor: statusBorder(status.tone),
            marginTop: '1.5rem',
          }}
        >
          <strong>{status.title}</strong>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            {status.message}
          </p>
          {status.checkoutUrl && (
            <a className="btn" href={status.checkoutUrl} rel="noreferrer" target="_blank" style={{ display: 'inline-block', marginTop: '1rem' }}>
              Ouvrir le lien de paiement
            </a>
          )}
        </Card>
      )}

      <section className="section">
        <h2 className="section-title">Questions fréquentes</h2>
        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          {FAQ_ITEMS.map((item) => (
            <Card key={item.question} variant="soft">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{item.question}</h3>
              <p className="muted" style={{ marginTop: '0.45rem' }}>
                {item.answer}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Card variant="soft" style={{ marginTop: '1.5rem', borderColor: '#85bfff', background: '#eef6ff' }}>
        <strong>Paiement MVP</strong>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Les boutons Pro et Équipe appellent <code>POST /billing/checkout</code> avec le token local{' '}
          <code>ama_access</code>. Sans session, tu es redirigé vers l’inscription ; en mode démo, un lien
          Stripe simulé s’affiche sans quitter la page.
        </p>
      </Card>
    </section>
  );
}

function PricingHero({ billingMode }: { billingMode: 'demo' | 'live' | 'loading' }) {
  return (
    <div className="hero" style={{ background: PRICING_GRADIENT, marginTop: 0 }}>
      <span className="hero-eyebrow">
        <span aria-hidden>{'\u{1F4B3}'}</span> Tarifs MDM Academy
      </span>
      {billingMode !== 'loading' && (
        <Badge
          tone={billingMode === 'live' ? 'success' : 'warning'}
          style={{ marginTop: '0.75rem', display: 'inline-flex' }}
        >
          {billingMode === 'live' ? 'Paiement Stripe' : 'Mode démo'}
        </Badge>
      )}
      <h1>Choisis le bon niveau pour apprendre Apple MDM</h1>
      <p style={{ marginTop: '0.85rem' }}>
        Parcours métier, sprint de certification et ressources officielles — commence gratuitement ou passe au
        plan Pro pour débloquer toute la progression.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
        <Button href="/auth" variant="secondary" size="lg">
          Essayer gratuitement
        </Button>
        <Button href="/courses" variant="ghost" size="lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
          Explorer les cours
        </Button>
      </div>
    </div>
  );
}

function PricingPlanCard({
  plan,
  pending,
  disabled,
  onSelect,
}: {
  plan: PlanConfig;
  pending: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      variant={plan.highlight ? 'elevated' : 'default'}
      style={{
        borderColor: plan.highlight ? 'var(--accent)' : undefined,
        borderWidth: plan.highlight ? 2 : undefined,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {plan.highlight && (
        <Badge tone="accent" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
          Populaire
        </Badge>
      )}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{plan.name}</h2>
      <p style={{ marginTop: '0.75rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800 }}>{plan.price}</span>
        {plan.period && <span className="muted"> {plan.period}</span>}
      </p>
      <p className="muted" style={{ marginTop: '0.75rem' }}>
        {plan.description}
      </p>
      <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', color: 'var(--muted)', flex: 1 }}>
        {plan.features.map((feature) => (
          <li key={feature} style={{ marginBottom: '0.35rem' }}>
            {feature}
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant={plan.highlight ? 'primary' : plan.free ? 'secondary' : 'dark'}
        fullWidth
        disabled={disabled}
        onClick={onSelect}
        style={{ marginTop: '1.25rem' }}
      >
        {pending ? 'Préparation…' : plan.cta}
      </Button>
    </Card>
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
