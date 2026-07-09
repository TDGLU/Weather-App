# `src/js/`

Client-side modules (ES modules → one esbuild bundle).

## Purpose

Fetch weather data, update the DOM, persist user choices, and drive liquid-glass UI chrome (toasts, modals, prefs).

## Key files

| File | Role |
|------|------|
| `app.js` | Entry: bootstrap, search orchestration |
| `api.js` | OpenWeather weather / forecast / air / geo |
| `cache.js` | In-memory TTL cache + in-flight dedupe |
| `config.js` | API URLs, storage keys, AQI labels, limits |
| `dom.js` | Cached element references |
| `format.js` | Dates, labels, units, forecast day picks |
| `icons.js` | OpenWeather icon URLs + animation class |
| `aqi.js` | AQI thumb position + markup helpers |
| `weather-ui.js` | Current weather panel + 5-day cards |
| `history.js` | Recent cities (`localStorage`) |
| `compare.js` | Multi-city comparison strip |
| `theme.js` / `theme-init.js` | Theme toggle + FOUC-safe init |
| `prefs.js` | Display prefs (system theme, compact stats, motion) |
| `ui-chrome.js` | Toasts + confirm modal |
| `scroll-regions.js` | Wheel/keyboard scrolling for `.scroll-region` |

## How they relate

`app.js` owns the search lifecycle and calls `weather-ui`, `history`, and `compare`. `compare` and main search both call `fetchWeatherBundle` in `api.js`. UI feedback goes through `ui-chrome.js`.

## Notable patterns

- **State management**: plain modules + DOM; no global store. Race guards via `latestSearchId` / `_compareLoadId`.
- **Storage**: `HISTORY_KEY`, `COMPARE_KEY`, `THEME_KEY`, `PREFS_KEY` — local only.
- **No audio / pitch-tracking** in this app; weather icons use CSS keyframe “motion” only.
- **Events**: `weather-compare-changed` custom event keeps history “Compare” buttons in sync.
- **Extension points**:
  - New panel fields → `dom.js` + `weather-ui.js` + `index.html`
  - New API surface → `api.js` + `cache.js`
  - New chrome → `ui-chrome.js` + CSS component section
