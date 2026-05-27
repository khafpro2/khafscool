#!/usr/bin/env bash
# Démarre l'API Railway : migrations Prisma, seed si catalogue vide, puis node.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> prisma migrate deploy"
pnpm db:migrate

echo "==> seed si catalogue vide (ou RUN_DB_SEED=true)"
pnpm --filter backend exec tsx scripts/bootstrap-seed-if-empty.ts

echo "==> démarrage API"
exec env NODE_ENV=production pnpm --filter backend start:prod
