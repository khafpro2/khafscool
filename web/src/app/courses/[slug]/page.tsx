import { CourseDetailClient } from '@/components/courses/CourseDetailClient';

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CourseDetailClient slug={slug} />;
}
