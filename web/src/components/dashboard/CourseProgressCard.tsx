'use client';

import Link from 'next/link';
import type { CourseSummary } from '@/lib/api/types';

interface CourseProgressCardProps {
  course: CourseSummary;
  rank?: number;
}

export function CourseProgressCard({ course, rank }: CourseProgressCardProps) {
  const pct = Math.round(course.progressPercent ?? 0);
  const isComplete = pct >= 100;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="course-progress-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        borderRadius: 12,
        border: '1px solid var(--border-soft)',
        background: 'var(--surface)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Rank badge */}
      {rank && (
        <span style={{
          flexShrink: 0,
          width: 24, height: 24,
          borderRadius: '50%',
          background: rank <= 3 ? 'var(--accent)' : 'var(--surface-elevated)',
          color: rank <= 3 ? '#fff' : 'var(--ink-secondary)',
          fontSize: '0.7rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {rank}
        </span>
      )}

      {/* Track icon */}
      <span style={{ fontSize: '1.4rem', flexShrink: 0 }} aria-hidden>
        {course.track === 'APPLE' ? '🍎' : course.track === 'JAMF' ? '🛠️' : '🪟'}
      </span>

      {/* Title + progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: '0.875rem', fontWeight: 600,
          color: 'var(--ink)', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {course.title}
        </p>
        {/* Progress bar */}
        <div style={{
          marginTop: '0.35rem', height: 4,
          borderRadius: 2, background: 'var(--border-soft)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: isComplete ? '#10b981' : 'var(--accent)',
            width: `${pct}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Percent */}
      <span style={{
        flexShrink: 0, fontSize: '0.8rem',
        fontWeight: 700,
        color: isComplete ? '#10b981' : 'var(--accent)',
      }}>
        {pct}%{isComplete ? ' ✓' : ''}
      </span>
    </Link>
  );
}
