# Checklist mainteneur — fusion PR #6

Checklist à valider avant de fusionner la branche `cursor/progress-dashboard-auth-v2` dans `main`.

**Pull request :** [PR #6 — Progress dashboard auth v2](https://github.com/khafpro2/khafscool/pull/6)

**Version cible :** `0.2.1` (monorepo `@ama/shared`, backend, web, mobile)

**HEAD de référence :** vérifier avec `git rev-parse --short HEAD` sur la branche avant merge.

---

## Prérequis locaux

- [ ] **Docker** — PostgreSQL local (`pnpm db:up` via `compose.yaml`, port **5433**)
- [ ] **Node.js 22** — aligné CI (`.nvmrc`)
- [ ] **pnpm 9.15+** — `corepack enable && corepack prepare pnpm@9.15.0 --activate`
- [ ] **Fichier `.env`** — copier depuis `.env.example` :
  - `DATABASE_URL`
  - `JWT_SECRET` / `JWT_REFRESH_SECRET` (≥ 32 caractères)
  - `NEXT_PUBLIC_API_URL` / `API_URL` (ex. `http://localhost:4000`)
  - `WEB_URL` (ex. `http://127.0.0.1:3000`)
- **Contact HarmyTech** — bouton « Nous contacter » / « Assistance » sur le site (`CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `EXPO_PUBLIC_CONTACT_EMAIL` — mailto uniquement, non affiché)

---

## Vérification release (commande unique)

```bash
bash scripts/verify-release.sh
# Sans Playwright (plus rapide) :
SKIP_E2E=1 bash scripts/verify-release.sh
```

Le script enchaîne : `pnpm install --frozen-lockfile` → `pnpm db:generate` → tests backend → build web → E2E Playwright (sauf `SKIP_E2E=1`).

- [ ] `bash scripts/verify-release.sh` vert (ou `SKIP_E2E=1` si E2E déjà validés séparément)

---

## CI GitHub Actions

Workflow : `.github/workflows/ci.yml`

| Job | Contenu |
| --- | --- |
| **build-test** | install, smoke scripts, tests backend, typecheck mobile, build backend + web |
| **integration** | Postgres service, `db:migrate` + `db:seed`, API, `pnpm smoke:api` |
| **e2e-web** | Playwright Chromium, `pnpm --filter web test:e2e` |

- [ ] Job **build-test** — vert
- [ ] Job **integration** — vert
- [ ] Job **e2e-web** — vert

Vérifier sur la PR : `gh pr checks 6`

---

## v0.2.1 — Contenu et fonctionnalités

### Contenu pédagogique (symétrique 4 modules)

- [x] **4 modules × 10 questions quiz** par piste (Apple, Jamf, Intune) — affichage catalogue « 40 questions »
- [x] **+4 Q bonus exam-only** module 4 par piste (2 existantes + 2 nouvelles) — **132 QCM** seed total
- [x] Pool examen blanc : **44 questions** par parcours (40 parcours + 4 bonus)
- [x] Leçons markdown FR ≥ 800 mots / module
- [x] Glossaire **34+ termes** FR — `/resources/glossaire` (web) + `/glossary` (mobile)

### Navigation et glossaire

- [x] **Header web** — recherche glossaire compacte + autocomplete (5 termes max) + lien « Glossaire »
- [x] **Mobile** — lien « Glossaire » en-tête écran Parcours
- [x] Fiche révision + examen blanc + certificat (web + mobile)

### Dons volontaires (3 modes)

- [ ] **`/soutenir`** testé — formation toujours gratuite
- [ ] **Carte bancaire** — Stripe Checkout (`/soutenir#carte`) ; badge Supporter si webhook actif
- [ ] **PayPal** — `paypal.me/khafpro` (`/soutenir#paypal`)
- [ ] **Virement SEPA** — IBAN Revolut HarmyTech (`/soutenir#virement`, variables `DONATION_BANK_*`)
- [ ] Mobile `/donate` — parité montants 5 € / 10 € / 20 € / Autre + 3 modes

### Compte démo

- [ ] Seed : **`demo@mdmacademy.local`** / **`DemoTest2026!`**
- [ ] Mode local **`/demo`** — guide 6 étapes, bannière démo, progression UI sans API
- [ ] Smoke avec API + compte démo : progression réelle enregistrée

### Conformité et UX

- [ ] Export / suppression compte (`GET /users/me/export`, `DELETE /users/me`, confirmation `SUPPRIMER`)
- [ ] Pages légales FR — `/legal/confidentialite`, `/legal/conditions`
- [ ] Bannière cookies + consentement localStorage
- [ ] Thème sombre web ; PWA `manifest.webmanifest`
- [ ] Filtres piste — `/courses?track=` et `/leaderboard?track=`
- [ ] Dashboard bannière **3/4 modules** — « Plus qu'une unité pour le badge ! »

---

## Tests locaux recommandés

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:up && pnpm db:migrate && pnpm db:seed

pnpm --filter backend test
pnpm --filter mobile typecheck

NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter web build

pnpm --filter web exec playwright install --with-deps chromium
CI=true NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter web test:e2e
```

Avec stack API (`pnpm dev:stack` ou API + Postgres) :

```bash
pnpm smoke:api
pnpm smoke:web
```

- [ ] `pnpm --filter backend test`
- [ ] `pnpm smoke:api`
- [ ] `pnpm smoke:web`
- [ ] `pnpm --filter web build`
- [ ] `pnpm --filter web test:e2e`
- [ ] `pnpm --filter mobile typecheck`

---

## Seed base de données

```bash
pnpm db:up
pnpm db:migrate
pnpm db:seed
```

- [ ] Migrations appliquées (dont `Question.examOnly`)
- [ ] Seed — 3 parcours, quêtes, badges, compte démo
- [ ] Re-seed contenu : `pnpm db:seed` uniquement (pas de reset prod)

---

## Validation fonctionnelle rapide

- [ ] `/` — accueil, CTA « Commencer gratuitement », carte soutien 3 modes
- [ ] `/courses` — catalogue, filtres piste, `~XX min · 4 modules · 40 questions`
- [ ] Header — recherche glossaire (ex. « SCEP ») → 5 résultats max
- [ ] `/resources/glossaire` — glossaire complet + ancres termes
- [ ] `/soutenir` — grille montants + carte / PayPal / virement
- [ ] `/demo` — guide démo, compte `demo@mdmacademy.local`
- [ ] `/auth` — inscription / connexion email
- [ ] `/dashboard` — progression, toast 3/4 modules
- [ ] `/courses/apple-cert-prep/revision` — fiche + partage
- [ ] `/courses/apple-cert-prep/examen` — examen blanc 10 Q (pool 44)
- [ ] `/courses/apple-cert-prep/certificate` — certificat imprimable
- [ ] `/profile` — export JSON + suppression compte
- [ ] Mobile Parcours — lien Glossaire → écran natif
- [ ] Mobile `/donate` — 3 modes dons

---

## Points d'attention

### Billing dormant

- Sans `STRIPE_SECRET_KEY`, checkout renvoie URL fictive + badge « Mode démo »
- `/pricing` → redirect `/courses` — pas de paywall MVP
- Prod Stripe : webhook + `STRIPE_PRICE_ID_*` obligatoires

### OAuth stub

- Google / Apple / Microsoft : variables `*_CLIENT_ID`, secrets, redirect URIs
- Guide : [docs/OAUTH-PRODUCTION.md](./docs/OAUTH-PRODUCTION.md)
- Auth **email/mot de passe** = chemin principal en dev

### Mode démo vs API

- `/demo` et bannière démo ≠ validation progression réelle
- Toujours valider avec `pnpm db:seed` + compte démo ou inscription

---

## Fusion

- [ ] Tous les jobs CI verts sur PR #6
- [ ] [CHANGELOG.md](./CHANGELOG.md) section `[0.2.1]` à jour
- [ ] Revue code effectuée
- [ ] Squash ou merge selon politique repo
- [ ] **Ne pas merger sans demande explicite du mainteneur**

---

## Documentation associée

- [CHANGELOG.md](./CHANGELOG.md) — notes `0.2.1`
- [DEPLOYMENT.md](./DEPLOYMENT.md) — variables prod
- [docs/OAUTH-PRODUCTION.md](./docs/OAUTH-PRODUCTION.md) — OAuth prod
