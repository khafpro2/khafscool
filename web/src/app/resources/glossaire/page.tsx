import type { Metadata } from 'next';
import { GlossaryPageClient } from './GlossaryPageClient';

export const metadata: Metadata = {
  title: 'Glossaire MDM',
  description:
    'Glossaire français MDM Apple : ABM, ADE, DEP, VPP, SCEP, supervision, Smart Group, conformité, wipe sélectif et plus.',
  openGraph: {
    title: 'Glossaire MDM — MDM Academy Pro',
    description: 'Plus de 30 termes MDM Apple, Jamf et Intune expliqués en français.',
  },
  alternates: { canonical: '/resources/glossaire' },
};

export default function GlossaryPage() {
  return <GlossaryPageClient />;
}
