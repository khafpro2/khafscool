import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion',
  description:
    'Connecte-toi à MDM Academy pour sauvegarder ta progression, débloquer tes badges et accéder à ton tableau de bord Apple, Jamf et Intune.',
  openGraph: {
    title: 'Connexion — MDM Academy',
    description: 'Connexion ou inscription gratuite pour sauvegarder ta progression MDM.',
  },
  alternates: { canonical: '/auth' },
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
