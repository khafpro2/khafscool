# Dons volontaires — configuration Stripe (carte bancaire) et fallback

MDM Academy Pro reste **100 % gratuit**. Les dons sont optionnels et servent uniquement à soutenir l’hébergement et la maintenance.

## Paiement par carte bancaire (Stripe Checkout)

La page `/soutenir#carte` propose en priorité un **don par carte** (Visa, Mastercard, Amex, etc.) via **Stripe Checkout** :

- Montants rapides **5 € / 10 € / 20 €** ou montant libre (1 € – 1 000 €)
- Mode **`payment`** (don unique) — **pas d’abonnement**
- `payment_method_types: ['card']` côté API
- Redirection success → `/soutenir/merci` ; annulation → `/soutenir/annule`
- Webhook `checkout.session.completed` → enregistrement en base (`Donation`)

Sans `STRIPE_SECRET_KEY`, la section affiche un message explicite (pas de fausse promesse CB) et renvoie vers ce guide.

## Variables d’environnement

| Variable | Obligatoire | Description |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Non | Clé secrète Stripe (`sk_test_…` ou `sk_live_…`). Sans clé : mode fallback ou « Bientôt disponible ». |
| `STRIPE_WEBHOOK_SECRET` | Non | Secret du webhook (`whsec_…`) pour enregistrer les dons confirmés. |
| `STRIPE_DONATION_PRICE_ID_5` | Non | Price ID Stripe pour 5 € (sinon `price_data` dynamique). |
| `STRIPE_DONATION_PRICE_ID_10` | Non | Price ID Stripe pour 10 €. |
| `STRIPE_DONATION_PRICE_ID_20` | Non | Price ID Stripe pour 20 €. |
| `DONATION_URL` | Non | Lien externe (Buy Me a Coffee, etc.) si Stripe n’est pas configuré. |
| `DONATION_PAYPAL_URL` | Non | Lien PayPal Donate ou PayPal.Me (backend `GET /donations/status`). Défaut : `https://www.paypal.com/paypalme/khafpro`. |
| `NEXT_PUBLIC_DONATION_PAYPAL_URL` | Non | Même lien côté web (`/soutenir#paypal`). Prioritaire sur le défaut intégré. |
| `EXPO_PUBLIC_DONATION_PAYPAL_URL` | Non | Lien PayPal sur l’écran À propos (mobile). Défaut : PayPal.Me khafpro. |
| `DONATION_BANK_BENEFICIARY` | Non | Bénéficiaire du virement SEPA (défaut : Khalifa Thiam). |
| `DONATION_BANK_IBAN` | Non | IBAN sans espaces (défaut : compte Revolut HarmyTech). |
| `DONATION_BANK_BIC` | Non | BIC/SWIFT (défaut : `REVOFRP2`). |
| `DONATION_BANK_NAME` | Non | Nom de la banque (défaut : Revolut Bank UAB). |
| `DONATION_BANK_ADDRESS` | Non | Adresse de la banque. |
| `DONATION_BANK_CORRESPONDENT_BIC` | Non | BIC banque correspondante (défaut : `CHASDEFX`). |
| `DONATION_BANK_REFERENCE` | Non | Libellé suggéré (défaut : `Soutien MDM Academy`). |
| `NEXT_PUBLIC_DONATION_BANK_*` | Non | Overrides côté web (client `/soutenir`). |
| `EXPO_PUBLIC_DONATION_BANK_*` | Non | Overrides côté mobile (carte virement À propos). |
| `ADMIN_API_KEY` | Non | Clé pour `GET /admin/donations/stats` et `GET /admin/donations/export.csv` (en-tête `X-Admin-Api-Key`). Sans clé : 503. |
| `WEB_URL` | Oui (prod) | URL du front pour les redirections success/cancel (`/soutenir`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Non | Clé publique (`pk_test_…`) — réservée à une future intégration Elements ; Checkout redirect n’en a pas besoin. |

Copier les valeurs depuis `.env.example` à la racine du monorepo.

## API

| Route | Auth | Rôle |
| --- | --- | --- |
| `GET /donations/status` | Non | Mode `live` / `fallback` / `unavailable` + montants suggérés + `paypal.status` |
| `POST /donations/create-checkout-session` | Optionnelle | Crée une session Stripe Checkout (`{ amountCents }`) |
| `GET /admin/donations/stats` | `X-Admin-Api-Key` | Agrégats lecture seule : nombre de dons, total centimes, dernière date |
| `GET /admin/donations/export.csv` | `X-Admin-Api-Key` | Export CSV de tous les dons (id, montant, email, userId, session Stripe, date) |
| `POST /donations/webhook` | Signature Stripe | Alias de `/billing/webhook` — enregistre les dons |

Corps checkout :

```json
{ "amountCents": 1000 }
```

Montants suggérés : `500`, `1000`, `2000` (5 €, 10 €, 20 €). Montant libre : entre `100` et `100000` centimes.

## Stripe Dashboard (local — carte test)

1. Créer un compte [Stripe](https://dashboard.stripe.com/) et activer le mode **Test**.
2. **Developers → API keys** : copier `Secret key` → `STRIPE_SECRET_KEY` (backend `.env` ou racine).
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
6. Ouvrir [http://127.0.0.1:3000/soutenir#carte](http://127.0.0.1:3000/soutenir#carte), choisir un montant, cliquer **Payer … par carte**.
7. Sur Stripe Checkout (mode test), payer avec une **carte test** :
   - Numéro : `4242 4242 4242 4242`
   - Date : une date future quelconque (ex. `12/34`)
   - CVC : `123` (ou tout CVC à 3 chiffres)
   - Code postal : `75001` (ou tout code valide)

## Stripe Dashboard (production — carte live)

1. Basculer le dashboard Stripe en mode **Live**.
2. Remplacer `STRIPE_SECRET_KEY` par la clé **`sk_live_…`** (backend + hébergeur).
3. Créer un endpoint webhook **live** pointant vers `https://votre-api.example.com/donations/webhook` (ou `/billing/webhook`).
4. Mettre à jour `STRIPE_WEBHOOK_SECRET` avec le secret **live** (`whsec_…`).
5. Vérifier `WEB_URL=https://votre-domaine.fr` pour les redirections `/soutenir/merci` et `/soutenir/annule`.
6. Tester un petit montant réel depuis `/soutenir#carte` avant communication publique.

## PayPal (don volontaire)

En complément de Stripe et du virement SEPA, la page `/soutenir#paypal` propose un **don via PayPal** (montant libre sur la page PayPal).

**Lien par défaut** (comme l’IBAN Revolut HarmyTech) : [paypal.me/khafpro](https://www.paypal.com/paypalme/khafpro). Référence optionnelle suggérée : « MDM Academy ».

### Créer ou remplacer le lien

1. **PayPal Donate (bouton hébergé)** — [PayPal Donations](https://www.paypal.com/fr/business/tools/donate-button) :
   - Créer un bouton « Don » pour votre association ou activité.
   - Copier l’URL générée, par ex. `https://www.paypal.com/donate/?hosted_button_id=XXXXXXXX`.
2. **PayPal.Me** — [paypal.me](https://www.paypal.me/) :
   - Créer votre page personnelle, ex. `https://paypal.me/votreNom`.

### Variables d’environnement

Sans override, le dépôt utilise `DEFAULT_DONATION_PAYPAL_URL` dans `@ama/shared/donation-methods` :

```env
# Valeur par défaut intégrée (override optionnel)
# https://www.paypal.com/paypalme/khafpro

# Backend (statut API)
DONATION_PAYPAL_URL=

# Web — affichage /soutenir#paypal (recommandé en production Vercel)
NEXT_PUBLIC_DONATION_PAYPAL_URL=

# Mobile — écran À propos
EXPO_PUBLIC_DONATION_PAYPAL_URL=
```

Pour remplacer le lien par défaut, renseigner l’une de ces variables. L’URL doit être `https` avec un domaine `paypal.com` ou `paypal.me`.

L’API `GET /donations/status` expose `paypal.status` : `configured` (défaut) ou `unavailable` si l’override est invalide.

## Fallback sans Stripe

Si `STRIPE_SECRET_KEY` est vide mais `DONATION_URL` est renseigné, le web et le mobile redirigent vers ce lien externe. Exemple :

```env
DONATION_URL=https://buymeacoffee.com/votre-page
```

## Virement bancaire (SEPA)

En complément de Stripe et du lien externe, la page `/soutenir#virement` affiche les coordonnées bancaires publiques pour un don volontaire par virement. Les valeurs par défaut pointent vers le compte Revolut HarmyTech (Khalifa Thiam) :

| Champ | Valeur par défaut |
| --- | --- |
| Bénéficiaire | Khalifa Thiam |
| IBAN | FR76 2823 3000 0193 2563 3272 239 |
| BIC/SWIFT | REVOFRP2 |
| Banque | Revolut Bank UAB, 10 avenue Kléber, 75116 Paris |
| Banque correspondante BIC | CHASDEFX |
| Référence libre | Soutien MDM Academy |

Pour remplacer ces coordonnées (autre compte, autre entité), renseigner les variables `DONATION_BANK_*` et leurs variantes `NEXT_PUBLIC_` / `EXPO_PUBLIC_` dans `.env.example`. L’IBAN est une donnée publique volontairement affichée — aucun secret Stripe n’est stocké dans le dépôt.

Contact reçu ou questions : `KTHIAM@HARMYTECH.COM` (voir `CONTACT_EMAIL`).

## Statistiques admin (lecture seule)

Endpoint protégé pour le suivi interne (pas d’UI admin dans le MVP) :

```bash
curl -s -H "X-Admin-Api-Key: $ADMIN_API_KEY" \
  http://localhost:4000/admin/donations/stats
```

Export CSV complet :

```bash
curl -s -H "X-Admin-Api-Key: $ADMIN_API_KEY" \
  -o donations-export.csv \
  http://localhost:4000/admin/donations/export.csv
```

Réponse exemple :

```json
{
  "totalCount": 12,
  "totalAmountCents": 18500,
  "currency": "eur",
  "lastDonationAt": "2026-05-22T14:30:00.000Z"
}
```

Sans `ADMIN_API_KEY` configurée, l’API renvoie `503 ADMIN_API_DISABLED`. Clé incorrecte → `401 ADMIN_API_UNAUTHORIZED`.

## Notifications email (stub)

Après un webhook Stripe `checkout.session.completed` validé pour un don (`metadata.type === 'donation'`), le backend enregistre la ligne `Donation` puis émet un **log stub** :

```
[donation] payment confirmed — email notification stub { stripeSessionId, amountCents, currency, email, userId }
```

Aucun envoi SendGrid (ou autre) n’est requis pour l’instant — la fonction `logDonationConfirmation` dans `donations-webhook.service.ts` sert de point d’extension pour brancher un provider email plus tard.

## Base de données

Le webhook crée une ligne dans la table `Donation` :

- `amountCents`, `currency`, `email` (optionnel), `userId` (optionnel), `stripeSessionId` (unique)

Migration : `20260522120000_add_donations`.

## Pages

- Web : `/soutenir` — **carte bancaire** (`#carte`, Stripe Checkout) + **PayPal** (`#paypal`) + **virement bancaire** (`#virement`)
- Footer et `/about` : lien « Faire un don » / « Soutenir le projet »
- Mobile : profil et à propos → carte **Carte bancaire** (redirect `/soutenir#carte`) + carte **PayPal** + carte virement native ; lien `/soutenir#virement`

## Tests

```bash
pnpm --filter backend test -- donation-bank
pnpm --filter backend test -- donations
pnpm --filter web test:e2e -- soutenir
```
