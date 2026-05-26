'use client';

import { ShareContentButton } from '@/components/courses/ShareContentButton';

export function ShareSuccessButton({
  courseTitle,
  slug,
}: {
  courseTitle: string;
  slug: string;
}) {
  return (
    <ShareContentButton
      shareTitle="Parcours terminé — MDM Academy"
      shareText={`J'ai complété le parcours « ${courseTitle} » sur Apple MDM Academy.`}
      shareUrlPath={`/courses/${slug}/complete`}
      label="Partager ma réussite"
      ariaLabel="Partager ma réussite de parcours"
    />
  );
}
