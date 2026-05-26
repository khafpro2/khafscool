import type { CSSProperties } from 'react';
import * as React from 'react';

type CardVariant = 'default' | 'soft' | 'flat' | 'elevated' | 'gradient';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  as?: 'div' | 'section' | 'article' | 'aside';
  className?: string;
  style?: CSSProperties;
  id?: string;
}

const VARIANT_CLASS: Record<CardVariant, string> = {
  default: 'card',
  soft: 'card card-soft',
  flat: 'card card-flat',
  elevated: 'card card-elevated',
  gradient: 'card card-gradient',
};

export function Card({
  children,
  variant = 'default',
  as: Component = 'section',
  className,
  style,
  id,
}: CardProps) {
  const classes = [VARIANT_CLASS[variant], className].filter(Boolean).join(' ');
  return (
    <Component id={id} className={classes} style={style}>
      {children}
    </Component>
  );
}
