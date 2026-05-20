import { buildAuthUrl } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function AuthConnectBanner({
  redirectPath,
  message = 'Les données affichées ci-dessous sont un aperçu fictif pour découvrir le format — pas ta progression réelle.',
}: {
  redirectPath: string;
  message?: string;
}) {
  return (
    <div role="status" aria-live="polite" style={{ marginBottom: '1.25rem' }}>
    <Card
      style={{
        background: '#fff8e6',
        borderColor: '#f0cf7a',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span className="pill pill-warning" style={{ margin: 0 }}>
          Mode démo
        </span>
        <strong style={{ color: '#8a5a00', fontSize: '0.95rem' }}>Données d&apos;exemple uniquement</strong>
      </div>
      <p style={{ margin: 0, color: '#6b4a00', lineHeight: 1.5 }}>{message}</p>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
        <Button href={buildAuthUrl(redirectPath)} size="sm">
          Se connecter pour voir mes vraies données
        </Button>
        <Button href="/courses" variant="ghost" size="sm">
          Explorer les parcours
        </Button>
      </div>
    </Card>
    </div>
  );
}
