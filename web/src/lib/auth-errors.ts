export class AuthRequestError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly retryAfterSeconds?: number;

  constructor(message: string, status: number, code?: string, retryAfterSeconds?: number) {
    super(message);
    this.name = 'AuthRequestError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

type AuthErrorBody = {
  error?: string;
  message?: string;
  retryAfter?: number | string;
};

function parseRetryAfterSeconds(headerValue: string | null, body?: AuthErrorBody): number | undefined {
  if (headerValue) {
    const parsed = Number.parseInt(headerValue, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  if (body?.retryAfter == null) return undefined;

  if (typeof body.retryAfter === 'number' && body.retryAfter > 0) {
    return body.retryAfter > 120 ? Math.ceil(body.retryAfter / 1000) : Math.ceil(body.retryAfter);
  }

  const match = String(body.retryAfter).match(/(\d+)/);
  if (match) {
    const value = Number.parseInt(match[1], 10);
    if (Number.isFinite(value) && value > 0) return value;
  }

  return undefined;
}

export async function throwAuthRequestError(res: Response): Promise<never> {
  let body: AuthErrorBody = {};

  try {
    body = (await res.json()) as AuthErrorBody;
  } catch {
    body = {};
  }

  const retryAfterSeconds = parseRetryAfterSeconds(res.headers.get('retry-after'), body);
  const code = body.error;
  const message = body.message ?? `Erreur HTTP ${res.status}`;

  throw new AuthRequestError(message, res.status, code, retryAfterSeconds);
}

function formatRetryDelay(seconds: number): string {
  if (seconds < 60) {
    return seconds === 1 ? '1 seconde' : `${seconds} secondes`;
  }
  const minutes = Math.ceil(seconds / 60);
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

function formatRateLimitMessage(retryAfterSeconds?: number): string {
  if (retryAfterSeconds) {
    return `Trop de tentatives. Réessaie dans ${formatRetryDelay(retryAfterSeconds)}.`;
  }
  return 'Trop de tentatives. Patiente une minute avant de réessayer.';
}

export function resolveApiErrorMessage(
  error: unknown,
  context: 'login' | 'register' | 'quiz' | 'module' | 'password' = 'login'
): string {
  if (error instanceof AuthRequestError) {
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.status === 429) {
      if (context === 'quiz') {
        return `Limite de vérification du quiz atteinte. ${formatRateLimitMessage(error.retryAfterSeconds)}`;
      }
      if (context === 'module') {
        return `Limite de validation d’unité atteinte. ${formatRateLimitMessage(error.retryAfterSeconds)}`;
      }
      return formatRateLimitMessage(error.retryAfterSeconds);
    }

    if (error.code === 'API_UNREACHABLE' || error.code === 'LOGIN_FAILED' || error.code === 'REGISTER_FAILED') {
      return 'Impossible de joindre le serveur. Vérifie que l’API est démarrée (pnpm dev:stack).';
    }

    if (error.code === 'INVALID_CREDENTIALS') {
      return 'Email ou mot de passe incorrect.';
    }

    if (error.code === 'EMAIL_EXISTS') {
      return 'Un compte existe déjà avec cet email. Connecte-toi ou utilise un autre email.';
    }

    if (error.code === 'INVALID_LOGIN_REQUEST' || error.code === 'INVALID_REGISTER_REQUEST') {
      return 'Vérifie que ton email est valide et que le mot de passe contient au moins 8 caractères.';
    }

    if (error.code === 'INVALID_PASSWORD_REQUEST') {
      return 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
    }

    if (error.code === 'WRONG_CURRENT_PASSWORD') {
      return 'Mot de passe actuel incorrect.';
    }

    if (error.code === 'PASSWORD_NOT_AVAILABLE') {
      return 'Le changement de mot de passe n’est disponible que pour les comptes e-mail.';
    }

    if (error.status >= 500) {
      return 'Le serveur est indisponible pour le moment. Réessaie dans quelques instants.';
    }
  }

  if (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError')) {
    return 'Impossible de joindre le serveur. Vérifie que l’API est démarrée (pnpm dev:stack).';
  }

  if (context === 'quiz') {
    return 'Impossible de vérifier cette réponse pour le moment.';
  }

  if (context === 'module') {
    return 'Impossible d’enregistrer l’unité pour le moment.';
  }

  if (context === 'password') {
    return 'Impossible de modifier le mot de passe pour le moment.';
  }

  return context === 'login'
    ? 'Connexion impossible pour le moment. Réessaie dans quelques instants.'
    : 'Inscription impossible pour le moment. Réessaie dans quelques instants.';
}

export function resolveAuthErrorMessage(error: unknown, mode: 'login' | 'register'): string {
  return resolveApiErrorMessage(error, mode);
}
