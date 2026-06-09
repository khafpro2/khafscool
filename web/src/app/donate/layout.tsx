import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Don — redirection',
  robots: { index: false, follow: false },
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
