import Link from 'next/link';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import * as React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'warm';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface AsButton extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'style' | 'className'> {
  href?: undefined;
}

interface AsLink extends BaseProps {
  href: string;
  type?: never;
  disabled?: boolean;
  prefetch?: boolean;
}

type ButtonProps = AsButton | AsLink;

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
  dark: 'btn btn-dark',
  warm: 'btn btn-warm',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

function classes(variant: ButtonVariant, size: ButtonSize, fullWidth: boolean, extra?: string) {
  return [
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    fullWidth ? 'btn-full' : '',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', icon, fullWidth = false, className, style } = props;
  const computedClassName = classes(variant, size, fullWidth, className);
  const finalStyle: CSSProperties = fullWidth ? { width: '100%', ...style } : style ?? {};

  if ('href' in props && typeof props.href === 'string') {
    const { href, disabled, prefetch } = props;
    if (disabled) {
      return (
        <span
          className={computedClassName}
          style={{ ...finalStyle, opacity: 0.5, pointerEvents: 'none' }}
          aria-disabled="true"
        >
          {icon && <span aria-hidden>{icon}</span>}
          <span>{children}</span>
        </span>
      );
    }
    return (
      <Link href={href} prefetch={prefetch} className={computedClassName} style={finalStyle}>
        {icon && <span aria-hidden>{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  }

  const { variant: _v, size: _s, icon: _i, fullWidth: _f, className: _c, style: _st, children: _ch, ...rest } = props as AsButton;
  void _v;
  void _s;
  void _i;
  void _f;
  void _c;
  void _st;
  void _ch;
  return (
    <button type="button" {...rest} className={computedClassName} style={finalStyle}>
      {icon && <span aria-hidden>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
