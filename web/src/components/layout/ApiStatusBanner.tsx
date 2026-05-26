'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { API_URL_DISPLAY, IS_API_URL_CONFIGURED } from '@/lib/api';
import { useApiUnavailable } from '@/lib/api-health';

/** Masqué sur `/` — accueil plein écran sans chrome latéral. */
export function ApiStatusBanner() {
  const pathname = usePathname();
  const unavailable = useApiUnavailable();

  if (pathname === '/' || !unavailable) return null;

  return (
    <div className="api-status-banner" role="alert">
      <span>
        {IS_API_URL_CONFIGURED
          ? `API indisponible — vérifiez que le backend répond sur ${API_URL_DISPLAY}`
          : 'API indisponible — NEXT_PUBLIC_API_URL non configurée sur Vercel (redeploy requis).'}
      </span>
      <Link href="/diagnostics" className="api-status-banner-link">
        Diagnostics
      </Link>
    </div>
  );
}
