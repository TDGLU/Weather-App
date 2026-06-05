# Weather App

A dreamy, glass-style weather dashboard for searching cities, viewing a 5-day forecast, and comparing multiple locations side by side.

## Live demo

**https://tdglu.github.io/Weather-App/**

Every push to `main` runs a production build and deploys with [GitHub Actions](.github/workflows/deploy.yml). If the site is not live yet, open **Settings → Pages** and set **Build and deployment** to **GitHub Actions**.

![Weather App screenshot](./assets/images/screenshot.png)

## Features

- **City search** — current temperature, wind, humidity, and conditions
- **5-day forecast** — daily icon, weather type (e.g. Clear Sky), temp, wind, and humidity
- **Search history** — unlimited recent cities saved in your browser (scrollable list)
- **City comparison** — add many cities side by side with current weather and mini 5-day forecasts (up to 10)
- **Air quality** — iOS-style slider with PM2.5 and quality label
- **Light / dark mode** — toggle in the top-right; preference is saved locally
- **Full location labels** — City, State, Country (e.g. Los Angeles, California, US)
- **Animated weather icons** — icons match the condition (sun, cloud, rain, etc.)

## Your data stays on your device

Search history, comparison cities, and theme preference are stored only in your browser (`localStorage`). That data is **never** committed to this Git repository. Weather details are fetched from the OpenWeather API when you search.

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
├── index.html                 # App shell
├── assets/                    # Deployed static output (built)
│   ├── css/app.min.css
│   ├── js/app.min.js
│   ├── js/theme-init.js       # Tiny theme bootstrap (no flash)
│   └── images/
├── src/                       # Source files
│   ├── css/main.css
│   └── js/
│       ├── app.js             # Entry point
│       ├── api.js             # OpenWeather + caching
│       ├── cache.js
│       ├── compare.js
│       ├── config.js
│       ├── dom.js
│       ├── format.js
│       ├── history.js
│       ├── icons.js
│       ├── theme.js
│       ├── aqi.js
│       └── weather-ui.js
├── scripts/
│   ├── build.mjs
│   ├── capture-screenshot.mjs
│   └── render-icon.mjs
└── .github/workflows/deploy.yml
```

## Performance

- **esbuild** bundles and minifies assets into `app.min.js` and `app.min.css`
- **In-memory API cache** (10 min TTL) and in-flight deduplication for faster city switches
- **Non-blocking fonts** via `<link>` + `preconnect` (no render-blocking `@import`)
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