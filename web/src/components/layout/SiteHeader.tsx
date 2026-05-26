'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteHeaderActions } from '@/components/layout/SiteHeaderActions';

/** Masqué sur `/` uniquement — nav globale conservée sur les autres routes. */
export function SiteHeader() {
  const pathname = usePathname();
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="site-header site-header-minimal">
      <div className="container site-header-inner site-header-inner-minimal">
        <Link href="/" className="site-logo" aria-label="Retour à l'accueil MDM Academy">
          <span className="site-logo-mark" aria-hidden>
            M
          </span>
          <span className="site-logo-wordmark">
            <span className="site-logo-mdm">MDM</span>
            <span className="site-logo-academy">Academy</span>
          </span>
        </Link>
        <SiteHeaderActions />
      </div>
    </header>
  );
}
