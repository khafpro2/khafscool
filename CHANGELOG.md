# Changelog

## [0.2.0] — 2026-05-23

Release **MDM Academy Pro v0.2** (branche `cursor/progress-dashboard-auth-v2`, PR #6) — contenu enrichi, 4 modules par piste, glossaire, révision et examen blanc.

### Contenu pédagogique
- **4 modules × 10 questions** par parcours Apple, Jamf et Intune (120 QCM total)
- Leçons markdown FR enrichies (`lessonContent`, objectifs, points clés), liens glossaire auto
- **Glossaire MDM** — 34 termes FR, page `/resources/glossaire` (web + mobile)

### Révision et examen
- **Fiche révision** — `/courses/[slug]/revision` : synthèse `keyTakeaways`, liens glossaire, impression PDF (web + mobile)
- **Examen blanc** — `/courses/[slug]/examen` : 10 questions aléatoires parmi les 40 du parcours ; API `GET /courses/:slug/practice-exam` (sans `correctOption`, validation via `check-answer`) ; score final + lien retour révision ; mobile lien web natif
- SEO : métadonnées `noindex` + sitemap `/revision` et `/examen` ; fil d’Ariane révision → examen

### Dashboard et parcours
- Dashboard web/mobile « Mes pistes MDM » — **X/4 modules** + barre %
- Pages complétion 4/4, certificat listant les 4 modules, badge piste à 4 modules
- Durée de lecture estimée, objectifs module actif (web + mobile)
- Bannière / toast dashboard à **3/4 modules** : « Plus qu'une unité pour le badge ! » (web + mobile)
- CTA dashboard **« Passer l'examen blanc »** quand un parcours est complété à 100 %
- Badge **`practice-exam-pass`** (≥ 70 % à l'examen blanc) + quête hebdo optionnelle « Passe un examen blanc » (+25 pts)
- API `POST /courses/:slug/practice-exam/score` pour enregistrer le score et déclencher la gamification
- Catalogue `TrailCard` : **~XX min · 4 modules · 40 questions** (somme reading-time)

### Partage et social
- Web Share API (ou copie presse-papiers) — fiche révision, certificat, complétion parcours (texte FR)

### Contenu quiz
- **+2 questions exam-style** par parcours (module final) — 126 QCM seed total

### Dons, conformité et DX
- Dons Stripe `/soutenir#carte` — section **carte bancaire** prioritaire (Visa/Mastercard, Checkout), badge Supporter, pages merci/annule
- **Virement bancaire SEPA** — section `/soutenir#virement` (web) + cartes natives mobile ; coordonnées Revolut HarmyTech, copie IBAN/BIC, variables `DONATION_BANK_*`
- **Mobile** — écran natif `/donate` (carte → web Stripe, PayPal, virement IBAN) ; liens profil, à propos et accueil
- **Web accueil** — carte « Soutenir le projet » (3 modes : CB, PayPal, virement)
- **CI** — `tsc --noEmit` mobile dans le job `build-test` (régression ToastKind)
- Export/suppression compte RGPD, auth enrichie, rate limit quiz FR
- `scripts/dev-stack.sh`, Postgres Docker port **5433**, diagnostics OAuth

## [0.1.0] — 2026-05-22

Première release MVP **MDM Academy Pro** (branche `cursor/progress-dashboard-auth-v2`, PR #6).

### Compte et conformité
- API : `GET /users/me/export` — export JSON (profil, progression, badges, points, quêtes)
- API : `DELETE /users/me` — suppression compte avec confirmation `SUPPRIMER` (cascade Prisma)
- Web + mobile : section « Données personnelles » sur le profil (export + suppression)

### Auth et sécurité
- Changement mot de passe, déconnexion globale, « Se souvenir de moi »
- Profil : édition du nom affiché (web + mobile)

### Parcours et gamification
- 3 pistes Apple / Jamf / Intune, quiz, mini-scénarios, badges, quêtes, sprint, classement
- Certificats imprimables, partage de réussite, récap quiz avant validation (web + mobile)
- Toasts gamification, thème sombre, PWA, pages légales et cookies FR

### Mobile
- Onglets natifs badges, quêtes, sprint, classement, diagnostics, profil enrichi

### Docs
- `DEPLOYMENT.md`, `MERGE.md`, roadmap README

## Unreleased — `cursor/progress-dashboard-auth-v2`

### UX dons — grille choix montant et mode
- **`DonationChoiceGrid` (web)** — `/soutenir` : montants 5 € / 10 € / 20 € / Autre puis 3 cartes mode (carte Stripe, PayPal, virement SEPA) ; CTA « Donner X € », PayPal avec `?amount=` si possible, référence virement « MDM Academy - X€ » ; bordure accent `#2563EB` ; FAQ conservée en bas
- **Accueil** — `SupportProjectCard` : 3 chips montants + lien « Choisir mode de paiement » → `/soutenir?amount=10`
- **Mobile** — `DonationChoiceSection` sur `/donate` : même pattern chips montants + 3 modes
- **Query `?amount=`** — pré-sélection montant sur `/soutenir` (web + deep link mobile)
- **`@ama/shared/donation-amounts`** — helpers `formatDonationEuros`, `buildPaypalUrlWithAmount`, `buildDonationBankReference`
- Tests e2e : `soutenir.spec.ts`, `home-support.spec.ts`

### Badge Supporter, FAQ dons, notifications stub
- **Badge Supporter** — galerie web/mobile (`ALL_BADGE_SLUGS`) + critères déblocage ; CTA « Soutenir le projet » sur la carte verrouillée
- **FAQ dons FR** — section 5 questions sur `/soutenir` (gratuité, remboursement, reçu fiscal, badge, destination)
- **Notifications email (stub)** — `logDonationConfirmation` après webhook Stripe OK (`console.info`, doc `DONATIONS.md`)
- **Refactor** — `mapCoursesWithProgress` + `computeModuleAggregateStats` dans `gamification.service.ts`

### PayPal par défaut (khafpro)
- **`DEFAULT_DONATION_PAYPAL_URL`** — `@ama/shared/donation-methods` : `https://www.paypal.com/paypalme/khafpro` (comme IBAN Revolut HarmyTech) ; override via `DONATION_PAYPAL_URL` / `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*`
- Web `/soutenir#paypal` + mobile : bouton **Donner avec PayPal** actif par défaut ; référence optionnelle « MDM Academy »
- API `GET /donations/status` → `paypal.status: configured` sans variable d’environnement

### Quiz révision, aperçu parcours, partage mobile, export dons
- **Quiz révision (module terminé)** — web + mobile : refaire le quiz depuis la sidebar sans modifier la progression ; flag API `reviewMode` sur `POST /modules/:id/complete` (score recalculé, `pointsEarned: 0`) ; bannière FR « Mode révision — aucun point »
- **Page parcours** — hero `/courses/[slug]` : liste compacte des 4 titres de modules (sans dévoiler le quiz)
- **Mobile partage** — Share API native : certificat (`CourseCompleteScreen`) + fiche révision (`CourseRevisionScreen`)
- **Admin dons** — `GET /admin/donations/export.csv` (CSV protégé `X-Admin-Api-Key`) ; doc `docs/DONATIONS.md` mise à jour
- Tests backend : `complete-module` review mode, `donations` export CSV

### Fiche révision, dashboard pistes et sprint 4 modules
- **Fiche révision web** — `/courses/[slug]/revision` : agrège `keyTakeaways` des 4 modules, liens glossaire auto, FR, dark mode, bouton « Imprimer / PDF » ; accessible après complétion (ou démo) ; lien depuis `/courses/[slug]/complete`
- **Dashboard web** — section « Mes pistes MDM » : cartes Apple/Jamf/Intune **X/4 modules** + barre % (`LearningPathCard`, `MdmTracksSection`)
- **Mobile** — écran natif `CourseRevisionScreen` (`/course/[slug]/revision`) + lien depuis complétion ; section `MdmTracksSection` sur tableau de bord (**X/4** + barre %)
- **Sprint & quêtes** — cibles sprint dynamiques sur **4 modules/piste** ; données démo alignées (`weekly-apple-2`, etc.) ; tests backend `revision-sheet`, `certification-sprint-target`, mocks 4 modules
- Tests e2e : `revision-sheet.spec.ts`

### Glossaire, leçons et catalogue (v0.2)
- **Glossaire MDM** — `@ama/shared/glossary` : 34 termes FR (ABM, ADE, DEP, VPP, SCEP, supervision, Smart Group, conformité, wipe sélectif…) ; page web `/resources/glossaire` avec recherche, catégories, dark mode, sitemap ; lien depuis `/resources`
- **Leçons enrichies** — `@ama/shared/lesson-markdown` : parseur H2/H3, listes, blockquote « Bonne pratique », liens externes ; web `LessonContent` + CSS `.lesson-content` ; mobile composant `LessonContent` (parité markdown)
- **Catalogue `/courses`** — cartes `TrailCard` : « 3 modules · 10 questions/module » + barre progression % si connecté (`showProgress`)
- **Dev DX** — `scripts/dev-stack.sh` : `pnpm db:migrate` uniquement si migrations pending ; README rappel `pnpm db:migrate && pnpm db:seed` après pull
- Tests : `glossary.test.ts`, `lesson-markdown.test.ts`, e2e `glossary-catalog.spec.ts`

### Sprint v0.2 (en cours)
- **Mobile glossaire** — écran `GlossaryScreen` (`@ama/shared/glossary`, recherche + filtres catégorie) ; liens profil, parcours et ressources web
- **Catalogue mobile** — parité web : « 3 modules · 10 Q/module » + barre % si connecté (`CoursesCatalogScreen`)
- **Durée de lecture** — `@ama/shared/reading-time` : `estimateReadingMinutes` (~200 mots/min) ; badge « ~N min de lecture » sur module actif (web sidebar + mobile)
- **Accueil web** — carte « Glossaire MDM » → `/resources/glossaire` (section Ressources)
- Tests : `reading-time.test.ts`
- **Contenu enrichi** — `@ama/shared/course-content` : descriptions 2–3 paragraphes, `lessonContent` markdown FR par module, `learningObjectives` / `keyTakeaways`, quiz portés à **8 questions/module** (72 total) ; API sanitize expose la leçon sans spoilers ; web `LessonContent` + mobile section « Leçon » scrollable
- **Objectifs module actif (web)** — panneau repliable `ModuleObjectives` sous le titre : objectifs d’apprentissage + points clés (FR, dark mode)
- **Liens glossaire auto** — `@ama/shared/lesson-markdown` + `@ama/shared/glossary` : termes MDM liés dans les leçons (`/resources/glossaire#terme`, mobile scroll) ; max 1 lien/terme/paragraphe ; quiz : lien « Voir dans le glossaire » après validation
- **Module 4 Apple** — parcours `apple-cert-prep` : « Gestion des apps et VPP » (leçon 800+ mots, 10 questions) ; catalogue **4 modules** pour ce parcours (`MODULES_BY_COURSE`, seed)
- **Module 4 Jamf** — parcours `jamf-pro-foundations` : « Automatisation et extension API » (leçon 800+ mots, 10 questions MDM Jamf)
- **Module 4 Intune** — parcours `intune-ios-enrollment` : « Apps métier et Apple Business Manager dans Intune » (même structure)
- **Parité catalogue** — `MODULES_BY_COURSE` : **4 modules** pour les 3 parcours ; TrailCard / mobile « 4 modules · 10 Q/module » ; tests seed **12 modules, 120 questions**
- **Complétion 4 modules** — pages `/courses/[slug]/complete` (web + mobile) : récap **4/4**, temps de lecture total, liste unités validées, message **40 questions** ; certificat web liste les **4 titres de modules** ; bandeau hero « 4 modules · 10 questions · ~N min » ; badge piste déclenché à **4 modules** (tests backend mis à jour)
- **Objectifs module actif (mobile)** — panneau repliable `ModuleObjectives` sur module actif (parité web)
- Docs : Postgres Docker — port hôte **5433** vs conteneur **5432** (`README`, `DEPLOYMENT`, `compose.yaml`, `backend/.env.example`)
- API : `GET /auth/oauth/status` — état Google / Apple / Microsoft (`configured` | `stub` | `disabled`)
- Web : `/diagnostics` — section OAuth FR (lecture `/auth/oauth/status`)
- Web : bannière analytics opt-in (stub, clé `analytics-opt-in`, après cookies) — « Aucun tracking tiers pour l'instant » + lien confidentialité
- Contenu Jamf : +1 question quiz module 2 (`inventory-basics`) — délai inventaire FileVault
- Contenu Intune : +2 questions quiz ADE (`ade-enrollment-basics`) — profil Setup Assistant, renouvellement jeton MDM
- Certificat : bouton « Télécharger PDF » + aide impression navigateur (`@media print` existant)
- API : `GET /admin/donations/stats` protégée par `X-Admin-Api-Key` — agrégats lecture seule ; doc `docs/DONATIONS.md`
- Mobile : carte « Soutenir le projet » sur l’accueil ; chip badge Supporter sur profil connecté
- SEO : métadonnées Open Graph `fr_FR` sur `/soutenir` et `/demo`

### Contact HarmyTech
- Email officiel `KTHIAM@HARMYTECH.COM` — footer, à propos, pages légales, profil RGPD, `/soutenir` (questions dons), mobile à propos
- Variables optionnelles : `CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `EXPO_PUBLIC_CONTACT_EMAIL` ; helper `web/src/lib/contact.ts`

### Dons — pages retour et badge Supporter
- Web : `/soutenir/merci` et `/soutenir/annule` — contenu FR, liens accueil/parcours ; `?session_id=` sur merci
- API Stripe : `success_url` / `cancel_url` vers ces pages
- Webhook don : badge `supporter` si `userId` dans metadata checkout (don anonyme → pas de badge)
- API dashboard : champ `isSupporter` ; affichage discret profil web + note mobile « Merci pour votre soutien »
- CI : workflow stub `.github/workflows/deploy-preview.yml` (`workflow_dispatch` only) ; secrets listés dans `DEPLOYMENT.md`

### Dons volontaires
- API : `GET /donations/status`, `POST /donations/create-checkout-session` — dons one-shot Stripe ou fallback `DONATION_URL`
- Webhook `checkout.session.completed` → table `Donation` (email optionnel, montant, `stripeSessionId`)
- Web : page `/soutenir` (montants 5 € / 10 € / 20 € + libre), lien footer et section À propos
- Mobile : profil et à propos — « Soutenir le projet » → `/soutenir`
- Docs : `docs/DONATIONS.md`, variables `.env.example`

- API : `GET /users/me/export` et `DELETE /users/me` — conformité RGPD minimale
- Web : profil — section Données personnelles (export JSON + modal suppression FR)
- Mobile : export Share + suppression compte sur profil (API connectée)
- Mobile : récap quiz fin d’unité (parité web)
- Web : `DemoModeBanner` — « Mode démo local » vs « Connecté à l’API »
- Version monorepo `0.1.0`, `MERGE.md` checklist release, roadmap README

- API : `PATCH /users/me/password` — changement mot de passe (Zod FR, bcrypt, comptes e-mail)- API : `POST /auth/logout-all` — révoque tous les refresh tokens de l’utilisateur
- Web : profil — section Sécurité (mot de passe + « Déconnecter tous les appareils », toasts erreurs FR)
- Mobile : profil — formulaire mot de passe et bouton déconnexion globale (API connectée)
- Web : `QuizPanel` — récap score X/Y + points estimés avant validation d’unité
- Tests : schéma/route mot de passe, logout-all, récap points quiz

- Auth : « Se souvenir de moi » (web `/auth`, mobile WelcomeScreen) — refresh 7 j / 90 j, JWT accès 15 min documenté
- Web : aide raccourcis clavier (? + lien) sur parcours/quiz — quiz + mini-scénario FR
- API : rate limit FR structuré (429) sur `check-answer` et `complete` ; QuizPanel affiche l’erreur style auth
- Web : `/mvp` — polish FR aligné thème Pro (grilles, dark mode, cartes glass)
- Tests : TTL refresh remember-me, rate limit quiz, schéma login `rememberMe`

- API : `PATCH /users/me` — mise à jour du `displayName` (Zod FR, auth requise)
- Web : `/profile` — formulaire FR pour modifier le nom affiché, validation et toast succès
- Web : menu mobile — points et rang (`SiteMobileNav`, parité header desktop)
- Web : certificat — CSS impression amélioré (marges, sans nav/footer, logo MDM Academy Pro)
- Mobile : profil — champ nom affiché éditable (API connectée)
- Tests : schéma + route profil, E2E profil démo et bouton impression certificat

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
