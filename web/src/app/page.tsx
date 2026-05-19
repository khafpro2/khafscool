import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrackIcon } from '@/components/ui/TrackIcon';
import { TrailCard } from '@/components/ui/TrailCard';

const POPULAR_TRAILS = [
  {
    href: '/courses/apple-cert-prep',
    title: 'Parcours Apple Device Support',
    description: 'Diagnostic, sécurité et préparation aux fondamentaux Apple Device Support.',
    track: 'APPLE',
    totalModules: 3,
  },
  {
    href: '/courses/jamf-pro-foundations',
    title: 'Fondamentaux Jamf Pro',
    description: 'Maîtrise inventaire, smart groups, politiques et bonnes pratiques MDM.',
    track: 'JAMF',
    totalModules: 3,
  },
  {
    href: '/courses/intune-ios-enrollment',
    title: 'Microsoft Intune pour Apple',
    description: 'Enrôlement iOS, profils de configuration et conformité hybride Apple x Microsoft.',
    track: 'INTUNE',
    totalModules: 3,
  },
];

const ROLE_TRAILS = [
  {
    title: 'Technicien support Apple',
    description: 'Diagnostique vite et bien : restauration, sauvegarde, sécurité, conformité.',
    track: 'APPLE',
    icon: '\u{1F468}\u200D\u{1F4BB}',
    href: '/courses/apple-cert-prep',
  },
  {
    title: 'Administrateur MDM',
    description: 'Pilote Jamf, Intune et ABM pour des flottes Apple cohérentes et sécurisées.',
    track: 'JAMF',
    icon: '\u{1F9D1}\u200D\u{1F4BC}',
    href: '/courses/jamf-pro-foundations',
  },
  {
    title: 'Ingénieur certification',
    description: 'Planifie un sprint 7 ou 14 jours pour décrocher ta prochaine certification.',
    track: 'SPRINT',
    icon: '\u{1F3C1}',
    href: '/sprint',
  },
];

const FEATURES = [
  {
    icon: '\u{1F3AE}',
    title: 'Unités courtes et ludiques',
    description: 'Quiz, mini-jeux, scénarios : 10 à 15 minutes pour valider une unité et gagner des points.',
  },
  {
    icon: '\u{1F3C5}',
    title: 'Badges et super-badges',
    description: 'Débloque des badges Apple, Jamf et Intune en validant les parcours, sans plateforme propriétaire.',
  },
  {
    icon: '\u{1F4C8}',
    title: 'Suivi de progression',
    description: 'Suis ton rang, ton classement et tes quêtes hebdo depuis un tableau de bord clair.',
  },
  {
    icon: '\u{1F4DA}',
    title: 'Contenus originaux',
    description: 'Inspirés de la documentation officielle Apple, Jamf et Microsoft, jamais copiés.',
  },
];

export default function HomePage() {
  return (
    <div style={{ paddingBottom: '2rem' }}>
      <section className="hero" style={{ marginTop: '0.5rem' }}>
        <span className="hero-eyebrow">
          <span aria-hidden>{'\u2728'}</span> Nouveau · Saison MDM 2026
        </span>
        <h1>Apprends Apple, Jamf et Intune comme dans un jeu.</h1>
        <p style={{ marginTop: '1rem' }}>
          MDM Academy transforme la formation des techniciens Apple et des administrateurs MDM en parcours
          courts, ponctués de badges, de quêtes hebdo et de sprints certification.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
          <Button href="/courses" size="lg" variant="secondary">
            Commencer un parcours
          </Button>
          <Button href="/demo" size="lg" variant="ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            Voir la démo guidée
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
          <HeroStat label="Parcours" value="12+" hint="Apple · Jamf · Intune" />
          <HeroStat label="Unités jouables" value="80+" hint="quiz et scénarios" />
          <HeroStat label="Badges" value="20" hint="dont 3 super-badges" />
          <HeroStat label="Sprints certif." value="7 / 14 j" hint="révision guidée" />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Parcours populaires</span>
            <h2>Commence par un classique MDM</h2>
            <p className="muted" style={{ marginTop: '0.35rem', maxWidth: 620 }}>
              Trois parcours phares pour acquérir le socle Apple Device Support, structurer Jamf Pro et
              maîtriser Microsoft Intune côté Apple.
            </p>
          </div>
          <Link href="/courses" style={{ fontWeight: 700 }}>
            Voir tout le catalogue →
          </Link>
        </div>
        <div className="grid grid-cards-lg">
          {POPULAR_TRAILS.map((trail) => (
            <TrailCard key={trail.title} {...trail} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Découvrir par rôle</span>
            <h2>Quel apprenant es-tu ?</h2>
          </div>
        </div>
        <div className="grid grid-cards-lg">
          {ROLE_TRAILS.map((role) => (
            <Link key={role.title} href={role.href} className="trail-card" aria-label={role.title}>
              <div
                className="trail-card-banner"
                style={{ background: gradientForRole(role.track), minHeight: 96 }}
              >
                <TrackIcon track={role.track} size="md" className="trail-card-icon" ariaHidden />
                <span className="trail-card-track">{trackLabelForRole(role.track)}</span>
              </div>
              <div className="trail-card-body">
                <h3 className="trail-card-title">{role.title}</h3>
                <p className="trail-card-desc">{role.description}</p>
                <div className="trail-card-footer">
                  <span className="trail-card-reward">
                    <strong>Parcours guidé</strong>
                  </span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                    Explorer {'\u2192'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Pourquoi MDM Academy</span>
            <h2>Une formation pensée pour les pros Apple et MDM</h2>
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
          <h2 style={{ fontSize: '1.6rem', marginTop: '0.35rem' }}>Crée ton profil et tracke ta progression.</h2>
          <p className="muted" style={{ marginTop: '0.5rem', maxWidth: 540 }}>
            Connecte-toi pour synchroniser ton rang, tes quêtes hebdo et démarrer un sprint certification
            Apple, Jamf ou Intune.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Button href="/auth" size="lg">
            Créer mon compte
          </Button>
          <Button href="/pricing" size="lg" variant="secondary">
            Voir les tarifs
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

function gradientForRole(track: string) {
  if (track === 'APPLE') return 'linear-gradient(135deg, #1d1d1f 0%, #4b4d57 100%)';
  if (track === 'JAMF') return 'linear-gradient(135deg, #ff5b00 0%, #ff9e2c 100%)';
  if (track === 'INTUNE') return 'linear-gradient(135deg, #0070d2 0%, #16cdf1 100%)';
  if (track === 'SPRINT') return 'linear-gradient(135deg, #4834d4 0%, #a29bfe 100%)';
  return 'linear-gradient(135deg, #032d60 0%, #0070d2 100%)';
}

function trackLabelForRole(track: string) {
  if (track === 'APPLE') return 'Support · Apple';
  if (track === 'JAMF') return 'Admin · Jamf';
  if (track === 'INTUNE') return 'Admin · Microsoft Intune';
  if (track === 'SPRINT') return 'Sprint · Certification';
  return 'Parcours';
}
