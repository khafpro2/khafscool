#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "==> .env créé depuis .env.example"
fi

echo "==> Installation des dépendances…"
pnpm install

echo "==> PostgreSQL (docker compose)…"
pnpm db:up

echo "==> Attente PostgreSQL…"
for _ in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U postgres -d apple_mdm_academy >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "==> Prisma generate + migrations + seed…"
pnpm db:generate
pnpm db:migrate
pnpm db:seed

echo ""
echo "Prêt. Lance la stack avec: pnpm dev:stack"
