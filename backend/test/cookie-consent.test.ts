import { describe, expect, it } from 'vitest';

const COOKIE_CONSENT_VERSION = 1;

type CookieConsentRecord = {
  version: number;
  acceptedAt: string;
};

function buildCookieConsentRecord(now = new Date()): CookieConsentRecord {
  return {
    version: COOKIE_CONSENT_VERSION,
    acceptedAt: now.toISOString(),
  };
}

function parseCookieConsent(raw: string | null): CookieConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CookieConsentRecord;
    if (parsed.version !== COOKIE_CONSENT_VERSION || typeof parsed.acceptedAt !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function hasCookieConsent(raw: string | null): boolean {
  return parseCookieConsent(raw) != null;
}

describe('cookie consent (logique partagée web)', () => {
  it('construit un enregistrement versionné', () => {
    const fixed = new Date('2026-05-22T10:00:00.000Z');
    expect(buildCookieConsentRecord(fixed)).toEqual({
      version: 1,
      acceptedAt: '2026-05-22T10:00:00.000Z',
    });
  });

  it('détecte un consentement valide en localStorage', () => {
    const raw = JSON.stringify(buildCookieConsentRecord());
    expect(hasCookieConsent(raw)).toBe(true);
    expect(parseCookieConsent(raw)?.version).toBe(1);
  });

  it('rejette une version ou un JSON invalide', () => {
    expect(hasCookieConsent(null)).toBe(false);
    expect(hasCookieConsent('{')).toBe(false);
    expect(hasCookieConsent(JSON.stringify({ version: 99, acceptedAt: 'x' }))).toBe(false);
    expect(hasCookieConsent(JSON.stringify({ version: 1 }))).toBe(false);
  });
});
