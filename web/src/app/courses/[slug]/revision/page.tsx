import type { Metadata } from 'next';
import { CourseRevisionClient } from '@/components/courses/CourseRevisionClient';
import { getLearningPath } from '@/lib/learningPaths';
import { buildCourseRevisionMetadata } from '@/lib/seo-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getLearningPath(slug);

  if (!path) {
    return {
      title: 'Fiche révision introuvable',
      description: 'Cette fiche révision MDM Academy n’existe pas ou le parcours n’est plus disponible.',
      robots: { index: false, follow: true },
    };
  }

  return buildCourseRevisionMetadata(slug, path.title);
}

export default async function CourseRevisionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CourseRevisionClient slug={slug} />;
}
