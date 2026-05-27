# Déployer l’API sur Railway (recommandé)

Objectif : obtenir une URL publique `https://xxxx.up.railway.app`, l’exposer à Vercel via `NEXT_PUBLIC_API_URL`, et sortir du mode démo.

> **Plateforme préférée** depuis v0.3.14 — Render reste documenté dans [`render.yaml`](../render.yaml) (legacy / secours).

Fichiers liés : [`railway.toml`](../railway.toml), [`NEON-DATABASE.md`](./NEON-DATABASE.md), [`scripts/railway-env-checklist.sh`](../scripts/railway-env-checklist.sh), [`scripts/deploy-api.sh`](../scripts/deploy-api.sh), guide Vercel [`VERCEL-WEB.md`](./VERCEL-WEB.md).

---

## Prérequis

| Outil | Version |
| ----- | ------- |
| Node.js | 22 (voir [`.nvmrc`](../.nvmrc)) |
| pnpm | 9.15 (voir `packageManager` racine) |
| Compte [Railway](https://railway.app) | CLI ou déploiement GitHub |
| Postgres | **[Neon](https://neon.tech)** (recommandé) — voir [`NEON-DATABASE.md`](./NEON-DATABASE.md) |

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

## Étape 2 — Base PostgreSQL (Neon)

L’API sur Railway **ne** s’appuie pas sur le plugin Postgres Railway par défaut : la base est hébergée sur **Neon**.

Guide détaillé : [`NEON-DATABASE.md`](./NEON-DATABASE.md).

1. [neon.tech](https://neon.tech) → **New Project** → région proche (ex. `eu-central-1`).
2. **Connect** → copier la connection string.
3. Vérifier `?sslmode=require` à la fin.

Format attendu :

```text
postgresql://USER:PASSWORD@ep-XXXXXXXX.region.aws.neon.tech/neondb?sslmode=require
```

4. Sur Railway (service API) :

```bash
railway variables set DATABASE_URL='postgresql://USER:PASSWORD@ep-xxx.neon.tech/neondb?sslmode=require'
```

Checklist interactive : `bash scripts/railway-env-checklist.sh`

> **Legacy** : le plugin `railway add --plugin postgresql` reste possible mais n’est plus documenté comme choix par défaut — préférer Neon pour staging/prod alignés avec Render et les secrets GitHub Actions.

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
| `NODE_ENV` | Oui | `production` — défini dans [`railway.toml`](../railway.toml) `[env]` **et** `scripts/railway-start.sh` ; sans cela `/auth/oauth/status` peut omettre `environment` ou indiquer `development` |
| `DATABASE_URL` | Oui | Connection string **Neon** (`?sslmode=require`) |
| `JWT_SECRET` | Oui | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Oui | autre secret, min. 32 caractères |
| `CORS_ORIGIN` | Oui | `https://apple-mdm-academy.vercel.app` |
| `WEB_URL` | Recommandé | `https://apple-mdm-academy.vercel.app` |
| `API_URL` | Recommandé | `https://VOTRE-SERVICE.up.railway.app` (après 1er deploy) |
| `GOOGLE_*` / `APPLE_*` / `MICROSOFT_*` | Optionnel (SSO) | Voir [OAUTH-PRODUCTION.md](./OAUTH-PRODUCTION.md) — **Railway uniquement** |
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
