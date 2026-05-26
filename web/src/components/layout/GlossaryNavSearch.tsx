'use client';

import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { glossaryWebHref, searchGlossaryLimited } from '@ama/shared/glossary';

const MAX_RESULTS = 5;

export function GlossaryNavSearch() {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return searchGlossaryLimited(trimmed, MAX_RESULTS);
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="glossary-nav-search">
      <label htmlFor="glossary-nav-input" className="sr-only">
        Rechercher dans le glossaire MDM
      </label>
      <input
        id="glossary-nav-input"
        type="search"
        className="glossary-nav-input"
        placeholder="Glossaire…"
        value={query}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            (event.target as HTMLInputElement).blur();
          }
        }}
      />
      <Link href="/resources/glossaire" className="glossary-nav-link">
        Glossaire
      </Link>
      {open && results.length > 0 ? (
        <ul id={listId} className="glossary-nav-results" role="listbox">
          {results.map((entry) => (
            <li key={entry.id} role="option">
              <Link
                href={glossaryWebHref(entry.id)}
                className="glossary-nav-result"
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                }}
              >
                <span className="glossary-nav-result-term">{entry.term}</span>
                <span className="glossary-nav-result-category">{entry.category}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
