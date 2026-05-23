import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { parseDonateDeepLink } from '../lib/donate-deep-link';

/** Ouvre `/donate` dans l’app pour les liens scheme ou universal link /donate et /soutenir. */
export function DonateDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    function openDonateScreen(url: string | null) {
      if (!url) return;
      const params = parseDonateDeepLink(url);
      if (!params) return;

      router.push({
        pathname: '/donate',
        params: {
          ...(params.amount ? { amount: params.amount } : {}),
          ...(params.mode ? { mode: params.mode } : {}),
        },
      });
    }

    void Linking.getInitialURL().then(openDonateScreen);
    const subscription = Linking.addEventListener('url', ({ url }) => openDonateScreen(url));
    return () => subscription.remove();
  }, [router]);

  return null;
}
