import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function BadgesCallout() {
  return (
    <Card
      style={{
        marginTop: '1.25rem',
        background: 'linear-gradient(135deg, #fff3d6 0%, #ffffff 100%)',
        borderColor: '#f0cf7a',
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
      }}
    >
      <div>
        <span
          style={{
            color: '#8a6d00',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Super-badges
        </span>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>
          Collectionne tes récompenses MDM Academy
        </h2>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Consulte les badges gagnés et ceux à débloquer sur Apple, Jamf et Intune.
        </p>
      </div>
      <Button href="/badges">Voir mes badges</Button>
    </Card>
  );
}
