#!/usr/bin/env bash
# =============================================================================
# MDM Academy — autopilot local (max 8 h, cycles de 10 min)
#
# Lancer en arrière-plan (8 h sans intervention) :
#   mkdir -p logs
#   nohup bash scripts/project-autopilot.sh >> logs/autopilot.log 2>&1 &
#
# Variables :
#   AUTOPILOT_FIX=1     — corrections texte sûres (mojibake, &apos;, apostrophe typographique)
#   AUTOPILOT_COMMIT=1  — commit si tests verts (désactivé par défaut)
#   SKIP_E2E=1          — défaut : pas d'E2E à chaque cycle ; full verify toutes les 6 itérations
#   SLEEP_SEC=600       — pause entre cycles (10 min)
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SLEEP_SEC="${SLEEP_SEC:-600}"
MAX_ITERATIONS="${MAX_ITERATIONS:-48}"
END=$((SECONDS + 28800))
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"

ITERATION=0
FAILURES=0

log() {
  local msg="$1"
  local ts
  ts="$(date '+%Y-%m-%d %H:%M:%S')"
  echo "[$ts] $msg" | tee -a "$LOG_DIR/autopilot-$(date '+%Y-%m-%d').log"
}

scan_suspect_text() {
  local dirs=(web/src mobile/src shared/src)
  local patterns=(
    'Ã©|Ã¨|Ã |Ã§|Ãª|Ã®|Ã´|Ã»'
    'â€™|â€œ|â€"|â€"'
    '&apos;'
  )
  local found=0
  for pat in "${patterns[@]}"; do
    if rg -n "$pat" "${dirs[@]}" 2>/dev/null; then
      found=1
    fi
  done
  return "$found"
}

apply_safe_text_fixes() {
  log "AUTOPILOT_FIX=1 — application des corrections texte sûres"
  local dirs=(web/src mobile/src shared/src)
  local files=()
  while IFS= read -r -d '' f; do
    files+=("$f")
  done < <(find "${dirs[@]}" -type f \( -name '*.tsx' -o -name '*.ts' \) -print0 2>/dev/null)

  for f in "${files[@]}"; do
    perl -i -pe '
      s/Ã©/é/g;
      s/Ã¨/è/g;
      s/Ã /à/g;
      s/Ã§/ç/g;
      s/Ãª/ê/g;
      s/Ã®/î/g;
      s/Ã´/ô/g;
      s/Ã»/û/g;
      s/â€™/'"'"'/g;
      s/â€œ/"/g;
      s/â€"/–/g;
      s/â€"/"/g;
      s/&apos;/'"'"'/g;
    ' "$f"
  done
}

run_quick_checks() {
  log "Tests backend (subset rapide)"
  pnpm --filter backend test

  log "Typecheck monorepo"
  pnpm typecheck
}

run_full_verify() {
  log "Verify-release complet (itération multiple de 6)"
  SKIP_E2E="${SKIP_E2E:-1}" bash scripts/verify-release.sh
}

maybe_commit() {
  if [[ "${AUTOPILOT_COMMIT:-}" != "1" ]]; then
    return 0
  fi
  if ! git diff --quiet || [[ -n "$(git status --porcelain)" ]]; then
    git add -A
    git commit -m "chore(autopilot): corrections automatiques cycle $ITERATION"
    log "Commit créé (AUTOPILOT_COMMIT=1)"
  fi
}

log "=== Autopilot démarré (PID $$) — max 8 h ou $MAX_ITERATIONS cycles ==="
log "Branche: $(git branch --show-current 2>/dev/null || echo '?')"
log "SKIP_E2E=${SKIP_E2E:-1} AUTOPILOT_FIX=${AUTOPILOT_FIX:-0} AUTOPILOT_COMMIT=${AUTOPILOT_COMMIT:-0}"

while [[ $SECONDS -lt $END && $ITERATION -lt $MAX_ITERATIONS ]]; do
  ITERATION=$((ITERATION + 1))
  log "--- Cycle $ITERATION / $MAX_ITERATIONS ---"

  if [[ "${AUTOPILOT_FIX:-}" == "1" ]]; then
    apply_safe_text_fixes || true
  fi

  log "Scan texte suspect (mojibake, entités HTML, apostrophes)"
  if scan_suspect_text; then
    log "⚠ Texte suspect détecté — voir ci-dessus"
    FAILURES=$((FAILURES + 1))
  else
    log "✓ Aucun motif suspect dans web/src, mobile/src, shared/src"
  fi

  if (( ITERATION % 6 == 0 )); then
    if run_full_verify; then
      maybe_commit
    else
      log "✗ verify-release en échec"
      FAILURES=$((FAILURES + 1))
    fi
  else
    if run_quick_checks; then
      maybe_commit
    else
      log "✗ tests ou typecheck en échec"
      FAILURES=$((FAILURES + 1))
    fi
  fi

  if [[ $SECONDS -ge $END || $ITERATION -ge $MAX_ITERATIONS ]]; then
    break
  fi

  log "Pause ${SLEEP_SEC}s avant le prochain cycle…"
  sleep "$SLEEP_SEC"
done

log "=== Autopilot terminé — $ITERATION cycle(s), $FAILURES échec(s) signalé(s) ==="
exit 0
