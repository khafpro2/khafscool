# Déploiement web sur Vercel

L’API tourne sur **Railway** (recommandé) ou Render (legacy) — **ne pas** builder `backend` ni `mobile` sur Vercel.

Guide API : [`docs/DEPLOY-RAILWAY.md`](./DEPLOY-RAILWAY.md).

## Réglages obligatoires (dashboard Vercel)

| Paramètre | Valeur |
| --------- | ------ |
| **Root Directory** | `web` |
| **Framework Preset** | Next.js (détecté via `web/vercel.json`) |
| **Install Command** | *(laisser vide — défini dans `web/vercel.json`)* |
| **Build Command** | *(laisser vide — défini dans `web/vercel.json`)* |
| **Output Directory** | *(défaut Next.js — ne pas surcharger)* |

Ne pas surcharger Install / Build dans le dashboard : les commandes ci-dessous viennent de `web/vercel.json`.

**Important :** une commande définie dans le dashboard Vercel (**Settings → General → Build & Development Settings**) **écrase** `web/vercel.json`. Si le build affiche encore `cd .. && pnpm install`, vider les champs **Install Command** et **Build Command** (laisser vides) puis redéployer.

### Commandes effectives (depuis `web/vercel.json`)

Avec **Root Directory** = `web`, Vercel exécute l’install et le build depuis la **racine du dépôt** (`/vercel/path0`), pas depuis `web/`. Il ne faut donc **pas** de `cd ..` : un `cd ..` depuis la racine remonte vers `/vercel` et provoque `ERR_PNPM_NO_PKG_MANIFEST`.

| Phase | Commande |
| ----- | -------- |
| Install | `pnpm install --frozen-lockfile` |
| Build | `pnpm --filter web build` |

### Erreurs fréquentes

| Symptôme | Cause | Correction |
| -------- | ----- | ---------- |
| `No package.json found in /vercel` | `installCommand` avec `cd ..` alors que le CWD est déjà la racine du monorepo | Utiliser les commandes ci-dessus (sans `cd ..`) |
| `turbo run build` sur `backend` / Prisma | **Root Directory** = `.` (racine du dépôt) au lieu de `web` | Mettre **Root Directory** = `web` |
| Variables `NEXT_PUBLIC_*` absentes au runtime | Pas redéployé après changement d’env | Redéployer après toute modification |

### Alternative (non utilisée ici)

**Root Directory** vide + `vercel.json` à la racine avec `buildCommand: pnpm --filter web build` et `outputDirectory: web/.next` fonctionne aussi, mais impose de maintenir deux fichiers et complique la détection Next.js. Ce dépôt garde **Root Directory** = `web` et `web/vercel.json` uniquement.

## Variables d’environnement

| Variable | Environnements | Exemple |
| -------- | -------------- | ------- |
| `NEXT_PUBLIC_API_URL` | Production, Preview | `https://votre-api.up.railway.app` |
| `WEB_URL` | Production, Preview (recommandé) | `https://votre-app.vercel.app` |

Redéployer après toute modification de `NEXT_PUBLIC_*` (valeurs figées au build).

## Checklist post-merge (v0.3.13 — main)

PR #6 fusionnée sur `main`. État au 2026-05-27 :

| Étape | Statut |
| ----- | ------ |
| Vercel prod auto-deploy sur `main` | OK |
| Railway API `/health` | OK — `https://apple-mdm-academy-api-production.up.railway.app` |
| Neon `/health/db` | OK |
| `NEXT_PUBLIC_API_URL` (Production) | OK — redeploy effectué |
| `WEB_URL` (Production) | OK — `https://apple-mdm-academy.vercel.app` |
| `NEXT_PUBLIC_API_URL` (Preview) | **À faire** — ajouter pour toutes les branches preview |

Variables Production :

- `NEXT_PUBLIC_API_URL` = `https://apple-mdm-academy-api-production.up.railway.app`
- `WEB_URL` = `https://apple-mdm-academy.vercel.app`

Railway / Neon : [`DEPLOY-RAILWAY.md`](./DEPLOY-RAILWAY.md), [`NEON-DATABASE.md`](./NEON-DATABASE.md).

Vérification :

```bash
curl -sf https://apple-mdm-academy-api-production.up.railway.app/health
open https://apple-mdm-academy.vercel.app/diagnostics
```

## Fichiers du dépôt

- `web/vercel.json` — install à la racine du monorepo, build **web uniquement** (`pnpm --filter web`)
- `package.json` (racine) — script `vercel-build` de secours si Root Directory = racine par erreur : `pnpm --filter web build` (évite Turbo sur tout le monorepo)
- `pnpm-workspace.yaml` — workspaces `shared`, `backend`, `mobile`, `web`
