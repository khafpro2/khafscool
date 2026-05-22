import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requireAdminApiKey } from '../src/middleware/admin-api-key.middleware.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

function makeReply() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn((payload: unknown) => payload),
  };

  return reply as unknown as FastifyReply & typeof reply;
}

function makeRequest(apiKey?: string) {
  return {
    headers: apiKey ? { 'x-admin-api-key': apiKey } : {},
  } as FastifyRequest;
}

describe('admin api key middleware', () => {
  beforeEach(() => {
    delete process.env.ADMIN_API_KEY;
  });

  it('returns 503 when ADMIN_API_KEY is not configured', async () => {
    const reply = makeReply();

    await requireAdminApiKey(makeRequest('secret'), reply);

    expect(reply.status).toHaveBeenCalledWith(503);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'ADMIN_API_DISABLED' })
    );
  });

  it('returns 401 when key is missing or invalid', async () => {
    process.env.ADMIN_API_KEY = 'admin-secret';
    const reply = makeReply();

    await requireAdminApiKey(makeRequest(), reply);

    expect(reply.status).toHaveBeenCalledWith(401);

    const replyInvalid = makeReply();
    await requireAdminApiKey(makeRequest('wrong-key'), replyInvalid);
    expect(replyInvalid.status).toHaveBeenCalledWith(401);
  });

  it('allows request when key matches', async () => {
    process.env.ADMIN_API_KEY = 'admin-secret';
    const reply = makeReply();

    await requireAdminApiKey(makeRequest('admin-secret'), reply);

    expect(reply.status).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });
});
