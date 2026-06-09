import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ressources officielles MDM',
  description:
    'Liens officiels Apple, Jamf et Microsoft pour préparer tes certifications MDM : documentation, portails de formation et références techniques.',
  openGraph: {
    title: 'Ressources officielles — MDM Academy',
    description: 'Documentation Apple, Jamf et Microsoft pour admins MDM et candidats aux certifications.',
  },
  alternates: { canonical: '/resources' },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
