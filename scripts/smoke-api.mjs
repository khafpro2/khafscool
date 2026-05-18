#!/usr/bin/env node

const DEFAULT_API_URL = 'http://localhost:4000';
const API_URL = (process.env.API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 10_000);

const password = `SmokePass-${Date.now()}!`;
const email = `smoke-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;

function log(message) {
  console.log(`[smoke-api] ${message}`);
}

function fail(message) {
  throw new Error(message);
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = {
      accept: 'application/json',
      ...options.headers,
    };

    if (options.body !== undefined) {
      headers['content-type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    return { response, payload };
  } catch (error) {
    if (error?.name === 'AbortError') {
      fail(`${path} timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function expectStatus(label, result, expectedStatus) {
  if (result.response.status !== expectedStatus) {
    fail(`${label} expected HTTP ${expectedStatus}, got ${result.response.status}: ${JSON.stringify(result.payload)}`);
  }
}

function expectObject(label, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    fail(`${label} expected a JSON object`);
  }
}

function expectToken(label, payload) {
  expectObject(label, payload);

  if (typeof payload.accessToken !== 'string' || payload.accessToken.length === 0) {
    fail(`${label} did not return an accessToken`);
  }

  return payload.accessToken;
}

async function getJson(label, path, token) {
  const result = await request(path, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  expectStatus(label, result, 200);
  expectObject(label, result.payload);
  log(`OK ${label}`);
  return result.payload;
}

async function postJson(label, path, body, expectedStatus, token) {
  const result = await request(path, {
    method: 'POST',
    body,
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  expectStatus(label, result, expectedStatus);
  expectObject(label, result.payload);
  log(`OK ${label}`);
  return result.payload;
}

async function main() {
  log(`Using API_URL=${API_URL}`);

  const health = await getJson('GET /health', '/health');
  if (health.ok !== true) {
    fail('GET /health did not report ok=true');
  }

  const catalog = await getJson('GET /catalog', '/catalog');
  if (!Array.isArray(catalog.courses)) {
    fail('GET /catalog did not return courses[]');
  }

  const registration = await postJson(
    'POST /auth/register',
    '/auth/register',
    { email, password, displayName: 'Smoke Test' },
    201
  );
  expectToken('POST /auth/register', registration);

  const login = await postJson('POST /auth/login', '/auth/login', { email, password }, 200);
  const accessToken = expectToken('POST /auth/login', login);

  await getJson('GET /auth/me', '/auth/me', accessToken);
  await getJson('GET /users/me/progress', '/users/me/progress', accessToken);
  await getJson('GET /quests/weekly', '/quests/weekly', accessToken);
  await getJson('GET /leaderboard', '/leaderboard', accessToken);

  log('Smoke test completed successfully');
}

main().catch((error) => {
  console.error(`[smoke-api] FAILED: ${error.message}`);
  process.exit(1);
});
