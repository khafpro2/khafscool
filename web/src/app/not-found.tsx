import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getTrackVisual } from '@/lib/design';

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: 'Cette page n’existe pas sur MDM Academy Pro. Retourne à l’accueil ou explore les parcours.',
  robots: { index: false, follow: true },
};

const NOT_FOUND_GRADIENT = getTrackVisual('DEFAULT').gradient;

export default function NotFound() {
  return (
    <section style={{ padding: '1rem 0 2rem' }}>
      <div className="hero" style={{ background: NOT_FOUND_GRADIENT, marginTop: 0 }}>
        <span className="hero-eyebrow">
          <span aria-hidden>{'\u{1F50D}'}</span> Erreur 404
        </span>
        <h1>Cette page n’existe pas.</h1>
        <p style={{ marginTop: '0.85rem', maxWidth: 560 }}>
          L’URL demandée est introuvable ou a été déplacée. Pas de panique — retourne à l’accueil ou choisis un
          parcours Apple, Jamf ou Intune pour continuer ta formation.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button href="/" size="lg">
            Retour à l’accueil
          </Button>
          <Button
            href="/courses"
            variant="ghost"
            size="lg"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
          >
            Voir les parcours
          </Button>
        </div>
      </div>

      <Card variant="soft" style={{ marginTop: '1.5rem' }}>
        <span className="section-eyebrow">Liens utiles</span>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.5rem' }}>Où aller ensuite ?</h2>
        <ul
          className="muted"
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            listStyle: 'none',
            padding: 0,
          }}
        >
          <li>
            <Link href="/">Accueil — présentation MDM Academy Pro</Link>
          </li>
          <li>
            <Link href="/courses">Parcours — Apple, Jamf Pro et Microsoft Intune</Link>
          </li>
          <li>
            <Link href="/dashboard">Tableau de bord — ma progression</Link>
          </li>
          <li>
            <Link href="/sprint">Sprint certification — programme 7 jours</Link>
          </li>
          <li>
            <Link href="/auth">Connexion — commencer gratuitement</Link>
          </li>
          <li>
            <Link href="/about">À propos — mission et vision</Link>
          </li>
        </ul>
      </Card>
    </section>
  );
}
