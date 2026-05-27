#!/usr/bin/env bash
# Checklist Railway — service API (plateforme préférée)
# Base Postgres : Neon — voir docs/NEON-DATABASE.md
# Usage :
#   bash scripts/railway-env-checklist.sh
#   API_URL=https://votre-service.up.railway.app bash scripts/railway-env-checklist.sh --poll

set -euo pipefail

API_URL="${API_URL:-https://apple-mdm-academy-api-production.up.railway.app}"
API_URL="${API_URL%/}"
CORS_ORIGIN="${CORS_ORIGIN:-https://apple-mdm-academy.vercel.app}"
WEB_URL="${WEB_URL:-https://apple-mdm-academy.vercel.app}"

echo "══════════════════════════════════════════════════════════════"
echo " Railway — API apple-mdm-academy"
echo " Guide    : docs/DEPLOY-RAILWAY.md"
echo " Base DB  : docs/NEON-DATABASE.md (Neon — pas le plugin Postgres Railway par défaut)"
echo " Health   : ${API_URL}/health"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "1) Projet Railway → service API"
echo "   - Root Directory = . (racine monorepo, pas backend/ seul)"
echo "   - railway.toml lu automatiquement"
echo ""
echo "2) Neon (neon.tech) → New Project → Connect → connection string"
echo "   Format DATABASE_URL :"
echo "     postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
echo ""
echo "3) Variables Railway (dashboard ou railway variables set) :"
echo ""
printf "   %-22s %s\n" "NODE_ENV" "production"
printf "   %-22s %s\n" "DATABASE_URL" "(Neon — voir ci-dessus, ?sslmode=require)"
printf "   %-22s %s\n" "CORS_ORIGIN" "${CORS_ORIGIN}"
printf "   %-22s %s\n" "WEB_URL" "${WEB_URL}"
printf "   %-22s %s\n" "API_URL" "${API_URL}"
echo "   JWT_SECRET             → openssl rand -base64 32"
echo "   JWT_REFRESH_SECRET     → openssl rand -base64 32  (différent du premier)"
echo ""
echo "   Ne pas définir PORT — Railway injecte \$PORT."
echo "   Ne jamais committer DATABASE_URL ni JWT_*."
echo ""
echo "4) Migrations (one-off après 1er deploy ou changement de schéma) :"
echo "   railway run pnpm --filter backend exec prisma migrate deploy"
echo ""
echo "5) Domaine public → Settings → Networking → Generate Domain"
echo "   Mettre à jour API_URL avec l’URL *.up.railway.app"
echo ""
echo "6) Vercel → NEXT_PUBLIC_API_URL = même URL API (sans / final) → Redeploy"
echo ""
echo "7) Vérification :"
echo "   curl -sf \"${API_URL}/health\""
echo "   curl -sf \"${API_URL}/health/db\""
echo "   bash scripts/deploy-api.sh"
echo ""

if [[ "${1:-}" == "--poll" ]]; then
  echo "==> Poll /health (max 120 s, intervalle 10 s)"
  deadline=$((SECONDS + 120))
  while (( SECONDS < deadline )); do
    if body="$(curl -sf --connect-timeout 15 --max-time 60 "${API_URL}/health" 2>/dev/null)"; then
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
  echo "ERREUR: /health indisponible après 120 s" >&2
  exit 1
fi

echo "Pour attendre après deploy :"
echo "  API_URL=${API_URL} bash scripts/railway-env-checklist.sh --poll"
echo ""
