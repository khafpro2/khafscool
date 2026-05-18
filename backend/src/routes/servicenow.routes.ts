import type { FastifyInstance } from 'fastify';
import * as servicenow from '../controllers/servicenow.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import type { TicketScorePayload } from '../services/servicenow-ticket-score.service.js';

export async function servicenowRoutes(app: FastifyInstance) {
  app.post<{ Body: TicketScorePayload }>(
    '/servicenow/ticket-score',
    { preHandler: requireAuth },
    servicenow.scoreTicket
  );
}
