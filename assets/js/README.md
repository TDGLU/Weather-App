# `assets/js/`

Production JavaScript output.

## Purpose

Browser-ready scripts: the esbuild bundle and the unbundled theme bootstrap.

## Key files

| File | Role |
|------|------|
| `app.min.js` | Bundled modules from `src/js/app.js` entry |
| `theme-init.js` | Runs in `<head>` to set `data-theme` before paint |

## How they relate

`theme-init.js` prevents light/dark flash; `app.min.js` (deferred) mounts the full app.

## Notable patterns

- Bundle uses `minifyIdentifiers: false` so debugging class names stay readable-ish.
- Prefer changing `src/js/*` and rebuilding; treat these files as artifacts.
