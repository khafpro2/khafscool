'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Redirige /donate → /soutenir en préservant query string ET fragment.
 * Client-side nécessaire car les fragments (#) ne sont pas transmis au serveur.
 */
export default function DonateRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const hash = window.location.hash; // fragment non disponible côté serveur
    const destination = `/soutenir${query ? `?${query}` : ''}${hash}`;
    router.replace(destination);
  }, [router, searchParams]);

  return <LoadingSpinner label="Redirection vers la page Soutenir…" />;
}
