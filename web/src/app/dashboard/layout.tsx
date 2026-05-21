import type { Metadata } from 'next';
import { dashboardPageMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = dashboardPageMetadata;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
