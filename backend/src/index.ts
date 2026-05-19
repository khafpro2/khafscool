import Fastify from 'fastify';
import cors from '@fastify/cors';
import { assertProductionSecrets, env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import { coursesRoutes } from './routes/courses.routes.js';
import { billingRoutes } from './routes/billing.routes.js';
import { healthRoutes } from './routes/health.routes.js';

assertProductionSecrets();

const app = Fastify({ logger: true });

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
