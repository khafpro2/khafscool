import bcrypt from 'bcrypt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthProvider } from '@prisma/client';
import { oauthProviders, type OAuthProviderName } from '../config/oauth.js';
import { prisma } from '../lib/prisma.js';
import {
  changePasswordSchema,
  formatZodErrors,
  loginSchema,
  refreshSchema,
  registerSchema,
  updateProfileSchema,
} from '../schemas/auth.schemas.js';
import {
  buildAuthorizeUrl,
  consumePkce,
  exchangeCodeAndGetProfile,
} from '../services/oauth.service.js';
import {
  createRefreshToken,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
} from '../services/token.service.js';

const providerMap: Record<OAuthProviderName, AuthProvider> = {
  apple: AuthProvider.APPLE,
  google: AuthProvider.GOOGLE,
  microsoft: AuthProvider.MICROSOFT,
};

function sanitizeUser(user: {
  id: string;
  email: string | null;
  displayName: string | null;
  provider: AuthProvider;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    provider: user.provider,
  };
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function findOrCreateOAuthUser(provider: OAuthProviderName, profile: { sub: string; email?: string; name?: string }) {
  const authProvider = providerMap[provider];
  let user = await prisma.user.findFirst({
    where: { provider: authProvider, externalId: profile.sub },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        displayName: profile.name,
        provider: authProvider,
        externalId: profile.sub,
        progress: { create: {} },
        subscription: {
          create: { plan: 'FREE_TRIAL', status: 'trialing', trialEndsAt: addDays(14) },
        },
      },
    });

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    await prisma.userQuest.create({
      data: {
        userId: user.id,
        questKey: 'weekly-apple-2',
        label: 'Valide 2 modules Apple',
        target: 2,
        weekStart,
      },
    });
  }

  return user;
}

function tokenResponse(
  user: { id: string; email: string | null; displayName: string | null; provider: AuthProvider },
  refresh: { plainToken: string },
  rememberMe?: boolean
) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  return {
    accessToken,
    refreshToken: refresh.plainToken,
    user: sanitizeUser(user),
    rememberMe: rememberMe ?? true,
    accessTokenTtlMinutes: 15,
  };
}

export async function startOAuth(
  req: FastifyRequest<{ Params: { provider: OAuthProviderName }; Querystring: { redirect?: string } }>,
  reply: FastifyReply
) {
  const config = oauthProviders[req.params.provider];
  if (!config) return reply.status(400).send({ error: 'UNKNOWN_PROVIDER' });

  const { url } = buildAuthorizeUrl(config, req.query.redirect);
  return reply.redirect(url);
}

export async function oauthCallback(
  req: FastifyRequest<{
    Params: { provider: OAuthProviderName };
    Querystring: { code?: string; state?: string };
  }>,
  reply: FastifyReply
) {
  const provider = req.params.provider;
  const config = oauthProviders[provider];
  const code = req.query.code ?? 'dev-code';
  const pkce = req.query.state ? consumePkce(req.query.state) : undefined;

  const profile = await exchangeCodeAndGetProfile(provider, code, config);
  const user = await findOrCreateOAuthUser(provider, profile);
  const refresh = await createRefreshToken(user.id);
  const tokens = tokenResponse(user, refresh);

  if (pkce?.redirect) {
    const redirect = new URL(pkce.redirect);
    redirect.searchParams.set('accessToken', tokens.accessToken);
    redirect.searchParams.set('refreshToken', tokens.refreshToken);
    return reply.redirect(redirect.toString());
  }

  return reply.send(tokens);
}

export async function registerLocal(req: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) {
  const parsedBody = registerSchema.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    return reply.status(400).send({
      error: 'INVALID_REGISTER_REQUEST',
      details: formatZodErrors(parsedBody.error),
    });
  }

  const { email, password, displayName } = parsedBody.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return reply.status(409).send({ error: 'EMAIL_EXISTS' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      provider: AuthProvider.LOCAL,
      progress: { create: {} },
      subscription: { create: { plan: 'FREE_TRIAL', status: 'trialing', trialEndsAt: addDays(14) } },
    },
  });

  const refresh = await createRefreshToken(user.id, { rememberMe: true });
  return reply.status(201).send(tokenResponse(user, refresh, true));
}

export async function loginLocal(req: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) {
  const parsedBody = loginSchema.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    return reply.status(400).send({
      error: 'INVALID_LOGIN_REQUEST',
      details: formatZodErrors(parsedBody.error),
    });
  }

  const { email, password, rememberMe } = parsedBody.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) return reply.status(401).send({ error: 'INVALID_CREDENTIALS' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return reply.status(401).send({ error: 'INVALID_CREDENTIALS' });

  const persistSession = rememberMe !== false;
  const refresh = await createRefreshToken(user.id, { rememberMe: persistSession });
  return reply.send(tokenResponse(user, refresh, persistSession));
}

export async function refreshTokens(req: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) {
  const parsedBody = refreshSchema.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    return reply.status(400).send({
      error: 'INVALID_REFRESH_REQUEST',
      details: formatZodErrors(parsedBody.error),
    });
  }

  try {
    const rotated = await rotateRefreshToken(parsedBody.data.refreshToken);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: rotated.userId } });
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    return reply.send({ accessToken, refreshToken: rotated.plainToken });
  } catch {
    return reply.status(401).send({ error: 'INVALID_REFRESH' });
  }
}

export async function logout(
  req: FastifyRequest<{ Body: { refreshToken?: string } }>,
  reply: FastifyReply
) {
  if (req.body.refreshToken) await revokeRefreshToken(req.body.refreshToken);
  return reply.send({ ok: true });
}

export async function logoutAllSessions(req: FastifyRequest, reply: FastifyReply) {
  const revokedCount = await revokeAllUserRefreshTokens(req.user.sub);
  return reply.send({ ok: true, revokedCount });
}

export async function changeCurrentUserPassword(req: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) {
  const parsedBody = changePasswordSchema.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    return reply.status(400).send({
      error: 'INVALID_PASSWORD_REQUEST',
      details: formatZodErrors(parsedBody.error),
    });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return reply.status(404).send({ error: 'NOT_FOUND' });

  if (user.provider !== AuthProvider.LOCAL || !user.passwordHash) {
    return reply.status(400).send({
      error: 'PASSWORD_NOT_AVAILABLE',
      message: 'Le changement de mot de passe n’est disponible que pour les comptes e-mail.',
    });
  }

  const { currentPassword, newPassword } = parsedBody.data;
  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) {
    return reply.status(401).send({
      error: 'WRONG_CURRENT_PASSWORD',
      message: 'Mot de passe actuel incorrect.',
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return reply.send({ ok: true });
}

export async function getCurrentUser(req: FastifyRequest, reply: FastifyReply) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    include: { progress: true, subscription: true },
  });
  if (!user) return reply.status(404).send({ error: 'NOT_FOUND' });
  return reply.send({ user: sanitizeUser(user), progress: user.progress, subscription: user.subscription });
}

export async function updateCurrentUserProfile(req: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) {
  const parsedBody = updateProfileSchema.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    return reply.status(400).send({
      error: 'INVALID_PROFILE_REQUEST',
      details: formatZodErrors(parsedBody.error),
    });
  }

  const user = await prisma.user.update({
    where: { id: req.user.sub },
    data: { displayName: parsedBody.data.displayName },
  });

  return reply.send({ user: sanitizeUser(user) });
}
