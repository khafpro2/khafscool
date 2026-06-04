export function buildFrenchRateLimitBody(_request: unknown, context: { after: number | string }) {
  return {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Trop de tentatives. Réessayez dans une minute.',
    retryAfter: context.after,
  };
}

export function buildAuthRateLimitBody(_request: unknown, context: { after: number | string }) {
  return {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Trop de tentatives de connexion. Réessayez dans une minute.',
    retryAfter: context.after,
  };
}

export const authLoginRateLimit = {
  max: 5,
  timeWindow: '1 minute' as const,
};

export const quizProgressRateLimit = {
  max: 40,
  timeWindow: '1 minute' as const,
};

export const donationCheckoutRateLimit = {
  max: 10,
  timeWindow: '1 minute' as const,
};
