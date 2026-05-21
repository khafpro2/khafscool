'use client';

import Link from 'next/link';
import { useApiUnavailable } from '@/lib/api-health';

export function ApiStatusBanner() {
  const unavailable = useApiUnavailable();

  if (!unavailable) return null;

  return (
    <div className="api-status-banner" role="alert">
      <span>
        API indisponible — vérifiez que le backend tourne sur :4000
      </span>
      <Link href="/diagnostics" className="api-status-banner-link">
        Diagnostics
      </Link>
    </div>
  );
}
