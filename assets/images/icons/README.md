# `assets/images/icons/`

Favicon and PWA icon sizes.

## Purpose

Supply multi-resolution icons for browser tabs, home-screen install, and `site.webmanifest`.

## Key files

| File | Typical use |
|------|-------------|
| `icon-16.png` … `icon-64.png` | Favicons |
| `icon-180.png` | Apple touch icon |
| `icon-192.png` / `icon-512.png` | PWA / Android |
| `icon-1024.png` | High-res source-ish export |

## How they relate

Generated from `assets/images/icon-source.jpg` via `npm run icons` (`scripts/generate-icons.mjs` + sharp). Referenced from `index.html` and `site.webmanifest`.

## Notable patterns

- Keep filenames stable; HTML lists explicit sizes.
- Regenerate the whole set after artwork changes rather than editing one size by hand.
