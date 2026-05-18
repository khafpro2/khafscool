# Apple MDM Academy

Plateforme de formation gamifiée pour techniciens Apple et administrateurs MDM (parcours Apple, Jamf Pro, Intune, ServiceNow).

> **Non affilié** à Apple Inc., Jamf, Microsoft ou ServiceNow. Contenus pédagogiques originaux.

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
- PostgreSQL 15+

## Installation

```bash
cd apple-mdm-academy
cp .env.example .env
# Éditer DATABASE_URL et les secrets JWT

pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Pour lancer uniquement le web en développement :

```bash
pnpm --filter web dev
```

Le serveur web écoute sur [http://127.0.0.1:3000](http://127.0.0.1:3000). Le script force ce hostname et active le polling Watchpack afin d'éviter les erreurs de découverte réseau et de watchers sur macOS.

## URLs


| Service | URL                                            |
| ------- | ---------------------------------------------- |
| API     | [http://localhost:4000](http://localhost:4000) |
| Web     | [http://localhost:3000](http://localhost:3000) |
| Mobile  | Expo Dev Tools (port 8081)                     |


## API — routes principales


| Méthode | Route                      | Description                              |
| ------- | -------------------------- | ---------------------------------------- |
| GET     | `/auth/:provider/start`    | Démarre OAuth (apple, google, microsoft) |
| GET     | `/auth/:provider/callback` | Callback OAuth                           |
| POST    | `/auth/register`           | Inscription email                        |
| POST    | `/auth/login`              | Connexion email                          |
| GET     | `/auth/me`                 | Utilisateur courant (Bearer)             |
| GET     | `/catalog`                 | Catalogue public des parcours            |
| GET     | `/courses`                 | Liste des parcours                       |
| GET     | `/courses/:slug`           | Détail parcours                          |
| POST    | `/modules/:id/complete`    | Terminer module (quiz + jeu)             |
| GET     | `/users/me/dashboard`      | Tableau de bord                          |
| GET     | `/quests/weekly`           | Quêtes hebdomadaires de l'utilisateur    |
| POST    | `/sprints/certification/start` | Démarre un sprint certification privé |
| GET     | `/leaderboard`             | Classement privé par points              |
| POST    | `/servicenow/ticket-score` | Scoring pédagogique d'un ticket          |
| POST    | `/billing/checkout`        | Checkout Stripe (stub)                   |


### Catalogue public

Route publique sans Bearer pour alimenter les pages marketing ou web avant connexion.

```bash
curl http://localhost:4000/catalog
```

La réponse contient `courses` avec `slug`, `track`, `title`, `description` et `moduleCount`.

### Mini-jeu ServiceNow — ticket scoring

Route privée Bearer qui évalue un ticket ServiceNow simulé sans écrire en base.

```bash
curl -X POST http://localhost:4000/servicenow/ticket-score \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "shortDescription": "MacBook bloqué après enrôlement MDM",
    "category": "incident",
    "priority": "P2",
    "resolutionNote": "Diagnostic réalisé avec vérification du profil MDM. Cause identifiée côté certificat, solution appliquée puis validée avec utilisateur."
  }'
```

La réponse contient `score` sur 100, `feedback` en français et `suggestions` d'amélioration.

### Certification Sprint

Route privée Bearer qui démarre un sprint de révision sur 7 ou 14 jours pour un parcours.

```bash
curl -X POST http://localhost:4000/sprints/certification/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "track": "INTUNE", "days": 14 }'
```

Le body doit contenir `track` (`APPLE`, `JAMF`, `INTUNE` ou `SERVICENOW`) et peut contenir `days` (`7` ou `14`, défaut `7`). Un body invalide retourne `400` avec `error: "INVALID_CERTIFICATION_SPRINT_REQUEST"` et des détails par champ.

## OAuth (développement)

En dev, le callback OAuth simule un profil utilisateur sans appeler les API fournisseurs. Configurez les variables `*_CLIENT_ID` pour la production.

## Mobile

```bash
pnpm --filter mobile dev
```

Définir `EXPO_PUBLIC_API_URL=http://<votre-ip-lan>:4000` pour tester sur appareil physique.

## Prochaines étapes

- Brancher SDK natifs SSO (Apple, Google, MSAL)
- Parcours Jamf et contenus avancés Intune/ServiceNow
- Stripe Checkout réel + webhooks
- Certification Sprint (7–14 jours)

