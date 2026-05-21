import type { Metadata } from 'next';
import { getLearningPath } from '@/lib/learningPaths';
import { CourseDetailClient } from '@/components/courses/CourseDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getLearningPath(slug);

  if (!path) {
    return {
      title: 'Parcours introuvable',
      description: 'Ce parcours MDM Academy n’existe pas ou n’est plus disponible.',
    };
  }

  return {
    title: path.title,
    description: `${path.shortTitle} — ${path.objectives.join(' ')}`,
    openGraph: {
      title: path.title,
      description: path.objectives[0],
    },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CourseDetailClient slug={slug} />;
}
