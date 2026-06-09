'use client';

import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { getStoredUser } from '@/lib/auth';

export function SiteHeaderActions() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Hydration initiale
    setIsLoggedIn(Boolean(getStoredUser()));

    // Synchronisation en temps réel (login/logout dans le même onglet ou un autre)
    function onStorage() {
      setIsLoggedIn(Boolean(getStoredUser()));
    }

    window.addEventListener('storage', onStorage);
    // Écoute aussi les changements dans le même onglet via un event custom
    window.addEventListener('ama:auth-change', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ama:auth-change', onStorage);
    };
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
