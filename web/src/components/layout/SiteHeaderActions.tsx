'use client';

import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { getStoredUser } from '@/lib/auth';

export function SiteHeaderActions() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Hydration côté client — lit localStorage/sessionStorage
    setIsLoggedIn(Boolean(getStoredUser()));
  }, []);

  return (
    <div className="site-actions">
      <ThemeToggle />
      {isLoggedIn ? (
        <Button href="/profile" variant="ghost" size="sm">
          Profil
        </Button>
      ) : (
        <Button href="/auth" size="sm">
          Connexion
        </Button>
      )}
    </div>
  );
}
