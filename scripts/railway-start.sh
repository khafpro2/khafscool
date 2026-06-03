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
migrate_log="$(mktemp)"
if ! pnpm db:migrate 2>&1 | tee "$migrate_log"; then
  if grep -q 'P3005' "$migrate_log"; then
    echo "==> migrate deploy P3005 — schéma déjà présent sans historique Prisma, démarrage poursuivi."
  else
    echo "==> migrate deploy a échoué — corriger les migrations avant redéploiement." >&2
    rm -f "$migrate_log"
    exit 1
  fi
fi
rm -f "$migrate_log"

echo "==> seed si catalogue vide (ou RUN_DB_SEED=true)"
pnpm --filter backend exec tsx scripts/bootstrap-seed-if-empty.ts

echo "==> démarrage API"
exec env NODE_ENV=production pnpm --filter backend start:prod
