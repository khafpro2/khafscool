# Hero MacBook — animation Blender (MDM Academy)

Animation 3D stylisée d’un MacBook Pro (silhouette abstraite, sans logo Apple) pour la page d’accueil du site web.

## Prérequis

- [Blender](https://www.blender.org/download/) 3.6+ ou 4.x
- FFmpeg (pour l’encodage WebM/MP4 si le script ne trouve pas `ffmpeg` dans le PATH)

## Fichiers

| Fichier | Rôle |
|---------|------|
| `render_hero.py` | Scène, animation, rendu image + séquence, export web |
| `README.md` | Ce guide |

## Sorties web (après rendu)

Le script écrit dans le dépôt :

```
web/public/media/hero/
  macbook-hero.webm    # VP9, fond transparent optionnel
  macbook-hero.mp4     # H.264
  macbook-hero-poster.webp
```

## Lancer un rendu

Depuis la racine du dépôt :

```bash
# Aperçu rapide (720p, peu d’échantillons) — ~2–5 min selon machine
blender --background --python assets/blender/hero-macbook/render_hero.py -- --quick

# Production (1080p, 128 samples)
blender --background --python assets/blender/hero-macbook/render_hero.py

# Poster seulement (pas de vidéo)
blender --background --python assets/blender/hero-macbook/render_hero.py -- --poster-only
```

Sans arguments, le script tente un rendu complet puis encode avec FFmpeg.

## Paramètres utiles

| Option | Effet |
|--------|--------|
| `--quick` | 720p, 32 samples, durée 4 s |
| `--poster-only` | Une image poster WebP uniquement |
| `--no-encode` | Garde les PNG de séquence, pas de WebM/MP4 |

Variables d’environnement :

- `HERO_RESOLUTION=720` ou `1080`
- `HERO_SAMPLES=128`

## Style visuel

- **Space Gray** : aluminium générique (métal ~0.92, rugosité ~0.28), sans logo Apple
- **Proportions 16"** : capot fin (~3 mm visuel), charnière plate, trackpad et clavier suggérés
- **Écran** : bezel sombre, point caméra générique, émission bleu `#2563EB` → teal `#0d9488`
- **Coins arrondis** : modificateur Bevel appliqué sur le châssis pour un rendu moins « bloc »

Le poster SVG (`macbook-hero-poster.svg`) sert de fallback immédiat ; le rendu Blender remplace la vidéo quand exporté.

- Durée boucle : **5 s** (150 images à 30 fps)
- Mouvement : légère orbite de la caméra + ouverture subtile du capot + lueur écran bleu `#2563EB`
- Style : métal sombre, écran avec dégradé MDM Academy (bleu → teal)

## Intégration site

L’accueil utilise `HomeWelcomeScreen` + `HomeTrackDock` (dock / effet genie). Les exports sous `/media/hero/` restent disponibles pour une future réintégration visuelle hero.

## Dépannage

- **Blender introuvable** : installer Blender et ajouter `blender` au PATH, ou ouvrir `render_hero.py` dans l’UI Blender (Scripting) et exécuter.
- **FFmpeg manquant** : les PNG restent dans `web/public/media/hero/frames/` ; encoder à la main :
  ```bash
  ffmpeg -y -framerate 30 -i frames/frame_%04d.png \
    -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 2M \
    web/public/media/hero/macbook-hero.webm
  ffmpeg -y -framerate 30 -i frames/frame_%04d.png \
    -c:v libx264 -pix_fmt yuv420p -crf 23 \
    web/public/media/hero/macbook-hero.mp4
  ```
- **Fichiers trop lourds** : privilégier 720p (`--quick`) ou réduire le débit dans le script (`WEBM_BITRATE`).

## Licence / marque

Modèle volontairement **générique** (pas de logo Apple, pas de copie photoréaliste du châssis). Usage interne MDM Academy Pro.
