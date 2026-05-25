#!/usr/bin/env bash
# Refuse la réintroduction de la vidéo ADE retirée du module 1 Apple (device-support-basics).
# Usage : bash scripts/check-no-ade-video.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

FORBIDDEN='Vidéo : ABM, supervision et enrôlement automatisé'
SEARCH_PATHS=(
  shared/src
  web/src
  backend/prisma
  backend/src
  mobile/src
)

echo "==> Vérification : aucun titre vidéo ADE interdit sur le module 1 Apple"

if rg -n --fixed-strings "$FORBIDDEN" "${SEARCH_PATHS[@]}" \
  --glob '!**/node_modules/**' \
  --glob '!CHANGELOG.md' \
  --glob '!*.spec.ts' \
  --glob '!module-video.spec.ts' 2>/dev/null; then
  echo ""
  echo "ERREUR : titre vidéo ADE interdit détecté (« ${FORBIDDEN} »)."
  echo "Le module apple-cert-prep/device-support-basics ne doit pas exposer de section vidéo ADE/ABM."
  exit 1
fi

MODULE_BLOCK="$(awk "/^      'device-support-basics': \\{/,/^      'ios-troubleshooting': \\{/" shared/src/course-content.ts)"
if printf '%s\n' "$MODULE_BLOCK" | rg -n 'videoTitle:|videoUrl:' >/dev/null 2>&1; then
  echo "ERREUR : device-support-basics ne doit pas définir videoTitle ni videoUrl dans course-content."
  exit 1
fi

echo "✓ Aucun titre vidéo ADE interdit"
