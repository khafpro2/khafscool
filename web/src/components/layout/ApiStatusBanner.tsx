'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useApiUnavailable } from '@/lib/api-health';

/** Masqué sur `/` — accueil plein écran sans chrome latéral. */
export function ApiStatusBanner() {
  const pathname = usePathname();
  const unavailable = useApiUnavailable();

  if (pathname === '/' || !unavailable) return null;

  return (
    <div className="api-status-banner" role="alert">
      <span>
        API indisponible — vérifiez que le backend tourne sur {API_URL}
      </span>
      <Link href="/diagnostics" className="api-status-banner-link">
        Diagnostics
      </Link>
    </div>
  );
}
