import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diagnostics système',
  description:
    'Vérification de la connectivité API, état des services OAuth et configuration de ton environnement MDM Academy.',
  robots: { index: false, follow: true },
};

export default function DiagnosticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
