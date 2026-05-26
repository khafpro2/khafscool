import type { Metadata } from 'next';
import { coursesPageMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = coursesPageMetadata;

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
