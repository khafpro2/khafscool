import type { Metadata } from 'next';
import { SoutenirPageClient } from './SoutenirPageClient';

export const metadata: Metadata = {
  title: 'Soutenir le projet — Don volontaire',
  description:
    'Soutenez MDM Academy Pro par un don optionnel. La formation Apple, Jamf et Intune reste 100 % gratuite.',
  openGraph: {
    locale: 'fr_FR',
    title: 'Soutenir MDM Academy Pro',
    description: 'Don volontaire pour maintenir une formation MDM 100 % gratuite.',
    url: '/soutenir',
  },
  alternates: {
    canonical: '/soutenir',
  },
};

export default function SoutenirPage() {
  return <SoutenirPageClient />;
}
