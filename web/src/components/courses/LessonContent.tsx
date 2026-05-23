'use client';

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ fontWeight: 800 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-strong)', fontWeight: 700 }}
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

export function LessonContent({ content }: { content: string }) {
  if (!content.trim()) return null;

  const blocks = content.split(/\n\n+/);

  return (
    <article
      className="lesson-content"
      style={{
        marginTop: '1rem',
        padding: '1rem 1.1rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-soft, var(--bg-soft))',
        border: '1px solid var(--border)',
        lineHeight: 1.65,
        fontSize: '0.95rem',
      }}
    >
      <p
        className="muted"
        style={{
          fontWeight: 800,
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.75rem',
        }}
      >
        Leçon
      </p>
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={index} style={{ fontSize: '1.05rem', fontWeight: 800, margin: '1rem 0 0.45rem' }}>
              {trimmed.slice(3)}
            </h3>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={index} style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0.85rem 0 0.35rem' }}>
              {trimmed.slice(4)}
            </h4>
          );
        }

        if (trimmed.startsWith('- ')) {
          const items = trimmed.split('\n').filter((line) => line.startsWith('- '));
          return (
            <ul key={index} style={{ margin: '0.45rem 0 0.65rem 1.1rem', display: 'grid', gap: '0.35rem' }}>
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item.slice(2))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} style={{ margin: '0.45rem 0' }}>
            {renderInline(trimmed)}
          </p>
        );
      })}
    </article>
  );
}

export function ModuleObjectives({
  learningObjectives,
  keyTakeaways,
}: {
  learningObjectives?: string[];
  keyTakeaways?: string[];
}) {
  const objectives = learningObjectives?.length ? learningObjectives : null;
  const takeaways = keyTakeaways?.length ? keyTakeaways : null;
  if (!objectives && !takeaways) return null;

  return (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem',
        marginTop: '0.75rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}
    >
      {objectives ? (
        <div>
          <p className="muted" style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
            Objectifs
          </p>
          <ul style={{ margin: '0.35rem 0 0 1rem', display: 'grid', gap: '0.25rem', fontSize: '0.9rem' }}>
            {objectives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {takeaways ? (
        <div>
          <p className="muted" style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
            Points clés
          </p>
          <ul style={{ margin: '0.35rem 0 0 1rem', display: 'grid', gap: '0.25rem', fontSize: '0.9rem' }}>
            {takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
