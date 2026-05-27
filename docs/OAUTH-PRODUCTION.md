# OAuth production — Apple, Google, Microsoft

Guide pour activer l’authentification SSO en production sur Apple MDM Academy (API Fastify sur **Railway** + web Next.js sur **Vercel** + mobile Expo).

> **État du code** : Google, Microsoft et Apple sont implémentés côté serveur (`backend/src/services/oauth.service.ts`). Sans credentials, chaque fournisseur est en statut **`stub`** : en **développement** l’API simule un profil ; en **production** le démarrage SSO est refusé (`503 OAUTH_UNAVAILABLE`). PKCE et codes de session OAuth sont des **JWT signés** (multi-instance).

## Ce que tu vois à l’écran

| Écran | Source | Signification |
| ----- | ------ | ------------- |
| `/diagnostics` → carte **OAuth** | `GET /auth/oauth/status` | Badge par fournisseur : **Configuré**, **Stub (dev)** ou **Désactivé** |
| `/auth` → colonne **Connexion rapide** | Même endpoint (chargé au montage) | Boutons actifs seulement si le fournisseur est utilisable |
| `curl …/auth/oauth/status` | API Railway | JSON : `google`, `apple`, `microsoft`, `environment` |

### Les trois statuts

| Statut | Condition | Comportement |
| ------ | --------- | -------------- |
| **configured** | Variables complètes sur Railway (voir tableaux ci-dessous) | Redirection vers le fournisseur, échange réel du code, création/liaison compte |
| **stub** | Credentials absents | **Dev** : profil fictif (`utilisateur@oauth.dev`). **Prod** : bouton SSO → erreur 503 |
| **disabled** | `*_OAUTH_DISABLED=true` ou `OAUTH_DISABLED=true` | Fournisseur volontairement coupé |

Vérifier en prod :

```bash
curl -s https://apple-mdm-academy-api-production.up.railway.app/auth/oauth/status | jq
```

Exemple sans OAuth configuré :

```json
{
  "google": "stub",
  "apple": "stub",
  "microsoft": "stub",
  "environment": "production"
}
```

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

Routes API :

| Méthode | Route | Rôle |
| ------- | ----- | ---- |
| GET | `/auth/oauth/status` | Lecture seule — statut par fournisseur + `environment` |
| GET | `/auth/apple/start` | Démarre Sign in with Apple |
| GET | `/auth/google/start` | Démarre Google OAuth |
| GET | `/auth/microsoft/start` | Démarre Microsoft Entra ID |
| GET | `/auth/:provider/callback` | Callback serveur (redirect URI enregistrée chez le fournisseur) |
| POST | `/auth/oauth/exchange` | Échange `sessionCode` → `{ accessToken, refreshToken, user }` |

---

## Variables d’environnement : où les mettre ?

### Railway (API) — secrets OAuth + redirects

Toutes les variables `GOOGLE_*`, `APPLE_*`, `MICROSOFT_*`, `API_URL`, `WEB_URL`, `CORS_ORIGIN`, `MOBILE_REDIRECT_URI` sont sur le **service API** Railway. Voir `backend/.env.example`.

| Variable | Obligatoire SSO | Exemple production (ce dépôt) |
| -------- | --------------- | ------------------------------ |
| `NODE_ENV` | Oui | `production` |
| `API_URL` | Oui (redirects cohérents) | `https://apple-mdm-academy-api-production.up.railway.app` |
| `WEB_URL` | Recommandé (retour web après SSO) | `https://apple-mdm-academy.vercel.app` |
| `CORS_ORIGIN` | Oui | `https://apple-mdm-academy.vercel.app` |
| `MOBILE_REDIRECT_URI` | Mobile | `applemdmacademy://auth` |
| `GOOGLE_CLIENT_ID` | Google | *(Console Google Cloud)* |
| `GOOGLE_CLIENT_SECRET` | Google | *(secret client)* |
| `GOOGLE_REDIRECT_URI` | Google | `https://apple-mdm-academy-api-production.up.railway.app/auth/google/callback` |
| `APPLE_CLIENT_ID` | Apple | Services ID |
| `APPLE_TEAM_ID` | Apple | Team ID |
| `APPLE_KEY_ID` | Apple | Key ID (.p8) |
| `APPLE_PRIVATE_KEY` | Apple | Contenu clé .p8 |
| `APPLE_REDIRECT_URI` | Apple | `https://apple-mdm-academy-api-production.up.railway.app/auth/apple/callback` |
| `MICROSOFT_CLIENT_ID` | Microsoft | Application (client) ID |
| `MICROSOFT_CLIENT_SECRET` | Microsoft | Secret client |
| `MICROSOFT_REDIRECT_URI` | Microsoft | `https://apple-mdm-academy-api-production.up.railway.app/auth/microsoft/callback` |

Désactiver un fournisseur sans retirer les secrets : `GOOGLE_OAUTH_DISABLED=true` (idem `APPLE_`, `MICROSOFT_`) ou `OAUTH_DISABLED=true`.

### Vercel (web) — pas de secrets OAuth

| Variable | Environnements | Valeur |
| -------- | -------------- | ------ |
| `NEXT_PUBLIC_API_URL` | Production, Preview | `https://apple-mdm-academy-api-production.up.railway.app` |
| `WEB_URL` | Production (recommandé) | `https://apple-mdm-academy.vercel.app` |

Les boutons sur `/auth` pointent vers `{NEXT_PUBLIC_API_URL}/auth/{provider}/start`. **Ne jamais** mettre `GOOGLE_CLIENT_SECRET` sur Vercel.

---

## Redirect URIs (enregistrer chez chaque fournisseur)

URLs **exactes** (schéma, hôte, chemin — pas de slash final en trop).

### Production — Apple MDM Academy

| Fournisseur | Redirect URI à enregistrer |
| ----------- | --------------------------- |
| Google | `https://apple-mdm-academy-api-production.up.railway.app/auth/google/callback` |
| Apple | `https://apple-mdm-academy-api-production.up.railway.app/auth/apple/callback` |
| Microsoft | `https://apple-mdm-academy-api-production.up.railway.app/auth/microsoft/callback` |

Sur Railway, en parallèle :

```bash
railway variables set API_URL='https://apple-mdm-academy-api-production.up.railway.app'
railway variables set GOOGLE_REDIRECT_URI='https://apple-mdm-academy-api-production.up.railway.app/auth/google/callback'
railway variables set APPLE_REDIRECT_URI='https://apple-mdm-academy-api-production.up.railway.app/auth/apple/callback'
railway variables set MICROSOFT_REDIRECT_URI='https://apple-mdm-academy-api-production.up.railway.app/auth/microsoft/callback'
```

### Développement local

| Fournisseur | Redirect URI |
| ----------- | -------------- |
| Google | `http://localhost:4000/auth/google/callback` |
| Apple | `http://localhost:4000/auth/apple/callback` |
| Microsoft | `http://localhost:4000/auth/microsoft/callback` |

---

## Mise en prod Google (étape par étape — le plus simple)

Objectif : passer `google` de `stub` à `configured` sur `/auth/oauth/status`.

### 1. Google Cloud Console

1. Ouvrir [Google Cloud Console](https://console.cloud.google.com/) → projet (ou en créer un).
2. **APIs & Services → OAuth consent screen** : type **External**, renseigner nom d’app et email support, ajouter les scopes `openid`, `email`, `profile` si demandé.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
4. Type d’application : **Web application**.
5. **Authorized redirect URIs** — ajouter **les deux** si tu testes local + prod :
   - `http://localhost:4000/auth/google/callback`
   - `https://apple-mdm-academy-api-production.up.railway.app/auth/google/callback`
6. Copier **Client ID** et **Client secret**.

### 2. Railway

Dans le service API (dashboard ou CLI) :

```bash
railway variables set GOOGLE_CLIENT_ID='VOTRE_CLIENT_ID.apps.googleusercontent.com'
railway variables set GOOGLE_CLIENT_SECRET='VOTRE_SECRET'
railway variables set GOOGLE_REDIRECT_URI='https://apple-mdm-academy-api-production.up.railway.app/auth/google/callback'
```

Vérifier aussi (si pas déjà fait) :

```bash
railway variables set API_URL='https://apple-mdm-academy-api-production.up.railway.app'
railway variables set WEB_URL='https://apple-mdm-academy.vercel.app'
railway variables set CORS_ORIGIN='https://apple-mdm-academy.vercel.app'
```

Redéployer le service API après modification des variables.

### 3. Vercel

Production :

- `NEXT_PUBLIC_API_URL` = `https://apple-mdm-academy-api-production.up.railway.app`
- `WEB_URL` = `https://apple-mdm-academy.vercel.app`

Redéployer le site après changement de `NEXT_PUBLIC_*`.

### 4. Vérification

```bash
curl -s https://apple-mdm-academy-api-production.up.railway.app/auth/oauth/status
# attendu : "google": "configured", "environment": "production"
```

Puis navigateur :

1. `https://apple-mdm-academy.vercel.app/auth`
2. **Continuer avec Google** → consentement Google → retour dashboard avec session.

En cas d’erreur : `/diagnostics` (carte OAuth) et logs Railway du service API.

---

## Apple (Sign in with Apple)

1. [Apple Developer](https://developer.apple.com/account/) → **Certificates, Identifiers & Profiles**.
2. **Services ID** avec Sign in with Apple → **Return URLs** = `APPLE_REDIRECT_URI` (dev + prod).
3. **Key** Sign in with Apple → Key ID + fichier `.p8`.
4. Railway : `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` (clé sur une ligne avec `\n` si l’UI l’exige).

Scopes API : `name email`.

---

## Microsoft (Entra ID)

1. [Microsoft Entra admin center](https://entra.microsoft.com/) → **App registrations → New registration**.
2. Redirect URI **Web** : URLs de callback API (dev + prod).
3. **Certificates & secrets** → client secret → `MICROSOFT_CLIENT_SECRET`.
4. **Application (client) ID** → `MICROSOFT_CLIENT_ID`.
5. Comptes : **Accounts in any organizational directory and personal Microsoft accounts** pour particuliers + pro.

Scopes API : `openid profile email offline_access`.

---

## Dev vs production (résumé)

| Aspect | Développement (`NODE_ENV` ≠ production) | Production (Railway) |
| ------ | ---------------------------------------- | --------------------- |
| Statut sans credentials | `stub` | `stub` (mais `/start` → 503) |
| Échange code | Stub local ou réel si credentials présents | Réel uniquement si `configured` |
| Redirect URIs | `http://localhost:4000/auth/.../callback` | URL Railway `https://…/auth/.../callback` |
| Secrets | `backend/.env` local (jamais commités) | Variables Railway |
| Web | `NEXT_PUBLIC_API_URL=http://localhost:4000` | URL Railway publique |

Sans OAuth, l’**auth email/mot de passe** reste disponible (compte démo : `demo@mdmacademy.local` / `DemoTest2026!`).

---

## Mobile (Expo)

```text
GET {API_URL}/auth/{provider}/start?redirect={encodeURIComponent(MOBILE_REDIRECT_URI)}
```

- `MOBILE_REDIRECT_URI=applemdmacademy://auth`
- `EXPO_PUBLIC_API_URL` = même API que le web en prod.

---

## Checklist mise en prod OAuth

- [ ] Redirect URIs enregistrées chez Google, Apple et Microsoft (dev **et** prod si besoin)
- [ ] Variables `*_CLIENT_ID`, secrets et `*_REDIRECT_URI` sur Railway
- [ ] `API_URL`, `WEB_URL`, `CORS_ORIGIN` alignés Vercel + Railway
- [ ] `NEXT_PUBLIC_API_URL` sur Vercel (redeploy)
- [ ] `curl …/auth/oauth/status` → au moins un `configured` en prod
- [ ] Test web : `/auth` → fournisseur → dashboard
- [ ] Test mobile : SSO depuis l’app (build EAS)

Voir aussi [DEPLOY-RAILWAY.md](./DEPLOY-RAILWAY.md), [VERCEL-WEB.md](./VERCEL-WEB.md), [DEPLOYMENT.md](../DEPLOYMENT.md).
