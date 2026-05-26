#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> PostgreSQL (docker compose, hôte :5433 → conteneur :5432)…"
pnpm db:up

echo "==> Migrations et seed…"
if ! pnpm --filter backend exec prisma migrate status >/dev/null 2>&1; then
  echo "    Migrations en attente — pnpm db:migrate"
  pnpm db:migrate
else
  echo "    Schéma à jour — migration ignorée"
fi
pnpm db:seed

echo "==> Backend http://localhost:4000 et Web http://127.0.0.1:3000"
echo "    Ctrl+C arrête les deux serveurs."
echo ""

pnpm --filter backend dev &
BACKEND_PID=$!
pnpm --filter web dev &
WEB_PID=$!

cleanup() {
  echo ""
  echo "==> Arrêt backend (pid $BACKEND_PID) et web (pid $WEB_PID)…"
  kill "$BACKEND_PID" "$WEB_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$WEB_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

wait "$BACKEND_PID" "$WEB_PID"
