#!/usr/bin/env bash
# Vérifications pré-release / pre-merge — aligné sur la CI GitHub Actions.
# Usage :
#   bash scripts/verify-release.sh
#   SKIP_E2E=1 bash scripts/verify-release.sh   # sans Playwright (plus rapide)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> verify-release : installation des dépendances"
CI=true pnpm install --frozen-lockfile

echo "==> verify-release : Prisma generate"
pnpm db:generate

echo "==> verify-release : garde-fou vidéo ADE module 1 Apple"
bash scripts/check-no-ade-video.sh

echo "==> verify-release : tests backend"
pnpm --filter backend test

echo "==> verify-release : build web"
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:4000}" pnpm --filter web build

if [[ "${SKIP_E2E:-}" == "1" ]]; then
  echo "==> verify-release : E2E ignorés (SKIP_E2E=1)"
else
  echo "==> verify-release : E2E Playwright (web)"
  pnpm --filter web exec playwright install --with-deps chromium
  CI=true NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:4000}" pnpm --filter web test:e2e
fi

echo ""
echo "✓ verify-release terminé avec succès"
