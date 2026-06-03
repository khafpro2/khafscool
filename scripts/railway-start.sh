#!/usr/bin/env bash
set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

on_error() {
  echo "==> Échec démarrage Railway (code $?). Vérifier DATABASE_URL, migrate deploy et logs ci-dessus." >&2
}
trap on_error ERR

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "==> ERREUR: DATABASE_URL non défini sur le service Railway." >&2
  exit 1
fi

echo "==> prisma migrate deploy"
if ! pnpm db:migrate; then
  echo "==> migrate deploy a échoué — corriger les migrations avant redéploiement." >&2
  exit 1
fi

echo "==> seed si catalogue vide (ou RUN_DB_SEED=true)"
pnpm --filter backend exec tsx scripts/bootstrap-seed-if-empty.ts

echo "==> démarrage API"
exec env NODE_ENV=production pnpm --filter backend start:prod
