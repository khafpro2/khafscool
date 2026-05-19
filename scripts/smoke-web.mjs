#!/usr/bin/env node

const DEFAULT_WEB_URL = 'http://127.0.0.1:3000';
const WEB_URL = (process.env.WEB_URL ?? DEFAULT_WEB_URL).replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 10_000);

const pages = [
  { path: '/auth', label: 'auth', marker: 'Authentification' },
  { path: '/dashboard', label: 'dashboard', marker: 'Tableau de bord' },
  { path: '/courses', label: 'courses', marker: 'Catalogue public' },
  { path: '/badges', label: 'badges', marker: 'Mes super-badges' },
  { path: '/quests', label: 'quests', marker: 'Quêtes hebdo' },
  { path: '/sprint', label: 'sprint', marker: 'Accélère ta préparation certification' },
  { path: '/pricing', label: 'pricing', marker: 'Tarifs MVP' },
  { path: '/diagnostics', label: 'diagnostics', marker: 'Diagnostics navigateur' },
  { path: '/mvp', label: 'mvp', marker: 'MVP testable' },
  { path: '/demo', label: 'demo', marker: 'Guide de démonstration' },
];

function log(message) {
  console.log(`[smoke-web] ${message}`);
}

function fail(message) {
  throw new Error(message);
}

async function fetchPage(page) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = `${WEB_URL}${page.path}`;

  try {
    const response = await fetch(url, {
      headers: { accept: 'text/html' },
      signal: controller.signal,
    });
    const body = await response.text();

    return { response, body, url };
  } catch (error) {
    if (error?.name === 'AbortError') {
      fail(`${page.path} timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function expectPage(page, result) {
  if (result.response.status !== 200) {
    fail(`${page.path} expected HTTP 200, got ${result.response.status}`);
  }

  const contentType = result.response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    fail(`${page.path} expected text/html, got ${contentType || 'no content-type'}`);
  }

  if (!result.body.trim()) {
    fail(`${page.path} returned an empty body`);
  }

  if (!result.body.includes(page.marker)) {
    fail(`${page.path} did not include marker "${page.marker}"`);
  }
}

async function main() {
  log(`Using WEB_URL=${WEB_URL}`);

  for (const page of pages) {
    const result = await fetchPage(page);
    expectPage(page, result);
    log(`OK ${page.label} ${result.url}`);
  }

  log('Smoke test completed successfully');
}

main().catch((error) => {
  console.error(`[smoke-web] FAILED: ${error.message}`);
  process.exit(1);
});
