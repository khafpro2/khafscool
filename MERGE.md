# Checklist mainteneur — fusion PR #6

Checklist à valider avant de fusionner la branche `cursor/progress-dashboard-auth-v2` dans `main`.

**Pull request :** [PR #6 — Progress dashboard auth v2](https://github.com/khafpro2/khafscool/pull/6)

---

## Prérequis

- [ ] **Docker** — pour PostgreSQL local (`pnpm db:up` via `compose.yaml`)
- [ ] **Node.js 22** — aligné sur CI (voir `.nvmrc`)
- [ ] **pnpm 9.15+** — `corepack enable && corepack prepare pnpm@9.15.0 --activate`
- [ ] **Fichier `.env`** — copier depuis `.env.example` et renseigner au minimum :
  - `DATABASE_URL`
  - `JWT_SECRET` et `JWT_REFRESH_SECRET` (≥ 32 caractères)
  - `NEXT_PUBLIC_API_URL` / `API_URL` (ex. `http://localhost:4000`)
  - `WEB_URL` (ex. `http://127.0.0.1:3000`)

---

## Vérifications CI (GitHub Actions)

Workflow : `.github/workflows/ci.yml`

| Job | Contenu |
| --- | --- |
| **build-test** | install, syntaxe smoke scripts, tests backend, typecheck mobile, build backend + web |
| **integration** | Postgres service, `db:migrate` + `db:seed`, démarrage API, `pnpm smoke:api` |
| **e2e-web** | Playwright Chromium, `pnpm --filter web test:e2e` (11 scénarios) |

- [ ] Job **build-test** — vert
- [ ] Job **integration** — vert
- [ ] Job **e2e-web** — vert

---

## Tests locaux recommandés

Depuis la racine du monorepo :

```bash
pnpm install --frozen-lockfile

# Tests unitaires backend
pnpm --filter backend test

# Build web (comme CI)
NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter web build

# E2E web (Playwright)
pnpm --filter web exec playwright install --with-deps chromium
CI=true NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter web test:e2e
```

Avec stack API + Postgres démarrée (`pnpm db:up`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev:stack` ou API seule) :

```bash
pnpm smoke:api
pnpm smoke:web
```

- [ ] `pnpm --filter backend test`
- [ ] `pnpm smoke:api` (API + DB)
- [ ] `pnpm smoke:web` (web accessible)
- [ ] `pnpm --filter web build`
- [ ] `pnpm --filter web test:e2e` (11 scénarios : auth, classement, catalogue, certificat…)
- [ ] `pnpm --filter mobile typecheck`

---

## Fonctionnalités récentes (PR #6)

- [ ] **Thème sombre** — bascule clair/sombre sur web (chips, cartes, quiz, certificat) ; mobile thème système
- [ ] **PWA** — `manifest.webmanifest`, icônes et métadonnées installables (web)
- [ ] **Toasts gamification** — points, badge et quête (web + mobile, FR)
- [ ] **Bannière API** — alerte si le backend est indisponible (`ApiStatusBanner` web, équivalent mobile)
- [ ] **Filtres piste** — `/courses?track=` et `/leaderboard?track=` (chips Toutes / Apple / Jamf / Intune) ; parité mobile catalogue + classement
- [ ] **Page `/resources`** — liens officiels Apple MDM, Jamf, Microsoft Intune (BrandIcon, layout Pro)
- [ ] **Compte démo** — exploration sans inscription (`demo@ama.dev`, mode local `/demo`)

---

## Seed base de données

Première installation ou rechargement du contenu pédagogique :

```bash
pnpm db:up
pnpm db:migrate
pnpm db:seed
```

- [ ] Migrations appliquées sans erreur
- [ ] Seed exécuté — 3 parcours (Apple, Jamf, Intune), quêtes et badges présents
- [ ] Re-seed après modification du contenu : `pnpm db:seed` uniquement (pas de reset prod)

---

## Points d'attention

### Billing dormant

- Stripe est **optionnel** : sans `STRIPE_SECRET_KEY`, le checkout renvoie une URL fictive et affiche le badge « Mode démo ».
- La page `/pricing` redirige vers `/courses` — pas de paywall sur le MVP.
- Ne pas activer Stripe en prod sans configurer webhook + Price IDs (`STRIPE_PRICE_ID_*`).

### OAuth stub

- Google, Apple et Microsoft OAuth nécessitent les variables `*_CLIENT_ID`, secrets et redirect URIs dans `.env`.
- Sans credentials, les boutons SSO restent visibles côté web mais le flux OAuth échouera côté API — l’auth **email/mot de passe** reste le chemin principal en dev.

### Mode démo

- Bannière « Mode démo » et données locales (`/demo`) permettent d’explorer l’UI sans compte.
- Le mode démo ne remplace pas un smoke test avec API + seed pour valider la progression réelle.

---

## Validation fonctionnelle rapide

- [ ] `/` — accueil et CTA « Commencer gratuitement »
- [ ] `/about` — page mission et piliers
- [ ] `/courses` — catalogue des 3 parcours + filtre piste (`?track=APPLE|JAMF|INTUNE`) et recherche
- [ ] `/leaderboard` — classement + filtre piste (`?track=`)
- [ ] `/resources` — liens officiels Apple, Jamf, Intune (pas de ServiceNow)
- [ ] `/auth` — inscription / connexion email
- [ ] `/dashboard` — progression après connexion ou démo
- [ ] `/diagnostics` — santé API et tokens (outil mainteneur)
- [ ] `/courses/apple-cert-prep/complete` — partage et lien certificat
- [ ] `/courses/apple-cert-prep/certificate` — certificat imprimable (mode démo OK)
- [ ] Mobile : écran victoire → certificat web + partage natif (`EXPO_PUBLIC_WEB_URL` pointant vers le web local)
- [ ] Mobile : filtres piste sur catalogue parcours et écran classement

---

## Fusion

- [ ] Tous les jobs CI verts sur la PR #6
- [ ] Revue code effectuée
- [ ] Squash ou merge selon la politique du repo
- [ ] Tag / release notes si applicable (`CHANGELOG.md`)
