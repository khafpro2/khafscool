# Déploiement rapide — Vercel + Railway + Postgres

Guide express (~30 min) pour mettre en ligne **MDM Academy Pro** : front Next.js sur Vercel, API Fastify sur Railway, base PostgreSQL managée.

> Guide détaillé : [DEPLOYMENT.md](../DEPLOYMENT.md) · OAuth prod : [OAUTH-PRODUCTION.md](./OAUTH-PRODUCTION.md) · Dons : [DONATIONS.md](./DONATIONS.md)

## Prérequis

- Compte [GitHub](https://github.com) avec accès au dépôt
- Compte [Vercel](https://vercel.com) (gratuit)
- Compte [Railway](https://railway.app) (gratuit / crédit)
- Compte [Neon](https://neon.tech) ou [Supabase](https://supabase.com) pour Postgres
- (Optionnel prod dons) Compte [Stripe](https://dashboard.stripe.com) + lien PayPal

---

## 15 étapes

### 1. Créer la base PostgreSQL

1. Créer un projet Postgres sur Neon ou Supabase.
2. Copier la **connection string** (`postgresql://…?sslmode=require`).
3. Conserver-la pour l’étape 5 — c’est `DATABASE_URL`.

### 2. Importer le dépôt sur Railway (API)

1. **New Project → Deploy from GitHub repo**.
2. Sélectionner le monorepo `apple-mdm-academy`.
3. **Root Directory** : `backend`.
4. Build : `cd .. && pnpm install --frozen-lockfile && pnpm --filter backend build`
5. Start : `node dist/index.js` (depuis `backend/`).

### 3. Variables Railway — secrets JWT

Dans **Variables** du service API :

| Variable | Valeur |
| -------- | ------ |
| `JWT_SECRET` | Chaîne aléatoire ≥ 32 caractères |
| `JWT_REFRESH_SECRET` | Autre chaîne aléatoire ≥ 32 caractères |
| `DATABASE_URL` | Connection string Neon/Supabase (étape 1) |
| `PORT` | `4000` (ou laisser Railway injecter `$PORT`) |
| `API_URL` | URL publique Railway (ex. `https://xxx.up.railway.app`) |

### 4. Variables Railway — CORS et web

| Variable | Valeur |
| -------- | ------ |
| `CORS_ORIGIN` | URL Vercel finale (étape 8), ex. `https://app.votredomaine.com` |
| `WEB_URL` | Même URL que le front Vercel (redirects Stripe `/soutenir/merci`) |

### 5. Appliquer les migrations Prisma

Dans Railway → **Settings → Deploy → Custom Start Command** ou job one-off :

```bash
cd .. && pnpm --filter backend exec prisma migrate deploy
```

Vérifier : `GET https://<api-railway>/health` → HTTP 200.

### 6. (Optionnel) Seed staging / démo

Uniquement pour un environnement de démo (jamais sur prod avec vrais utilisateurs) :

```bash
pnpm --filter backend exec prisma db seed
```

Compte démo : `demo@mdmacademy.local` / `DemoTest2026!`

### 7. Importer le dépôt sur Vercel (Web)

1. **Add New → Project** depuis GitHub.
2. **Root Directory** : `web`.
3. Framework : **Next.js** (détecté automatiquement).
4. Build : installer les deps à la racine du monorepo (voir `web/vercel.json`).

### 8. Variable Vercel — API

| Variable | Environnements | Valeur |
| -------- | -------------- | ------ |
| `NEXT_PUBLIC_API_URL` | Production + Preview | URL Railway étape 2 (sans slash final) |
| `WEB_URL` | Production | URL Vercel (ex. `https://app.votredomaine.com`) |

Déployer. Noter l’URL Vercel (`https://xxx.vercel.app`).

### 9. Finaliser CORS côté Railway

Retourner sur Railway : mettre à jour `CORS_ORIGIN` et `WEB_URL` avec l’URL Vercel réelle. Redéployer l’API si nécessaire.

### 10. Smoke test post-déploiement

```bash
curl -sf https://<api-railway>/health
WEB_URL=https://<vercel> pnpm smoke:web
```

Pages clés : `/auth`, `/courses`, `/dashboard`, `/soutenir`.

### 11. Stripe production (carte bancaire)

1. Dashboard Stripe → mode **Live**.
2. **Developers → API keys** : `STRIPE_SECRET_KEY=sk_live_…` sur Railway.
3. **Webhooks → Add endpoint** : `https://<api-railway>/donations/webhook`
   - Événement : `checkout.session.completed`
   - Copier `STRIPE_WEBHOOK_SECRET=whsec_…` sur Railway.
4. (Optionnel) Créer prix one-shot 5 € / 10 € / 20 € → `STRIPE_DONATION_PRICE_ID_5/10/20`.
5. Tester un petit don depuis `https://<vercel>/soutenir#carte`.

### 12. PayPal production

Sur Railway (API) et Vercel (web) :

| Variable | Description |
| -------- | ----------- |
| `DONATION_PAYPAL_URL` | Lien PayPal.Me ou Donate live (API `GET /donations/status`) |
| `NEXT_PUBLIC_DONATION_PAYPAL_URL` | Même lien pour `/soutenir#paypal` |

Défaut intégré : `https://www.paypal.com/paypalme/khafpro` — remplacer par votre lien prod.

### 13. Virement SEPA (optionnel)

Variables Railway + Vercel (voir [DONATIONS.md](./DONATIONS.md)) :

- `DONATION_BANK_IBAN`, `DONATION_BANK_BIC`, `DONATION_BANK_BENEFICIARY`
- `NEXT_PUBLIC_DONATION_BANK_*` pour affichage `/soutenir#virement`

### 14. OAuth SSO (optionnel)

Si Sign in with Apple / Google / Microsoft en prod, configurer les variables `*_CLIENT_ID`, secrets et `*_REDIRECT_URI` sur Railway. Voir [OAUTH-PRODUCTION.md](./OAUTH-PRODUCTION.md).

### 15. Checklist go-live

- [ ] `DATABASE_URL` Postgres managé avec SSL
- [ ] `prisma migrate deploy` exécuté
- [ ] `NEXT_PUBLIC_API_URL` (Vercel) = URL API Railway
- [ ] `CORS_ORIGIN` = domaine Vercel exact
- [ ] `/health` → 200 · smoke web OK
- [ ] Stripe live + webhook testé (ou `DONATION_URL` fallback)
- [ ] PayPal live si activé
- [ ] `bash scripts/verify-release.sh` ou CI verte

---

## Liste complète des variables d'environnement

### API (Railway) — obligatoires

| Variable | Description |
| -------- | ----------- |
| `DATABASE_URL` | PostgreSQL (`postgresql://…?sslmode=require`) |
| `JWT_SECRET` | Secret JWT accès |
| `JWT_REFRESH_SECRET` | Secret JWT refresh |
| `API_URL` | URL publique HTTPS de l’API |
| `CORS_ORIGIN` | Origine(s) Vercel autorisée(s) |
| `WEB_URL` | URL front pour redirects Stripe |

### API (Railway) — optionnelles

| Variable | Description |
| -------- | ----------- |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook (`whsec_…`) |
| `STRIPE_DONATION_PRICE_ID_5/10/20` | Price IDs preset dons |
| `DONATION_PAYPAL_URL` | Lien PayPal prod |
| `DONATION_URL` | Fallback externe si Stripe absent |
| `DONATION_BANK_*` | Coordonnées virement SEPA |
| `ADMIN_API_KEY` | Stats dons admin |
| `GOOGLE_*` / `APPLE_*` / `MICROSOFT_*` | OAuth SSO |
| `MOBILE_REDIRECT_URI` | Deep link mobile (`applemdmacademy://auth`) |

### Web (Vercel)

| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_API_URL` | URL API Railway |
| `WEB_URL` | URL canonique du site |
| `NEXT_PUBLIC_DONATION_PAYPAL_URL` | Lien PayPal `/soutenir#paypal` |
| `NEXT_PUBLIC_DONATION_BANK_*` | Overrides IBAN affiché |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email support (défaut HarmyTech) |

---

## Dépannage express

| Symptôme | Action |
| -------- | ------ |
| Web en mode démo permanent | Vérifier `NEXT_PUBLIC_API_URL` et `/health` API |
| CORS bloqué | `CORS_ORIGIN` = URL Vercel exacte, pas de wildcard |
| Erreur Prisma au boot | Relancer `prisma migrate deploy` |
| Dons CB « indisponible » | `STRIPE_SECRET_KEY` + `WEB_URL` sur Railway |
| Webhook Stripe 400 | Vérifier `STRIPE_WEBHOOK_SECRET` live vs test |
