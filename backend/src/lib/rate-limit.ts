export function buildFrenchRateLimitBody(_request: unknown, context: { after: number | string }) {
  return {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Trop de tentatives. Réessayez dans une minute.',
    retryAfter: context.after,
  };
}

export const quizProgressRateLimit = {
  max: 40,
  timeWindow: '1 minute' as const,
};
