import type { CourseSummary } from '../services/progress';
import { formatTrack } from './design';

export type ResumeLearningAction = {
  title: string;
  description: string;
  route: string;
  cta: string;
  meta: string;
  hasProgress: boolean;
};

type ResumeCourses = Pick<CourseSummary, 'slug' | 'title' | 'track' | 'progressPercent' | 'nextModule'>[];

export function getResumeLearningAction(courses: ResumeCourses): ResumeLearningAction {
  const nextCourse = courses.find((course) => course.nextModule);

  if (nextCourse?.nextModule) {
    return {
      title: nextCourse.nextModule.title,
      description: `Continue le parcours ${formatTrack(nextCourse.track)} là où tu t’es arrêté.`,
      route: `/course/${nextCourse.slug}`,
      cta: 'Continuer l’apprentissage',
      meta: `${nextCourse.progressPercent ?? 0} % du parcours complété`,
      hasProgress: true,
    };
  }

  const incompleteCourse = courses.find((course) => (course.progressPercent ?? 0) < 100);

  if (incompleteCourse) {
    return {
      title: incompleteCourse.title,
      description: `Ouvre la prochaine unité disponible pour renforcer ton socle ${formatTrack(incompleteCourse.track)}.`,
      route: `/course/${incompleteCourse.slug}`,
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
    route: '/(tabs)/courses',
    cta: 'Explorer les parcours',
    meta: 'Connecte-toi pour synchroniser ta progression',
    hasProgress: false,
  };
}
