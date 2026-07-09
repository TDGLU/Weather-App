# `src/`

Application source. Everything here is compiled or copied into `assets/` by `scripts/build.mjs` before deploy.

## Purpose

Hold the editable UI and logic for the Weather App: liquid-glass styles, OpenWeather API client, local history/compare state, and progressive UI chrome (toasts, modals, prefs).

## Key files

| Path | Role |
|------|------|
| `css/main.css` | Full design system + layout (source for `assets/css/app.min.css`) |
| `js/app.js` | Bootstrap entry: search flow, history, compare wiring |
| `js/*.js` | Feature modules (see `js/README.md`) |
| `js/theme-init.js` | Tiny FOUC-prevention script (copied, not bundled) |

## How they relate

```
app.js
  ├─ dom.js          element refs
  ├─ theme.js        light/dark (localStorage)
  ├─ prefs.js        display prefs (localStorage)
  ├─ ui-chrome.js    toasts + confirm modal
  ├─ scroll-regions.js  keyboard/wheel scroll helpers
  ├─ history.js      recent cities list
  ├─ compare.js      multi-city strip
  ├─ weather-ui.js   current + 5-day DOM updates
  │    ├─ aqi.js
  │    ├─ icons.js
  │    └─ format.js
  └─ api.js          OpenWeather fetches
       └─ cache.js
```

## Notable patterns

- **State**: no framework — module-level state + `localStorage` keys from `config.js`.
- **Storage**: history, compare list, theme, and prefs are browser-only (never sent to our server).
- **Build**: esbuild bundles `js/app.js` → `assets/js/app.min.js` and minifies CSS.
- **Extension points**: add UI chrome in `ui-chrome.js`, new prefs in `prefs.js`, new API endpoints in `api.js` with `cached()`.
