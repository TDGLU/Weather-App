# Weather App

A dreamy **liquid-glass** weather dashboard for searching cities, viewing a 5-day forecast, and comparing multiple locations side by side.

## Live demo

**https://tdglu.github.io/Weather-App/**

Every push to `main` runs a production build and deploys with [GitHub Actions](.github/workflows/deploy.yml). If the site is not live yet, open **Settings → Pages** and set **Build and deployment** to **GitHub Actions**.

![Weather App screenshot](./assets/images/screenshot.png)

## Features

- **City search** — temperature, wind, humidity, pressure, visibility, sunrise/sunset, and more
- **5-day forecast** — daily icon, weather type, temp, wind, and humidity
- **Search history** — unlimited recent cities saved in your browser (scrollable list)
- **City comparison** — side-by-side current weather and mini 5-day forecasts (up to 10)
- **Air quality** — liquid glass slider with PM2.5 and quality label
- **Light / dark mode** — theme toggle; optional “match system” preference
- **Liquid-glass UI** — frosted panels, specular edges, glass form controls, tooltips, toasts, and modals
- **Empty / loading / error states** — clear panel feedback plus toast notifications
- **Full location labels** — City, State, Country (e.g. Los Angeles, California, US)
- **Animated weather icons** — condition-matched motion (respects reduced motion)

## Your data stays on your device

Search history, comparison cities, theme, and display prefs are stored only in your browser (`localStorage`). That data is **never** committed to this Git repository. Weather details are fetched from the OpenWeather API when you search.

## Run locally

```bash
npm install
npm run build
python -m http.server 8765
```

Open **http://localhost:8765/** in your browser.

For a one-step dev server after building:

```bash
npm run dev
```

## Project structure

```
Weather-App/
├── index.html                 # App shell (liquid-glass layout)
├── assets/                    # Deployed static output (built)
│   ├── css/app.min.css
│   ├── js/app.min.js
│   ├── js/theme-init.js       # Tiny theme bootstrap (no flash)
│   └── images/
├── src/                       # Source files
│   ├── css/main.css           # Design system + components
│   └── js/
│       ├── app.js             # Entry point
│       ├── api.js             # OpenWeather + caching
│       ├── ui-chrome.js       # Toasts + confirm modal
│       ├── prefs.js           # Display preferences
│       └── …                  # See src/js/README.md
├── scripts/
│   ├── build.mjs
│   ├── capture-screenshot.mjs
│   └── generate-icons.mjs
└── .github/workflows/deploy.yml
```

Every folder includes a `README.md` describing purpose, key files, relationships, and patterns.

## Liquid-glass design system

The stylesheet (`src/css/main.css`) defines shared glass tokens and styles for:

| Surface | Classes / hooks |
|---------|-----------------|
| Panels | `.panel`, `.glass-liquid` |
| Selects / dropdowns | `.glass-select`, `.glass-dropdown` |
| Popovers / modals | `.popover`, `.modal`, `.modal-backdrop` |
| Tooltips | `[data-tooltip]`, `.tooltip` |
| Scrollbars | Global thin liquid thumbs |
| Checkboxes / radios / toggles | `.glass-check`, `.glass-radio`, `.glass-toggle` |
| Sliders / AQI | `.glass-slider`, `.aqi-visual` |
| Number steppers | `.glass-stepper` |
| States | `.state-empty`, `.state-loading`, `.state-error`, toasts |

## Performance

- **esbuild** bundles and minifies assets into `app.min.js` and `app.min.css`
- **In-memory API cache** (10 min TTL) and in-flight deduplication for faster city switches
- **Non-blocking fonts** via `<link>` + `preconnect`
- **Lean HTML** — forecast cards generated once in JS
- **CSS `contain` and `content-visibility`** for smoother scrolling and painting

## Assets

| File | Description |
|------|-------------|
| `assets/images/icon.png` | Default app icon (512×512 PNG, transparent) |
| `assets/images/icons/icon-*.png` | Favicon / PWA sizes (16–1024) |
| `assets/images/icon-source.jpg` | Master artwork for regeneration |
| `assets/images/screenshot.png` | README preview |

Regenerate PNG icons from the master artwork:

```bash
npm run icons
```

Regenerate the README screenshot:

```bash
npm install playwright@1.49.1 --no-save
npx playwright install chromium
npm run build
python -m http.server 8765
node scripts/capture-screenshot.mjs
```

## Tech

- HTML5, CSS3, JavaScript (ES modules → bundled with esbuild)
- [OpenWeatherMap API](https://openweathermap.org/api) for weather data
- GitHub Pages for hosting
