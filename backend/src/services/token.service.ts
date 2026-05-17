import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { Prisma } from '@prisma/client';
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

function buildRefreshToken() {
  const plainToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);
  return { plainToken, tokenHash: hashToken(plainToken), expiresAt };
}

export async function createRefreshToken(userId: string) {
  const refresh = buildRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: refresh.tokenHash,
      expiresAt: refresh.expiresAt,
    },
  });

  return { plainToken: refresh.plainToken, expiresAt: refresh.expiresAt };
}

export async function rotateRefreshToken(oldPlain: string) {
  const hash = hashToken(oldPlain);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
  if (!existing || existing.revoked || existing.expiresAt < new Date()) {
    throw new Error('INVALID_REFRESH');
  }

  const refresh = buildRefreshToken();
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const revoked = await tx.refreshToken.updateMany({
      where: { id: existing.id, revoked: false, expiresAt: { gt: new Date() } },
      data: { revoked: true },
    });
    if (revoked.count !== 1) throw new Error('INVALID_REFRESH');

    await tx.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: refresh.tokenHash,
        expiresAt: refresh.expiresAt,
      },
    });
  });

  return { plainToken: refresh.plainToken, expiresAt: refresh.expiresAt, userId: existing.userId };
}

export async function revokeRefreshToken(plainToken: string) {
  const hash = hashToken(plainToken);
  await prisma.refreshToken.updateMany({ where: { tokenHash: hash }, data: { revoked: true } });
}
