import type { Metadata } from 'next';
import { HomeWelcomeScreen } from '@/components/home/HomeWelcomeScreen';

export const metadata: Metadata = {
  title: 'Apple MDM Academy — Formation Apple, Jamf Pro & Intune',
  description:
    'Plateforme de formation certifiante pour administrateurs Apple : Jamf 100/200, Apple Certified IT Pro, Microsoft Intune. Quiz, examens blancs, labs pratiques.',
  openGraph: {
    title: 'Apple MDM Academy — Formation Apple, Jamf Pro & Intune',
    description:
      'Prépare tes certifications Apple MDM avec des cours, labs, examens blancs et certificats PDF.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="home-page home-page-minimal">
      <HomeWelcomeScreen />
    </div>
  );
}
