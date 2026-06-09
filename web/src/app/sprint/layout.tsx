import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sprint certification',
  description:
    'Lance un sprint de certification MDM : 7 jours intensifs pour maîtriser Apple Device Support, Jamf Pro ou Microsoft Intune avec suivi journalier.',
  openGraph: {
    title: 'Sprint certification — MDM Academy',
    description: 'Programme 7 jours pour préparer ta certification Apple, Jamf ou Intune.',
  },
  alternates: { canonical: '/sprint' },
};

export default function SprintLayout({ children }: { children: React.ReactNode }) {
  return children;
}
