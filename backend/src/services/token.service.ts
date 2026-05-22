import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const ACCESS_TTL = '15m';

/** Durée par défaut (OAuth, inscription). */
export const REFRESH_TTL_DAYS_DEFAULT = 30;
/** Session courte sans « Se souvenir de moi ». */
export const REFRESH_TTL_DAYS_SESSION = 7;
/** Session prolongée avec « Se souvenir de moi ». */
export const REFRESH_TTL_DAYS_REMEMBER = 90;

export type RefreshTokenOptions = {
  rememberMe?: boolean;
  /** Conserve la date d’expiration lors d’une rotation de jeton. */
  expiresAt?: Date;
};

function refreshDaysFor(options?: RefreshTokenOptions): number {
  if (options?.rememberMe === true) return REFRESH_TTL_DAYS_REMEMBER;
  if (options?.rememberMe === false) return REFRESH_TTL_DAYS_SESSION;
  return REFRESH_TTL_DAYS_DEFAULT;
}

export interface AccessPayload {
  sub: string;
  email?: string | null;
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: ACCESS_TTL });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.jwtSecret) as AccessPayload;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createRefreshToken(userId: string, options?: RefreshTokenOptions) {
  const plainToken = crypto.randomBytes(48).toString('hex');
  const expiresAt =
    options?.expiresAt ??
    (() => {
      const date = new Date();
      date.setDate(date.getDate() + refreshDaysFor(options));
      return date;
    })();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(plainToken),
      expiresAt,
    },
  });

  return { plainToken, expiresAt };
}

export async function rotateRefreshToken(oldPlain: string) {
  const hash = hashToken(oldPlain);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
  if (!existing || existing.revoked || existing.expiresAt < new Date()) {
    throw new Error('INVALID_REFRESH');
  }

  await prisma.refreshToken.update({ where: { id: existing.id }, data: { revoked: true } });
  const refresh = await createRefreshToken(existing.userId, { expiresAt: existing.expiresAt });
  return { ...refresh, userId: existing.userId };
}

export async function revokeRefreshToken(plainToken: string) {
  const hash = hashToken(plainToken);
  await prisma.refreshToken.updateMany({ where: { tokenHash: hash }, data: { revoked: true } });
}

export async function revokeAllUserRefreshTokens(userId: string) {
  const result = await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
  return result.count;
}
