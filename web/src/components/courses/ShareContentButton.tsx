'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

type ShareFeedback = 'shared' | 'copied' | 'error' | null;

export type ShareContentButtonProps = {
  shareTitle: string;
  shareText: string;
  shareUrlPath: string;
  label?: string;
  ariaLabel?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
};

function buildSharePayload(shareTitle: string, shareText: string, shareUrlPath: string) {
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}${shareUrlPath}`
      : shareUrlPath;
  return {
    url,
    title: shareTitle,
    text: `${shareText} ${url}`,
  };
}

export function ShareContentButton({
  shareTitle,
  shareText,
  shareUrlPath,
  label = 'Partager',
  ariaLabel = 'Partager',
  variant = 'secondary',
}: ShareContentButtonProps) {
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
    const { url, title, text } = buildSharePayload(shareTitle, shareText, shareUrlPath);

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
  }, [canNativeShare, shareText, shareTitle, shareUrlPath]);

  const buttonLabel =
    feedback === 'shared'
      ? 'Partagé !'
      : feedback === 'copied'
        ? 'Lien copié !'
        : feedback === 'error'
          ? 'Copie impossible'
          : label;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.35rem' }}>
      <Button
        type="button"
        variant={variant}
        icon={feedback ? '\u2705' : '\u{1F4E4}'}
        onClick={() => void handleShare()}
        aria-label={ariaLabel}
      >
        {buttonLabel}
      </Button>
      {feedback === 'copied' && (
        <span className="muted" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
          Colle le lien dans Teams, Slack ou LinkedIn.
        </span>
      )}
    </div>
  );
}
