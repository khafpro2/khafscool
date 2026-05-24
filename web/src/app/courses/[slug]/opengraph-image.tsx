import { ImageResponse } from 'next/og';
import { getLearningPath } from '@/lib/learningPaths';
import { formatTrack } from '@/lib/tracks';

export const alt = 'Parcours MDM Academy Pro';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TRACK_GRADIENTS: Record<string, string> = {
  APPLE: 'linear-gradient(135deg, #1d1d1f 0%, #52525b 100%)',
  JAMF: 'linear-gradient(135deg, #5a9200 0%, #76B900 100%)',
  INTUNE: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
};

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 42%, #0d9488 100%)';

function GenericOpenGraphImage() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 72,
        background: DEFAULT_GRADIENT,
        fontFamily: 'system-ui, sans-serif',
        color: '#ffffff',
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 600, opacity: 0.92, marginBottom: 20 }}>MDM Academy Pro</div>
      <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.15, maxWidth: 960 }}>
        Formation MDM gratuite — Apple, Jamf et Intune
      </div>
      <div style={{ fontSize: 26, marginTop: 24, opacity: 0.88, maxWidth: 820, lineHeight: 1.4 }}>
        Quiz, badges, quêtes et certificats pour techniciens
      </div>
    </div>
  );
}

function CourseOpenGraphImage({
  trackLabel,
  title,
  background,
}: {
  trackLabel: string;
  title: string;
  background: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background,
        fontFamily: 'system-ui, sans-serif',
        color: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          M
        </div>
        <span style={{ fontSize: 28, fontWeight: 600, opacity: 0.95 }}>MDM Academy Pro</span>
      </div>
      <div>
        <div
          style={{
            display: 'inline-flex',
            padding: '10px 18px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.16)',
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          {trackLabel}
        </div>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.12, maxWidth: 980 }}>{title}</div>
        <div style={{ fontSize: 26, marginTop: 22, opacity: 0.88, maxWidth: 820, lineHeight: 1.4 }}>
          Parcours gratuit · quiz · badges · certificat
        </div>
      </div>
    </div>
  );
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const path = getLearningPath(slug);

    if (!path) {
      return new ImageResponse(<GenericOpenGraphImage />, { ...size });
    }

    const background = TRACK_GRADIENTS[path.track] ?? DEFAULT_GRADIENT;
    const trackLabel = formatTrack(path.track);

    return new ImageResponse(
      <CourseOpenGraphImage background={background} title={path.title} trackLabel={trackLabel} />,
      { ...size },
    );
  } catch {
    return new ImageResponse(<GenericOpenGraphImage />, { ...size });
  }
}
