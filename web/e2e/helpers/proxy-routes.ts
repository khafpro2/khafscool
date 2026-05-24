/** Routes Playwright pour le relais BFF Next.js (`/api/proxy/*`) et fallback API directe. */
export const PROXY_DONATIONS_STATUS = '**/donations/status';
export const PROXY_DONATIONS_CHECKOUT = '**/donations/create-checkout-session';
export const PROXY_DASHBOARD = '**/api/proxy/users/me/dashboard';
export const PROXY_USER_EXPORT = '**/api/proxy/users/me/export';
export const PROXY_COURSE_PROGRESS = '**/api/proxy/courses/*/progress';
export const PROXY_PRACTICE_EXAM = '**/api/proxy/courses/*/practice-exam';
export const PROXY_PRACTICE_EXAM_SCORE = '**/api/proxy/courses/*/practice-exam/score';

/** Login reste un appel direct vers l’API backend (hors proxy). */
export const API_AUTH_LOGIN = 'http://localhost:4000/auth/login';
