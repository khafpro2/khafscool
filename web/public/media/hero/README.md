# Hero MacBook media

| File | Role |
|------|------|
| `macbook-hero-ai.webp` | **LCP poster** (~50KB, 1280×853) — loaded first in cascade |
| `macbook-hero-ai.png` | Source / design export only (~1.2MB) — **not** in runtime cascade |
| `macbook-hero-poster.svg` | Final SVG fallback |
| `macbook-hero.webm` / `.mp4` | Optional Blender loop (when present) |

Regenerate WebP from PNG with reasonable quality (target &lt;80KB 1x). Keep PNG out of the critical path.
