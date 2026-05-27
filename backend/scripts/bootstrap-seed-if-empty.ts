import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { isSchemaMissing } from '../src/lib/database-health.js';

const prisma = new PrismaClient();
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function runMigrateDeploy() {
  console.log('[bootstrap] prisma migrate deploy…');
  execSync('pnpm db:migrate', { stdio: 'inherit', cwd: repoRoot });
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error('[bootstrap] DATABASE_URL manquant — impossible de migrer ou seed.');
    process.exit(1);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error(
      '[bootstrap] Connexion Postgres impossible. Vérifie DATABASE_URL et que la base est joignable.',
      error
    );
    process.exit(1);
  }

  let courseCount: number;

  try {
    courseCount = await prisma.course.count();
  } catch (error) {
    if (isSchemaMissing(error)) {
      console.warn('[bootstrap] Schéma absent — tentative migrate deploy avant seed…');
      try {
        runMigrateDeploy();
        courseCount = await prisma.course.count();
      } catch (migrateError) {
        console.error('[bootstrap] migrate deploy a échoué.', migrateError);
        process.exit(1);
      }
    } else {
      console.error('[bootstrap] Lecture du catalogue impossible.', error);
      process.exit(1);
    }
  }

  const forceSeed = process.env.RUN_DB_SEED === 'true';

  if (courseCount === 0 || forceSeed) {
    console.log(
      forceSeed
        ? '[bootstrap] RUN_DB_SEED=true — seed idempotent'
        : '[bootstrap] Catalogue vide — seed initial'
    );
    execSync('pnpm db:seed', { stdio: 'inherit', cwd: repoRoot });

    const afterCount = await prisma.course.count();
    if (afterCount === 0) {
      console.error('[bootstrap] Seed terminé mais catalogue toujours vide — vérifier prisma/seed.ts.');
      process.exit(1);
    }
    console.log(`[bootstrap] Seed OK (${afterCount} parcours)`);
    return;
  }

  console.log(`[bootstrap] Catalogue OK (${courseCount} parcours) — seed ignoré`);
}

main()
  .catch((error) => {
    console.error('[bootstrap] Échec seed bootstrap', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
