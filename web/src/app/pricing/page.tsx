import { redirect } from 'next/navigation';

/** Tarifs retirés — accès 100 % gratuit vers le catalogue. */
export default function PricingPage() {
  redirect('/courses');
}
