import { MVP_TRACK_SLUGS, type CourseSlug } from './learning-paths';

export const COURSE_SLUGS = [...MVP_TRACK_SLUGS] as const;

export type NextCourseLink = { slug: CourseSlug; title: string };

export const NEXT_COURSE_BY_SLUG: Partial<Record<CourseSlug, NextCourseLink>> = {
  'apple-cert-prep': { slug: 'jamf-pro-foundations', title: 'Fondamentaux Jamf Pro' },
  'jamf-pro-foundations': { slug: 'intune-ios-enrollment', title: 'Microsoft Intune pour Apple' },
};
