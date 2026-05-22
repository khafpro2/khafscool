# Dons volontaires — configuration Stripe et fallback

MDM Academy Pro reste **100 % gratuit**. Les dons sont optionnels et servent uniquement à soutenir l’hébergement et la maintenance.

## Variables d’environnement

| Variable | Obligatoire | Description |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Non | Clé secrète Stripe (`sk_test_…` ou `sk_live_…`). Sans clé : mode fallback ou « Bientôt disponible ». |
| `STRIPE_WEBHOOK_SECRET` | Non | Secret du webhook (`whsec_…`) pour enregistrer les dons confirmés. |
| `STRIPE_DONATION_PRICE_ID_5` | Non | Price ID Stripe pour 5 € (sinon `price_data` dynamique). |
| `STRIPE_DONATION_PRICE_ID_10` | Non | Price ID Stripe pour 10 €. |
| `STRIPE_DONATION_PRICE_ID_20` | Non | Price ID Stripe pour 20 €. |
| `DONATION_URL` | Non | Lien externe (Buy Me a Coffee, PayPal, etc.) si Stripe n’est pas configuré. |
| `WEB_URL` | Oui (prod) | URL du front pour les redirections success/cancel (`/soutenir`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Non | Clé publique (`pk_test_…`) — réservée à une future intégration Elements ; Checkout redirect n’en a pas besoin. |

Copier les valeurs depuis `.env.example` à la racine du monorepo.

## API

| Route | Auth | Rôle |
| --- | --- | --- |
| `GET /donations/status` | Non | Mode `live` / `fallback` / `unavailable` + montants suggérés |
| `POST /donations/create-checkout-session` | Optionnelle | Crée une session Stripe Checkout (`{ amountCents }`) |
| `POST /donations/webhook` | Signature Stripe | Alias de `/billing/webhook` — enregistre les dons |

Corps checkout :

```json
{ "amountCents": 1000 }
```

Montants suggérés : `500`, `1000`, `2000` (5 €, 10 €, 20 €). Montant libre : entre `100` et `100000` centimes.

## Stripe Dashboard (local)

1. Créer un compte [Stripe](https://dashboard.stripe.com/) et activer le mode **Test**.
2. **Developers → API keys** : copier `Secret key` → `STRIPE_SECRET_KEY`.
3. (Optionnel) **Products** : créer un produit « Don MDM Academy » avec des prix one-shot 5 € / 10 € / 20 €, puis renseigner `STRIPE_DONATION_PRICE_ID_*`. Sinon, l’API utilise `price_data` automatiquement.
4. **Developers → Webhooks → Add endpoint** :
   - URL locale via [Stripe CLI](https://stripe.com/docs/stripe-cli) :
     ```bash
     stripe listen --forward-to localhost:4000/donations/webhook
     ```
   - Copier le `whsec_…` affiché → `STRIPE_WEBHOOK_SECRET`.
   - Événement minimum : `checkout.session.completed`.
5. Démarrer la stack :
   ```bash
   pnpm db:up && pnpm db:migrate
   pnpm dev:stack
   ```
6. Ouvrir [http://127.0.0.1:3000/soutenir](http://127.0.0.1:3000/soutenir), choisir un montant, payer avec une carte test (`4242 4242 4242 4242`).

## Fallback sans Stripe

Si `STRIPE_SECRET_KEY` est vide mais `DONATION_URL` est renseigné, le web et le mobile redirigent vers ce lien externe. Exemple :

```env
DONATION_URL=https://buymeacoffee.com/votre-page
```

## Base de données

Le webhook crée une ligne dans la table `Donation` :

- `amountCents`, `currency`, `email` (optionnel), `userId` (optionnel), `stripeSessionId` (unique)

Migration : `20260522120000_add_donations`.

## Pages

- Web : `/soutenir` — cartes montants + Stripe Checkout ou lien externe
- Footer et `/about` : lien « Faire un don » / « Soutenir le projet »
- Mobile : profil et à propos → ouverture de `/soutenir` dans le navigateur

## Tests

```bash
pnpm --filter backend test -- donations
pnpm --filter web test:e2e -- soutenir
```
