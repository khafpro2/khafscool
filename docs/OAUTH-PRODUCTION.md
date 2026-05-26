# OAuth production — Apple, Google, Microsoft

Guide pour activer l’authentification SSO en production sur Apple MDM Academy (API Fastify + web Next.js + mobile Expo).

> **État actuel du code** : Google, Microsoft et Apple sont implémentés côté serveur (`backend/src/services/oauth.service.ts`). En développement, un provider `stub` simule un profil sans appeler les API réelles. PKCE et codes de session OAuth sont des **JWT signés** (multi-instance).

## Vue d’ensemble du flux

```text
[Web / Mobile]
    │  Clic « Continuer avec … »
    ▼
GET /auth/:provider/start?redirect=…   (API, PKCE state JWT)
    ▼
[Fournisseur OAuth] → callback API
    ▼
[API] sessionCode JWT éphémère (60 s)
    ▼
[Web] /auth/oauth-complete?sessionCode=… → POST /api/auth/oauth-exchange → cookies HttpOnly
[Mobile] applemdmacademy://auth?sessionCode=… → POST /auth/oauth/exchange → SecureStore
```

Routes API concernées :

| Méthode | Route | Rôle |
| ------- | ----- | ---- |
| GET | `/auth/apple/start` | Démarre Sign in with Apple |
| GET | `/auth/google/start` | Démarre Google OAuth |
| GET | `/auth/microsoft/start` | Démarre Microsoft Entra ID |
| GET | `/auth/:provider/callback` | Callback serveur (redirect URI enregistrée chez le fournisseur) |
| POST | `/auth/oauth/exchange` | Échange `sessionCode` → `{ accessToken, refreshToken, user }` |

## Variables d’environnement (API)

Toutes les variables OAuth sont définies côté **backend** (voir `backend/.env.example`).

| Variable | Fournisseur | Description |
| -------- | ----------- | ----------- |
| `GOOGLE_CLIENT_ID` | Google | Client ID OAuth 2.0 (Console Google Cloud) |
| `GOOGLE_CLIENT_SECRET` | Google | Secret client (type « Web application ») |
| `GOOGLE_REDIRECT_URI` | Google | URL callback API (voir ci-dessous) |
| `APPLE_CLIENT_ID` | Apple | Services ID (Sign in with Apple) |
| `APPLE_TEAM_ID` | Apple | Team ID Apple Developer |
| `APPLE_KEY_ID` | Apple | Key ID de la clé Sign in with Apple (.p8) |
| `APPLE_PRIVATE_KEY` | Apple | Contenu de la clé privée .p8 |
| `APPLE_REDIRECT_URI` | Apple | URL callback API |
| `MICROSOFT_CLIENT_ID` | Microsoft | Application (client) ID Entra |
| `MICROSOFT_CLIENT_SECRET` | Microsoft | Secret client (certificat ou secret) |
| `MICROSOFT_REDIRECT_URI` | Microsoft | URL callback API |
| `MOBILE_REDIRECT_URI` | Mobile | Deep link Expo après SSO (`applemdmacademy://auth`) |
| `API_URL` | Tous | URL publique de l’API (cohérence redirect URIs) |
| `CORS_ORIGIN` | Web | Domaine Vercel autorisé (ex. `https://app.votredomaine.com`) |

Le web n’a **pas** besoin de secrets OAuth : les boutons SSO pointent vers `{NEXT_PUBLIC_API_URL}/auth/{provider}/start`.

## Redirect URIs

Enregistrer **exactement** les mêmes URLs que dans les variables `*_REDIRECT_URI` (schéma, hôte, chemin, pas de slash final superflu).

### Développement local

| Fournisseur | Redirect URI |
| ----------- | ------------ |
| Google | `http://localhost:4000/auth/google/callback` |
| Apple | `http://localhost:4000/auth/apple/callback` |
| Microsoft | `http://localhost:4000/auth/microsoft/callback` |

Apple et Google acceptent `localhost` pour les apps de dev. Microsoft : ajouter `http://localhost:4000/auth/microsoft/callback` dans **Authentication → Redirect URIs** de l’app Entra.

### Production (exemple)

Remplacer `api.votredomaine.com` par votre domaine API réel :

| Fournisseur | Redirect URI |
| ----------- | ------------ |
| Google | `https://api.votredomaine.com/auth/google/callback` |
| Apple | `https://api.votredomaine.com/auth/apple/callback` |
| Microsoft | `https://api.votredomaine.com/auth/microsoft/callback` |

Mettre à jour en parallèle :

```bash
GOOGLE_REDIRECT_URI=https://api.votredomaine.com/auth/google/callback
APPLE_REDIRECT_URI=https://api.votredomaine.com/auth/apple/callback
MICROSOFT_REDIRECT_URI=https://api.votredomaine.com/auth/microsoft/callback
API_URL=https://api.votredomaine.com
```

## Configuration par fournisseur

### Google

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**.
2. Créer **OAuth client ID** → type **Web application**.
3. **Authorized redirect URIs** : URI de callback API (dev + prod).
4. Copier Client ID et Client Secret dans `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
5. Scopes utilisés par l’API : `openid email profile` (voir `backend/src/config/oauth.ts`).

### Apple (Sign in with Apple)

1. [Apple Developer](https://developer.apple.com/account/) → **Certificates, Identifiers & Profiles**.
2. Créer un **Services ID** (Sign in with Apple) → activer Sign in with Apple.
3. Configurer **Return URLs** = `APPLE_REDIRECT_URI` (dev et prod).
4. Créer une **Key** Sign in with Apple → noter Key ID et télécharger `.p8`.
5. Renseigner `APPLE_CLIENT_ID` (Services ID), `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`.
6. Domaine et Return URL doivent correspondre à l’hôte de l’API en production.

### Microsoft (Entra ID / Azure AD)

1. [Microsoft Entra admin center](https://entra.microsoft.com/) → **App registrations → New registration**.
2. **Redirect URI** : Web → callback API (dev + prod).
3. **Certificates & secrets** → nouveau client secret → `MICROSOFT_CLIENT_SECRET`.
4. **Application (client) ID** → `MICROSOFT_CLIENT_ID`.
5. Scopes : `openid profile email offline_access` (déjà configurés côté API).
6. Pour multi-tenant « comptes personnels + professionnels », laisser **Accounts in any organizational directory and personal Microsoft accounts**.

## Dev vs production

| Aspect | Développement | Production |
| ------ | ------------- | ---------- |
| Callback OAuth | Stub profil simulé si échange non implémenté | Échange réel code → token + validation id_token |
| Redirect URIs | `http://localhost:4000/auth/.../callback` | `https://api.<domaine>/auth/.../callback` |
| Secrets | `.env` local (jamais commités) | Variables plateforme (Railway, Render, Fly) |
| CORS | Vide ou `http://127.0.0.1:3000` | Domaine Vercel exact dans `CORS_ORIGIN` |
| Mobile | `MOBILE_REDIRECT_URI=applemdmacademy://auth` | Identique ; scheme dans `app.json` / Expo |
| Web | `NEXT_PUBLIC_API_URL=http://localhost:4000` | `NEXT_PUBLIC_API_URL=https://api.<domaine>` |

Sans credentials OAuth, les boutons SSO restent visibles sur `/auth` mais le flux échouera côté API — l’**auth email/mot de passe** reste le chemin principal en dev.

## Mobile (Expo)

Le flux mobile passe par :

```text
GET {API_URL}/auth/{provider}/start?redirect={encodeURIComponent(MOBILE_REDIRECT_URI)}
```

Après callback, l’API redirige vers le deep link avec `accessToken` et `refreshToken` en query string (`auth.controller.ts`). Vérifier que :

- `MOBILE_REDIRECT_URI` correspond au scheme Expo (`applemdmacademy://auth`).
- `EXPO_PUBLIC_API_URL` pointe vers la même API que le web en prod.

## Checklist mise en prod OAuth

- [ ] Redirect URIs enregistrées chez Google, Apple et Microsoft (dev **et** prod si besoin)
- [ ] Variables `*_CLIENT_ID`, secrets et `*_REDIRECT_URI` sur l’API staging puis prod
- [ ] `API_URL` et `CORS_ORIGIN` alignés sur Vercel + domaine API
- [ ] Échange OAuth réel implémenté (remplacer le stub `exchangeCodeAndGetProfile`)
- [ ] Test manuel : web `/auth` → chaque fournisseur → dashboard avec progression
- [ ] Test mobile : SSO depuis WelcomeScreen sur build EAS preview

Voir aussi [DEPLOYMENT.md](../DEPLOYMENT.md) et [MERGE.md](../MERGE.md).
