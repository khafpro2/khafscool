import { describe, expect, it } from 'vitest';

type CourseLike = {
  slug: string;
  title: string;
  track: string;
  progressPercent?: number;
  nextModule?: { slug: string; title: string } | null;
};

function getResumeLearningAction(courses: CourseLike[]) {
  const nextCourse = courses.find((course) => course.nextModule);
  if (nextCourse?.nextModule) {
    return {
      title: nextCourse.nextModule.title,
      hasProgress: true,
      slug: nextCourse.slug,
      href: `/courses/${nextCourse.slug}#module-${nextCourse.nextModule.slug}`,
    };
  }
  const incomplete = courses.find((course) => (course.progressPercent ?? 0) < 100);
  if (incomplete) {
    return { title: incomplete.title, hasProgress: true, slug: incomplete.slug, href: `/courses/${incomplete.slug}` };
  }
  return { title: 'Aucun parcours en cours', hasProgress: false, slug: null, href: '/courses' };
}

describe('resume learning (logique partagée web/mobile)', () => {
  it('priorise le module nextModule du dashboard', () => {
    const action = getResumeLearningAction([
      {
        slug: 'jamf-pro-foundations',
        title: 'Jamf',
        track: 'JAMF',
        progressPercent: 10,
        nextModule: null,
      },
      {
        slug: 'apple-cert-prep',
        title: 'Apple',
        track: 'APPLE',
        progressPercent: 67,
        nextModule: { slug: 'mdm-basics', title: 'Bases MDM' },
      },
    ]);

    expect(action).toEqual({
      title: 'Bases MDM',
      hasProgress: true,
      slug: 'apple-cert-prep',
      href: '/courses/apple-cert-prep#module-mdm-basics',
    });
  });

  it('ajoute le hash module sur le CTA resume quand nextModule est connu', () => {
    const action = getResumeLearningAction([
      {
        slug: 'apple-cert-prep',
        title: 'Apple',
        track: 'APPLE',
        progressPercent: 33,
        nextModule: { slug: 'mdm-basics', title: 'Bases MDM' },
      },
    ]);

    expect(action.href).toBe('/courses/apple-cert-prep#module-mdm-basics');
  });

  it('retombe sur un parcours incomplet sans nextModule', () => {
    const action = getResumeLearningAction([
      {
        slug: 'intune-ios-enrollment',
        title: 'Intune',
        track: 'INTUNE',
        progressPercent: 33,
        nextModule: null,
      },
    ]);

    expect(action.hasProgress).toBe(true);
    expect(action.slug).toBe('intune-ios-enrollment');
  });
});
