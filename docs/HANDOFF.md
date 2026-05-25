# Handoff — Apple MDM Academy (PR #6)

Document de reprise pour **Claude Code** ou tout agent après un `git push`. Cursor peut reprendre en citant ce fichier et la branche active.

## Contexte

| Élément | Valeur |
| --- | --- |
| Dépôt | `apple-mdm-academy` (monorepo pnpm) |
| Branche de travail | `cursor/progress-dashboard-auth-v2` |
| Pull request | [#6](https://github.com/khafpro2/khafscool/pull/6) — **ne pas merger** sans checklist [MERGE.md](../MERGE.md) |
| Version cible | `0.2.1` |

## Règles produit (à ne pas casser)

1. **Langue** — UI, quiz, leçons, toasts et messages d’erreur en **français**.
2. **Accueil** — `/` sans `.site-header`, sans `.site-footer` ni `contentinfo`, ni lien « Retour à l'accueil MDM Academy » (smoke `learning-path.spec.ts`).
3. **Contact** — pas d’email HarmyTech visible en clair ; boutons « Assistance » / « Nous contacter » en `mailto:` uniquement (`NEXT_PUBLIC_CONTACT_EMAIL` optionnel).
4. **Compte démo** — `demo@mdmacademy.local` / `DemoTest2026!` (`@ama/shared/constants` → `DEMO_ACCOUNT`), affiché sur `/demo` et seed API.
5. **Vidéos pilotes** — MP4 HeyGen FR quand prêt ; sinon placeholder ou YouTube **whitelist** via `videoSourceLanguage: 'fr'` (`canEmbedExternalVideo`).
6. **Module 1 Apple** (`device-support-basics`) — **pas** de section vidéo ADE / ABM.
7. **Module 1 Jamf** (`smart-groups-policies`) — intro YouTube `t3j9TkFfUJw`, titre **`Vidéo : introduction Jamf Pro`** (jamais « Smart Groups et politiques Jamf Pro » comme titre vidéo).
8. **Module 1 Intune** (`ade-enrollment-basics`) — MP4 FR `intune-ade-enrollment-basics-fr.mp4`.

## Workflow git → Cursor

```bash
git checkout cursor/progress-dashboard-auth-v2
git pull origin cursor/progress-dashboard-auth-v2
pnpm install --frozen-lockfile
pnpm db:up && pnpm db:migrate && pnpm db:seed   # si schéma/contenu modifié
pnpm dev:stack   # API :4000 + web :3000
```

Vérification rapide avant push :

```bash
pnpm --filter backend test
pnpm --filter web build
CI=true NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter web test:e2e
gh pr checks 6
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
- Ne **pas** committer `web/.env.local` ni secrets Stripe/PayPal.

## Reprise Cursor

Après push, ouvrir le dépôt sur la branche ci-dessus et demander par exemple :

> Reprends depuis `docs/HANDOFF.md` : vérifier `gh pr checks 6` et corriger ce qui est rouge.

SHA de référence : indiquer `git rev-parse HEAD` dans le message de handoff.
