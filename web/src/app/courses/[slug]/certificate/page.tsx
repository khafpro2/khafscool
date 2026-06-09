import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CourseCertificateClient } from '@/components/courses/CourseCertificateClient';
import { getLearningPath } from '@/lib/learningPaths';
import { buildCourseCertificateMetadata } from '@/lib/seo-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getLearningPath(slug);

  if (!path) {
    return {
      title: 'Certificat introuvable',
      description: 'Ce certificat MDM Academy n’existe pas ou le parcours n’est plus disponible.',
      robots: { index: false, follow: true },
    };
  }

  return buildCourseCertificateMetadata(slug, path.title);
}

export default async function CourseCertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getLearningPath(slug)) notFound();
  return <CourseCertificateClient slug={slug} />;
}
