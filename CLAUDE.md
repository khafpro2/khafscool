# Instructions Claude Code — Apple MDM Academy

## Langue et ton

- Répondre et rédiger commits/PR en **français**.
- Messages utilisateur, quiz, leçons et erreurs auth : **français** uniquement.

## Branche et déploiement

- Branche active : **`main`** (PR [#6](https://github.com/khafpro2/khafscool/pull/6) **fusionnée** le 2026-05-27).
- Stack production :
  - **Web** — Vercel : `https://apple-mdm-academy.vercel.app`
  - **API** — Railway : `https://apple-mdm-academy-api-production.up.railway.app`
  - **Base** — Neon Postgres (`DATABASE_URL` sur Railway, voir [docs/NEON-DATABASE.md](./docs/NEON-DATABASE.md))
- Guides déploiement : [docs/DEPLOY-RAILWAY.md](./docs/DEPLOY-RAILWAY.md), [docs/VERCEL-WEB.md](./docs/VERCEL-WEB.md), handoff [docs/HANDOFF.md](./docs/HANDOFF.md)
- Commits logiques ; ne pas committer `.env`, `.env.local`, clés API

## Compte démo

```text
Email    : demo@mdmacademy.local
Mot de passe : DemoTest2026!
```

Constante : `DEMO_ACCOUNT` dans `shared/src/constants.ts`. Page `/demo` et seed `pnpm db:seed`.

## Confidentialité contact

- **Ne jamais** afficher d’email support en clair dans l’UI (ex. pas de `KTHIAM@HARMYTECH.COM` visible).
- Liens `mailto:` via libellés « Assistance » / « Nous contacter » ; variables d’env optionnelles.

## Vidéos (cohérence contenu)

| Parcours | Module 1 slug | Vidéo attendue |
| --- | --- | --- |
| Apple | `device-support-basics` | Aucune vidéo (pas ADE/ABM en tête de module) |
| Jamf | `smart-groups-policies` | YouTube `t3j9TkFfUJw`, titre **Vidéo : introduction Jamf Pro** ; pas de titre « Smart Groups… » sur la section vidéo |
| Intune | `ade-enrollment-basics` | MP4 FR HeyGen / local |

YouTube anglais autorisé en embed si `videoSourceLanguage: 'fr'` (whitelist `canEmbedExternalVideo`).

Liste pilote : `PILOT_VIDEO_MODULES` dans `shared/src/course-content.ts` (11 entrées).

## Tests à lancer

```bash
pnpm --filter backend test
pnpm --filter web build
CI=true NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter web test:e2e
```

Smoke prod (API Railway + Neon) :

```bash
API_URL=https://apple-mdm-academy-api-production.up.railway.app bash scripts/deploy-api.sh
```

E2E clés : `web/e2e/learning-path.spec.ts` (accueil sans header ni footer), `module-video.spec.ts`, `soutenir.spec.ts`.

## Handoff détaillé

Voir [docs/HANDOFF.md](./docs/HANDOFF.md) pour le workflow `git push` → reprise Cursor / agent.

## Stack (rappel)

- `backend/` Fastify + Prisma + Postgres (Neon en prod)
- `web/` Next.js 15 (port 3000, Vercel en prod)
- `shared/` contenu et constantes partagées
- `mobile/` Expo (hors scope CI web sauf typecheck)
