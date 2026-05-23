'use client';

import Link from 'next/link';
import {
  isBonnePratiqueBlockquote,
  parseInlineMarkdown,
  parseLessonBlocks,
} from '@ama/shared/lesson-markdown';

function renderInline(text: string) {
  return parseInlineMarkdown(text).map((part, index) => {
    if (part.type === 'strong') {
      return (
        <strong key={index} className="lesson-content-strong">
          {part.value}
        </strong>
      );
    }
    if (part.type === 'link') {
      return (
        <a
          key={index}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          className="lesson-content-link"
        >
          {part.label}
        </a>
      );
    }
    return part.value;
  });
}

export function LessonContent({ content }: { content: string }) {
  if (!content.trim()) return null;

  const blocks = parseLessonBlocks(content);

  return (
    <article className="lesson-content">
      <p className="lesson-content-eyebrow">Leçon</p>
      <p className="lesson-content-glossary-hint muted">
        Termes MDM ? Consulte le{' '}
        <Link href="/resources/glossaire" className="lesson-content-glossary-link">
          glossaire
        </Link>
        .
      </p>
      {blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h2 key={index} className="lesson-content-h2">
              {renderInline(block.text)}
            </h2>
          );
        }
        if (block.type === 'h3') {
          return (
            <h3 key={index} className="lesson-content-h3">
              {renderInline(block.text)}
            </h3>
          );
        }
        if (block.type === 'blockquote') {
          const isBonnePratique = isBonnePratiqueBlockquote(block.text);
          return (
            <blockquote
              key={index}
              className={isBonnePratique ? 'lesson-content-tip' : 'lesson-content-quote'}
            >
              {isBonnePratique ? (
                <span className="lesson-content-tip-label">Bonne pratique</span>
              ) : null}
              <p>{renderInline(block.text.replace(/^\*\*Bonne pratique\s*:\*\*\s*/i, ''))}</p>
            </blockquote>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={index} className="lesson-content-list">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="lesson-content-p">
            {renderInline(block.text)}
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
    <div className="module-objectives">
      {objectives ? (
        <div>
          <p className="muted module-objectives-label">Objectifs</p>
          <ul className="module-objectives-list">
            {objectives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {takeaways ? (
        <div>
          <p className="muted module-objectives-label">Points clés</p>
          <ul className="module-objectives-list">
            {takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
