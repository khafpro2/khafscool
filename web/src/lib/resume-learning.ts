import type { DashboardData } from '@/lib/api';
import { formatTrack } from '@/lib/tracks';

export type ResumeLearningAction = {
  title: string;
  description: string;
  href: string;
  cta: string;
  meta: string;
  hasProgress: boolean;
};

export function getResumeLearningAction(data: DashboardData): ResumeLearningAction {
  const nextCourse = data.courses.find((course) => course.nextModule);

  if (nextCourse?.nextModule) {
    return {
      title: nextCourse.nextModule.title,
      description: `Continue le parcours ${formatTrack(nextCourse.track)} là où tu t’es arrêté.`,
      href: `/courses/${nextCourse.slug}#module-${nextCourse.nextModule.slug}`,
      cta: 'Continuer l’apprentissage',
      meta: `${nextCourse.progressPercent ?? 0} % du parcours complété`,
      hasProgress: true,
    };
  }

  const incompleteCourse = data.courses.find((course) => (course.progressPercent ?? 0) < 100);

  if (incompleteCourse) {
    return {
      title: incompleteCourse.title,
      description: `Ouvre la prochaine unité disponible pour renforcer ton socle ${formatTrack(incompleteCourse.track)}.`,
      href: `/courses/${incompleteCourse.slug}`,
      cta: 'Continuer l’apprentissage',
      meta: `${incompleteCourse.progressPercent ?? 0} % du parcours complété`,
      hasProgress: true,
    };
  }

  return getFallbackResumeAction();
}

export function getFallbackResumeAction(): ResumeLearningAction {
  return {
    title: 'Aucun parcours en cours',
    description: 'Explore le catalogue Apple, Jamf ou Intune pour démarrer ta prochaine unité.',
    href: '/courses',
    cta: 'Explorer les parcours',
    meta: 'Connecte-toi pour synchroniser ta progression',
    hasProgress: false,
  };
}
