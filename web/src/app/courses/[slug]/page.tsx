import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLearningPath } from '@/lib/learningPaths';
import { MVP_TRACK_SLUGS } from '@ama/shared/learning-paths';
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
      description: "Ce parcours MDM Academy n'existe pas ou n'est plus disponible.",
    };
  }

  return {
    title: path.title,
    description: `${path.shortTitle} — ${path.objectives.join(' ')} Parcours MDM Academy Pro gratuit avec quiz et badges.`,
    openGraph: {
      title: `${path.title} — MDM Academy Pro`,
      description: path.objectives[0],
      type: 'website',
    },
    alternates: {
      canonical: `/courses/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return MVP_TRACK_SLUGS.map((slug) => ({ slug }));
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = getLearningPath(slug);
  if (!path) {
    notFound();
  }

  // Course JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: path.title,
    description: path.objectives[0] ?? path.shortTitle,
    provider: {
      "@type": "Organization",
      name: "MDM Academy Pro",
      url: "https://apple-mdm-academy-refonte.vercel.app",
    },
    url: `https://apple-mdm-academy-refonte.vercel.app/courses/${slug}`,
    inLanguage: "fr",
    isAccessibleForFree: true,
    teaches: "Apple MDM, Jamf Pro, Microsoft Intune",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseDetailClient slug={slug} />
    </>
  );
}
