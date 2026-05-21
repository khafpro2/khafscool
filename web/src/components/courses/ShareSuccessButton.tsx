'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

type ShareFeedback = 'shared' | 'copied' | 'error' | null;

function buildSharePayload(courseTitle: string, slug: string) {
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/courses/${slug}/complete`
      : `/courses/${slug}/complete`;
  const text = `J'ai complété le parcours « ${courseTitle} » sur Apple MDM Academy.`;
  return {
    url,
    title: 'Parcours terminé — MDM Academy',
    text: `${text} ${url}`,
  };
}

export function ShareSuccessButton({
  courseTitle,
  slug,
}: {
  courseTitle: string;
  slug: string;
}) {
  const [feedback, setFeedback] = useState<ShareFeedback>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2800);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleShare = useCallback(async () => {
    const { url, title, text } = buildSharePayload(courseTitle, slug);

    if (canNativeShare) {
      try {
        await navigator.share({ title, text, url });
        setFeedback('shared');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setFeedback('copied');
    } catch {
      setFeedback('error');
    }
  }, [canNativeShare, courseTitle, slug]);

  const label =
    feedback === 'shared'
      ? 'Partagé !'
      : feedback === 'copied'
        ? 'Lien copié !'
        : feedback === 'error'
          ? 'Copie impossible'
          : 'Partager ma réussite';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.35rem' }}>
      <Button
        type="button"
        variant="secondary"
        icon={feedback ? '\u2705' : '\u{1F4E4}'}
        onClick={() => void handleShare()}
        aria-label="Partager ma réussite de parcours"
      >
        {label}
      </Button>
      {feedback === 'copied' && (
        <span className="muted" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
          Colle le lien dans Teams, Slack ou LinkedIn.
        </span>
      )}
    </div>
  );
}
