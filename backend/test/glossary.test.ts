import { describe, expect, it } from 'vitest';
import { MDM_GLOSSARY, searchGlossary } from '@ama/shared/glossary';

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
});
