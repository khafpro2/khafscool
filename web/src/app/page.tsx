import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LearningPathCard } from '@/components/ui/LearningPathCard';
import { LEARNING_PATHS } from '@/lib/learningPaths';

const FEATURES = [
  {
    icon: '\u{1F3AE}',
    title: 'Unités courtes et ludiques',
    description: 'Quiz, mini-jeux et scénarios : 10 à 15 minutes par unité pour valider une compétence.',
  },
  {
    icon: '\u{1F3C5}',
    title: 'Badges par piste',
    description: 'Débloque des badges Apple, Jamf et Intune en terminant chaque parcours de 3 unités.',
  },
  {
    icon: '\u{1F4C8}',
    title: 'Suivi de progression',
    description: 'Tableau de bord, quêtes hebdo et sprints certification pour garder le rythme.',
  },
];

export default function HomePage() {
  return (
    <div style={{ paddingBottom: '2rem' }} >
      <section className="hero" style={{ marginTop: '0.5rem' }}>
        <span className="hero-eyebrow">
          <span aria-hidden>{'\u2728'}</span> MDM Academy · Formation gamifiée
        </span>
        <h1>Apprends Apple, Jamf Pro et Intune en pratiquant.</h1>
        <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
          Maîtrise Apple Device Support, Jamf Pro et Microsoft Intune
        </p>
        <p style={{ marginTop: '0.65rem', maxWidth: 640 }}>
          Trois parcours guidés de 3 unités chacun : support Apple, administration Jamf et enrôlement Intune
          pour flottes iOS et macOS.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
          <Button href="/courses/apple-cert-prep" size="lg" variant="secondary">
            Commencer par Apple
          </Button>
          <Button href="/courses" size="lg" variant="ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            Voir les 3 parcours
          </Button>
        </div>
        <div
          style={{
            marginTop: '2.25rem',
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          }}
        >
          <HeroStat label="Parcours" value="3" hint="Apple · Jamf · Intune" />
          <HeroStat label="Unités" value="9" hint="3 par piste" />
          <HeroStat label="Durée" value="~45 min" hint="par parcours" />
          <HeroStat label="Badges" value="3" hint="super-badges piste" />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Apprentissage</span>
            <h2>Choisis ta piste d&apos;apprentissage</h2>
            <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 620 }}>
              Chaque parcours combine quiz, mini-jeu et scénario terrain. Commence par Apple si tu débutes en
              support ou MDM.
            </p>
          </div>
          <Link href="/courses" style={{ fontWeight: 700 }}>
            Catalogue complet →
          </Link>
        </div>
        <div className="grid grid-learning-paths">
          {LEARNING_PATHS.map((path) => (
            <LearningPathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Pourquoi MDM Academy</span>
            <h2>Formation pensée pour les pros Apple et MDM</h2>
          </div>
        </div>
        <div className="grid grid-cards">
          {FEATURES.map((feature) => (
            <Card key={feature.title} variant="soft">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent-strong)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                }}
                aria-hidden
              >
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.85rem' }}>{feature.title}</h3>
              <p className="muted" style={{ marginTop: '0.4rem' }}>{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card
        variant="elevated"
        style={{
          marginTop: '2.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #e3f0ff 100%)',
          borderColor: '#c5dbf3',
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
        }}
      >
        <div>
          <span className="section-eyebrow">Prochaine étape</span>
          <h2 style={{ fontSize: '1.6rem', marginTop: '0.35rem' }}>Crée ton profil et tracke tes 3 pistes.</h2>
          <p className="muted" style={{ marginTop: '0.5rem', maxWidth: 540 }}>
            Connecte-toi pour synchroniser ta progression Apple, Jamf et Intune, tes quêtes hebdo et tes sprints
            certification.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Button href="/auth" size="lg">
            Créer mon compte
          </Button>
          <Button href="/dashboard" size="lg" variant="secondary">
            Mon tableau de bord
          </Button>
        </div>
      </Card>
    </div>
  );
}

function HeroStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: 14,
        padding: '0.85rem 1rem',
        color: '#fff',
      }}
    >
      <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.86 }}>
        {label}
      </p>
      <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem' }}>{value}</p>
      <p style={{ fontSize: '0.8rem', opacity: 0.82 }}>{hint}</p>
    </div>
  );
}
