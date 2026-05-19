# Apple MDM Academy

Plateforme de formation gamifiée pour techniciens Apple et administrateurs MDM (parcours Apple, Jamf Pro, Intune).

> **Non affilié** à Apple Inc., Jamf ou Microsoft. Contenus pédagogiques originaux.

## Stack


| Package    | Technologie                   |
| ---------- | ----------------------------- |
| `shared/`  | Types & enums TypeScript      |
| `backend/` | Fastify + Prisma + PostgreSQL |
| `mobile/`  | Expo (React Native)           |
| `web/`     | Next.js 15                    |


## Prérequis

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+ ou Docker pour lancer PostgreSQL localement

## Démarrage rapide

**Première fois** (base + dépendances) :

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

La configuration Docker démarre PostgreSQL 16 sur `localhost:5432` avec la base `apple_mdm_academy` et l'utilisateur `postgres` / `postgres`, ce qui correspond au `DATABASE_URL` de `.env.example`. Pour arrêter la base locale :

```bash
pnpm db:down
```

Le backend écoute sur `http://localhost:4000`. Le web écoute sur [http://127.0.0.1:3000](http://127.0.0.1:3000) ; le script force ce hostname et active le polling Watchpack afin d'éviter les erreurs de découverte réseau et de watchers sur macOS. Pour tester le mobile sur appareil physique, définir `EXPO_PUBLIC_API_URL=http://<votre-ip-lan>:4000`.

Le seed crée les parcours MVP, modules, quiz, mini-jeux et données de progression nécessaires pour explorer l'application localement.

Parcours seedés :

| Slug | Piste | Titre | Modules |
| ---- | ----- | ----- | ------- |
| `apple-cert-prep` | APPLE | Parcours Apple — Device Support & MDM | 3 |
| `jamf-pro-foundations` | JAMF | Fondamentaux Jamf Pro | 3 |
| `intune-ios-enrollment` | INTUNE | Microsoft Intune — Enrôlement iOS/iPadOS | 3 |

## URLs


| Service | URL                                            |
| ------- | ---------------------------------------------- |
| API     | [http://localhost:4000](http://localhost:4000) |
| Web     | [http://localhost:3000](http://localhost:3000) |
| Mobile  | Expo Dev Tools (port 8081)                     |


## Web — pages MVP

| Route | Description |
| ----- | ----------- |
| `/` | Accueil Trailhead, parcours populaires et CTA |
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

Parcours seedés (3 modules chacun) : `apple-cert-prep`, `jamf-pro-foundations`, `intune-ios-enrollment`.

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

En dev, le callback OAuth simule un profil utilisateur sans appeler les API fournisseurs. Configurez les variables `*_CLIENT_ID` pour la production.

## Tests et build

```bash
pnpm --filter backend test
pnpm --filter backend build
pnpm --filter web build
pnpm build
```

## Contenu et ressources

Les contenus pédagogiques du MVP sont originaux et non affiliés à Apple, Jamf ou Microsoft. Les pages de ressources peuvent pointer vers les documentations officielles pour préparer les certifications et vérifier les pratiques produit.

## Prochaines étapes

- Brancher SDK natifs SSO (Apple, Google, MSAL)
- Contenus avancés Intune et modules Apple supplémentaires
- Stripe Checkout réel + webhooks
- Finaliser l'expérience mobile complète

