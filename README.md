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
| GET     | `/courses`                 | Liste des parcours                       |
| GET     | `/courses/:slug`           | Détail parcours                          |
| POST    | `/modules/:id/complete`    | Terminer module (quiz + jeu)             |
| GET     | `/users/me/dashboard`      | Tableau de bord                          |
| GET     | `/quests/weekly`           | Quêtes hebdomadaires de l'utilisateur    |
| GET     | `/leaderboard`             | Classement privé par points              |
| POST    | `/billing/checkout`        | Checkout Stripe (stub)                   |


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

