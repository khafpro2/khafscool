# Guide de déploiement — Apple MDM Academy

Ce document décrit une architecture de production recommandée pour le monorepo (`web`, `backend`, `mobile`).

## Architecture recommandée

| Composant | Hébergement conseillé | Rôle |
| --------- | --------------------- | ---- |
| **Web** (Next.js) | [Vercel](https://vercel.com) | Interface Trailblazer, auth côté client, appels API |
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
| `JWT_ACCESS_SECRET` | Oui | Secret JWT accès (long, aléatoire) |
| `JWT_REFRESH_SECRET` | Oui | Secret JWT refresh |
| `PORT` | Non | Port d’écoute (souvent imposé par la plateforme, ex. `4000`) |
| `CORS_ORIGIN` | Recommandé | Origines autorisées (ex. `https://app.votredomaine.com`) |
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

## Checklist avant mise en production

- [ ] `DATABASE_URL` pointe vers Postgres managé (SSL activé)
- [ ] `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` uniques et robustes
- [ ] `prisma migrate deploy` exécuté sur l’environnement cible
- [ ] `NEXT_PUBLIC_API_URL` et `EXPO_PUBLIC_API_URL` alignés sur la même API
- [ ] CORS API autorise le domaine Vercel
- [ ] `/health` répond 200
- [ ] Parcours seedés ou importés selon votre stratégie contenu
- [ ] CI verte (`backend` tests, `web` build, `mobile` `tsc`)

## Vérifications locales (pré-déploiement)

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
