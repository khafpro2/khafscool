# Déployer l’API sur Railway (recommandé)

Objectif : obtenir une URL publique `https://xxxx.up.railway.app`, l’exposer à Vercel via `NEXT_PUBLIC_API_URL`, et sortir du mode démo.

> **Plateforme préférée** depuis v0.3.14 — Render reste documenté dans [`render.yaml`](../render.yaml) (legacy / secours).

Fichiers liés : [`railway.toml`](../railway.toml), [`scripts/deploy-api.sh`](../scripts/deploy-api.sh), guide Vercel [`VERCEL-WEB.md`](./VERCEL-WEB.md).

---

## Prérequis

| Outil | Version |
| ----- | ------- |
| Node.js | 22 (voir [`.nvmrc`](../.nvmrc)) |
| pnpm | 9.15 (voir `packageManager` racine) |
| Compte [Railway](https://railway.app) | CLI ou déploiement GitHub |
| Postgres | Plugin Railway **ou** Neon / Supabase |

---

## Étape 1 — Connexion et projet

```bash
npm i -g @railway/cli
railway login
cd /chemin/vers/apple-mdm-academy
railway init          # créer ou lier un projet Railway
```

Si le dépôt est déjà connecté à GitHub dans Railway : **New Project → Deploy from GitHub repo** → sélectionner `apple-mdm-academy`.

**Important (monorepo)** : dans **Settings → Source** du service API, la **racine** doit être `.` (racine du dépôt), **pas** `backend/`. Le package `@ama/shared` est compilé depuis `shared/` avant le backend.

---

## Étape 2 — Base PostgreSQL

### Option A — Postgres Railway (plugin)

```bash
railway add --plugin postgresql
```

Railway injecte automatiquement `DATABASE_URL` (ou `DATABASE_URL` via variable de référence selon la version du plugin).

### Option B — Neon (recommandé si vous avez déjà un projet Neon)

1. [Neon](https://neon.tech) → copier la connection string.
2. Vérifier `?sslmode=require` à la fin.

```bash
railway variables set DATABASE_URL='postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require'
```

---

## Étape 3 — Variables d’environnement

Générer les secrets JWT (deux valeurs **différentes**) :

```bash
openssl rand -base64 32
openssl rand -base64 32
```

### Tableau des variables (production)

| Variable | Obligatoire | Valeur / exemple |
| -------- | ----------- | ---------------- |
| `NODE_ENV` | Oui | `production` |
| `DATABASE_URL` | Oui | Postgres (Railway plugin ou Neon) |
| `JWT_SECRET` | Oui | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Oui | autre secret, min. 32 caractères |
| `CORS_ORIGIN` | Oui | `https://apple-mdm-academy.vercel.app` |
| `WEB_URL` | Recommandé | `https://apple-mdm-academy.vercel.app` |
| `API_URL` | Recommandé | `https://VOTRE-SERVICE.up.railway.app` (après 1er deploy) |
| `PORT` | Non | **Ne pas définir** — Railway injecte `$PORT` |

### CLI (exemple)

Remplacer les placeholders avant d’exécuter :

```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET='REMPLACER'
railway variables set JWT_REFRESH_SECRET='REMPLACER'
railway variables set CORS_ORIGIN='https://apple-mdm-academy.vercel.app'
railway variables set WEB_URL='https://apple-mdm-academy.vercel.app'
# Après le premier deploy, mettre l’URL publique Railway :
railway variables set API_URL='https://VOTRE-SERVICE.up.railway.app'
```

Ne **jamais** committer `JWT_*`, `DATABASE_URL`, ni `.env.local`.

---

## Étape 4 — Déployer

### Option A — CLI

```bash
railway up
```

Railway lit [`railway.toml`](../railway.toml) :

- **Build** : `pnpm install`, build `@ama/shared`, `prisma generate`, build `backend`
- **Start** : `NODE_ENV=production pnpm --filter backend start:prod` → `node dist/index.js`
- **Health check** : `GET /health`

### Option B — GitHub

Push sur `main` (ou branche connectée) → Railway rebuild automatiquement si le repo est lié.

---

## Étape 5 — Migrations Prisma

Une fois le service en ligne (ou avant le trafic prod) :

```bash
railway run pnpm --filter backend exec prisma migrate deploy
```

En local avec la même `DATABASE_URL` prod :

```bash
DATABASE_URL="postgresql://..." pnpm --filter backend exec prisma migrate deploy
```

(Optionnel démo) :

```bash
railway run pnpm --filter backend exec prisma db seed
```

Compte démo : `demo@mdmacademy.local` / `DemoTest2026!`

---

## Étape 6 — URL publique Railway

1. Dashboard Railway → service API → **Settings → Networking**
2. **Generate Domain** → copier l’URL, ex. `https://apple-mdm-academy-api-production.up.railway.app`
3. Mettre à jour `API_URL` sur Railway avec cette URL exacte (sans `/` final)
4. Redéployer si nécessaire

Vérification :

```bash
export API_URL=https://VOTRE-SERVICE.up.railway.app
curl -sf "${API_URL}/health"
bash scripts/deploy-api.sh
```

Réponse attendue : JSON avec `"ok": true`.

Test CORS (origine Vercel prod) :

```bash
CORS_ORIGIN=https://apple-mdm-academy.vercel.app \
  API_URL=https://VOTRE-SERVICE.up.railway.app \
  bash scripts/deploy-api.sh --smoke-cors
```

---

## Étape 7 — Brancher Vercel

Production Vercel : **https://apple-mdm-academy.vercel.app**

1. **Vercel** → projet → **Settings → Environment Variables**
2. Cocher **Production** et **Preview** :

| Variable | Valeur |
| -------- | ------ |
| `NEXT_PUBLIC_API_URL` | `https://VOTRE-SERVICE.up.railway.app` (sans `/` final) |
| `WEB_URL` | `https://apple-mdm-academy.vercel.app` |

3. **Deployments → … → Redeploy** (obligatoire : `NEXT_PUBLIC_*` est figé au build)

### CLI Vercel (optionnel)

```bash
cd web
pnpm dlx vercel login
vercel link
vercel env add NEXT_PUBLIC_API_URL production
# coller https://VOTRE-SERVICE.up.railway.app
vercel env add NEXT_PUBLIC_API_URL preview
vercel env add WEB_URL production
vercel env add WEB_URL preview
vercel deploy --prod
```

Contrôle navigateur : `https://apple-mdm-academy.vercel.app/diagnostics` → API OK, plus de bandeau mode démo.

---

## Dépannage

| Symptôme | Cause probable | Action |
| -------- | -------------- | ------ |
| Build échoue « module @ama/shared » | Racine service = `backend/` | Racine = `.` (monorepo) |
| Crash `Missing env: JWT_SECRET` | Secrets absents | Définir JWT_* + `CORS_ORIGIN` |
| `/health` OK, web en démo | `NEXT_PUBLIC_API_URL` absent ou pas redeploy Vercel | Variable + Redeploy |
| Erreur CORS | `CORS_ORIGIN` ≠ origine exacte | `https://apple-mdm-academy.vercel.app` |
| `/health/db` 503 | Migrations non appliquées | `railway run … prisma migrate deploy` |
| Health check timeout | Cold start ou DB lente | Attendre 120 s ; vérifier logs Railway |

---

## Render (legacy)

L’ancien déploiement Render (`apple-mdm-academy-api.onrender.com`) n’est plus la cible principale. Le blueprint [`render.yaml`](../render.yaml) reste dans le dépôt pour secours ou migration inverse.

Voir aussi [`DEPLOY-API-TODAY.md`](./DEPLOY-API-TODAY.md) pour le flux complet web + API.
