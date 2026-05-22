# Roadmap — MDM Academy Pro

Feuille de route produit et technique pour le monorepo Apple MDM Academy.

## v0.1.0 — MVP local (livré)

- Catalogue 3 parcours (Apple, Jamf, Intune) avec quiz et mini-scénarios
- Auth email + OAuth dev, dashboard gamifié, badges, quêtes, classement, sprint certification
- Web Next.js + mobile Expo, thème sombre, PWA, pages légales FR
- Certificat imprimable, export/suppression RGPD, guide `/demo`
- Dons volontaires (`/soutenir`), contact HarmyTech, compte démo unifié (`demo@mdmacademy.local`)
- CI : build-test, integration, e2e-web — voir [MERGE.md](./MERGE.md) et [PR #6](https://github.com/khafpro2/khafscool/pull/6)

## v0.2 — Enrichissement

- **OAuth production** — credentials Apple / Google / Microsoft, redirect URIs prod ([guide](./docs/OAUTH-PRODUCTION.md))
- **Certificats PDF** — export personnalisé, métadonnées SEO, partage amélioré
- **Contenus** — modules Intune avancés, parcours Apple supplémentaires, scénarios interactifs
- **Analytics (optionnel)** — mesure d’usage avec consentement cookies respecté

## v1.0 — Production

- **Déploiement prod** — web Vercel + API Railway/Render/Fly + Postgres managé ([DEPLOYMENT.md](./DEPLOYMENT.md))
- **Stripe live** — webhooks dons et billing si activé
- **Mobile stores** — builds EAS production, deep links SSO stables
- **Observabilité** — health checks, logs structurés, sauvegardes BDD

## Comment contribuer

1. Choisir une tâche ouverte sur la branche `main` ou une PR en cours
2. Lire [README.md](./README.md) pour le setup local (`pnpm setup`, `pnpm dev:stack`)
3. Valider avec `SKIP_E2E=1 bash scripts/verify-release.sh` avant ouverture de PR
