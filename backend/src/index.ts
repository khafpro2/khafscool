import { Readable } from 'node:stream';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { assertProductionSecrets, env } from './config/env.js';
import type { BillingWebhookRequest } from './controllers/billing.controller.js';
import { authRoutes } from './routes/auth.routes.js';
import { coursesRoutes } from './routes/courses.routes.js';
import { billingRoutes } from './routes/billing.routes.js';
import { healthRoutes } from './routes/health.routes.js';

assertProductionSecrets();

const app = Fastify({ logger: true });

app.addHook('preParsing', async (request, _reply, payload) => {
  if (request.url !== '/billing/webhook') {
    return payload;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of payload) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  const rawBody = Buffer.concat(chunks);
  (request as BillingWebhookRequest).rawBody = rawBody;
  return Readable.from(rawBody);
});

await app.register(cors, {
  origin: env.corsOrigin ?? true,
  credentials: true,
});
await app.register(healthRoutes);
await app.register(authRoutes);
await app.register(coursesRoutes);
await app.register(billingRoutes);

try {
  await app.listen({ port: env.port, host: '0.0.0.0' });
  console.log(`API listening on http://localhost:${env.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
