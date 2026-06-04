#!/usr/bin/env bash
set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

on_error() {
  echo "==> Echec demarrage Railway (code $?). Verifier DATABASE_URL, migrate deploy et logs ci-dessus." >&2
  }
  trap on_error ERR

  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "==> ERREUR: DATABASE_URL non defini sur le service Railway." >&2
      exit 1
      fi

      echo "==> prisma migrate deploy"
      migrate_log="$(mktemp)"
      if ! pnpm db:migrate 2>&1 | tee "$migrate_log"; then
        if grep -q 'P3005' "$migrate_log"; then
            echo "==> migrate deploy P3005 - schema deja present sans historique Prisma, demarrage poursuivi."
              else
                  echo "==> migrate deploy a echoue - corriger les migrations avant redeploiement." >&2
                      rm -f "$migrate_log"
                          exit 1
                            fi
                            fi
                            rm -f "$migrate_log"

                            if [[ "${RUN_DB_SEED:-false}" == "true" ]]; then
                              echo "==> seed catalogue (RUN_DB_SEED=true)"
                                pnpm --filter backend exec tsx scripts/bootstrap-seed-if-empty.ts
                                else
                                  echo "==> seed ignore (RUN_DB_SEED != true)"
                                  fi

                                  echo "==> demarrage API"
                                  exec env NODE_ENV=production pnpm --filter backend start:prod
