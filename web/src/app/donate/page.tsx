import { redirect } from 'next/navigation';

type DonatePageProps = {
  searchParams: Promise<Record<string, string>>;
};

/**
 * Redirige /donate → /soutenir en préservant les query params.
 * Version serveur (plus rapide que le useEffect client-side précédent).
 */
export default async function DonateRedirectPage({ searchParams }: DonatePageProps) {
  const params = await searchParams;
  const query = new URLSearchParams(params).toString();
  const destination = query ? `/soutenir?${query}` : '/soutenir';
  redirect(destination);
}
