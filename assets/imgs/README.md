# `assets/imgs/`

Legacy image copies retained for older relative paths and caches.

## Purpose

Historical duplicate of core images (`icon.png`, `screenshot.png`, `stacked-waves-haikei.svg`). New work should use `assets/images/`.

## Key files

| File | Role |
|------|------|
| `icon.png` | Legacy app icon path |
| `screenshot.png` | Legacy screenshot |
| `stacked-waves-haikei.svg` | Legacy background |

## How they relate

Built CSS historically resolved backgrounds relative to older folder names. Current `src/css/main.css` targets `../images/` from the built CSS location (`assets/css/` → `assets/images/`).

## Notable patterns

- Safe to treat as read-only compatibility layer.
- Prefer deleting only after confirming no external links depend on `/assets/imgs/`.
