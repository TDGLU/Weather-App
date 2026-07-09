# `scripts/`

Node tooling for build, icons, and screenshots.

## Purpose

Produce deployable assets without a heavy bundler config: esbuild for JS/CSS, sharp for icons, optional Playwright screenshot capture.

## Key files

| File | Role |
|------|------|
| `build.mjs` | Bundle `src/js/app.js` + minify CSS; copy `theme-init.js` |
| `generate-icons.mjs` | Resize master art into `assets/images/icons/` |
| `render-icon.mjs` | Helper for icon rendering pipeline |
| `capture-screenshot.mjs` | README screenshot via Playwright |

## How they relate

```
npm run build  → build.mjs
npm run icons  → generate-icons.mjs
npm run dev    → build.mjs + python http.server
```

GitHub Actions deploy job runs `npm ci` + `npm run build` before publishing the repo root.

## Notable patterns

- **No app state** lives here; scripts are pure build-time.
- **Extension**: add new entry points in `build.mjs` if you split CSS/JS further.
- Screenshot script expects a local server (default port `8765`).
