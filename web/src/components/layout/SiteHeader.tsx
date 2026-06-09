'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteHeaderActions } from '@/components/layout/SiteHeaderActions';
import { SiteNavLinks } from '@/components/layout/SiteNavLinks';
import { SiteMobileNav } from '@/components/layout/SiteMobileNav';

/** Masqué sur `/` uniquement — nav globale conservée sur les autres routes. */
export function SiteHeader() {
  const pathname = usePathname();
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-logo" aria-label="Retour à l'accueil MDM Academy">
          <span className="site-logo-mark" aria-hidden>
            M
          </span>
          <span className="site-logo-wordmark">
            <span className="site-logo-mdm">MDM</span>
            <span className="site-logo-academy">Academy</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Navigation principale">
          <SiteNavLinks />
        </nav>
        <SiteHeaderActions />
        <SiteMobileNav />
      </div>
    </header>
  );
}
