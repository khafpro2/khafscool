'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/Button';

export function SiteHeaderActions() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className="site-actions">
      <ThemeToggle />
      {!isHome ? (
        <Button href="/profile" variant="ghost" size="sm">
          Profil
        </Button>
      ) : null}
      <Button href="/auth" size="sm">
        Connexion
      </Button>
    </div>
  );
}
