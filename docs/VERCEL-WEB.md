# Déploiement web sur Vercel

L’API tourne sur Render (ou Railway) — **ne pas** builder `backend` ni `mobile` sur Vercel.

## Réglages obligatoires (dashboard Vercel)

| Paramètre | Valeur |
| --------- | ------ |
| **Root Directory** | `web` |
| **Framework Preset** | Next.js (détecté via `web/vercel.json`) |
| **Install Command** | *(laisser vide — défini dans `web/vercel.json`)* |
| **Build Command** | *(laisser vide — défini dans `web/vercel.json`)* |
| **Output Directory** | *(défaut Next.js — ne pas surcharger)* |

Si **Root Directory** est la racine du dépôt (`.` ) par erreur, Vercel exécute `pnpm build` → `turbo run build` → échec sur `backend` (Prisma non généré). Corriger en mettant **Root Directory** = `web`.

## Variables d’environnement

| Variable | Environnements | Exemple |
| -------- | -------------- | ------- |
| `NEXT_PUBLIC_API_URL` | Production, Preview | `https://votre-api.onrender.com` |
| `WEB_URL` | Production, Preview (recommandé) | `https://votre-app.vercel.app` |

Redéployer après toute modification de `NEXT_PUBLIC_*` (valeurs figées au build).

## Fichiers du dépôt

- `web/vercel.json` — install à la racine du monorepo, build **web uniquement**
- `package.json` (racine) — script `vercel-build` de secours si Root Directory = racine (évite Turbo sur tout le monorepo)
