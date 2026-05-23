import { describe, expect, it } from 'vitest';
import {
  MDM_GLOSSARY,
  findGlossaryTermInText,
  findGlossaryMatchesInText,
  glossaryWebHref,
  searchGlossary,
} from '@ama/shared/glossary';

describe('MDM glossary', () => {
  it('contains at least 30 French MDM terms', () => {
    expect(MDM_GLOSSARY.length).toBeGreaterThanOrEqual(30);
  });

  it('includes key acronyms ABM, ADE, DEP, VPP, SCEP', () => {
    const ids = MDM_GLOSSARY.map((entry) => entry.id);
    expect(ids).toEqual(expect.arrayContaining(['abm', 'ade', 'dep', 'vpp', 'scep']));
  });

  it('filters terms by query', () => {
    const results = searchGlossary('smart group');
    expect(results.some((entry) => entry.id === 'smart-group')).toBe(true);
  });

  it('detects glossary matches with max one per term', () => {
    const matches = findGlossaryMatchesInText('VPP et VPP encore, plus ABM.');
    const vppMatches = matches.filter((match) => match.termId === 'vpp');
    expect(vppMatches).toHaveLength(1);
    expect(matches.some((match) => match.termId === 'abm')).toBe(true);
  });

  it('finds a glossary term in quiz-like text', () => {
    const term = findGlossaryTermInText('Quelle est la bonne réponse sur la supervision ADE ?');
    expect(term?.id).toBe('supervision');
  });

  it('builds web glossary href with anchor', () => {
    expect(glossaryWebHref('vpp')).toBe('/resources/glossaire#vpp');
  });
});
