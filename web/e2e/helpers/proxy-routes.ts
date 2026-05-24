import type { Route } from '@playwright/test';

/** Routes Playwright pour le relais BFF Next.js (`/api/proxy/*`). */
export function isDonationsStatusRequest(url: URL) {
  return url.pathname.endsWith('/donations/status');
}

export function isDonationsCheckoutRequest(url: URL) {
  return url.pathname.endsWith('/donations/create-checkout-session');
}

export function isDashboardRequest(url: URL) {
  return url.pathname.endsWith('/users/me/dashboard');
}

export function isAuthMeRequest(url: URL) {
  return url.pathname.endsWith('/auth/me');
}

export function isUserExportRequest(url: URL) {
  return url.pathname.endsWith('/users/me/export');
}

export function isCourseProgressRequest(url: URL) {
  return /\/courses\/[^/]+\/progress$/.test(url.pathname);
}

export function isPracticeExamRequest(url: URL) {
  return /\/courses\/[^/]+\/practice-exam$/.test(url.pathname);
}

export function isPracticeExamScoreRequest(url: URL) {
  return /\/courses\/[^/]+\/practice-exam\/score$/.test(url.pathname);
}

/** @deprecated Préférer `isDonationsStatusRequest` — conservé pour grep. */
export const PROXY_DONATIONS_STATUS = '**/api/proxy/donations/status';

/** @deprecated Préférer `isDonationsCheckoutRequest`. */
export const PROXY_DONATIONS_CHECKOUT = '**/api/proxy/donations/create-checkout-session';

export const PROXY_DASHBOARD = '**/api/proxy/users/me/dashboard';
export const PROXY_AUTH_ME = '**/api/proxy/auth/me';
export const PROXY_USER_EXPORT = '**/api/proxy/users/me/export';
export const PROXY_COURSE_PROGRESS = '**/api/proxy/courses/*/progress';
export const PROXY_PRACTICE_EXAM = '**/api/proxy/courses/*/practice-exam';
export const PROXY_PRACTICE_EXAM_SCORE = '**/api/proxy/courses/*/practice-exam/score';

/** Login via relais BFF Next.js (cookies HttpOnly). */
export const BFF_AUTH_LOGIN = '**/api/auth/login';

/** @deprecated Préférer `BFF_AUTH_LOGIN` — login passe par le BFF. */
export const API_AUTH_LOGIN = 'http://localhost:4000/auth/login';

export async function fulfillJsonRoute(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}
