import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MVP — feuille de route',
  description: 'Fonctionnalités livrées et roadmap publique de MDM Academy Pro.',
  robots: { index: false, follow: true },
};

export default function MvpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
