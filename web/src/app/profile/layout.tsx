import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon profil',
  description:
    'Ton profil MDM Academy : progression par piste, badges obtenus, historique des modules et paramètres de compte.',
  openGraph: {
    title: 'Mon profil — MDM Academy',
    description: 'Progression, badges et paramètres de ton compte MDM Academy.',
  },
  alternates: { canonical: '/profile' },
  robots: { index: false, follow: true },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
