'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getContactMailto } from '@/lib/contact';
import { InstallAppButton } from '@/components/home/InstallAppButton';

/** Masqué sur `/` uniquement — footer global conservé sur les autres routes. */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === '/') {
    return null;
  }

  const contactMailto = getContactMailto();

  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <strong>MDM Academy</strong>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Apple, Jamf Pro et Intune en mode jeu</span>
          <InstallAppButton />
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/courses">Parcours</Link>
          <Link href="/dashboard">Tableau de bord</Link>
          <Link href="/quests">Quêtes</Link>
          <Link href="/sprint">Sprint</Link>
          <Link href="/badges">Badges</Link>
          <Link href="/leaderboard">Classement</Link>
          <Link href="/resources">Ressources</Link>
          <Link href="/about">À propos</Link>
          <Link href={contactMailto}>Nous contacter</Link>
          <Link href="/soutenir">Faire un don</Link>
          <Link href="/demo">Démo</Link>
          <Link href="/diagnostics" className="site-footer-tools">
            Diagnostics
          </Link>
          <Link href="/legal/confidentialite">Confidentialité</Link>
          <Link href="/legal/conditions">Conditions</Link>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
          Non affilié à Apple Inc., Jamf ou Microsoft. ·{' '}
          <Link href={contactMailto} style={{ color: 'inherit' }}>
            Assistance
          </Link>
        </div>
      </div>
    </footer>
  );
}
