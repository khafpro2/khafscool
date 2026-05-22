#!/usr/bin/env bash
# Rappel léger après édition de fichiers UI — ne bloque pas l'agent.
set -euo pipefail
echo "[mdm-academy] Pensez à vérifier : pnpm --filter backend test && pnpm typecheck"
echo "[mdm-academy] Release complète : SKIP_E2E=1 bash scripts/verify-release.sh"
exit 0
