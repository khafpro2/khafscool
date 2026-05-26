# Base PostgreSQL — Neon (production)

Apple MDM Academy utilise **Neon** comme base PostgreSQL managée pour l’API (hébergée sur **Railway**). Render (legacy) utilise la même `DATABASE_URL` Neon.

> Ne **jamais** committer `.env`, `.env.local`, ni une vraie `DATABASE_URL` dans le dépôt.

---

## 1. Créer un projet Neon

1. Ouvrir [neon.tech](https://neon.tech) et se connecter (GitHub ou email).
2. **New Project** → choisir une région proche des utilisateurs (ex. `eu-central-1` pour l’Europe).
3. Noter le nom de la base par défaut (souvent `neondb`).

---

## 2. Copier la connection string

Dans le dashboard Neon :

1. **Dashboard** → projet → **Connect**.
2. Choisir **Connection string** (pas seulement « Pooled » pour la première config — voir § Pooling ci-dessous).
3. Copier l’URL au format :

```text
postgresql://USER:PASSWORD@ep-XXXXXXXX.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Obligatoire** : le paramètre `sslmode=require` doit être présent (Neon l’ajoute souvent par défaut — vérifier).

| Segment | Exemple (placeholders) |
| ------- | ---------------------- |
| Schéma | `postgresql://` |
| Utilisateur / mot de passe | `USER:PASSWORD` |
| Hôte | `ep-xxx.region.aws.neon.tech` |
| Base | `/neondb` |
| SSL | `?sslmode=require` |

---

## 3. Configurer Railway

Guide API complet : [`DEPLOY-RAILWAY.md`](./DEPLOY-RAILWAY.md).

### Dashboard

1. [Railway](https://railway.app) → projet → service **API**.
2. **Variables** → ajouter ou modifier :

| Variable | Valeur |
| -------- | ------ |
| `DATABASE_URL` | Connection string Neon (étape 2) |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | autre secret, ≥ 32 caractères |
| `CORS_ORIGIN` | URL Vercel exacte (sans `/` final) |

3. **Redeploy** le service après modification de `DATABASE_URL`.

### CLI

```bash
railway variables set DATABASE_URL='postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require'
```

Remplacer par la vraie URL copiée depuis Neon — **ne pas** la coller dans un commit Git.

---

## 4. Render (legacy / secours)

Si l’API tourne encore sur Render (`render.yaml`) :

1. **Environment** → `DATABASE_URL` = **même** connection string Neon.
2. Checklist interactive : `bash scripts/render-env-checklist.sh`

L’API Railway et Render legacy peuvent partager une base Neon distincte par environnement (staging vs prod) — deux projets Neon recommandés.

---

## 5. Migrations Prisma

Appliquer le schéma **après** avoir défini `DATABASE_URL` et **avant** le trafic utilisateur :

### Depuis Railway (recommandé)

```bash
railway run pnpm --filter backend exec prisma migrate deploy
```

### En local (même URL que prod — attention)

```bash
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.neon.tech/neondb?sslmode=require" \
  pnpm --filter backend exec prisma migrate deploy
```

### Seed démo (optionnel, staging uniquement)

```bash
railway run pnpm --filter backend exec prisma db seed
```

Compte démo : `demo@mdmacademy.local` / `DemoTest2026!`

---

## 6. Connection pooling (optionnel)

Neon propose deux types d’URL :

| Type | Usage | Suffixe hôte typique |
| ---- | ----- | -------------------- |
| **Direct** | Migrations Prisma, `prisma migrate deploy`, scripts one-off | `@ep-xxx.neon.tech` |
| **Pooled** | Runtime API avec beaucoup de connexions courtes (serverless-like) | `@ep-xxx-pooler.neon.tech` |

Pour **Fastify sur Railway** (processus long-lived), l’URL **directe** avec `?sslmode=require` suffit en général.

Si vous activez le pooler Neon :

1. Dashboard Neon → **Connect** → onglet **Pooled connection**.
2. Utiliser cette URL pour `DATABASE_URL` sur Railway.
3. Garder l’URL **directe** uniquement pour les migrations en local ou `railway run prisma migrate deploy`.

Paramètre Prisma utile avec pooler : `?sslmode=require&connect_timeout=15`

---

## 7. Vérification

```bash
export API_URL=https://VOTRE-SERVICE.up.railway.app
curl -sf "${API_URL}/health"
curl -sf "${API_URL}/health/db"   # doit répondre 200 si DB + migrations OK
bash scripts/deploy-api.sh
```

| Symptôme | Action |
| -------- | ------ |
| `/health` OK, `/health/db` 503 | `prisma migrate deploy` |
| Erreur SSL / connection | Vérifier `?sslmode=require` |
| Auth failed | Vérifier user/password Neon (régénérer le mot de passe dans Neon si besoin) |

---

## Liens

- [Neon — Connection strings](https://neon.tech/docs/connect/connect-from-any-app)
- [Prisma + Neon](https://www.prisma.io/docs/orm/overview/databases/neon)
- Déploiement API : [`DEPLOY-RAILWAY.md`](./DEPLOY-RAILWAY.md)
- Flux complet : [`DEPLOY-API-TODAY.md`](./DEPLOY-API-TODAY.md)
