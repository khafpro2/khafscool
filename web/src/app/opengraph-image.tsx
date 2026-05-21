import { ImageResponse } from 'next/og';

export const alt = 'MDM Academy Pro — Apple, Jamf Pro et Intune gratuits';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 42%, #0d9488 100%)',
          fontFamily: 'system-ui, sans-serif',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            M
          </div>
          <span style={{ fontSize: 36, fontWeight: 600, opacity: 0.95 }}>MDM Academy Pro</span>
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, maxWidth: 900 }}>
          Apple, Jamf Pro et Intune — formation gratuite
        </div>
        <div style={{ fontSize: 28, marginTop: 28, opacity: 0.9, maxWidth: 820, lineHeight: 1.4 }}>
          Quiz, mini-jeux, badges et sprints certification pour techniciens MDM
        </div>
      </div>
    ),
    { ...size },
  );
}
