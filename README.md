# Apple MDM Academy

Plateforme de formation gamifiée pour techniciens Apple et administrateurs MDM (parcours Apple, Jamf Pro, Intune).

> **Non affilié** à Apple Inc., Jamf ou Microsoft. Contenus pédagogiques originaux.

## Aperçu en 30 secondes

```bash
pnpm setup      # première fois : dépendances, migrations, seed
pnpm dev:stack  # Postgres + API (:4000) + web (:3000)
```

| Où | URL |
| --- | --- |
| Web | http://127.0.0.1:3000 |
| API | http://localhost:4000 |
| Diagnostics | http://127.0.0.1:3000/diagnostics |
| Auth / compte | http://127.0.0.1:3000/auth |

**Compte démo** — explore le catalogue, le classement et les parcours sans inscription (`demo@mdmacademy.local` / `DemoTest2026!` après `pnpm db:seed`, ou mode local sur `/demo`). Connecte-toi sur `/auth` pour sauvegarder ta progression.

## Fonctionnalités

- **100 % gratuit** — pas de paywall sur le MVP ; checkout billing simulé sans Stripe obligatoire
- **3 pistes seedées** — Apple Device Support, Jamf Pro et Microsoft Intune (3 modules × 3 unités chacun)
- **Gamification** — points, rangs, badges, quêtes hebdo, sprint certification et classement communautaire
- **Certificat & partage** — certificat imprimable web et partage de réussite (web + mobile) à la fin d’un parcours
- **Web Next.js** — auth email + SSO dev, dashboard, parcours, quiz et mini-scénarios
- **Mobile Expo** — auth par email, dashboard apprenant, quêtes et classement natifs (fallback démo FR sans token)
- **Thème MDM Academy Pro** — palette bleu `#2563EB`, sans page pricing bloquante

## Fonctionnalités récentes

Voir le détail dans [CHANGELOG.md](./CHANGELOG.md) (branche `cursor/progress-dashboard-auth-v2`, [PR #7](https://github.com/khafpro2/khafscool/pull/7)).

- **Accueil** — dock pistes MDM (Apple / Jamf / Intune) sur `/` ; descriptions une ligne sous chaque libellé
- **Locale** — affichage des dates en `fr-FR`, fuseau `Europe/Paris`
- **QCM** — garde-fou `pnpm qcm:balance:check` (CI) ; maintenance `pnpm qcm:balance` / scripts `improve-qcm-ai.mjs`, `fix-qcm.mjs`
- Toasts gamification, certificat, thème sombre et PWA (voir CHANGELOG)

**Compte démo** — sans inscription, explore le catalogue, le classement et les parcours en mode local (`demo@mdmacademy.local`, mot de passe `DemoTest2026!` après seed). Pour sauvegarder ta progression, connecte-toi sur [`/auth`](http://127.0.0.1:3000/auth) ou suis le [guide démo](/demo).

## Contact

Projet **MDM Academy Pro** (HarmyTech). Pour le support, les retours pédagogiques ou l’exercice de vos droits RGPD :

- **Contact** : via le bouton « Nous contacter » ou « Assistance » sur le site (footer, à propos, profil RGPD, page Soutenir)
- Variable optionnelle (mailto uniquement, non affichée) : `NEXT_PUBLIC_CONTACT_EMAIL` (web) / `EXPO_PUBLIC_CONTACT_EMAIL` (mobile)

## Stack


| Package    | Technologie                   |
| ---------- | ----------------------------- |
| `backend/` | Fastify + Prisma + PostgreSQL |
| `mobile/`  | Expo (React Native)           |
| `web/`     | Next.js 15                    |


## Prérequis

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+ ou Docker pour lancer PostgreSQL localement

## Démarrer

Depuis la racine du monorepo, enchaîner dans l’ordre :

```bash
# 1. Base PostgreSQL (Docker)
pnpm db:up

# 2. Première fois uniquement : dépendances, migrations et contenu seed
pnpm setup
# ou, si déjà installé : pnpm db:migrate && pnpm db:seed

# Après un git pull (schéma ou contenu modifié) :
# pnpm db:migrate && pnpm db:seed
#
# Migration `Question.examOnly` : le seed idempotent recrée les bonus examen blanc
# (44 Q par parcours). Toujours enchaîner migrate puis seed après pull.

# 3. API + web en un terminal (Ctrl+C arrête tout)
pnpm dev:stack
```

| Service | URL |
| ------- | --- |
| API | http://localhost:4000 |
| Web | http://127.0.0.1:3000 |
| Mobile (optionnel) | `pnpm --filter mobile dev` → Expo Dev Tools |

Re-seed après modification du contenu : `pnpm db:seed`.

## Démarrage rapide

**Première fois** (base + dépendances) :

```bash
cd apple-mdm-academy
pnpm setup
```

Ou manuellement :

```bash
cd apple-mdm-academy
cp .env.example .env
# Éditer DATABASE_URL et les secrets JWT

pnpm install
pnpm db:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

**Une commande** — Postgres + API + web (2 terminaux fusionnés, Ctrl+C pour tout arrêter) :

```bash
pnpm dev:stack
```

**Trois terminaux** (contrôle fin) :

```bash
# Terminal 1 — base
pnpm db:up

# Terminal 2 — API http://localhost:4000
pnpm --filter backend dev

# Terminal 3 — Web http://127.0.0.1:3000
pnpm --filter web dev
```

Mobile (Expo, optionnel) :

```bash
pnpm --filter mobile dev
```

### Build mobile (EAS)

Build preview interne avec l’URL API injectée via `mobile/eas.json` :

```bash
cd mobile
npm i -g eas-cli   # une fois
eas login          # une fois
eas build --profile preview --platform ios     # ou android / all
```

Pour pointer vers votre API déployée, remplacez `EXPO_PUBLIC_API_URL` dans `mobile/eas.json` ou créez un secret EAS :

```bash
eas secret:create --name EXPO_PUBLIC_API_URL --value https://api.votredomaine.com
```

Sur appareil physique en dev local : `EXPO_PUBLIC_API_URL=http://<votre-ip-lan>:4000 pnpm --filter mobile dev`.

La configuration Docker mappe le port **hôte 5433** vers le port **conteneur 5432** (port interne PostgreSQL). Dans `DATABASE_URL`, utilisez toujours le port **hôte** (`5433` par défaut) — jamais `5432` sauf si vous avez changé le mapping dans `compose.yaml`.

| Où | Port | Rôle |
| --- | --- | --- |
| Machine locale (`localhost`) | **5433** | Port à mettre dans `DATABASE_URL` (ex. `backend/.env`) |
| Conteneur Docker | **5432** | Port interne Postgres — ne pas utiliser depuis l’API hors Docker |

Exemple `backend/.env` :

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/apple_mdm_academy
```

Si aucun PostgreSQL natif n’occupe le port 5432, vous pouvez mapper `5432:5432` dans `compose.yaml` et ajuster `DATABASE_URL` en conséquence (voir commentaires dans `compose.yaml` et `backend/.env.example`). Pour arrêter la base locale :

```bash
pnpm db:down
```

Le backend écoute sur `http://localhost:4000`. Le web écoute sur [http://127.0.0.1:3000](http://127.0.0.1:3000) ; le script force ce hostname et active le polling Watchpack afin d'éviter les erreurs de découverte réseau et de watchers sur macOS. Pour tester le mobile sur appareil physique, définir `EXPO_PUBLIC_API_URL=http://<votre-ip-lan>:4000`.

Le seed crée les parcours MVP, modules, quiz, mini-jeux et données de progression nécessaires pour explorer l'application localelement.

Pour un déploiement production (Vercel, Railway/Render, Neon, EAS), voir [DEPLOYMENT.md](./DEPLOYMENT.md).

## Parcours d'apprentissage

Trois parcours seedés (3 modules × 3 unités chacun) pour couvrir le socle Apple, Jamf et Intune :

| Slug | Piste | Public cible | Certification visée |
| ---- | ----- | ------------ | --------------------- |
| `apple-cert-prep` | APPLE | Techniciens support, helpdesk Apple et débutants MDM | Apple Device Support (ACMT / fondamentaux) |
| `jamf-pro-foundations` | JAMF | Administrateurs MDM Jamf et responsables flotte Apple | Jamf Certified Admin (fondations) |
| `intune-ios-enrollment` | INTUNE | Admins Microsoft 365 / Entra et équipes endpoint hybrides | Microsoft Intune (MD-102 — partie mobile) |

| Slug | Titre | Modules |
| ---- | ----- | ------- |
| `apple-cert-prep` | Parcours Apple — Device Support & MDM | 3 |
| `jamf-pro-foundations` | Fondamentaux Jamf Pro | 3 |
| `intune-ios-enrollment` | Microsoft Intune — Enrôlement iOS/iPadOS | 3 |

## URLs


| Service | URL                                            |
| ------- | ---------------------------------------------- |
| API     | [http://localhost:4000](http://localhost:4000) |
| Web     | [http://localhost:3000](http://localhost:3000) |
| Mobile  | Expo Dev Tools (port 8081)                     |


## Web — pages MVP

| Route | Description |
| ----- | ----------- |
| `/` | Accueil MDM Academy, parcours populaires et CTA |
| `/auth` | Hero bleu, formulaire email, SSO dev (Apple, Google, Microsoft) |
| `/dashboard` | Progression, points, streak, badges, quêtes et accès rapides |
| `/courses` | Catalogue (3 parcours seedés × 3 modules chacun) |
| `/courses/:slug` | Détail parcours, statuts unité (à faire / en cours / terminé), quiz et mini-scénario |
| `/badges` | Collection de super-badges Apple, Jamf et Intune |
| `/quests` | Quêtes hebdomadaires et récompenses |
| `/leaderboard` | Classement communautaire par points |
| `/sprint` | Certification Sprint 7 ou 14 jours |
| `/pricing` | Tarifs et checkout MVP simulé |
| `/resources` | Liens vers ressources officielles |
| `/demo` | Guide de démonstration pas à pas pour testeurs |
| `/diagnostics` | Santé API, DB Prisma, catalogue et session locale |
| `/mvp` | Roadmap MVP (livré vs à venir) et checklist de revue |

Re-seed après modification du contenu : `pnpm db:seed` (depuis la racine du monorepo).

## API — routes principales


| Méthode | Route                              | Description                              |
| ------- | ---------------------------------- | ---------------------------------------- |
| GET     | `/health`                          | Santé API                                |
| GET     | `/catalog`                         | Catalogue public des parcours            |
| POST    | `/auth/register`                   | Inscription email                        |
| POST    | `/auth/login`                      | Connexion email                          |
| POST    | `/auth/refresh`                    | Rafraîchit les tokens                    |
| POST    | `/auth/logout`                     | Déconnexion (Bearer)                     |
| GET     | `/auth/me`                         | Utilisateur courant (Bearer)             |
| GET     | `/auth/:provider/start`            | Démarre OAuth dev (apple, google, microsoft) |
| GET     | `/auth/:provider/callback`         | Callback OAuth dev                       |
| GET     | `/courses`                         | Liste privée des parcours                |
| GET     | `/courses/:slug`                   | Détail parcours                          |
| GET     | `/courses/:slug/progress`          | Progression d'un parcours                |
| POST    | `/modules/:id/complete`            | Terminer module (quiz + jeu)             |
| GET     | `/users/me/progress`               | Progression globale utilisateur          |
| GET     | `/users/me/dashboard`              | Tableau de bord                          |
| GET     | `/quests/weekly`                   | Quêtes hebdomadaires de l'utilisateur    |
| POST    | `/sprints/certification/start`     | Démarre un sprint certification privé    |
| GET     | `/sprints/certification/current`   | Sprint certification actif               |
| GET     | `/leaderboard`                     | Classement privé par points              |
| POST    | `/billing/checkout`                | Checkout billing (`monthly`, `yearly`, `enterprise`; demo sans Stripe) |


### Catalogue public

Route publique sans Bearer pour alimenter les pages marketing ou web avant connexion.

```bash
curl http://localhost:4000/catalog
```

La réponse contient `courses` avec `slug`, `track`, `title`, `description` et `moduleCount`.

### Smoke test API

Quand le backend local est lancé, un smoke test sans dépendance externe vérifie rapidement `/health`, `/catalog`, l'inscription/connexion avec un email unique, puis les routes privées principales.

```bash
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm --filter backend dev
pnpm smoke:api
```

Le script cible `http://localhost:4000` par défaut. Pour tester un autre backend :

```bash
API_URL=http://127.0.0.1:4000 pnpm smoke:api
```

### Smoke test web

Quand le serveur web local est lancé, un smoke test sans navigateur vérifie rapidement les pages MVP principales : auth, dashboard, courses, badges, quests, sprint, pricing, diagnostics, mvp et demo.

```bash
pnpm --filter web dev
pnpm smoke:web
```

Le script cible `http://127.0.0.1:3000` par défaut. Pour tester une autre origine web :

```bash
WEB_URL=http://localhost:3000 pnpm smoke:web
```

### Smoke tests combinés

Pour enchaîner les smokes API puis web (fail fast : `smoke:web` n’est pas lancé si `smoke:api` échoue), avec les serveurs déjà lancés dans des terminaux séparés :

```bash
pnpm smoke:all
```

La CI valide la syntaxe de `scripts/smoke-api.mjs` et `scripts/smoke-web.mjs` avec `node --check`, mais ne lance pas `pnpm smoke:api` ni `pnpm smoke:web` car ces commandes nécessitent les serveurs locaux et la base de données.

### Certification Sprint

Route privée Bearer qui démarre un sprint de révision sur 7 ou 14 jours pour un parcours.

```bash
curl -X POST http://localhost:4000/sprints/certification/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "track": "INTUNE", "days": 14 }'
```

Le body doit contenir `track` (`APPLE`, `JAMF` ou `INTUNE`) et peut contenir `days` (`7` ou `14`, défaut `7`). Un body invalide retourne `400` avec `error: "INVALID_CERTIFICATION_SPRINT_REQUEST"` et des détails par champ.

## OAuth (développement)

En dev, le callback OAuth simule un profil utilisateur sans appeler les API fournisseurs. Pour la production (redirect URIs, variables env, dev vs prod), voir [docs/OAUTH-PRODUCTION.md](./docs/OAUTH-PRODUCTION.md).

## Tests et build

```bash
pnpm --filter backend test
pnpm --filter backend build
pnpm --filter web build
pnpm build
```

Tests E2E Playwright (web déjà lancé ou démarré automatiquement) : `pnpm --filter web test:e2e`.

**Équilibre des QCM** (longueur des distracteurs vs bonne réponse dans `shared/src/quiz-content.ts`) :

```bash
pnpm qcm:balance          # rapport stdout (+ copie /tmp si déséquilibres)
pnpm qcm:balance:check    # exit 1 si ratio > 1.4x — garde-fou CI / pre-commit
```

## Contribution

Les évolutions majeures de la branche `cursor/progress-dashboard-auth-v2` sont regroupées dans [PR #7](https://github.com/khafpro2/khafscool/pull/7) (dock accueil, gamification, mobile, QCM). Voir aussi [CHANGELOG.md](./CHANGELOG.md) et [MERGE.md](./MERGE.md).

## Contenu et ressources

Les contenus pédagogiques du MVP sont originaux et non affiliés à Apple, Jamf ou Microsoft. Les pages de ressources peuvent pointer vers les documentations officielles pour préparer les certifications et vérifier les pratiques produit.

## Propositions de thème (Cursor Canvas)

Un canvas interactif compare **trois thèmes alternatifs** au style MDM Academy actuel (`web/src/app/globals.css`) : *Nuit profonde*, *Apple Pro* et *Jamf Enterprise* (palettes, typo, aperçu header / TrailCard / badges).

**Ouvrir dans Cursor** : panneau **Canvas** (icône à côté du chat) ou clic sur le fichier :

`~/.cursor/projects/Users-khafpro-apple-mdm-academy/canvases/mdm-academy-theme-proposals.canvas.tsx`

Ce fichier est géré par l’IDE (hors dépôt git) ; le README documente son emplacement pour l’équipe.

## Prochaines étapes

Roadmap détaillée : [ROADMAP.md](./ROADMAP.md). Post-PR #6 (ne pas merger sans revue — voir [MERGE.md](./MERGE.md) et [DEPLOYMENT.md](./DEPLOYMENT.md)) :

1. **Fusion PR #6** — valider CI (build-test, integration, e2e-web), checklist [MERGE.md](./MERGE.md)
2. **Déploiement** — web sur Vercel + API sur Railway/Fly (variables `DATABASE_URL`, JWT, `NEXT_PUBLIC_API_URL`, `WEB_URL`)
3. **OAuth production** — credentials Apple / Google / Microsoft et redirect URIs prod ([guide](./docs/OAUTH-PRODUCTION.md))
4. **Certificats** — personnalisation PDF/impression et métadonnées SEO certificats
5. **Analytics (optionnel)** — consentement cookies respecté, pas de traceur tiers par défaut

Évolutions techniques ultérieures :

- SDK natifs SSO (Apple, Google, MSAL) sur mobile
- Contenus avancés Intune et modules Apple supplémentaires
- Stripe Checkout réel + webhooks (billing dormant aujourd’hui)

