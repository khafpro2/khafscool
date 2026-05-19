import type { FastifyReply } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const constructEvent = vi.fn();
const processStripeWebhookEvent = vi.fn();

vi.mock('../src/lib/stripe.js', () => ({
  getStripeClient: vi.fn(() => ({ webhooks: { constructEvent } })),
  getStripeWebhookSecret: vi.fn(() => 'whsec_test'),
  stripeWebhookReady: vi.fn(() => true),
}));

vi.mock('../src/services/billing-webhook.service.js', () => ({
  processStripeWebhookEvent: (...args: unknown[]) => processStripeWebhookEvent(...args),
}));

import { stripeWebhook } from '../src/controllers/billing.controller.js';
import { stripeWebhookReady } from '../src/lib/stripe.js';

function makeReply() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn((payload: unknown) => payload),
  };
  return reply as unknown as FastifyReply & typeof reply;
}

function makeRequest(overrides: Record<string, unknown> = {}) {
  return {
    headers: { 'stripe-signature': 'sig_test' },
    rawBody: Buffer.from('{"type":"checkout.session.completed"}'),
    log: { warn: vi.fn(), error: vi.fn() },
    ...overrides,
  } as never;
}

describe('stripeWebhook controller', () => {
  beforeEach(() => {
    constructEvent.mockReset();
    processStripeWebhookEvent.mockReset();
    vi.mocked(stripeWebhookReady).mockReturnValue(true);
  });

  it('rejects requests when webhook secrets are missing', async () => {
    vi.mocked(stripeWebhookReady).mockReturnValue(false);
    const reply = makeReply();

    await stripeWebhook(makeRequest(), reply);

    expect(reply.status).toHaveBeenCalledWith(503);
    expect(constructEvent).not.toHaveBeenCalled();
  });

  it('verifies signature then processes the event', async () => {
    constructEvent.mockReturnValue({ type: 'invoice.paid', data: { object: {} } });
    processStripeWebhookEvent.mockResolvedValue(undefined);
    const reply = makeReply();

    await stripeWebhook(makeRequest(), reply);

    expect(constructEvent).toHaveBeenCalledWith(
      expect.any(Buffer),
      'sig_test',
      'whsec_test',
    );
    expect(processStripeWebhookEvent).toHaveBeenCalledWith({ type: 'invoice.paid', data: { object: {} } });
    expect(reply.send).toHaveBeenCalledWith({ received: true, type: 'invoice.paid' });
  });

  it('returns 400 on invalid signatures', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });
    const reply = makeReply();

    await stripeWebhook(makeRequest(), reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(processStripeWebhookEvent).not.toHaveBeenCalled();
  });
});
