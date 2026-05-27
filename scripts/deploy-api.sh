#!/usr/bin/env bash
# Vérifications post-déploiement API (sans secrets).
# Plateforme cible : Railway (docs/DEPLOY-RAILWAY.md). Render reste supporté en legacy.
# Usage :
#   API_URL=https://votre-api.up.railway.app bash scripts/deploy-api.sh
#   API_URL=... CORS_ORIGIN=https://apple-mdm-academy.vercel.app bash scripts/deploy-api.sh --smoke-cors

set -euo pipefail

API_URL="${API_URL:?Définir API_URL (URL HTTPS publique, sans slash final)}"
API_URL="${API_URL%/}"

echo "==> GET ${API_URL}/health"
health_body="$(curl -sf "${API_URL}/health")"
echo "${health_body}" | head -c 500
echo ""

if ! echo "${health_body}" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
  echo "ERREUR: /health ne contient pas ok:true" >&2
  exit 1
fi

echo "==> GET ${API_URL}/health/db"
db_code="$(curl -s -o /tmp/ama-health-db.json -w '%{http_code}' "${API_URL}/health/db")"
cat /tmp/ama-health-db.json
echo ""
if [[ "${db_code}" != "200" ]]; then
  echo "AVERTISSEMENT: /health/db → HTTP ${db_code} (vérifier DATABASE_URL et prisma migrate deploy)" >&2
fi

if [[ "${1:-}" == "--smoke-cors" ]]; then
  if [[ -z "${CORS_ORIGIN:-}" ]]; then
    echo "Pour --smoke-cors, définir CORS_ORIGIN (origine Vercel exacte)" >&2
    exit 1
  fi
  echo "==> Preflight CORS depuis ${CORS_ORIGIN}"
  cors_code="$(curl -s -o /dev/null -w '%{http_code}' \
    -X OPTIONS "${API_URL}/health" \
    -H "Origin: ${CORS_ORIGIN}" \
    -H "Access-Control-Request-Method: GET")"
  echo "OPTIONS /health → HTTP ${cors_code}"
fi

echo ""
echo "OK — API joignable. Coller sur Vercel (Preview + Production) :"
echo "  NEXT_PUBLIC_API_URL=${API_URL}"
