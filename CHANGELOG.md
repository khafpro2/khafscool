# Changelog

## [0.3.6] — 2026-05-30

### Accueil — dock pistes et retrait hero
- **Web accueil** — dock style macOS sur les 3 pistes MDM (magnification au survol, effet genie au clic, reflet sous le dock) ; navigation clavier flèches / Home / End ; `aria-label` par piste
- **Web accueil** — retrait du hero MacBook (poster 3D) ; écran Hello + tagline + dock uniquement
- **Mobile** — retour visuel discret au press sur les cartes piste (`MdmTracksSection`)
- **Locale** — dates et fuseau `fr-FR` / `Europe/Paris` (web, API, affichage relatif)
- **QCM** — distracteurs contextualisés (Jamf/Intune), scripts `improve-qcm-ai.mjs` / `fix-qcm.mjs`, garde-fou CI `qcm:balance:check`
- Tests : e2e `home-hero` (4 scénarios), `qcm:balance:check`

## [0.3.17] — 2026-05-27

### Auth, certificats, progression locale et dons
- **API** — rate limit dédié login/register/refresh (5/min) avec message 429 en français
- **Web** — certificat : gestion d’erreur FR à l’impression / export PDF (pop-ups, annulation)
- **Web** — parcours : validation d’unité hors ligne (localStorage) si l’API est indisponible ou sans session
- **Shared** — helper `quiz-stats` (`computeQuizScorePercent`, `summarizeQuizStats`) pour analytics
- **Dons** — cartes mode de paiement avec badge Disponible / Indisponible
- **Dashboard** — barre de progression des quêtes hebdo dans l’encart
- **DX** — script `pnpm neon:bootstrap` (migrate + seed)

## [0.3.16] — 2026-05-27

### Examen blanc, vidéos, mobile et API
- **Web** — examen blanc : minuteur indicatif (~15 min) avec alerte douce au dépassement
- **Web** — vidéos module : chargement différé au scroll (IntersectionObserver) pour limiter le poids initial
- **API** — `/catalog` : en-têtes `Cache-Control` (5 min + stale-while-revalidate) ; `no-store` si schéma absent
- **Mobile** — quiz : raccourcis **A–D** sur web Expo ; libellés accessibilité sur les options
- **Mobile** — diagnostics : contrôles `/health/db` (schemaReady) et `/catalog` alignés sur le web

## [0.3.15] — 2026-05-27

### Diagnostics, quiz et gamification
- **Web** — page `/diagnostics` : affichage de `schemaReady` depuis `/health/db`, carte « Migrations requises » et lien guide Neon
- **Quiz** — dernier rééquilibrage des libellés (gap ≤ 8) ; test backend sur le seuil modéré
- **E2E** — `quiz-shuffle.spec.ts` : vérifie l’ordre mélangé des options sur une question pilote
- **Classement** — état vide enrichi (CTA parcours et quêtes)

## [0.3.14] — 2026-05-27

### Quiz, API et catalogue
- **Quiz** — mélange des options à l’affichage ; rééquilibrage des libellés pour réduire le biais « réponse la plus longue » ; raccourcis clavier **A–D** sur le web
- **API** — `/catalog` renvoie **503** avec message en français si le schéma Postgres est absent ; `/health/db` expose `schemaReady`
- **Railway** — migrations et seed automatiques au démarrage si la base est vide

## [0.3.13] — 2026-05-25

### Vidéos YouTube FR et accueil
- **Placeholders pilotes** — `getPilotModuleVideoConfig` : repli YouTube (`sourceYouTubeUrl`) avant placeholder ; modules 3–4 Apple/Jamf/Intune et App Protection Intune en iframe `youtube-nocookie` (whitelist `videoSourceLanguage: 'fr'`)
- **Accueil web** — liens discrets **Parcours** (`/courses`) et **Connexion** (`/auth`) sous les pistes Hello (sans header/footer)
- **Mobile** — mêmes liens sur `WelcomeScreen` (catalogue et auth web)
- Tests : `seed-video`, e2e `module-video`, `learning-path`

## [0.3.12] — 2026-05-25

### Catalogue, garde-fou ADE et seed
- **Catalogue `/courses`** — parcours Apple : métadonnées **3 avec vidéo** (module 1 `device-support-basics` sans section vidéo ADE/ABM) ; Jamf et Intune **4 avec vidéo**
- **CI** — script `scripts/check-no-ade-video.sh` : refuse le titre interdit « Vidéo : ABM, supervision et enrôlement automatisé (ADE) » dans le contenu partagé
- **README** — note seed idempotent après `git pull` (`pnpm db:migrate && pnpm db:seed`)
- **E2E** — `quiz-learning` : unité 4 Apple (démo 75 %, bandeau conseils hors mode révision)
- Tests : e2e `glossary-catalog` (badge Apple 3 vidéos), `check-no-ade-video.sh` en CI

## [0.3.11] — 2026-05-25

### Grille vidéos module 2 et catalogue
- **Module 2 pilote** — Jamf `inventory-basics` : MP4 HeyGen FR (`jamf-inventory-basics-fr.mp4`) ; Intune `compliance-policies` : MP4 FR (`intune-compliance-policies-fr.mp4`) ; Apple `ios-troubleshooting` : YouTube FR `lgMDK4zU114` (inchangé)
- **Module 1 Apple** — `device-support-basics` : **sans** section vidéo ADE/ABM (leçon et quiz inchangés)
- **Catalogue** — métadonnées cohérentes sur les 3 parcours (4 modules) : Apple **3 avec vidéo**, Jamf et Intune **4 avec vidéo** (`TrailCard`, hero parcours)
- **PR #6** — description FR résumant v0.3.7–0.3.11 (accueil épuré, dons, vidéos FR, intro Jamf `t3j9TkFfUJw`, pas de vidéo ADE module 1 Apple)
- Tests : `seed-video`, e2e `module-video` (modules 2), `glossary-catalog`

## [0.3.10] — 2026-05-25

### Vidéos module 4 et cookies mobile
- **Module 4 pilote** — Apple `apps-vpp-management`, Jamf `api-automation-advanced-policies`, Intune `vpp-abm-business-apps` : placeholders animés FR (`videoSourceLanguage: 'fr'`) ; module 1 Apple toujours sans vidéo ADE
- **Mobile** — lien « Préférences cookies » sur `WelcomeScreen` (politique de confidentialité web)
- **E2E** — modale cookies accueil (`cookie-consent.spec.ts`), placeholders module 4 (`module-video.spec.ts`), comptages vidéo (`seed-video`)
- Tests : `seed-video`, e2e `module-video`, `cookie-consent`, `learning-path`

## [0.3.9] — 2026-05-25

### Vidéos module 3 et cookies accueil
- **Module 3 pilote** — Apple `acmt-exam-prep` : MP4 HeyGen FR ; Jamf `api-automation-advanced-policies` et Intune `vpp-abm-business-apps` : placeholder animé FR (`videoSourceLanguage: 'fr'`)
- **Accueil** — lien discret « Préférences » sous les pistes : modale cookies (même contenu que la bannière `/courses`) sans bannière fixe sur `/`
- **Jamf module 1** — intro YouTube `t3j9TkFfUJw`, titre **Vidéo : introduction Jamf Pro** (inchangé, whitelist `fr`)
- Tests : `seed-video` (module 3), e2e `learning-path` (Préférences + modale)

## [0.3.8] — 2026-05-25

### Accueil minimal et mobile
- **Web accueil** — masquage sur `/` de `ApiStatusBanner`, `DemoModeBanner`, `CookieConsentBanner` et `AnalyticsOptInBanner` (plein écran Hello sans chrome)
- **Mobile** — `WelcomeScreen` et `LearnerDashboardScreen` : safe area (encoches), espacement accueil aligné web
- **Vidéo Apple module 2** — `ios-troubleshooting` : YouTube FR `lgMDK4zU114` (redémarrage forcé iPhone), titre « Vidéo : dépannage iOS en environnement géré » (pas de titre ADE)
- Tests : `seed-video`, e2e `learning-path` (absence bannières accueil)

## [0.3.7] — 2026-05-25

### Version 0.3.7
- **Accueil plein écran** — hero Hello centré sur 100vh ; padding `main` retiré sur `/` uniquement
- **Versions** — alignement `package.json` (racine, web, backend, shared, mobile), API health et bannière « Nouveau »

## [0.3.6] — 2026-05-25

### Accueil sans footer
- **Web accueil** — retrait du footer global (`SiteFooter`) sur `/` uniquement, comme le header ; autres pages inchangées
- Tests e2e : `learning-path` (absence footer accueil), `legal-pages` et `soutenir` (footer vérifié sur `/courses`)

## [0.3.5] — 2026-05-25

### Intro Jamf module 1 (YouTube whitelist)
- **Contenu** — module `smart-groups-policies` : intro YouTube `t3j9TkFfUJw` avec titre **Vidéo : introduction Jamf Pro** (pas de titre vidéo « Smart Groups… ») ; `videoSourceLanguage: 'fr'` pour embed
- **Pilote** — `smart-groups-policies` réintégré dans `PILOT_VIDEO_MODULES` (11 vidéos ; Jamf **4 avec vidéo**)
- **E2E** — `module-video.spec.ts` : intro visible + titre module en `exact: true` (évite collision avec le h2 leçon)
- **Handoff** — `docs/HANDOFF.md`, `CLAUDE.md` pour reprise Claude Code / Cursor après push
- Tests : `seed-video`, `video-dub-sync`, e2e `module-video`

## [0.3.4] — 2026-05-25

### Retrait vidéo ADE (module 1 Apple)
- **Contenu** — module `device-support-basics` (`apple-cert-prep`) : retrait de la vidéo « ABM, supervision et enrôlement automatisé (ADE) » (MP4/doublage) ; leçon et quiz inchangés
- **Pilote** — retrait de `device-support-basics` dans `PILOT_VIDEO_MODULES` (11 vidéos ; catalogue Apple **3 avec vidéo**)
- Tests : `seed-video`, e2e `module-video`, `learning-path`

## [0.3.3] — 2026-05-25

### Accueil sans header
- **Web accueil** — retrait de la barre de navigation globale (`SiteHeader`) sur `/` uniquement ; footer, lien « Aller au contenu » et contenu Hello + 3 pistes inchangés
- **Autres pages** — header conservé (parcours, dashboard, glossaire, etc.)
- Tests e2e : `learning-path.spec.ts` (absence header accueil, présence sur `/courses`)

## [0.3.2] — 2026-05-25

### Vidéos 100 % françaises (pilote 12 modules)
- **Politique** — `videoSourceLanguage: 'fr'` obligatoire pour toute iframe YouTube/Vimeo ; sources `en` ou MP4 HeyGen non prêts → `ModuleAnimatedExplainer` + message « Vidéo française bientôt disponible » (jamais d’autoplay YouTube EN)
- **Contenu** — `getPilotModuleVideoConfig` : MP4 FR HeyGen si manifest `ready`, sinon `placeholder` ; 4 modules prêts (`acmt-exam-prep`, `inventory-basics`, `ade-enrollment-basics`, `compliance-policies`)
- **Web / mobile** — badge « Français » sur le lecteur ; `canEmbedExternalVideo` dans `@ama/shared/video-embed`
- **Pilote** — 12 vidéos (4 Apple, 4 Jamf, 4 Intune), toutes déclarées `fr`
- Tests : `seed-video`, `video-embed`, e2e `module-video`

## [0.3.1] — 2026-05-25

### Retrait vidéo ABM (module 1 Apple)
- **Contenu** — module `device-support-basics` : retrait de la vidéo ManageEngine « comprendre l'ABM et l'enrôlement MDM » (`qrQyL5-SWFg`)
- **Pilote** — retrait temporaire de `device-support-basics` dans `PILOT_VIDEO_MODULES` (11 vidéos)
- Tests : `seed-video`, `video-dub-sync`, e2e `module-video`

## [0.3.0] — 2026-05-24

### Vidéo intro Jamf Pro (module 1)
- **Contenu** — module `smart-groups-policies` du parcours `jamf-pro-foundations` : vidéo YouTube principale `t3j9TkFfUJw` (« Vidéo : introduction Jamf Pro »)

### Vidéos module 3 (suite v0.3)
- **Pilote** — 3 vidéos supplémentaires (module 3 par piste) : Apple Diagnostics (placeholder animé), Jamf ADE (YouTube Jamf 100), Intune App Protection (YouTube MD-102)
- **Catalogue** — `TrailCard` : métadonnées `4 modules · 3 avec vidéo` quand des unités ont une vidéo
- **Hero parcours** — suffixe `3 modules avec vidéo explicative` sur `/courses/[slug]`
- **Web** — `localStorage` `video-watched-{moduleId}` après 30 s (iframe/lecteur) ; badge sidebar « Vidéo vue »
- **Web** — lecteur YouTube/Vimeo en iframe (`youtube-nocookie`) pour les unités module 3 Jamf/Intune
- Tests : `seed-video`, `reading-time`, e2e catalogue et hero

### Marque Jamf
- **UI** — wordmark Jamf en vert officiel `#76B900` (tokens CSS, parcours, badges, Open Graph) ; dégradés track/badges alignés sur la charte Jamf

### Vidéos explicatives par module (pilote)
- **Contenu** — champs optionnels `videoUrl`, `videoTitle`, `videoDurationMinutes`, `videoProvider` dans `@ama/shared/course-content` ; helper `parseVideoEmbed` (YouTube nocookie, Vimeo, MP4)
- **Pilote** — 6 vidéos (modules 1 et 2 de chaque parcours) : YouTube éducatif MDM/Apple/Jamf/Intune ou fallback `ModuleAnimatedExplainer` SVG/CSS animé
- **Web** — `ModuleVideoSection` au-dessus de la leçon : ratio 16:9, iframe lazy, titre + durée, doublage FR synchronisé sur module 1
- **Mobile** — `ModuleVideoSection` : lecteur YouTube inline (`WebView`) quand `videoUrl` présent ; placeholder animé sinon
- **Prisma** — migration `Module.videoUrl`, `videoTitle`, `videoDurationMinutes` ; seed depuis course-content
- **Catalogue / sidebar** — badge « 2 vidéos » si le parcours a plusieurs unités vidéo
- **Certificat** — mention « Formation multimédia » sur la page certificat
- Tests : `video-embed.test.ts`, `seed-video.test.ts`, e2e `module-video.spec.ts`

### Contact et accueil
- **Contact** — email support retiré de l’UI publique (web + mobile)
- **Web accueil** — bandeau « Nouveau · v0.3.0 » ; fix API banner

## [0.2.1] — 2026-05-24

### Déploiement, bandeau accueil et durcissement dons
- **Contact** — email support retiré de l’UI publique (web + mobile) ; liens « Nous contacter » / « Assistance » (mailto sans adresse visible)
- **docs/QUICK-DEPLOY.md** — guide FR en 15 étapes : Vercel web + Railway API + Postgres, liste env vars, Stripe/PayPal prod
- **Web accueil** — bandeau discret « Nouveau · v0.2.1 » (examen blanc, glossaire, dons 3 modes) ; dismiss `localStorage`
- **Intune module 4** — encadré cas pratique supplémentaire (renouvellement token VPP avant go-live)
- **API** — rate limit 10/min sur `POST /donations/create-checkout-session` (429 FR structuré)
- **CI** — smoke web aligné sur le rendu client (skeletons aria-label, titre auth, diagnostics MVP)
- **Auth web** — login/inscription via BFF `/api/auth/login` et `/api/auth/register` (cookies HttpOnly, tokens hors JS)
- Tests : `donations.rate-limit.test.ts`, e2e `whats-new-banner.spec.ts`

### Dons — montants, modes et redirect
- **Web** — `/donate` redirige vers `/soutenir` (query `?amount=` et fragment `#carte` / `#paypal` / `#virement` préservés)
- **UX dons** — grille montants 5 € / 10 € / 20 € / Autre + choix mode (carte Stripe, PayPal, virement SEPA) ; CTA contextuels ; bordure accent `#2563EB`
- **Accueil** — `SupportProjectCard` : chips montants + liens vers `/soutenir?amount=10#…`
- **Mobile** — `DonationChoiceSection` sur `/donate` : parité montants/modes avec le web
- **Deep link mobile** — universal link style `/donate` et `/soutenir` → écran natif `DonateScreen` (scheme `applemdmacademy://` + associated domains via `EXPO_PUBLIC_WEB_URL`)
- **Stripe Checkout** — spinner sur « Payer X € par carte » ; message d’erreur FR si l’API échoue
- **FAQ** — badge Supporter : attribution manuelle PayPal/virement via le bouton Assistance
- **Parcours** — micro-CTA discret « Ce contenu vous aide ? Soutenir le projet » → `/soutenir?amount=5` (web sidebar, mobile `/donate?amount=5`)
- **CI** — smoke `pnpm --filter backend test -- donations`
- Tests e2e : `donate-redirect.spec.ts`, `soutenir.spec.ts`, `home-support.spec.ts`

### Glossaire, merge checklist et bonus examen
- **Header web** — recherche glossaire compacte + lien « Glossaire » ; autocomplete 5 termes max (`searchGlossaryLimited`, `@ama/shared/glossary`)
- **Mobile** — lien « Glossaire » dans l’en-tête écran Parcours → `/glossary`
- **MERGE.md** — checklist mainteneur v0.2.1 (HEAD, CI, compte démo, 3 modes dons, `verify-release.sh`)
- **Contenu symétrique** — +2 Q bonus **exam-only** module 4 par piste (Apple, Jamf, Intune) ; 4 modules × 10 Q quiz + 4 bonus examen blanc ; seed **132 QCM** total
- Champ Prisma `Question.examOnly` ; quiz module filtre les bonus ; pool examen blanc **44 Q** par parcours
- Tests : `quiz-content.test.ts`, `glossary.test.ts`, `seed-content.test.ts`, e2e header glossaire

### Quiz module vs pool examen blanc
- **GET /courses/:slug** — `sanitizeModule` exclut les questions `examOnly` du quiz module (10 Q affichées)
- **GET /courses/:slug/practice-exam** — pool **44 Q** (40 parcours + 4 bonus module final) ; 10 tirées au hasard
- **Web** — page `/courses/[slug]/examen` : « Pool de 44 questions · 10 tirées au hasard » + message badge ≥ 70 %
- **Mobile** — `CoursePracticeExamScreen` aligné sur le pool 44 ; recherche glossaire sur `GlossaryScreen`
- Tests : `course-sanitize.test.ts` (filtre examOnly), `practice-exam.routes.test.ts` (poolSize 44)
- **README** — rappel `pnpm db:migrate && pnpm db:seed` après migration `examOnly`

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

### Redirect dons, checkout Stripe et liens
- _(livré en 0.2.1 — voir section ci-dessus)_

### UX dons — sélecteur de mode de paiement
- _(livré en 0.2.1 — voir section ci-dessus)_

### UX dons — grille choix montant et mode
- _(livré en 0.2.1 — voir section ci-dessus)_

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
