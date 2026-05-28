# Hero MacBook media

| File | Role |
|------|------|
| `macbook-hero-ai.webp` | **LCP poster** (~50KB, 1280×853) — loaded first in cascade |
| `macbook-hero-ai.png` | Source / design export only (~1.2MB) — **not** in runtime cascade |
| `macbook-hero-poster.svg` | Final SVG fallback |
| `macbook-hero.webm` / `.mp4` | Optional Blender loop (when present) |
| `macbook-hero-ai.avif` | Optional — add to `<picture>` in `HeroMacbookVisual` when generated |

## Performance (LCP)

- Hero poster `<img>` uses `loading="eager"`, `fetchPriority="high"`, and explicit `width` / `height` (1280×853).
- Only the home hero uses eager loading; other images stay lazy by default.
- Runtime cascade: WebP AI → WebP poster → SVG (PNG source is never fetched by the app).
- **AVIF**: not shipped yet. Add `macbook-hero-ai.avif` beside the WebP and wire a `<source type="image/avif">` in `HeroMacbookVisual` when ready.

## Regenerate WebP

From repo root (requires `sharp` via `web` / Next):

```bash
node scripts/optimize-hero-media.mjs
```

Target &lt;80KB at 1×; adjust `quality` in the script if needed. Keep PNG out of the critical path.

## E2E

`web/e2e/home-hero.spec.ts` — desktop + 375px viewport — runs in CI job `e2e-web`.
