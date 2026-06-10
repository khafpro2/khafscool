import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLearningPath } from '@/lib/learningPaths';
import { courseCompletePageMetadata } from '@/lib/seo-metadata';
import dynamic from 'next/dynamic';
const CourseCompleteClient = dynamic(
  () => import('@/components/courses/CourseCompleteClient').then(m => ({ default: m.CourseCompleteClient })),
  { ssr: false }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getLearningPath(slug);
  if (!path) return { title: 'Parcours introuvable', robots: { index: false } };
  return { ...courseCompletePageMetadata, title: `Bravo — ${path.title}` };
}

export default async function CourseCompletePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getLearningPath(slug)) notFound();
  return <CourseCompleteClient slug={slug} />;
}
