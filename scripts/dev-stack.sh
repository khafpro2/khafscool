#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> PostgreSQL (docker compose, hôte :5433 → conteneur :5432)…"
pnpm db:up

echo "==> Migrations et seed…"
pnpm db:migrate
pnpm --filter backend exec tsx scripts/bootstrap-seed-if-empty.ts

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
