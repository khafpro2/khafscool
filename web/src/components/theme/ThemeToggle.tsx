'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPreferredTheme, persistTheme, type Theme } from '@/lib/theme';

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getPreferredTheme());
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    persistTheme(next);
    setTheme(next);
  }, [theme]);

  const label =
    theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre';

  return (
    <button
      type="button"
      className={['theme-toggle', className].filter(Boolean).join(' ')}
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={mounted ? theme === 'dark' : undefined}
    >
      <span className="theme-toggle-icon" aria-hidden>
        {mounted ? (theme === 'dark' ? '☀️' : '🌙') : '🌙'}
      </span>
      <span className="theme-toggle-label sr-only">{label}</span>
    </button>
  );
}
