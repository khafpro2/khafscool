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
- **Contact HarmyTech** — support et RGPD : [KTHIAM@HARMYTECH.COM](mailto:KTHIAM@HARMYTECH.COM) (`CONTACT_EMAIL` / `NEXT_PUBLIC_CONTACT_EMAIL` web, `EXPO_PUBLIC_CONTACT_EMAIL` mobile)

---

## Vérifications CI (GitHub Actions)

Workflow : `.github/workflows/ci.yml`

| Job | Contenu |
| --- | --- |
| **build-test** | install, syntaxe smoke scripts, tests backend, typecheck mobile, build backend + web |
| **integration** | Postgres service, `db:migrate` + `db:seed`, démarrage API, `pnpm smoke:api` |
| **e2e-web** | Playwright Chromium, `pnpm --filter web test:e2e` (13 scénarios) |

- [ ] Job **build-test** — vert
- [ ] Job **integration** — vert
- [ ] Job **e2e-web** — vert

---

## v0.2.0 — Enrichissement (PR #6, branche `cursor/progress-dashboard-auth-v2`)

- [x] Version monorepo `@ama/shared`, backend, web, mobile : **0.2.0**
- [x] [CHANGELOG.md](./CHANGELOG.md) — section `[0.2.0]` à jour
- [x] **4 modules × 10 questions** par piste (120 QCM + 6 renfort exam-style)
- [x] **Glossaire MDM** — `/resources/glossaire` (web + mobile)
- [x] **Fiche révision** — `/courses/[slug]/revision` + partage Web Share API (web)
- [x] **Examen blanc** — `/courses/[slug]/examen` + API `GET /courses/:slug/practice-exam`
- [x] **Certificat** — partage Web Share API (web) + impression PDF
- [x] **Dashboard** — bannière / toast « Plus qu'une unité pour le badge ! » à 3/4 modules
- [x] **Catalogue** — `TrailCard` : `~XX min · 4 modules · 40 questions` (somme reading-time)
- [ ] Job **build-test** — vert
- [ ] Job **integration** — vert
- [ ] Job **e2e-web** — vert

---

## Release 0.1.0 — checklist pre-merge

- [ ] Version monorepo `@ama/shared`, backend, web, mobile : **0.1.0**
- [ ] [CHANGELOG.md](./CHANGELOG.md) — section `[0.1.0]` à jour
- [ ] Compte démo seed (`demo@mdmacademy.local` / `DemoTest2026!`) et mode local `/demo` testés
- [ ] Variables prod documentées dans [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] Export / suppression compte testés (`GET /users/me/export`, `DELETE /users/me`)
- [ ] `bash scripts/verify-release.sh` — ou `SKIP_E2E=1 bash scripts/verify-release.sh` (sans Playwright)
- [ ] `pnpm --filter web test:e2e` — 13 scénarios verts
- [ ] `pnpm smoke:api` + `pnpm smoke:web` avec stack locale

---

## Tests locaux recommandés

Depuis la racine du monorepo :

```bash
pnpm install --frozen-lockfile

# Vérification release (generate + tests + build + E2E optionnel)
bash scripts/verify-release.sh
# SKIP_E2E=1 bash scripts/verify-release.sh

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
- [ ] `pnpm --filter web test:e2e` (13 scénarios : auth, profil export RGPD, classement, catalogue, certificat, démo…)
- [ ] `pnpm --filter mobile typecheck`

---

## Fonctionnalités récentes (PR #6)

- [ ] **Thème sombre** — bascule clair/sombre sur web (chips, cartes, quiz, certificat) ; mobile thème système
- [ ] **PWA** — `manifest.webmanifest`, icônes et métadonnées installables (web)
- [ ] **Toasts gamification** — points, badge et quête (web + mobile, FR)
- [ ] **Bannière API** — alerte si le backend est indisponible (`ApiStatusBanner` web, équivalent mobile)
- [ ] **Filtres piste** — `/courses?track=` et `/leaderboard?track=` (chips Toutes / Apple / Jamf / Intune) ; parité mobile catalogue + classement
- [ ] **Page `/resources`** — liens officiels Apple MDM, Jamf, Microsoft Intune (BrandIcon, layout Pro)
- [ ] **Compte démo** — exploration sans inscription (`demo@mdmacademy.local`, mode local `/demo`)
- [ ] **Pages légales FR** — `/legal/confidentialite`, `/legal/conditions` (métadonnées SEO, liens footer)
- [ ] **Bannière cookies** — consentement localStorage, lien confidentialité, pas de traceur tiers
- [ ] **Header points + rang** — indicateur discret (cache session 5 min, liens profil/classement)
- [ ] **Profil certificats** — parcours 100 % → lien `/courses/[slug]/certificate` (web + mobile)
- [ ] **Guide démo `/demo`** — parcours guidé 6 étapes, bandeau `demo@mdmacademy.local`, BrandIcon, dark mode
- [ ] **Open Graph parcours** — image dynamique titre + piste sur `/courses/[slug]`
- [ ] **Mobile profil stats** — carte récap points, rang, streak et #classement
- [ ] **RGPD compte** — export JSON + suppression compte (web profil + mobile API)
- [ ] **DemoModeBanner** — distinction « Mode démo local » / « Connecté à l’API »
- [ ] **Récap quiz mobile** — score X/Y + points estimés avant validation d’unité
- [ ] **Dons volontaires** — `/soutenir` : carte bancaire (Stripe Checkout), PayPal (`paypal.me/khafpro`) et virement Revolut (IBAN Khalifa Thiam) ; footer `#paypal` + mobile (formation toujours gratuite)
- [x] **Fiche révision web** — partage Web Share API + impression PDF
- [x] **Examen blanc** — web `/examen`, mobile lien natif, API practice-exam
- [x] **Catalogue durée** — `TrailCard` reading-time cumulé + 40 questions
- [x] **Dashboard 3/4** — bannière + toast « Plus qu'une unité pour le badge ! »
- [x] **Partage certificat web** — Web Share API avec texte FR

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
- Guide production : [docs/OAUTH-PRODUCTION.md](./docs/OAUTH-PRODUCTION.md) (redirect URIs, dev vs prod).
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
- [ ] `/demo` — guide 6 étapes, bandeau compte démo, liens parcours/quiz/quêtes/classement/certificat
- [ ] `/auth` — inscription / connexion email
- [ ] `/dashboard` — progression après connexion ou démo
- [ ] `/diagnostics` — santé API et tokens (outil mainteneur)
- [ ] `/courses/apple-cert-prep/complete` — partage et lien certificat
- [ ] `/courses/apple-cert-prep/certificate` — certificat imprimable (mode démo OK)
- [ ] `/courses/apple-cert-prep/revision` — fiche révision + bouton Partager (Web Share / copie)
- [ ] `/courses/apple-cert-prep/examen` — examen blanc 10 questions (mode démo OK)
- [ ] `/dashboard` (connecté, 3/4 modules) — bannière « Plus qu'une unité pour le badge ! »
- [ ] `/courses` — cartes `~XX min · 4 modules · 40 questions`
- [ ] `/profile` — section certificats (parcours terminés → certificat, empty state FR)
- [ ] `/profile` — export JSON + suppression compte (modal confirmation SUPPRIMER)
- [ ] Bannière cookies — affichée une fois, masquée après « J'ai compris », lien `/legal/confidentialite`
- [ ] Mobile : écran victoire → certificat web + partage natif (`EXPO_PUBLIC_WEB_URL` pointant vers le web local)
- [ ] Mobile : profil → carte récap points/rang/streak + certificats (`WEB_URL/courses/[slug]/certificate`)
- [ ] Mobile : filtres piste sur catalogue parcours et écran classement

---

## Fusion

- [ ] Tous les jobs CI verts sur la PR #6
- [ ] Revue code effectuée
- [ ] Squash ou merge selon la politique du repo
- [ ] Tag / release notes si applicable (`CHANGELOG.md`)
