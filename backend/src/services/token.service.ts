import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const ACCESS_TTL = '15m';
const REFRESH_DAYS = 30;

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

export async function createRefreshToken(userId: string) {
  const plainToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);

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
  const refresh = await createRefreshToken(existing.userId);
  return { ...refresh, userId: existing.userId };
}

export async function revokeRefreshToken(plainToken: string) {
  const hash = hashToken(plainToken);
  await prisma.refreshToken.updateMany({ where: { tokenHash: hash }, data: { revoked: true } });
}
