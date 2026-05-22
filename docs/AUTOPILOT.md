# Autopilot local — vérification continue (8 h)

Cursor ne peut pas se réveiller seul toutes les 10 minutes. Ce script bash tourne **en local** sur votre machine et enchaîne tests, typecheck et scans de texte FR pendant jusqu'à **8 heures** (48 cycles × 10 min).

## Démarrer (sans intervention)

```bash
cd /chemin/vers/apple-mdm-academy
mkdir -p logs
nohup bash scripts/project-autopilot.sh >> logs/autopilot.log 2>&1 &
echo $! > logs/autopilot.pid
```

Le journal du jour est aussi écrit dans `logs/autopilot-YYYY-MM-DD.log`.

## Arrêter

```bash
kill "$(cat logs/autopilot.pid)"   # ou kill PID affiché par ps
```

## Lire les logs

```bash
tail -f logs/autopilot.log
tail -f logs/autopilot-$(date +%Y-%m-%d).log
grep -E '⚠|✗|Cycle' logs/autopilot-$(date +%Y-%m-%d).log
```

## Variables utiles

| Variable | Défaut | Effet |
|----------|--------|--------|
| `SKIP_E2E=1` | `1` | Pas de Playwright à chaque cycle |
| `AUTOPILOT_FIX=1` | off | Remplace mojibake et `&apos;` (pas les `'` typographiques dans chaînes `'…'`) |
| `AUTOPILOT_COMMIT=1` | off | Commit auto **uniquement** si tests verts |
| `SLEEP_SEC=600` | 600 | Pause entre cycles (10 min) |

Exemple avec corrections auto :

```bash
AUTOPILOT_FIX=1 nohup bash scripts/project-autopilot.sh >> logs/autopilot.log 2>&1 &
```

## Comportement par cycle

1. Timestamp dans `logs/autopilot-YYYY-MM-DD.log`
2. (Optionnel) corrections texte sûres si `AUTOPILOT_FIX=1`
3. Grep mojibake / `&apos;` dans `web/src`, `mobile/src`, `shared/src`
4. `pnpm --filter backend test` + `pnpm typecheck`
5. Toutes les **6** itérations : `bash scripts/verify-release.sh` (E2E sauf si `SKIP_E2E=1`)

## Hook Cursor (optionnel)

Le dépôt inclut un hook `afterFileEdit` léger (`.cursor/hooks.json`) qui rappelle de lancer une vérification après des edits sur le front :

```bash
SKIP_E2E=1 bash scripts/verify-release.sh
```

Ou un cycle rapide :

```bash
pnpm --filter backend test && pnpm typecheck
```

## Limites

- Ne pousse **pas** sur GitHub automatiquement.
- Ne commit **pas** sans `AUTOPILOT_COMMIT=1` et tests verts.
- N'est pas un substitut à la CI GitHub Actions.
