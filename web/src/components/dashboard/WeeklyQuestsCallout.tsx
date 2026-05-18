import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function WeeklyQuestsCallout() {
  return (
    <Card
      style={{
        marginTop: '1.25rem',
        background: 'linear-gradient(135deg, #e8f5ec 0%, #ffffff 100%)',
        borderColor: '#a8d8b2',
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
      }}
    >
      <div>
        <span style={{ color: '#2e844a', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Quêtes hebdo
        </span>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>
          Avance tes objectifs de la semaine
        </h2>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Suis tes quêtes Apple, Jamf et Intune, leur progression et les points à débloquer avant la
          réinitialisation hebdomadaire.
        </p>
      </div>
      <Button href="/quests">Voir mes quêtes</Button>
    </Card>
  );
}
