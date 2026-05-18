import type { CSSProperties } from 'react';
import * as React from 'react';

type BadgeTone = 'accent' | 'success' | 'warning' | 'neutral' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  icon?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

const TONE_CLASS: Record<BadgeTone, string> = {
  accent: 'pill',
  success: 'pill pill-success',
  warning: 'pill pill-warning',
  neutral: 'pill pill-neutral',
  outline: 'pill pill-outline',
};

export function Badge({ children, tone = 'accent', icon, title, className, style }: BadgeProps) {
  const classes = [TONE_CLASS[tone], className].filter(Boolean).join(' ');
  return (
    <span className={classes} title={title} style={style}>
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </span>
  );
}
