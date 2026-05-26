# Roadmap — MDM Academy Pro

Feuille de route produit et technique pour le monorepo Apple MDM Academy.

## v0.1.0 — MVP local (livré)

- Catalogue 3 parcours (Apple, Jamf, Intune) avec quiz et mini-scénarios
- Auth email + OAuth dev, dashboard gamifié, badges, quêtes, classement, sprint certification
- Web Next.js + mobile Expo, thème sombre, PWA, pages légales FR
- Certificat imprimable, export/suppression RGPD, guide `/demo`
- Dons volontaires (`/soutenir`), contact HarmyTech, compte démo unifié (`demo@mdmacademy.local`)
- CI : build-test, integration, e2e-web — voir [MERGE.md](./MERGE.md) et [PR #6](https://github.com/khafpro2/khafscool/pull/6)

## v0.2.0 — Enrichissement (livré — PR #6)

- [x] **Contenus enrichis** — 4 modules/piste, leçons markdown FR, objectifs et points clés, glossaire 34 termes
- [x] **Fiche révision** — `/courses/[slug]/revision` web + mobile, impression PDF, partage Web Share (web)
- [x] **Examen blanc** — 10 questions aléatoires/piste, API `practice-exam`, web + mobile
- [x] **Dashboard pistes** — X/4 modules + barre % ; bannière 3/4 « Plus qu'une unité pour le badge ! »
- [x] **Catalogue** — durée lecture cumulée `~XX min · 4 modules · 40 questions`
- [x] **Certificat** — impression PDF + partage Web Share (web)
- [x] **Quiz renforcés** — +2 questions exam-style par parcours (126 QCM seed)
- [x] **Durée de lecture** — `@ama/shared/reading-time` sur modules et hero parcours
- [x] **Dons multi-modes** — montants 5/10/20 €, choix carte/PayPal/virement (web `/soutenir`, mobile `/donate`), redirect `/donate`, micro-CTA parcours
- [ ] **OAuth production** — credentials Apple / Google / Microsoft ([guide](./docs/OAUTH-PRODUCTION.md))
- [ ] **Analytics (optionnel)** — mesure d’usage avec consentement cookies respecté

## v0.3.0 — Vidéos explicatives (livré — PR #6)

- [x] **Modèle contenu** — champs `videoUrl`, `videoTitle`, `videoDurationMinutes`, `videoProvider` dans `@ama/shared/course-content` + helper `parseVideoEmbed`
- [x] **Pilote 6 vidéos** — modules 1 et 2 de chaque parcours (YouTube éducatif ou animation SVG légère)
- [x] **Web** — `ModuleVideoSection` (16:9, lazy iframe, dark mode, aria-label, pas d’autoplay)
- [x] **Mobile** — lecteur YouTube inline (`WebView`) quand `videoUrl` présent
- [x] **Prisma + seed** — colonnes nullable `Module.videoUrl`, `videoTitle`, `videoDurationMinutes`
- [x] **Catalogue / sidebar** — badge « 2 vidéos » par parcours pilote
- [x] **Certificat** — mention « Formation multimédia »
- [ ] **OAuth production** — credentials Apple / Google / Microsoft ([guide](./docs/OAUTH-PRODUCTION.md))
- [ ] **Analytics (optionnel)** — mesure d’usage avec consentement cookies respecté

## v1.0 — Production

- **Déploiement prod** — web Vercel + API Railway/Render/Fly + Postgres managé ([DEPLOYMENT.md](./DEPLOYMENT.md))
- **Stripe live** — webhooks dons et billing si activé
- **Mobile stores** — builds EAS production, deep links SSO stables
- **Observabilité** — health checks, logs structurés, sauvegardes BDD

## Comment contribuer

1. Choisir une tâche ouverte sur la branche `main` ou une PR en cours
2. Lire [README.md](./README.md) pour le setup local (`pnpm setup`, `pnpm dev:stack`)
3. Valider avec `SKIP_E2E=1 bash scripts/verify-release.sh` avant ouverture de PR
