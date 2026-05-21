# Changelog

## Unreleased — `cursor/progress-dashboard-auth-v2`

- Web : mini-scénarios accessibles au clavier (ARIA FR), erreurs auth API en français
- Web : filtre classement par piste (Apple / Jamf / Intune) avec query `?track=`
- README : section « Fonctionnalités récentes » + compte démo
- Mobile : toasts gamification (points, badge, quête) — banner Animated, thème sombre, FR
- Mobile : écran complétion — confettis/sparkles Animated + message motivant FR
- Web + Mobile : progression modules — statuts Terminé / En cours / Verrouillé, scores
- Web : page `/courses/[slug]/complete` — sparkles CSS + message motivant FR
- Web : métadonnées SEO (`/courses`, `/dashboard`, `/leaderboard`, `/courses/[slug]`, complétion)
- Web : thème sombre, PWA (`manifest`), bannière API, lien d’évitement « Aller au contenu »
- `MERGE.md` — checklist mainteneur avant fusion PR #6 (CI, seed, billing dormant, OAuth stub)
- Web : page `/about` (mission, piliers Apple / Jamf / Intune, lien footer)
- `smoke-web` : couverture HTTP de `/about`
- Mobile : lien « À propos » vers `WEB_URL/about` depuis l’écran Profil
- Web : bouton « Partager ma réussite » sur `/courses/[slug]/complete` (Web Share API + copie de lien)
- Web : certificat de complétion imprimable `/courses/[slug]/certificate` (`window.print()`, auth ou démo)
- Mobile : « Voir mon certificat » et « Partager ma réussite » sur l’écran de victoire (`Share` natif + lien `WEB_URL`)
- Fix `scripts/dev-stack.sh` (fins de ligne LF, `pnpm dev:stack` relance db + backend + web)
- Mobile : constantes parcours (`NEXT_COURSE_BY_SLUG`, slugs) importées depuis `@ama/shared`
- Thème **MDM Academy Pro** gratuit (palette `#2563EB`, sans paywall bloquant ; `/pricing` → `/courses`)
- Web : QCM, mini-scénarios, pages badges, quêtes, sprint, classement et ressources
- Mobile : écrans natifs `/badges`, `/sprint`, `/quests`, `/leaderboard` (fallback démo FR)
- Playwright smoke E2E web (`pnpm --filter web test:e2e`)
- Catalogue web MDM Academy (cartes, hero, filtres par piste et niveau)
- Recherche client sur le catalogue (titre, description, piste)
- Trois parcours MDM (Apple, Jamf, Intune) avec progression et complétion
- API tableau de bord : `completedCourses[]` pour les parcours terminés
- Mobile : onglets Accueil / Parcours / Profil, écran de victoire à la complétion
- Profil mobile : section « Parcours terminés » synchronisée avec le dashboard
- Web : bannières de connexion sur profil, badges, quêtes, sprint et classement
- Pages MVP, diagnostics et démo pour parcourir l’app sans compte
