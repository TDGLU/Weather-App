# `assets/css/`

Production stylesheet output.

## Purpose

Minified CSS loaded by `index.html` after `npm run build`.

## Key files

| File | Role |
|------|------|
| `app.min.css` | Bundled/minified copy of `src/css/main.css` |

## How they relate

Generated only — edit `src/css/main.css`, then run `npm run build`. Deploy workflow rebuilds this on push to `main`.

## Notable patterns

- Contains the full liquid-glass design system (tokens, components, layout).
- Versioned in HTML via `?v=` when breaking visual changes ship.
