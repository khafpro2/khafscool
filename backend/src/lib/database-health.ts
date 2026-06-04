import { prisma } from './prisma.js';

export type DatabaseHealthResponse = {
  message: string;
  status: 'ok' | 'error';
  /** Présent lorsque les tables Prisma attendues sont absentes. */
  schemaReady?: boolean;
};

export function isSchemaMissing(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const code = 'code' in error ? String((error as { code?: string }).code) : '';
  if (code === 'P2021') return true;

  const message = 'message' in error ? String((error as { message?: string }).message) : '';
  return /does not exist|relation .* does not exist|n'existe pas/i.test(message);
}

const SCHEMA_MISSING_MESSAGE_FR =
  'Schéma absent ou incomplet. Exécuter prisma migrate deploy puis db seed (ou redéployer avec scripts/railway-start.sh).';

const SCHEMA_MISSING_MESSAGE_EN =
  'Database schema missing or incomplete. Run prisma migrate deploy and db seed (or redeploy with scripts/railway-start.sh).';

export function schemaMissingMessage(locale: 'fr' | 'en' = 'fr'): string {
  return locale === 'fr' ? SCHEMA_MISSING_MESSAGE_FR : SCHEMA_MISSING_MESSAGE_EN;
}

export async function getDatabaseHealth(): Promise<DatabaseHealthResponse> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.course.findFirst({ select: { id: true } });

    return {
      status: 'ok',
      message: 'Database reachable.',
      schemaReady: true,
    };
  } catch (error) {
    if (isSchemaMissing(error)) {
      return {
        status: 'error',
        message: SCHEMA_MISSING_MESSAGE_FR,
        schemaReady: false,
      };
    }

    return {
      status: 'error',
      message: 'Database unavailable. Check Docker Desktop, DATABASE_URL, migrations and seed.',
      schemaReady: undefined,
    };
  }
}
