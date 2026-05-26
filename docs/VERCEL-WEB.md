# Déploiement web sur Vercel

L’API tourne sur Render (ou Railway) — **ne pas** builder `backend` ni `mobile` sur Vercel.

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
| `NEXT_PUBLIC_API_URL` | Production, Preview | `https://votre-api.onrender.com` |
| `WEB_URL` | Production, Preview (recommandé) | `https://votre-app.vercel.app` |

Redéployer après toute modification de `NEXT_PUBLIC_*` (valeurs figées au build).

## Checklist post-merge (v0.3.13)

Après fusion de `cursor/progress-dashboard-auth-v2` sur `main` :

1. **Vercel** — le push sur `main` déclenche un déploiement Production automatique (Root Directory = `web`).
2. **Variables Vercel** (Production + Preview) :
   - `NEXT_PUBLIC_API_URL` = URL HTTPS de l’API Render (ex. `https://apple-mdm-academy-api.onrender.com`)
   - `WEB_URL` = URL Vercel de prod (ex. `https://apple-mdm-academy.vercel.app`)
3. **Render** — voir [`docs/DEPLOY-API-TODAY.md`](./DEPLOY-API-TODAY.md) et [`DEPLOYMENT.md`](../DEPLOYMENT.md) pour la liste complète des variables API.
4. **Redéployer Vercel** après avoir défini ou modifié `NEXT_PUBLIC_API_URL` (rebuild obligatoire).
5. **Vérifier** : `curl https://<api>/health` puis ouvrir le dashboard web sans mode démo.

## Fichiers du dépôt

- `web/vercel.json` — install à la racine du monorepo, build **web uniquement** (`pnpm --filter web`)
- `package.json` (racine) — script `vercel-build` de secours si Root Directory = racine par erreur : `pnpm --filter web build` (évite Turbo sur tout le monorepo)
- `pnpm-workspace.yaml` — workspaces `shared`, `backend`, `mobile`, `web`
