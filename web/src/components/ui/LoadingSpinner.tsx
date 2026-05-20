type LoadingSpinnerProps = {
  label?: string;
  className?: string;
};

export function LoadingSpinner({ label = 'Chargement…', className }: LoadingSpinnerProps) {
  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '2rem 0',
      }}
    >
      <span
        aria-hidden
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          border: '3px solid var(--border-soft)',
          borderTopColor: 'var(--accent)',
          animation: 'ama-spin 0.8s linear infinite',
        }}
      />
      <p className="muted" style={{ margin: 0 }}>
        {label}
      </p>
    </div>
  );
}
