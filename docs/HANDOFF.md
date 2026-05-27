# Handoff — Apple MDM Academy (`main`)

Document de reprise pour **Claude Code** ou tout agent après un `git push`. Cursor peut reprendre en citant ce fichier et la branche active.

## Contexte

| Élément | Valeur |
| --- | --- |
| Dépôt | `apple-mdm-academy` (monorepo pnpm) |
| Branche active | **`main`** |
| Pull request | [#6](https://github.com/khafpro2/khafscool/pull/6) — **fusionnée** (2026-05-27) |
| Version cible | `0.3.13` |
| SHA de référence | `1eb2448` (vérifier avec `git rev-parse --short HEAD`) |

## Stack production (2026-05-27)

| Composant | Plateforme | URL / doc |
| --- | --- | --- |
| Web Next.js | **Vercel** | `https://apple-mdm-academy.vercel.app` — [VERCEL-WEB.md](./VERCEL-WEB.md) |
| API Fastify | **Railway** | `https://apple-mdm-academy-api-production.up.railway.app` — [DEPLOY-RAILWAY.md](./DEPLOY-RAILWAY.md) |
| Postgres | **Neon** | `DATABASE_URL` sur Railway — [NEON-DATABASE.md](./NEON-DATABASE.md) |

### État actuel (checks curl)

```bash
curl -sf https://apple-mdm-academy-api-production.up.railway.app/health
curl -sf https://apple-mdm-academy-api-production.up.railway.app/health/db
API_URL=https://apple-mdm-academy-api-production.up.railway.app bash scripts/deploy-api.sh
```

- **`/health`** — OK (`ok: true`, version `0.3.13`)
- **`/health/db`** — OK (Neon joignable, migrations appliquées)
- **Vercel `/diagnostics`** — `NEXT_PUBLIC_API_URL` pointe vers Railway (redeploy prod effectué)

Render (`render.yaml`) reste **legacy / secours** — ne plus utiliser comme cible principale.

## Bloqueurs / actions manuelles restantes

| Priorité | Action | Où |
| --- | --- | --- |
| Moyenne | Définir `NEXT_PUBLIC_API_URL` + `WEB_URL` pour **Preview** Vercel (toutes branches) | Dashboard Vercel → Environment Variables |
| Basse | Vérifier connexion `/auth` avec compte démo en prod | `demo@mdmacademy.local` / `DemoTest2026!` |
| Basse | OAuth prod (Google / Apple / Microsoft) si souhaité | [OAUTH-PRODUCTION.md](./OAUTH-PRODUCTION.md) |
| Basse | Stripe live pour `/soutenir` carte bancaire | Variables `STRIPE_*` sur Railway |

L’API **est en ligne** sur Railway ; le principal blocage historique (`NEXT_PUBLIC_API_URL` vide sur Vercel prod) est **corrigé**.

## État projet (fonctionnel)

- **CI** — workflow `.github/workflows/ci.yml` sur `main` (build-test, integration, e2e-web).
- **Accueil web** — `/` plein écran : pas de header/footer global, pas de bannières API/démo/cookies/analytics ; liens **Parcours** (`/courses`), **Connexion** (`/auth`) et **Préférences** (modale cookies).
- **Vidéos pilotes** — 11 modules (`PILOT_VIDEO_MODULES`) ; repli YouTube FR (`sourceYouTubeUrl`) avant placeholder ; MP4 HeyGen sur 4 modules ; module 4 par piste et App Protection Intune en YouTube whitelist ; Apple module 1 sans vidéo ADE ; Jamf module 1 YouTube `t3j9TkFfUJw`.
- **Mobile** — `WelcomeScreen` : liens **Parcours** / **Connexion** (web), **Préférences cookies** ; safe area sur accueil et dashboard.

## Règles produit (à ne pas casser)

1. **Langue** — UI, quiz, leçons, toasts et messages d’erreur en **français**.
2. **Accueil** — `/` sans `.site-header`, sans `.site-footer` ni `contentinfo`, sans bannières globales ; liens **Parcours**, **Connexion**, **Préférences** (smoke `learning-path.spec.ts`).
3. **Contact** — pas d’email HarmyTech visible en clair ; boutons « Assistance » / « Nous contacter » en `mailto:` uniquement (`NEXT_PUBLIC_CONTACT_EMAIL` optionnel).
4. **Compte démo** — `demo@mdmacademy.local` / `DemoTest2026!` (`@ama/shared/constants` → `DEMO_ACCOUNT`), affiché sur `/demo` et seed API.
5. **Vidéos pilotes** — MP4 HeyGen FR quand prêt ; sinon doublage MP4, puis YouTube **whitelist** (`sourceYouTubeUrl`, `videoSourceLanguage: 'fr'`), sinon placeholder (`canEmbedExternalVideo`).
6. **Module 1 Apple** (`device-support-basics`) — **pas** de section vidéo ADE / ABM.
7. **Module 2 Apple** (`ios-troubleshooting`) — YouTube FR `lgMDK4zU114`, titre **`Vidéo : dépannage iOS en environnement géré`**.
8. **Module 1 Jamf** (`smart-groups-policies`) — intro YouTube `t3j9TkFfUJw`, titre **`Vidéo : introduction Jamf Pro`**.
9. **Module 1 Intune** (`ade-enrollment-basics`) — MP4 FR `intune-ade-enrollment-basics-fr.mp4`.
10. **Module 3 pilote** — `acmt-exam-prep` MP4 FR ; `app-protection-conditional-access` YouTube `F4PESZiEQhU`.
11. **Module 4 pilote** — `apps-vpp-management` et `vpp-abm-business-apps` YouTube `k0cchC6mE88` ; `api-automation-advanced-policies` YouTube `t3j9TkFfUJw`.

## Workflow git → Cursor

```bash
git checkout main
git pull origin main
pnpm install --frozen-lockfile
pnpm db:up && pnpm db:migrate && pnpm db:seed   # si schéma/contenu modifié
pnpm dev:stack   # API :4000 + web :3000
```

Vérification rapide avant push :

```bash
pnpm --filter backend test
pnpm --filter web build
CI=true NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter web test:e2e
```

Smoke prod API :

```bash
API_URL=https://apple-mdm-academy-api-production.up.railway.app bash scripts/deploy-api.sh
bash scripts/railway-env-checklist.sh
```

## CI (priorité)

| Job | Commande locale équivalente |
| --- | --- |
| build-test | `pnpm --filter backend test`, builds web/backend |
| integration | Postgres + `pnpm smoke:api` |
| e2e-web | `pnpm --filter web test:e2e` |

Échec récent typique : `module-video.spec.ts` — titre module vs titre leçon (`exact: true` sur le h2 module).

## Fichiers sensibles

- Contenu pédagogique : `shared/src/course-content.ts`, `shared/src/quiz-content.ts`
- Vidéos : `shared/src/video-local.ts`, `shared/src/video-heygen-fr.ts`, `web/public/media/videos/`
- E2E web : `web/e2e/*.spec.ts`
- Déploiement : `railway.toml`, `docs/DEPLOY-RAILWAY.md`, `docs/NEON-DATABASE.md`
- Ne **pas** committer `web/.env.local`, `.vercel/.env.*.local`, ni secrets Stripe/PayPal.

## Reprise Cursor

Après push, ouvrir le dépôt sur **`main`** et demander par exemple :

> Reprends depuis `docs/HANDOFF.md` : vérifier smoke prod (`scripts/deploy-api.sh`) et corriger ce qui est rouge en CI.

SHA de référence : indiquer `git rev-parse HEAD` dans le message de handoff.
