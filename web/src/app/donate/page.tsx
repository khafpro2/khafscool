'use client';

import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/** Redirige /donate → /soutenir en préservant query string et fragment (#carte, #paypal…). */
export default function DonateRedirectPage() {
  useEffect(() => {
    const { search, hash } = window.location;
    window.location.replace(`/soutenir${search}${hash}`);
  }, []);

  return <LoadingSpinner label="Redirection vers la page Soutenir…" />;
}
