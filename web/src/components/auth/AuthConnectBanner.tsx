import { buildAuthUrl } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function AuthConnectBanner({
  redirectPath,
  message = 'Connecte-toi pour voir tes vraies données. L’aperçu démo ci-dessous te permet d’explorer le format.',
}: {
  redirectPath: string;
  message?: string;
}) {
  return (
    <Card
      style={{
        marginBottom: '1.25rem',
        background: '#fff8e6',
        borderColor: '#f0cf7a',
      }}
    >
      <p style={{ margin: 0, color: '#8a5a00', fontWeight: 700 }}>{message}</p>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
        <Button href={buildAuthUrl(redirectPath)} size="sm">
          Se connecter ou s&apos;inscrire
        </Button>
        <Button href="/courses" variant="ghost" size="sm">
          Explorer les parcours
        </Button>
      </div>
    </Card>
  );
}
