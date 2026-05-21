/** Rendu partagé pour favicon et icônes PWA (ImageResponse). */
export function AppIconMark({ size }: { size: number }) {
  const radius = Math.round(size * 0.25);
  const fontSize = Math.round(size * 0.52);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0d9488 100%)',
        borderRadius: radius,
        fontSize,
        fontWeight: 700,
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      M
    </div>
  );
}
