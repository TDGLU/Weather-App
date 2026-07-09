# `assets/`

Deployed static output and media served by GitHub Pages (and local `http.server`).

## Purpose

Ship built CSS/JS, app icons, screenshots, and background art. Prefer editing sources under `src/` (and regenerating icons via `scripts/`), not hand-editing minified bundles.

## Key files / folders

| Path | Role |
|------|------|
| `css/` | Built stylesheet |
| `js/` | Built app bundle + theme-init copy |
| `images/` | Icons, favicons, waves SVG, screenshot |
| `imgs/` | Legacy/duplicate media (kept for old paths) |

## How they relate

```
src/css/main.css  ──build──►  assets/css/app.min.css
src/js/app.js     ──build──►  assets/js/app.min.js
src/js/theme-init.js ─copy─►  assets/js/theme-init.js
scripts/generate-icons.mjs ──► assets/images/icons/*
```

`index.html` references these paths with cache-busting query params.

## Notable patterns

- **Do not commit secrets** here — API key lives in source `config.js` (public demo key).
- **No runtime state** is stored under `assets/`; user data stays in browser `localStorage`.
- **Extension**: add new static images under `images/`, then reference from HTML/CSS.
