import { CourseCertificateClient } from '@/components/courses/CourseCertificateClient';

export const metadata = {
  title: 'Certificat de complétion — MDM Academy',
  description: 'Certificat imprimable de complétion de parcours Apple MDM Academy.',
};

export default async function CourseCertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CourseCertificateClient slug={slug} />;
}
