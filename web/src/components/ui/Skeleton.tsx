import type { CSSProperties } from 'react';

export type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'pill' | 'none';
};

const ROUNDED: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  none: '0',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  pill: 'var(--radius-pill)',
};

export function Skeleton({
  className,
  style,
  width,
  height,
  rounded = 'md',
}: SkeletonProps) {
  return (
    <span
      className={['ui-skeleton', className].filter(Boolean).join(' ')}
      aria-hidden
      style={{
        width,
        height,
        borderRadius: ROUNDED[rounded],
        ...style,
      }}
    />
  );
}

export function TrailCardSkeleton() {
  return (
    <div className="trail-card" aria-hidden style={{ pointerEvents: 'none' }}>
      <div className="trail-card-banner" style={{ background: 'var(--border-soft)' }}>
        <Skeleton width={46} height={46} rounded="lg" />
        <Skeleton width="55%" height={12} rounded="pill" style={{ marginTop: '0.85rem' }} />
      </div>
      <div className="trail-card-body">
        <Skeleton width="85%" height={22} rounded="sm" />
        <Skeleton width="100%" height={14} rounded="sm" style={{ marginTop: '0.5rem' }} />
        <Skeleton width="72%" height={14} rounded="sm" style={{ marginTop: '0.35rem' }} />
        <div className="trail-card-meta" style={{ marginTop: '0.75rem' }}>
          <Skeleton width={88} height={26} rounded="pill" />
          <Skeleton width={64} height={26} rounded="pill" />
          <Skeleton width={72} height={26} rounded="pill" />
        </div>
        <Skeleton width="100%" height={8} rounded="pill" style={{ marginTop: '0.75rem' }} />
        <div className="trail-card-footer">
          <Skeleton width={140} height={16} rounded="sm" />
          <Skeleton width={72} height={16} rounded="sm" />
        </div>
      </div>
    </div>
  );
}

export function QuestCardSkeleton() {
  return (
    <div className="card" aria-hidden style={{ pointerEvents: 'none' }}>
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          alignItems: 'center',
        }}
      >
        <Skeleton width={40} height={40} rounded="lg" />
        <div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <Skeleton width={72} height={24} rounded="pill" />
            <Skeleton width={88} height={24} rounded="pill" />
          </div>
          <Skeleton width="70%" height={20} rounded="sm" style={{ marginTop: '0.5rem' }} />
          <Skeleton width="90%" height={14} rounded="sm" style={{ marginTop: '0.35rem' }} />
        </div>
        <Skeleton width={48} height={28} rounded="sm" />
      </div>
      <Skeleton width="100%" height={8} rounded="pill" style={{ marginTop: '0.75rem' }} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement du tableau de bord">
      <Skeleton width={160} height={14} rounded="pill" />
      <Skeleton width="min(420px, 90%)" height={36} rounded="sm" style={{ marginTop: '0.5rem' }} />
      <Skeleton width="min(320px, 75%)" height={16} rounded="sm" style={{ marginTop: '0.5rem' }} />

      <div className="card" style={{ marginTop: '1.25rem' }}>
        <Skeleton width={120} height={12} rounded="pill" />
        <Skeleton width="min(480px, 95%)" height={28} rounded="sm" style={{ marginTop: '0.5rem' }} />
        <Skeleton width="100%" height={14} rounded="sm" style={{ marginTop: '0.5rem' }} />
        <Skeleton width={140} height={40} rounded="md" style={{ marginTop: '1rem' }} />
      </div>

      <div
        className="stat-grid"
        style={{ marginTop: '1.25rem' }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="stat">
            <Skeleton width="70%" height={12} rounded="pill" />
            <Skeleton width="50%" height={28} rounded="sm" style={{ marginTop: '0.35rem' }} />
          </div>
        ))}
      </div>

      <div className="grid grid-cards-lg" style={{ marginTop: '1.5rem' }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <TrailCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function LeaderboardPageSkeleton() {
  return (
    <section style={{ padding: '1rem 0 2rem' }} aria-busy="true" aria-label="Chargement du classement">
      <div className="hero" style={{ marginTop: 0 }}>
        <Skeleton width={200} height={28} rounded="pill" style={{ opacity: 0.5 }} />
        <Skeleton width="min(480px, 95%)" height={40} rounded="sm" style={{ marginTop: '1rem', opacity: 0.5 }} />
        <Skeleton width="min(420px, 90%)" height={16} rounded="sm" style={{ marginTop: '0.75rem', opacity: 0.45 }} />
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <Skeleton width={148} height={40} rounded="md" style={{ opacity: 0.45 }} />
          <Skeleton width={120} height={40} rounded="md" style={{ opacity: 0.45 }} />
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <Skeleton width="40%" height={18} rounded="sm" />
        <Skeleton width="85%" height={14} rounded="sm" style={{ marginTop: '0.5rem' }} />
      </div>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          marginTop: '1.5rem',
        }}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card" aria-hidden>
            <Skeleton width={48} height={14} rounded="pill" />
            <Skeleton width="70%" height={20} rounded="sm" style={{ marginTop: '0.75rem' }} />
            <Skeleton width="55%" height={14} rounded="sm" style={{ marginTop: '0.35rem' }} />
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.65rem' }}>
              <Skeleton width={72} height={24} rounded="pill" />
              <Skeleton width={64} height={24} rounded="pill" />
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gap: '0.5rem',
            gridTemplateColumns: '60px minmax(0, 1.6fr) 90px 140px minmax(0, 1fr)',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} width="80%" height={12} rounded="pill" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div
            key={row}
            style={{
              display: 'grid',
              gap: '0.5rem',
              gridTemplateColumns: '60px minmax(0, 1.6fr) 90px 140px minmax(0, 1fr)',
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid var(--border-soft)',
            }}
          >
            <Skeleton width={32} height={18} rounded="sm" />
            <Skeleton width="75%" height={18} rounded="sm" />
            <Skeleton width={48} height={18} rounded="sm" />
            <Skeleton width={100} height={24} rounded="pill" />
            <Skeleton width="90%" height={24} rounded="pill" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function QuestsPageSkeleton() {
  return (
    <section style={{ padding: '1rem 0 2rem' }} aria-busy="true" aria-label="Chargement des quêtes">
      <div className="hero" style={{ marginTop: 0 }}>
        <Skeleton width={140} height={28} rounded="pill" style={{ opacity: 0.5 }} />
        <Skeleton width="min(520px, 95%)" height={40} rounded="sm" style={{ marginTop: '1rem', opacity: 0.5 }} />
        <Skeleton width="min(480px, 90%)" height={16} rounded="sm" style={{ marginTop: '0.75rem', opacity: 0.45 }} />
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <Skeleton width={148} height={40} rounded="md" style={{ opacity: 0.45 }} />
          <Skeleton width={120} height={40} rounded="md" style={{ opacity: 0.45 }} />
        </div>
      </div>

      <div className="stat-grid" style={{ marginTop: '1.5rem' }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="stat">
            <Skeleton width="75%" height={12} rounded="pill" />
            <Skeleton width="55%" height={28} rounded="sm" style={{ marginTop: '0.35rem' }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <QuestCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
