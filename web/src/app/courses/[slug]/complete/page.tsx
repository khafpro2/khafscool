import { CourseCompleteClient } from '@/components/courses/CourseCompleteClient';

export default async function CourseCompletePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CourseCompleteClient slug={slug} />;
}
