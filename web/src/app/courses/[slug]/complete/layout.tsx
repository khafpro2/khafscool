import type { Metadata } from 'next';
import { courseCompletePageMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = courseCompletePageMetadata;

export default function CourseCompleteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
