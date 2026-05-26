#!/usr/bin/env bash
# Checklist Render — LEGACY (plateforme préférée : Railway — docs/DEPLOY-RAILWAY.md)
# Usage :
#   bash scripts/render-env-checklist.sh
#   API_URL=https://apple-mdm-academy-api.onrender.com bash scripts/render-env-checklist.sh --poll

set -euo pipefail

API_URL="${API_URL:-https://apple-mdm-academy-api.onrender.com}"
API_URL="${API_URL%/}"
CORS_ORIGIN="${CORS_ORIGIN:-https://apple-mdm-academy.vercel.app}"
WEB_URL="${WEB_URL:-https://apple-mdm-academy.vercel.app}"

echo "══════════════════════════════════════════════════════════════"
echo " Render — apple-mdm-academy-api"
echo " Dashboard : https://dashboard.render.com"
echo " Health    : ${API_URL}/health"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "1) Ouvrir le service « apple-mdm-academy-api »"
echo "   - Si statut Suspended → Resume"
echo "   - Si dernier deploy Failed → Logs → corriger env puis Manual Deploy"
echo ""
echo "2) Environment → coller ces variables (Production + Preview) :"
echo ""
printf "   %-22s %s\n" "NODE_ENV" "production"
printf "   %-22s %s\n" "CORS_ORIGIN" "${CORS_ORIGIN}"
printf "   %-22s %s\n" "WEB_URL" "${WEB_URL}"
printf "   %-22s %s\n" "API_URL" "${API_URL}"
echo "   DATABASE_URL           → Neon (connection string ?sslmode=require)"
echo "   JWT_SECRET             → openssl rand -base64 32"
echo "   JWT_REFRESH_SECRET     → openssl rand -base64 32  (différent du premier)"
echo ""
echo "   Générer deux secrets :"
echo "     openssl rand -base64 32"
echo "     openssl rand -base64 32"
echo ""
echo "   Copie locale possible : .env à la racine du monorepo (DATABASE_URL, JWT_*)."
echo "   Ne jamais committer ces fichiers."
echo ""
echo "3) Settings → Pre-Deploy Command (ou render.yaml preDeployCommand après push) :"
echo "   pnpm --filter backend exec prisma migrate deploy"
echo ""
echo "   One-off Shell si besoin (même repo, racine .) :"
echo "   corepack enable && corepack prepare pnpm@9.15.0 --activate"
echo "   pnpm install --frozen-lockfile"
echo "   pnpm --filter backend exec prisma migrate deploy"
echo ""
echo "4) Manual Deploy → attendre build vert (cold start free : 60–90 s)"
echo ""
echo "5) Vérification :"
echo "   curl -sf \"${API_URL}/health\""
echo "   bash scripts/deploy-api.sh"
echo ""

if [[ "${1:-}" == "--poll" ]]; then
  echo "==> Poll /health (max 150 s, intervalle 10 s)"
  deadline=$((SECONDS + 150))
  while (( SECONDS < deadline )); do
    if body="$(curl -sf --connect-timeout 15 --max-time 90 "${API_URL}/health" 2>/dev/null)"; then
      echo "${body}"
      if echo "${body}" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
        echo ""
        echo "OK — API en ligne."
        exit 0
      fi
    else
      echo "… pas encore prêt ($(date +%H:%M:%S))"
    fi
    sleep 10
  done
  echo "ERREUR: /health indisponible après 150 s" >&2
  exit 1
fi

echo "Pour attendre le redémarrage après deploy Render :"
echo "  API_URL=${API_URL} bash scripts/render-env-checklist.sh --poll"
echo ""
