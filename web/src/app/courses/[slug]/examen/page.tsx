import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
const CoursePracticeExamClient = dynamic(
  () => import('@/components/courses/CoursePracticeExamClient').then(m => ({ default: m.CoursePracticeExamClient })),
  { ssr: false }
);
import { getLearningPath } from '@/lib/learningPaths';
import { buildCoursePracticeExamMetadata } from '@/lib/seo-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getLearningPath(slug);

  if (!path) {
    return {
      title: 'Examen blanc introuvable',
      description: 'Cet examen blanc MDM Academy n’existe pas ou le parcours n’est plus disponible.',
      robots: { index: false, follow: true },
    };
  }

  return buildCoursePracticeExamMetadata(slug, path.title);
}

export default async function CoursePracticeExamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getLearningPath(slug)) notFound();
  return <CoursePracticeExamClient slug={slug} />;
}
