# Guide de déploiement — Apple MDM Academy

Ce document décrit une architecture de production recommandée pour le monorepo (`web`, `backend`, `mobile`).

## Variables essentielles (résumé)

| Composant | Plateforme | Variables clés |
| --------- | ---------- | -------------- |
| **Web** | Vercel | `NEXT_PUBLIC_API_URL` |
| **API** | Railway / Render / Fly.io | `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` |
| **Base** | Neon / Supabase / Postgres managé | URL dans `DATABASE_URL` |
| **Mobile** | EAS Build | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WEB_URL` |

Voir le détail par service ci-dessous. Aligner les trois URLs publiques (web, mobile, API) sur le même backend avant la mise en prod.

## Architecture recommandée

| Composant | Hébergement conseillé | Rôle |
| --------- | --------------------- | ---- |
| **Web** (Next.js) | [Vercel](https://vercel.com) | Interface apprenant MDM Academy, auth côté client, appels API |
| **API** (Fastify) | [Railway](https://railway.app), [Render](https://render.com) ou [Fly.io](https://fly.io) | REST, JWT, gamification, billing |
| **Base** (PostgreSQL) | [Neon](https://neon.tech), [Supabase](https://supabase.com) ou Postgres managé | Données utilisateurs, parcours, progression |
| **Mobile** (Expo) | [EAS Build](https://docs.expo.dev/build/introduction/) | Builds iOS/Android, OTA via EAS Update (optionnel) |

```text
[Utilisateur]
    │
    ├─► Vercel (web) ──NEXT_PUBLIC_API_URL──► API (Railway/Render/Fly)
    │                                              │
    └─► Expo (mobile) ──EXPO_PUBLIC_API_URL───────┘
                                                   │
                                                   ▼
                                            PostgreSQL (Neon/Supabase)
```

## Variables d'environnement

### Web (`web/` — Vercel)

| Variable | Exemple | Description |
| -------- | ------- | ----------- |
| `NEXT_PUBLIC_API_URL` | `https://api.votredomaine.com` | URL publique de l’API (sans slash final) |

Configurer dans **Project Settings → Environment Variables** (Production, Preview, Development).

### API (`backend/` — Railway / Render / Fly)

| Variable | Obligatoire | Description |
| -------- | ----------- | ----------- |
| `DATABASE_URL` | Oui | Chaîne PostgreSQL (`postgresql://...`) |
| `JWT_SECRET` | Oui | Secret JWT accès (long, aléatoire) |
| `JWT_REFRESH_SECRET` | Oui | Secret JWT refresh |
| `PORT` | Non | Port d’écoute (souvent imposé par la plateforme, ex. `4000`) |
| `CORS_ORIGIN` | Recommandé | Origines autorisées, séparées par des virgules (ex. `https://app.votredomaine.com`) |
| `STRIPE_*` | Si billing live | Clés Stripe selon votre configuration billing |

### Mobile (`mobile/` — EAS)

| Variable | Exemple | Description |
| -------- | ------- | ----------- |
| `EXPO_PUBLIC_API_URL` | `https://api.votredomaine.com` | URL API pour `apiFetch` |
| `EXPO_PUBLIC_WEB_URL` | `https://app.votredomaine.com` | Liens profil / quêtes vers le web |

Déclarer dans `eas.json` (profils `preview` / `production`) ou secrets EAS :

```bash
eas secret:create --name EXPO_PUBLIC_API_URL --value https://api.votredomaine.com
```

## Base de données

1. Créer une instance Postgres (Neon, Supabase, etc.).
2. Copier `DATABASE_URL` dans l’API.
3. Appliquer les migrations **avant** le premier trafic :

```bash
cd backend
pnpm exec prisma migrate deploy
```

4. **Seed production (optionnel)** — uniquement pour un environnement de démo ou staging :

```bash
pnpm exec prisma db seed
```

Ne pas exécuter le seed sur une base de production contenant déjà des comptes réels.

## Déploiement par composant

### 1. API

1. Connecter le dépôt, racine `backend/`.
2. Build : `pnpm install && pnpm build` (depuis la racine du monorepo : `pnpm --filter backend build`).
3. Start : `node dist/index.js` ou `pnpm --filter backend start`.
4. Health check : `GET /health`.
5. Lancer `prisma migrate deploy` en job de release ou commande one-off.

### 2. Web (Vercel)

1. Framework : **Next.js**, répertoire `web/`.
2. Build : `pnpm --filter web build` (installer les deps à la racine du monorepo).
3. Définir `NEXT_PUBLIC_API_URL` vers l’URL API déployée.
4. Vérifier `/dashboard`, `/quests`, `/auth` après déploiement.

### 3. Mobile (EAS)

```bash
cd mobile
eas build --platform all --profile production
```

Configurer `EXPO_PUBLIC_*` dans le profil EAS. Tester la connexion API sur appareil physique (pas `localhost`).

## Checklist go-live (production)

Contrôles minimum avant d’ouvrir le trafic réel :

| Contrôle | Variable / action | Attendu |
| -------- | ----------------- | ------- |
| Base de données | `DATABASE_URL` | Postgres managé (Neon, Supabase…), SSL activé |
| Secrets JWT | `JWT_SECRET`, `JWT_REFRESH_SECRET` | Valeurs uniques, ≥ 32 caractères, **jamais** les défauts dev |
| Schéma BDD | `pnpm --filter backend exec prisma migrate deploy` | Migrations appliquées sur l’environnement cible |
| URL API (web) | `NEXT_PUBLIC_API_URL` | URL HTTPS publique de l’API, sans slash final |
| URL API (mobile) | `EXPO_PUBLIC_API_URL` | **Même** API que le web |
| CORS | `CORS_ORIGIN` | Domaine Vercel exact (ex. `https://app.votredomaine.com`) |
| Santé API | `GET /health` | Réponse HTTP 200 |
| OAuth (si SSO live) | `*_CLIENT_ID`, secrets, `*_REDIRECT_URI` | Voir [docs/OAUTH-PRODUCTION.md](./docs/OAUTH-PRODUCTION.md) |
| Contenu | seed ou import | Parcours disponibles selon votre stratégie |
| CI / release | `bash scripts/verify-release.sh` | Tests backend, build web, E2E (ou `SKIP_E2E=1`) |

Checklist détaillée :

- [ ] `DATABASE_URL` pointe vers Postgres managé (SSL activé)
- [ ] `JWT_SECRET` et `JWT_REFRESH_SECRET` uniques et robustes (prod ≠ dev)
- [ ] `prisma migrate deploy` exécuté sur l’environnement cible
- [ ] `NEXT_PUBLIC_API_URL` et `EXPO_PUBLIC_API_URL` alignés sur la même API HTTPS
- [ ] `CORS_ORIGIN` autorise le domaine Vercel (pas de wildcard en prod)
- [ ] `/health` répond 200
- [ ] Parcours seedés ou importés selon votre stratégie contenu
- [ ] CI verte ou `scripts/verify-release.sh` exécuté localement

## Vérifications locales (pré-déploiement)

Script tout-en-un (équivalent CI partiel) :

```bash
bash scripts/verify-release.sh
# Sans E2E Playwright (plus rapide) :
SKIP_E2E=1 bash scripts/verify-release.sh
```

Ou manuellement :

```bash
pnpm --filter backend test
pnpm --filter web build
cd mobile && npx tsc --noEmit
```

## Dépannage

| Symptôme | Piste |
| -------- | ----- |
| Web en mode démo permanent | `NEXT_PUBLIC_API_URL` absent ou API injoignable |
| Mobile « API indisponible » | `EXPO_PUBLIC_API_URL` = `localhost` sur appareil physique |
| Erreurs Prisma au démarrage | Migrations non appliquées (`migrate deploy`) |
| CORS bloqué | Ajuster `CORS_ORIGIN` côté API |

Pour le développement local, voir le [README](./README.md).

## Secrets GitHub (deploy preview)

Workflow manuel : [`.github/workflows/deploy-preview.yml`](./.github/workflows/deploy-preview.yml) (`workflow_dispatch` uniquement — n’impacte pas la CI PR).

| Secret | Usage |
| ------ | ----- |
| `VERCEL_TOKEN` | Déploiement web preview (`vercel deploy`) |
| `VERCEL_ORG_ID` | ID organisation Vercel |
| `VERCEL_PROJECT_ID` | ID projet Vercel (répertoire `web/`) |
| `RAILWAY_TOKEN` | Déploiement API staging (`railway up`) |
| `DATABASE_URL` | Postgres staging (Neon/Supabase) — aussi sur Railway |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Secrets JWT API staging |
| `CORS_ORIGIN` | URL preview Vercel (`https://*.vercel.app` ou domaine fixe) |
| `WEB_URL` | URL publique web (redirects Stripe dons : `/soutenir/merci`, `/soutenir/annule`) |
| `STRIPE_SECRET_KEY` | Checkout dons live (optionnel staging) |
| `STRIPE_WEBHOOK_SECRET` | Webhook `checkout.session.completed` sur l’API staging |
| `STRIPE_DONATION_PRICE_ID_*` | Prix preset 5 € / 10 € / 20 € (optionnel) |
| `DONATION_URL` | Fallback Buy Me a Coffee / PayPal si Stripe absent |

Décommenter les étapes de déploiement dans le workflow une fois les secrets configurés dans **Settings → Secrets and variables → Actions**.

## Staging / preview (< 30 min)

Objectif : une preview web Vercel + une API staging accessible, sans configurer de comptes cloud depuis ce dépôt.

### 1. API staging (Render — recommandé)

1. Créer un **Web Service** sur [Render](https://render.com) lié au dépôt.
2. **Root Directory** : `backend`
3. **Build Command** (depuis la racine du monorepo, si Render le permet) :

   ```bash
   cd .. && pnpm install --frozen-lockfile && pnpm --filter backend build
   ```

   Sinon : service avec racine = racine du repo et commande :

   ```bash
   pnpm install --frozen-lockfile && pnpm --filter backend build
   ```

4. **Start Command** : `node dist/index.js` (dans `backend/`) ou `pnpm --filter backend start`.
5. Variables : `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN=https://<preview-vercel>.vercel.app`, `STRIPE_*` si billing live.
6. **Release command** (ou job manuel) : `pnpm --filter backend exec prisma migrate deploy`
7. Health check : `GET /health` → URL publique notée comme `https://api-staging.example.com`.

Alternative **Railway** : nouveau service depuis le dépôt, dossier `backend/`, mêmes variables, commande de release `prisma migrate deploy`.

### 2. Web preview (Vercel)

1. Importer le dépôt sur [Vercel](https://vercel.com).
2. **Root Directory** : `web` (monorepo : installer les deps à la racine — voir `web/vercel.json`).
3. Variable **Preview + Production** : `NEXT_PUBLIC_API_URL` = URL Render/Railway ci-dessus.
4. Chaque PR obtient une URL `*.vercel.app` ; vérifier `/auth`, `/pricing`, `/dashboard`.

### 3. Webhook Stripe (staging)

1. Dashboard Stripe → **Developers → Webhooks** → endpoint : `https://<api-staging>/billing/webhook`
2. Événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
3. Copier le **Signing secret** dans `STRIPE_WEBHOOK_SECRET` sur l’API staging.

### 4. Smoke après déploiement

```bash
WEB_URL=https://<preview-vercel>.vercel.app pnpm smoke:web
curl -sf https://<api-staging>/health
```

### 5. Hook migrate (optionnel)

Sur Render : **Release Command** `cd .. && pnpm --filter backend exec prisma migrate deploy`  
Sur Railway : commande post-deploy équivalente dans le service API.
