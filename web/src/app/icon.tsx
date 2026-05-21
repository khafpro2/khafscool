import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0d9488 100%)',
          borderRadius: 8,
          fontSize: 20,
          fontWeight: 700,
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        M
      </div>
    ),
    { ...size },
  );
}
