'use client';

import { useDemoMode } from '@/lib/demo-mode';

export function DemoModeBanner() {
  const active = useDemoMode();

  if (!active) return null;

  return (
    <div
      role="status"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'linear-gradient(90deg, #fff7d6 0%, #fef3c7 100%)',
        borderBottom: '1px solid #f0cf7a',
        color: '#6b5200',
        fontSize: '0.85rem',
        fontWeight: 600,
        textAlign: 'center',
        padding: '0.45rem 1rem',
      }}
    >
      Mode démo — données locales (API indisponible ou session absente)
    </div>
  );
}
