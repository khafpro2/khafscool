# Changelog

## Unreleased — `cursor/progress-dashboard-auth-v2`

- Web : `/demo` — parcours guidé FR en 6 étapes (compte démo, parcours, quiz, quêtes, classement, certificat), BrandIcon, dark mode, bandeau credentials
- Web : Open Graph dynamique par parcours (`/courses/[slug]/opengraph-image`, titre + piste, fallback générique)
- Mobile : profil — carte récap points, rang, streak et #classement
- Tests : E2E smoke page `/demo`
- Web : bannière consentement cookies FR (localStorage, lien `/legal/confidentialite`, pas de traceur tiers)
- Web : profil — section certificats (parcours terminés → `/courses/[slug]/certificate`, empty state FR, dark mode)
- Mobile : profil — certificats (lien web imprimable par parcours terminé)
- `MERGE.md` — checklist pages légales, cookies, points/rang nav, certificats profil
- Tests : logique consentement cookies, E2E bannière + profil certificats
- Web : `/courses/[slug]/certificate` — métadonnées SEO dynamiques (canonical, Open Graph FR, noindex)
- Smoke web : page certificat démo (`apple-cert-prep/certificate`)

- Web : header discret points + rang classement (cache dashboard 5 min, liens profil/classement, thème sombre)
- Web : pages légales FR `/legal/confidentialite` et `/legal/conditions` + liens footer
- Web : sitemap/robots — pages about, resources, diagnostics et légales
- Web : `/sprint` — objectif, progression et CTA parcours lié (FR, dark mode)
- Mobile : sous-titre accueil points + rang (#classement) avec liens profil/classement
- Tests : logique points/rank nav, E2E pages légales, smoke pages legal

- Web : `/quests` — filtre piste (chips Toutes/Apple/Jamf/Intune, query `?track=`)
- Mobile : écran natif `/about` — parité mission, 3 parcours, gratuité, lien GitHub (depuis Profil)
- Web + Mobile : indicateur série 🔥 discret dans la navigation si streak &gt; 0 (dashboard API, thème sombre)
- Tests : filtre quêtes par piste, logique streak nav

- Mobile : pastille quête hebdo sur l’onglet Accueil (cache léger dashboard, parité nav web)
- Mobile : écran `/diagnostics` — santé API, version backend, URL config et session (FR)
- Web : deep link `/courses/[slug]#module-{slug}` — scroll + surbrillance module en cours
- Web : footer — liens Ressources, À propos, Diagnostics
- README : section « Aperçu en 30 secondes » (`pnpm dev:stack`, compte démo, URLs)
- Tests : quest nav badge, hash resume CTA, E2E deep link module

- Mobile : accueil/dashboard — CTA « Continuer l’apprentissage » (logique resume API, empty state FR)
- Mobile : `/badges` — filtre piste (`TrackFilterChips`, parité web)
- Web : `/diagnostics` — synthèse FR (health, version API, DB, auth, catalogue), lien docs stack locale
- Web : navigation — pastille discrète sur « Quêtes » si quête hebdo non terminée (cache session 5 min)
- API : `/health` expose `version` pour les diagnostics
- Tests : health version, logique resume, E2E diagnostics

- Mobile : profil — section « Activité récente » (`recentActivity[]`), empty state FR
- Mobile : accueil — cartes quête hebdo + sprint certification (parité `HomeEngagementSection`)
- Web : `/badges` — filtre piste (chips Toutes/Apple/Jamf/Intune, query `?track=`, thème sombre)
- Web : accueil + dashboard — CTA « Continuer l’apprentissage » (dernier module / parcours en cours, empty state)
- `DEPLOYMENT.md` — résumé variables WEB, API, DATABASE, JWT + hints Vercel/Railway
- Tests : `mapRecentActivity` (backend), E2E filtre badges (Playwright)

- Web : profil `/profile` — section « Activité récente » (modules complétés, points gagnés), skeleton et empty state FR, thème sombre
- Web : accueil — bandeau « Quête de la semaine » avec progression + lien `/quests`, carte « Sprint certification » si sprint actif → `/sprint`
- Web : page `/about` enrichie — BrandIcon Apple/Jamf/Microsoft, contact et lien GitHub
- API : `recentActivity[]` sur `/users/me/progress` et `/users/me/dashboard` (points calculés depuis quiz + mini-jeu)

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
