import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  scoreServiceNowTicket,
  type TicketScorePayload,
} from '../services/servicenow-ticket-score.service.js';

export async function scoreTicket(
  req: FastifyRequest<{ Body: TicketScorePayload }>,
  reply: FastifyReply
) {
  return reply.send(scoreServiceNowTicket(req.body ?? {}));
}
