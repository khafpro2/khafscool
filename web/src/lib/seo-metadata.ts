import type { Metadata } from 'next';

const SITE = 'MDM Academy Pro';

export const coursesPageMetadata: Metadata = {
  title: 'Catalogue des parcours MDM',
  description:
    'Parcours gratuits Apple Device Support, Jamf Pro et Microsoft Intune : quiz, mini-scénarios, badges et progression gamifiée.',
  openGraph: {
    title: `Catalogue des parcours — ${SITE}`,
    description:
      'Trois pistes MDM (Apple, Jamf, Intune) avec unités, QCM et scénarios pratiques — 100 % gratuit.',
  },
  alternates: { canonical: '/courses' },
};

export const dashboardPageMetadata: Metadata = {
  title: 'Tableau de bord',
  description:
    'Suis ta progression MDM, tes badges, quêtes hebdomadaires et actions rapides par piste Apple, Jamf ou Intune.',
  openGraph: {
    title: `Tableau de bord — ${SITE}`,
    description: 'Progression, badges, quêtes et sprint certification en un coup d’œil.',
  },
  alternates: { canonical: '/dashboard' },
};

export const leaderboardPageMetadata: Metadata = {
  title: 'Classement',
  description:
    'Top apprenants MDM Academy : rangs, points cumulés et motivation pour progresser sur Apple, Jamf et Intune.',
  openGraph: {
    title: `Classement — ${SITE}`,
    description: 'Compare ta progression aux autres apprenants du catalogue MDM.',
  },
  alternates: { canonical: '/leaderboard' },
};

export const courseCompletePageMetadata: Metadata = {
  title: 'Parcours terminé',
  description:
    'Célébration de complétion : points gagnés, super-badge débloqué et prochaines étapes sur MDM Academy Pro.',
  robots: { index: false, follow: true },
};

export function buildCourseCertificateMetadata(
  slug: string,
  courseTitle?: string
): Metadata {
  const title = courseTitle ?? 'Parcours MDM';
  const canonical = `/courses/${slug}/certificate`;

  return {
    title: `Certificat — ${title}`,
    description: `Certificat imprimable de complétion du parcours ${title} sur MDM Academy Pro.`,
    openGraph: {
      locale: 'fr_FR',
      title: `Certificat de complétion — ${title}`,
      description: `Preuve de complétion du parcours ${title} (Apple MDM, Jamf ou Intune).`,
      url: canonical,
    },
    alternates: { canonical },
    robots: { index: false, follow: true },
  };
}
