# Déployer l’API HTTPS aujourd’hui (Vercel + Railway ou Render)

Objectif : obtenir une URL du type `https://xxxx.up.railway.app` (recommandé) ou `https://xxxx.onrender.com` (legacy), la brancher sur Vercel via `NEXT_PUBLIC_API_URL`, et sortir du mode démo.

> Fichiers d’infra dans le dépôt : [`railway.toml`](../railway.toml), [`docs/DEPLOY-RAILWAY.md`](./DEPLOY-RAILWAY.md), [`render.yaml`](../render.yaml) (secours), script [`scripts/deploy-api.sh`](../scripts/deploy-api.sh).

## Plateforme recommandée

| Plateforme | Pourquoi |
| ---------- | -------- |
| **Railway (recommandé)** | DX monorepo, health check `/health`, [`railway.toml`](../railway.toml), domaine `*.up.railway.app`, Postgres plugin. Guide : [`DEPLOY-RAILWAY.md`](./DEPLOY-RAILWAY.md). |
| **Render (legacy / secours)** | Plan gratuit Web Service, blueprint `render.yaml`. Cold start free plus long ; URL `onrender.com` non maintenue en prod actuelle. |

**Postgres** : Neon ou Supabase (gratuit) — ou plugin Postgres Railway.

---

## Variables d’environnement API (liste exacte)

### Obligatoires en production (`NODE_ENV=production`)

| Variable | Exemple (placeholders) |
| -------- | ---------------------- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | `remplacer-par-openssl-rand-base64-32` |
| `JWT_REFRESH_SECRET` | `autre-secret-different-min-32-chars` |
| `CORS_ORIGIN` | `https://apple-mdm-academy.vercel.app` (URL Vercel **exacte**, sans `/` final) |
| `PORT` | Laisser vide sur Render/Railway (la plateforme injecte `$PORT`) |

### Fortement recommandées

| Variable | Exemple |
| -------- | ------- |
| `API_URL` | `https://VOTRE-SERVICE.up.railway.app` |
| `WEB_URL` | `https://apple-mdm-academy.vercel.app` |

### Optionnelles (plus tard)

`STRIPE_*`, `DONATION_*`, `GOOGLE_*`, `APPLE_*`, `MICROSOFT_*`, `ADMIN_API_KEY`, `MOBILE_REDIRECT_URI`

Générer des secrets JWT :

```bash
openssl rand -base64 32
openssl rand -base64 32
```

---

## Commandes build / start (monorepo)

À exécuter depuis la **racine** du dépôt (pas seulement `backend/`, à cause de `@ama/shared`) :

| Étape | Commande |
| ----- | -------- |
| Install + Prisma | `pnpm install --frozen-lockfile` |
| Migrations (one-off ou release) | `pnpm --filter backend exec prisma migrate deploy` |
| Build TypeScript | `pnpm --filter @ama/shared build && pnpm --filter backend build` |
| **Démarrage prod** | `pnpm --filter backend start:prod` (`node dist/index.js`) |

`@ama/shared` est compilé en `shared/dist` ; les exports du package pointent vers le JS en production (`NODE_ENV=production`).

---

## Checklist — à suivre dans l’ordre

### 1. PostgreSQL managé (Neon)

1. [Neon](https://neon.tech) → New Project → copier la connection string.
2. Vérifier `?sslmode=require` à la fin de `DATABASE_URL`.

### 2. Déployer l’API

#### Option A — Railway (recommandé)

Voir le guide complet [`docs/DEPLOY-RAILWAY.md`](./DEPLOY-RAILWAY.md). Résumé :

```bash
npm i -g @railway/cli
railway login
cd /chemin/vers/apple-mdm-academy
railway init
railway add              # optionnel : PostgreSQL Railway
railway variables set NODE_ENV=production
railway variables set DATABASE_URL='postgresql://...'
railway variables set JWT_SECRET='...'
railway variables set JWT_REFRESH_SECRET='...'
railway variables set CORS_ORIGIN='https://apple-mdm-academy.vercel.app'
railway variables set WEB_URL='https://apple-mdm-academy.vercel.app'
railway variables set API_URL='https://votre-service.up.railway.app'
railway up
railway run pnpm --filter backend exec prisma migrate deploy
```

Racine du service = **repo** (`.`), pas `backend/` seul. Railway utilise [`railway.toml`](../railway.toml).

#### Option B — Render (blueprint legacy)

1. [render.com](https://render.com) → **New** → **Blueprint** → repo GitHub `apple-mdm-academy`.
2. Render lit [`render.yaml`](../render.yaml).
3. Renseigner les variables `sync: false` dans le dashboard :
   - `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - `CORS_ORIGIN` = URL Vercel prévue (étape 4) ou domaine prod connu
   - `WEB_URL` = même URL que le front Vercel
   - `API_URL` = URL Render du service (après 1er deploy, ou domaine custom)
4. **Create resources** → attendre le build vert.
5. **Release / Shell** (ou en local avec `DATABASE_URL` prod) :

   ```bash
   pnpm install --frozen-lockfile
   DATABASE_URL="postgresql://..." pnpm --filter backend exec prisma migrate deploy
   ```

6. (Optionnel démo) : `pnpm --filter backend exec prisma db seed` — compte `demo@mdmacademy.local` / `DemoTest2026!`

### 3. Vérifier l’API

```bash
export API_URL=https://VOTRE-SERVICE.up.railway.app   # votre URL Railway réelle
curl -sf --max-time 120 "${API_URL}/health"
bash scripts/deploy-api.sh
```

Checklist interactive Render (legacy uniquement) :

```bash
bash scripts/render-env-checklist.sh
API_URL=https://apple-mdm-academy-api.onrender.com bash scripts/render-env-checklist.sh --poll
```

Réponse attendue : JSON avec `"ok": true`.

### 4. Vercel — brancher le front

1. Projet Vercel, **Root Directory** = `web` (voir [`web/vercel.json`](../web/vercel.json)).
2. **Settings → Environment Variables** (cocher **Preview** et **Production**) :

   | Variable | Valeur |
   | -------- | ------ |
   | `NEXT_PUBLIC_API_URL` | `https://VOTRE-SERVICE.up.railway.app` (URL API étape 3, **sans** `/` final) |
   | `WEB_URL` | `https://apple-mdm-academy.vercel.app` (URL réelle de **ce** déploiement Vercel) |

3. **Deployments → … → Redeploy** (obligatoire : `NEXT_PUBLIC_*` est figé au build).

### 5. Finaliser CORS

1. Noter l’URL preview exacte après redeploy, ex. `https://apple-mdm-academy-abc123.vercel.app`.
2. Sur Railway (ou Render legacy), mettre à jour `CORS_ORIGIN` :
   - une origine : `https://apple-mdm-academy-abc123.vercel.app`
   - plusieurs : `https://prod.vercel.app,https://preview-abc.vercel.app` (séparées par des virgules)
3. Redéployer l’API si besoin.
4. Vérifier :

   ```bash
   CORS_ORIGIN=https://apple-mdm-academy-abc123.vercel.app \
     API_URL=https://VOTRE-SERVICE.up.railway.app \
     bash scripts/deploy-api.sh --smoke-cors
   ```

### 6. Contrôle navigateur

- `https://<votre-vercel>/diagnostics` → API OK
- Plus de bandeau « mode démo » si l’API répond et CORS est correct.

---

## Ce qu’il faut coller sur Vercel

```
NEXT_PUBLIC_API_URL=https://VOTRE-SERVICE.up.railway.app
WEB_URL=https://apple-mdm-academy.vercel.app
```

Puis **Redeploy**.

---

## CLI Vercel (optionnel)

```bash
cd web
pnpm dlx vercel login
vercel link
vercel env add NEXT_PUBLIC_API_URL preview
# coller https://VOTRE-SERVICE.up.railway.app
vercel env add NEXT_PUBLIC_API_URL production
vercel env add WEB_URL preview
vercel env add WEB_URL production
vercel deploy
```

---

## Dépannage rapide

| Symptôme | Cause probable | Action |
| -------- | -------------- | ------ |
| Build Railway/Render échoue | Racine = `backend/` au lieu de la racine monorepo | Racine `.`, commandes du `railway.toml` / `render.yaml` |
| Crash au boot `Missing env: JWT_SECRET` | `NODE_ENV=production` sans secrets | Définir JWT_* et `CORS_ORIGIN` |
| `/health` OK mais web en démo | `NEXT_PUBLIC_API_URL` absent ou pas redeploy | Variable + Redeploy |
| Erreur CORS navigateur | `CORS_ORIGIN` ≠ origine Vercel exacte | Copier l’URL depuis la barre d’adresse |
| `/health/db` 503 | Migrations non appliquées | `prisma migrate deploy` |
| 401 page Vercel SSO | Deployment Protection | Se connecter Vercel ou assouplir la protection |

---

## Commit suggéré (à faire vous-même)

```bash
git add railway.toml render.yaml scripts/deploy-api.sh docs/DEPLOY-RAILWAY.md docs/DEPLOY-API-TODAY.md docs/VERCEL-WEB.md backend/package.json
git commit -m "docs(deploy): Railway comme plateforme API principale"
```

Ne jamais committer `.env`, `.env.local`, ni les valeurs réelles de `JWT_*` / `DATABASE_URL`.
