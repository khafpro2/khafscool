import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function BadgesCallout() {
  return (
    <Card className="dashboard-callout dashboard-callout-badges dashboard-fade-in">
      <div className="dashboard-callout-inner">
        <div>
          <span className="dashboard-callout-eyebrow">Super-badges</span>
          <h2 className="dashboard-callout-title">Collectionne tes récompenses MDM Academy</h2>
          <p className="muted dashboard-callout-caption">
            Consulte les badges gagnés et ceux à débloquer sur Apple, Jamf et Intune.
          </p>
        </div>
        <Button href="/badges">Voir mes badges</Button>
      </div>
    </Card>
  );
}
