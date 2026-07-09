# `assets/images/`

Visual assets for branding, PWA icons, and backgrounds.

## Purpose

Provide favicons, default weather placeholder, README screenshot, and the dreamy wave background used behind liquid-glass panels.

## Key files

| File / folder | Role |
|---------------|------|
| `icon.png` | Default / fallback weather icon |
| `icon-source.jpg` | Master artwork for icon generation |
| `screenshot.png` | README preview capture |
| `stacked-waves-haikei.svg` | Full-page background |
| `icons/` | Sized favicons / PWA icons |

## How they relate

CSS references `stacked-waves-haikei.svg` (via relative path from built CSS). HTML links icons and the fallback image. `scripts/generate-icons.mjs` rebuilds `icons/` from `icon-source.jpg`.

## Notable patterns

- Weather condition icons are remote (OpenWeather CDN); local icons are app chrome only.
- Transparent PNGs preferred for glass UI compositing.
