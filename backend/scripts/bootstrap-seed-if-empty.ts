import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function main() {
  let courseCount: number;

  try {
    courseCount = await prisma.course.count();
  } catch (error) {
    console.error('[bootstrap] Lecture du catalogue impossible — vérifier migrate deploy.', error);
    process.exit(1);
  }

  const forceSeed = process.env.RUN_DB_SEED === 'true';

  if (courseCount === 0 || forceSeed) {
    console.log(
      forceSeed
        ? '[bootstrap] RUN_DB_SEED=true — seed idempotent'
        : '[bootstrap] Catalogue vide — seed initial'
    );
    execSync('pnpm db:seed', { stdio: 'inherit', cwd: repoRoot });
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
