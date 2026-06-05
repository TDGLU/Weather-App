// Weather App - Functional Search + 5-Day Forecast
//
// User data (search history, comparison cities, theme) lives only in this
// browser's localStorage. Nothing personal is stored in or read from the Git repo.

const APIKey = '7b23df2e93e0f4913efaf4a0404c91c0';
const HISTORY_KEY = 'weatherAppHistory';
const COMPARE_KEY = 'weatherAppCompare';
const THEME_KEY = 'weatherAppTheme';
const MAX_HISTORY = 6;
const MAX_COMPARE = 10;

let latestSearchId = 0;

// DOM Elements
const searchText = document.getElementById('searchText');
const searchBtn = document.getElementById('searchBtn');
const historyList = document.getElementById('history');
const clearHistoryBtn = document.getElementById('clearHistory');

const searchedCity = document.getElementById('searchedCity');
const currentWeatherIconWrap = document.getElementById('currentWeatherIconWrap');
const currentWeatherIcon = document.getElementById('currentWeatherIcon');
const currentWeatherDesc = document.getElementById('currentWeatherDesc');
const currentCityTemp = document.getElementById('currentCityTemp');
const currentFeelsLike = document.getElementById('currentFeelsLike');
const currentHighLow = document.getElementById('currentHighLow');
const currentCityHumidity = document.getElementById('currentCityHumidity');
const currentWind = document.getElementById('currentWind');
const currentGust = document.getElementById('currentGust');
const currentPressure = document.getElementById('currentPressure');
const currentVisibility = document.getElementById('currentVisibility');
const currentClouds = document.getElementById('currentClouds');
const currentPrecip = document.getElementById('currentPrecip');
const currentSunrise = document.getElementById('currentSunrise');
const currentSunset = document.getElementById('currentSunset');
const currentAqiVisual = document.getElementById('currentAqiVisual');
const currentAqiLabel = document.getElementById('currentAqiLabel');
const currentPm25 = document.getElementById('currentPm25');

const AQI_LEVELS = {
  1: { label: 'Good', class: 'aqi-lvl-1' },
  2: { label: 'Fair', class: 'aqi-lvl-2' },
  3: { label: 'Moderate', class: 'aqi-lvl-3' },
  4: { label: 'Poor', class: 'aqi-lvl-4' },
  5: { label: 'Very Poor', class: 'aqi-lvl-5' }
};

const todaysDate = document.getElementById('todaysDate');
const themeToggle = document.getElementById('themeToggle');
const compareInput = document.getElementById('compareInput');
const compareAddBtn = document.getElementById('compareAddBtn');
const compareAddCurrent = document.getElementById('compareAddCurrent');
const compareClearBtn = document.getElementById('compareClearBtn');
const compareContainer = document.getElementById('compareContainer');
const compareEmpty = document.getElementById('compareEmpty');
const cards = document.querySelectorAll('.card');

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function updateThemeToggleUi(theme) {
  if (!themeToggle) return;
  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.classList.toggle('is-dark', isDark);
}

function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeToggleUi(next);
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
  setTheme(theme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
  }
}

// Format as Month Day, Year (e.g. June 5, 2026)
function formatLongDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Set today's date
function setTodaysDate() {
  todaysDate.textContent = formatLongDate(new Date());
}

// Use day icon variant so clear sky shows sun (not moon) in app dark theme / at night
function getDisplayIconCode(iconCode) {
  const code = (iconCode || '01d').replace(/@.*$/, '');
  if (code.length >= 3 && code.endsWith('n')) {
    return `${code.slice(0, -1)}d`;
  }
  return code;
}

// CSS animation class from OpenWeather icon code
function getWeatherAnimClass(iconCode) {
  const code = getDisplayIconCode(iconCode).slice(0, 2);
  if (code === '11') return 'weather-anim-storm';
  if (code === '09' || code === '10') return 'weather-anim-rain';
  if (code === '13') return 'weather-anim-snow';
  if (code === '50') return 'weather-anim-mist';
  if (code === '01') return 'weather-anim-sun';
  return 'weather-anim-cloud';
}

function setWeatherIcon(iconWrap, iconImg, rawIconCode, description) {
  if (!iconImg) return;
  const iconCode = getDisplayIconCode(rawIconCode);
  iconImg.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  iconImg.alt = description || 'weather icon';
  if (iconWrap) {
    iconWrap.className = `weather-icon-wrap ${getWeatherAnimClass(iconCode)}`;
  }
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

// "clear sky" -> "Clear Sky"
function formatWeatherDescription(description) {
  if (!description) return '';
  return description
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function pickFiveForecastDays(forecastData) {
  if (!forecastData || !forecastData.list || forecastData.list.length === 0) return [];

  const days = [];
  const seen = new Set();

  for (const entry of forecastData.list) {
    const d = new Date(entry.dt * 1000);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!seen.has(dayKey)) {
      seen.add(dayKey);
      days.push(entry);
      if (days.length >= 5) break;
    }
  }

  while (days.length < 5 && days.length > 0) {
    days.push(days[days.length - 1]);
  }

  return days;
}

// Load history from localStorage
function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

// Save history to localStorage
function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// Render the history list (dynamic + clickable)
function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = '';

  if (history.length === 0) {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.textContent = 'No searches yet';
    li.style.opacity = '0.6';
    historyList.appendChild(li);
    return;
  }

  history.forEach((city) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.textContent = city;
    li.addEventListener('click', () => {
      searchText.value = city;
      doSearch(city);
    });
    historyList.appendChild(li);
  });
}

// Same city key for "Perris, US" and "Perris, California, US"
function getHistoryCityKey(label) {
  return getCityQuery(label).toLowerCase();
}

// Old history used "City, US" — upgrade to full label when state is missing
function labelNeedsUpgrade(label) {
  const parts = (label || '').split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length === 2 && /^[A-Z]{2}$/i.test(parts[1]);
}

// Add a city to history (dedup + recent first + limit)
function addToHistory(cityLabel) {
  if (!cityLabel) return;
  const cityKey = getHistoryCityKey(cityLabel);
  let history = loadHistory();
  history = history.filter((h) => getHistoryCityKey(h) !== cityKey);
  // add to front
  history.unshift(cityLabel);
  // limit
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  saveHistory(history);
  renderHistory();
}

// Clear history
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

// Get API query from possibly "City, ST" input - use city part only for reliability
function getCityQuery(searchVal) {
  const trimmed = (searchVal || '').trim();
  if (!trimmed) return '';
  // take before first comma, or whole
  const part = trimmed.split(',')[0].trim();
  return part || trimmed;
}

// Build display label: City, State, Country (state omitted when unavailable)
function formatLocationLabel(city, state, country) {
  const parts = [(city || '').trim()];
  const statePart = (state || '').trim();
  const countryPart = (country || '').trim();
  if (statePart) parts.push(statePart);
  if (countryPart) parts.push(countryPart);
  return parts.filter(Boolean).join(', ');
}

// Build City, State, Country from a weather API response
async function buildLabelFromWeatherData(currentData, cityQuery) {
  const cityName = currentData.name || cityQuery;
  const country = currentData.sys && currentData.sys.country ? currentData.sys.country : '';
  let state = '';
  if (currentData.coord) {
    state = await getStateFromCoords(currentData.coord.lat, currentData.coord.lon);
  }
  return formatLocationLabel(cityName, state, country);
}

// Resolve full label for a history entry (city name or partial label)
async function resolveLocationLabel(searchVal) {
  const cityQuery = getCityQuery(searchVal);
  if (!cityQuery) return searchVal;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityQuery)}&appid=${APIKey}&units=imperial`;
  try {
    const res = await fetch(url);
    if (!res.ok) return searchVal;
    const currentData = await res.json();
    return buildLabelFromWeatherData(currentData, cityQuery);
  } catch {
    return searchVal;
  }
}

// Upgrade stored history labels to City, State, Country
async function upgradeHistoryLabels() {
  const history = loadHistory();
  const upgraded = await Promise.all(
    history.map((label) => (labelNeedsUpgrade(label) ? resolveLocationLabel(label) : label))
  );
  if (upgraded.some((label, i) => label !== history[i])) {
    saveHistory(upgraded);
  }
  return upgraded;
}

// Resolve state/region via reverse geocoding (OpenWeather current weather has no state field)
async function getStateFromCoords(lat, lon) {
  if (lat == null || lon == null) return '';
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${APIKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    return data[0] && data[0].state ? data[0].state : '';
  } catch {
    return '';
  }
}

// Format forecast card date from unix timestamp
function formatCardDate(dt) {
  return formatLongDate(new Date(dt * 1000));
}

function degToCompass(deg) {
  if (deg == null || Number.isNaN(deg)) return '';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function formatCityLocalTime(unixUtc, tzOffsetSec) {
  if (unixUtc == null) return '—';
  const offset = tzOffsetSec || 0;
  const d = new Date((unixUtc + offset) * 1000);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  });
}

function metersToMiles(m) {
  if (m == null) return null;
  return m / 1609.34;
}

function mmToInches(mm) {
  return mm * 0.0393701;
}

function setText(el, text) {
  if (el) el.textContent = text ?? '—';
}

function getAqiEntry(airData) {
  return airData && airData.list && airData.list[0] ? airData.list[0] : null;
}

function getAqiBaseClass(visualEl) {
  return visualEl.classList.contains('compare-aqi-visual')
    ? 'aqi-visual compare-aqi-visual'
    : 'aqi-visual';
}

// Map PM2.5 (µg/m³) to thumb position along the gradient track
function pm25ToThumbPercent(pm25, aqi) {
  const anchors = [
    { pm: 0, pos: 6 },
    { pm: 12, pos: 18 },
    { pm: 35, pos: 34 },
    { pm: 55, pos: 52 },
    { pm: 150, pos: 80 },
    { pm: 300, pos: 94 }
  ];
  const fallback = { 1: 8, 2: 28, 3: 50, 4: 74, 5: 92 };

  if (pm25 == null || Number.isNaN(pm25)) {
    return fallback[aqi] ?? 50;
  }

  if (pm25 <= anchors[0].pm) return anchors[0].pos;
  if (pm25 >= anchors[anchors.length - 1].pm) return anchors[anchors.length - 1].pos;

  for (let i = 1; i < anchors.length; i += 1) {
    const hi = anchors[i];
    const lo = anchors[i - 1];
    if (pm25 <= hi.pm) {
      const t = (pm25 - lo.pm) / (hi.pm - lo.pm);
      return lo.pos + t * (hi.pos - lo.pos);
    }
  }

  return fallback[aqi] ?? 50;
}

function setAqiLoadingState(visualEl, labelEl, pmEl) {
  if (!visualEl) return;
  visualEl.className = `${getAqiBaseClass(visualEl)} is-loading`;
  visualEl.setAttribute('data-aqi', '0');
  visualEl.style.setProperty('--aqi-thumb-pos', '50%');
  visualEl.setAttribute('aria-label', 'Loading air quality');
  visualEl.setAttribute('aria-valuenow', '0');
  if (labelEl) labelEl.textContent = 'Loading…';
  if (pmEl) pmEl.textContent = '—';
}

function buildAqiSliderMarkup(extraClass) {
  const cls = extraClass ? `aqi-visual ${extraClass}` : 'aqi-visual';
  return `
    <div class="${cls}" data-aqi="0" role="slider" aria-label="Air quality" aria-valuemin="1" aria-valuemax="5" aria-valuenow="0">
      <div class="aqi-slider-track">
        <div class="aqi-slider-thumb" aria-hidden="true"></div>
      </div>
      <p class="aqi-label">—</p>
    </div>
  `;
}

function applyAqiVisual(visualEl, labelEl, pmEl, airData) {
  const entry = getAqiEntry(airData);
  if (!visualEl) return;

  const baseClass = getAqiBaseClass(visualEl);
  const thumb = visualEl.querySelector('.aqi-slider-thumb');

  if (!entry || entry.main?.aqi == null) {
    visualEl.setAttribute('data-aqi', '0');
    visualEl.className = baseClass;
    visualEl.style.setProperty('--aqi-thumb-pos', '50%');
    visualEl.setAttribute('aria-label', 'Air quality unavailable');
    visualEl.setAttribute('aria-valuenow', '0');
    if (labelEl) labelEl.textContent = '—';
    if (pmEl) pmEl.textContent = '—';
    return;
  }

  const aqi = entry.main.aqi;
  const info = AQI_LEVELS[aqi] || { label: 'Unknown', class: 'aqi-lvl-unknown' };
  const pm = entry.components?.pm2_5;
  const thumbPos = pm25ToThumbPercent(pm, aqi);

  // Reset thumb so CSS transition runs when switching cities
  visualEl.setAttribute('data-aqi', '0');
  visualEl.style.setProperty('--aqi-thumb-pos', '50%');
  if (thumb) void thumb.offsetWidth;

  visualEl.setAttribute('data-aqi', String(aqi));
  visualEl.className = `${baseClass} ${info.class}`;
  visualEl.style.setProperty('--aqi-thumb-pos', `${thumbPos}%`);
  visualEl.setAttribute('aria-label', `Air quality: ${info.label}`);
  visualEl.setAttribute('aria-valuenow', String(aqi));
  if (labelEl) labelEl.textContent = info.label;

  if (pmEl) {
    pmEl.textContent = pm != null ? `PM2.5: ${pm.toFixed(1)} µg/m³` : '—';
  }
}

function clearAqiVisual(visualEl, labelEl, pmEl) {
  applyAqiVisual(visualEl, labelEl, pmEl, null);
}

function clearCurrentWeather() {
  setText(currentWeatherDesc, '—');
  if (currentWeatherIcon) {
    currentWeatherIcon.src = './assets/imgs/icon.png';
    currentWeatherIcon.alt = '';
  }
  if (currentWeatherIconWrap) {
    currentWeatherIconWrap.className = 'weather-icon-wrap weather-anim-cloud current-hero-icon-wrap';
  }
  [
    currentCityTemp, currentFeelsLike, currentHighLow, currentCityHumidity,
    currentWind, currentGust, currentPressure, currentVisibility, currentClouds,
    currentPrecip, currentSunrise, currentSunset
  ].forEach((el) => setText(el, '—'));
  clearAqiVisual(currentAqiVisual, currentAqiLabel, currentPm25);
}

function updateCurrentWeather(currentData, airData) {
  const main = currentData.main || {};
  const weather = currentData.weather && currentData.weather[0];
  const wind = currentData.wind || {};
  const clouds = currentData.clouds || {};
  const tz = currentData.timezone || 0;

  if (weather) {
    setText(currentWeatherDesc, formatWeatherDescription(weather.description));
    setWeatherIcon(currentWeatherIconWrap, currentWeatherIcon, weather.icon, weather.description);
  }

  setText(currentCityTemp, main.temp != null ? Math.round(main.temp) : '—');
  setText(currentFeelsLike, main.feels_like != null ? Math.round(main.feels_like) : '—');

  if (main.temp_max != null && main.temp_min != null) {
    setText(currentHighLow, `${Math.round(main.temp_max)}° / ${Math.round(main.temp_min)}°`);
  } else {
    setText(currentHighLow, '—');
  }

  setText(currentCityHumidity, main.humidity != null ? main.humidity : '—');

  const windSpeed = wind.speed != null ? Math.round(wind.speed) : null;
  const windDir = degToCompass(wind.deg);
  if (windSpeed != null) {
    setText(currentWind, windDir ? `${windSpeed} mph ${windDir}` : `${windSpeed} mph`);
  } else {
    setText(currentWind, '—');
  }

  setText(currentGust, wind.gust != null ? `${Math.round(wind.gust)} mph` : '—');
  setText(currentPressure, main.pressure != null ? `${main.pressure} hPa` : '—');

  const visMi = metersToMiles(currentData.visibility);
  setText(currentVisibility, visMi != null ? `${visMi.toFixed(1)} mi` : '—');

  setText(currentClouds, clouds.all != null ? clouds.all : '—');

  const rainMm = currentData.rain && currentData.rain['1h'];
  const snowMm = currentData.snow && currentData.snow['1h'];
  if (rainMm != null) {
    setText(currentPrecip, `${mmToInches(rainMm).toFixed(2)} in rain`);
  } else if (snowMm != null) {
    setText(currentPrecip, `${mmToInches(snowMm).toFixed(2)} in snow`);
  } else {
    setText(currentPrecip, '0 in');
  }

  setText(currentSunrise, formatCityLocalTime(currentData.sys?.sunrise, tz));
  setText(currentSunset, formatCityLocalTime(currentData.sys?.sunset, tz));
  applyAqiVisual(currentAqiVisual, currentAqiLabel, currentPm25, airData);
}

// Update a single forecast card
function updateCard(cardEl, entry) {
  if (!entry || !entry.main || !entry.weather || !entry.weather[0]) return;

  const dateP = cardEl.querySelector('.card-date');
  const weatherDescP = cardEl.querySelector('.card-weather-desc');
  const iconWrap = cardEl.querySelector('.weather-icon-wrap');
  const iconImg = cardEl.querySelector('.card-icon');
  const tempSpan = cardEl.querySelector('.card-temp span');
  const windSpan = cardEl.querySelector('.card-wind span');
  const humSpan = cardEl.querySelector('.card-humidity span');

  if (dateP) dateP.textContent = formatCardDate(entry.dt);
  if (weatherDescP && entry.weather[0]) {
    weatherDescP.textContent = formatWeatherDescription(entry.weather[0].description);
  }
  if (iconImg && entry.weather[0]) {
    setWeatherIcon(iconWrap, iconImg, entry.weather[0].icon, entry.weather[0].description);
  }
  if (tempSpan) tempSpan.textContent = Math.round(entry.main.temp);
  if (windSpan) windSpan.textContent = Math.round(entry.wind ? entry.wind.speed : 0);
  if (humSpan) humSpan.textContent = entry.main.humidity;
}

// Update all 5 forecast cards from the forecast list (pick one per day, using local calendar days)
function updateFiveDayForecast(forecastData) {
  const days = pickFiveForecastDays(forecastData);
  cards.forEach((card, i) => {
    if (days[i]) {
      updateCard(card, days[i]);
    }
  });
}

// Fetch current weather for a city
async function fetchCurrentWeather(searchVal) {
  const cityQuery = getCityQuery(searchVal);
  if (!cityQuery) throw new Error('Enter a city name');

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityQuery)}&appid=${APIKey}&units=imperial`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `City not found: ${cityQuery}`);
  }

  const currentData = await res.json();
  const label = await buildLabelFromWeatherData(currentData, cityQuery);
  return { currentData, label, cityQuery };
}

async function fetchForecast(cityQuery) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityQuery)}&appid=${APIKey}&units=imperial`;
  const forecastRes = await fetch(forecastUrl);
  return forecastRes.ok ? forecastRes.json() : { list: [] };
}

async function fetchAirPollution(lat, lon) {
  if (lat == null || lon == null) return null;
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${APIKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchWeatherBundle(searchVal) {
  const { currentData, label, cityQuery } = await fetchCurrentWeather(searchVal);
  const lat = currentData.coord?.lat;
  const lon = currentData.coord?.lon;
  const [forecastData, airData] = await Promise.all([
    fetchForecast(cityQuery),
    fetchAirPollution(lat, lon)
  ]);
  return { currentData, label, cityQuery, forecastData, airData };
}

// --- City comparison ---
function loadCompare() {
  try {
    const saved = localStorage.getItem(COMPARE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCompare(cities) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(cities));
}

function isInCompareList(label, list) {
  const key = getHistoryCityKey(label);
  return list.some((c) => getHistoryCityKey(c) === key);
}

function addToCompareList(searchVal) {
  const trimmed = (searchVal || '').trim();
  if (!trimmed) return { ok: false, message: 'Enter a city to compare' };

  let list = loadCompare();
  if (isInCompareList(trimmed, list)) {
    return { ok: false, message: 'City already in comparison' };
  }
  if (list.length >= MAX_COMPARE) {
    return { ok: false, message: `Maximum ${MAX_COMPARE} cities` };
  }

  list.push(trimmed);
  saveCompare(list);
  return { ok: true };
}

function removeFromCompareList(searchVal) {
  const key = getHistoryCityKey(searchVal);
  const list = loadCompare().filter((c) => getHistoryCityKey(c) !== key);
  saveCompare(list);
}

function buildCompareForecastDaysMarkup() {
  return Array.from({ length: 5 }, () => `
    <div class="compare-day">
      <span class="compare-day-date">--</span>
      <span class="weather-icon-wrap weather-anim-cloud compare-day-icon-wrap">
        <img src="./assets/imgs/icon.png" alt="" class="compare-day-icon card-icon">
      </span>
      <span class="compare-day-desc weather-type-label">--</span>
      <span class="compare-day-temp">--</span>
    </div>
  `).join('');
}

function buildCompareCardShell(cityLabel) {
  const card = document.createElement('article');
  card.className = 'compare-card is-loading';
  card.dataset.cityKey = getHistoryCityKey(cityLabel);

  card.innerHTML = `
    <button type="button" class="compare-remove" aria-label="Remove from comparison">&times;</button>
    <h4 class="compare-city">${cityLabel}</h4>
    <span class="weather-icon-wrap weather-anim-cloud compare-current-icon-wrap">
      <img src="./assets/imgs/icon.png" alt="" class="compare-icon card-icon">
    </span>
    <p class="compare-desc">Loading...</p>
    <div class="compare-aqi-wrap">
      ${buildAqiSliderMarkup('compare-aqi-visual').replace('class="aqi-label"', 'class="aqi-label compare-aqi-label"')}
      <p class="compare-aqi-pm aqi-pm-line">—</p>
    </div>
    <div class="compare-stats">
      <div class="compare-stat">
        <span class="compare-stat-label">Temp</span>
        <span class="compare-stat-value"><span class="compare-temp">--</span><span class="stat-unit">°F</span></span>
      </div>
      <div class="compare-stat">
        <span class="compare-stat-label">Wind</span>
        <span class="compare-stat-value"><span class="compare-wind">--</span><span class="stat-unit"> mph</span></span>
      </div>
      <div class="compare-stat">
        <span class="compare-stat-label">Humidity</span>
        <span class="compare-stat-value"><span class="compare-humidity">--</span><span class="stat-unit">%</span></span>
      </div>
    </div>
    <div class="compare-forecast">
      <p class="compare-forecast-label">5-Day Forecast</p>
      <div class="compare-forecast-days">${buildCompareForecastDaysMarkup()}</div>
    </div>
  `;

  card.querySelector('.compare-remove').addEventListener('click', () => {
    removeFromCompareList(cityLabel);
    renderCompare();
  });

  return card;
}

function renderCompareForecast(cardEl, forecastDays) {
  const dayEls = cardEl.querySelectorAll('.compare-day');
  dayEls.forEach((dayEl, i) => {
    const entry = forecastDays[i];
    if (!entry || !entry.weather || !entry.weather[0]) return;

    const dateSpan = dayEl.querySelector('.compare-day-date');
    const iconWrap = dayEl.querySelector('.compare-day-icon-wrap');
    const iconImg = dayEl.querySelector('.compare-day-icon');
    const descSpan = dayEl.querySelector('.compare-day-desc');
    const tempSpan = dayEl.querySelector('.compare-day-temp');

    if (dateSpan) dateSpan.textContent = formatShortDate(new Date(entry.dt * 1000));
    if (descSpan) descSpan.textContent = formatWeatherDescription(entry.weather[0].description);
    if (tempSpan) tempSpan.textContent = `${Math.round(entry.main.temp)}°`;
    setWeatherIcon(iconWrap, iconImg, entry.weather[0].icon, entry.weather[0].description);
  });
}

function updateCompareCard(cardEl, label, currentData, forecastDays, airData, errorMsg) {
  cardEl.classList.remove('is-loading');

  const cityEl = cardEl.querySelector('.compare-city');
  const iconWrap = cardEl.querySelector('.compare-current-icon-wrap') || cardEl.querySelector('.weather-icon-wrap:not(.compare-day-icon-wrap)');
  const iconImg = cardEl.querySelector('.compare-icon');
  const descEl = cardEl.querySelector('.compare-desc');
  const aqiVisual = cardEl.querySelector('.compare-aqi-visual');
  const aqiLabel = cardEl.querySelector('.compare-aqi-label');
  const aqiPm = cardEl.querySelector('.compare-aqi-pm');
  const tempEl = cardEl.querySelector('.compare-temp');
  const windEl = cardEl.querySelector('.compare-wind');
  const humEl = cardEl.querySelector('.compare-humidity');

  if (errorMsg) {
    if (cityEl) cityEl.textContent = label;
    if (descEl) descEl.textContent = errorMsg;
    if (tempEl) tempEl.textContent = '--';
    if (windEl) windEl.textContent = '--';
    if (humEl) humEl.textContent = '--';
    clearAqiVisual(aqiVisual, aqiLabel, aqiPm);
    cardEl.classList.add('is-error');
    return;
  }

  cardEl.classList.remove('is-error');
  if (cityEl) cityEl.textContent = label;

  const weather = currentData.weather && currentData.weather[0];
  if (descEl) descEl.textContent = weather ? formatWeatherDescription(weather.description) : '';
  if (tempEl) tempEl.textContent = Math.round(currentData.main.temp);
  if (windEl) windEl.textContent = Math.round(currentData.wind ? currentData.wind.speed : 0);
  if (humEl) humEl.textContent = currentData.main.humidity;

  if (weather) {
    setWeatherIcon(iconWrap, iconImg, weather.icon, weather.description);
  }

  applyAqiVisual(aqiVisual, aqiLabel, aqiPm, airData);
  renderCompareForecast(cardEl, forecastDays || []);
}

async function loadCompareCardData(cardEl, cityLabel) {
  const loadId = (cardEl._compareLoadId = (cardEl._compareLoadId || 0) + 1);
  const aqiVisual = cardEl.querySelector('.compare-aqi-visual');
  const aqiLabel = cardEl.querySelector('.compare-aqi-label');
  const aqiPm = cardEl.querySelector('.compare-aqi-pm');
  setAqiLoadingState(aqiVisual, aqiLabel, aqiPm);

  try {
    const { currentData, label, forecastData, airData } = await fetchWeatherBundle(cityLabel);
    if (cardEl._compareLoadId !== loadId) return;

    const forecastDays = pickFiveForecastDays(forecastData);
    const resolvedKey = getHistoryCityKey(label);
    cardEl.dataset.cityKey = resolvedKey;

    let list = loadCompare();
    const oldKey = getHistoryCityKey(cityLabel);
    list = list.map((c) => (getHistoryCityKey(c) === oldKey ? label : c));
    saveCompare(list);

    updateCompareCard(cardEl, label, currentData, forecastDays, airData);
  } catch (err) {
    if (cardEl._compareLoadId !== loadId) return;
    updateCompareCard(cardEl, cityLabel, null, [], null, err.message || 'Could not load');
  }
}

function refreshCompareCardForLabel(label) {
  if (!compareContainer || !label) return;
  const key = getHistoryCityKey(label);
  const card = [...compareContainer.querySelectorAll('.compare-card')].find(
    (el) => el.dataset.cityKey === key
  );
  if (card) loadCompareCardData(card, label);
}

async function renderCompare() {
  if (!compareContainer) return;

  const cities = loadCompare();
  compareContainer.innerHTML = '';

  if (cities.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'compare-empty';
    empty.id = 'compareEmpty';
    empty.textContent = 'No cities yet — add one above to start comparing.';
    compareContainer.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  cities.forEach((cityLabel) => {
    const card = buildCompareCardShell(cityLabel);
    fragment.appendChild(card);
    loadCompareCardData(card, cityLabel);
  });
  compareContainer.appendChild(fragment);
}

async function handleAddCompare(searchVal) {
  const result = addToCompareList(searchVal);
  if (!result.ok) {
    if (compareInput) compareInput.focus();
    return result;
  }
  if (compareInput) compareInput.value = '';
  await renderCompare();
  return result;
}

function setCompareControlsLoading(loading) {
  if (compareAddBtn) {
    compareAddBtn.disabled = loading;
    compareAddBtn.textContent = loading ? 'Adding...' : 'Add';
  }
  if (compareAddCurrent) compareAddCurrent.disabled = loading;
}

function initCompare() {
  if (!compareContainer) return;

  renderCompare();

  if (compareAddBtn && compareInput) {
    const runAdd = async () => {
      setCompareControlsLoading(true);
      await handleAddCompare(compareInput.value);
      setCompareControlsLoading(false);
    };
    compareAddBtn.addEventListener('click', runAdd);
    compareInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') runAdd();
    });
  }

  if (compareAddCurrent) {
    compareAddCurrent.addEventListener('click', async () => {
      const current = searchedCity.textContent.trim();
      if (!current || current === 'Enter a city' || current === 'Error') return;
      setCompareControlsLoading(true);
      await handleAddCompare(current);
      setCompareControlsLoading(false);
    });
  }

  if (compareClearBtn) {
    compareClearBtn.addEventListener('click', () => {
      saveCompare([]);
      renderCompare();
    });
  }
}

// Fetch current + forecast, update UI
async function doSearch(searchVal) {
  const cityQuery = getCityQuery(searchVal);
  if (!cityQuery) {
    searchedCity.textContent = 'Enter a city';
    clearCurrentWeather();
    return;
  }

  const searchId = ++latestSearchId;
  setAqiLoadingState(currentAqiVisual, currentAqiLabel, currentPm25);

  const originalBtnText = searchBtn.textContent;
  searchBtn.textContent = 'Loading...';
  searchBtn.setAttribute('aria-busy', 'true');

  try {
    const { currentData, label, forecastData, airData } = await fetchWeatherBundle(searchVal);
    if (searchId !== latestSearchId) return;

    searchedCity.textContent = label;
    updateCurrentWeather(currentData, airData);

    // Update 5-day forecast cards
    updateFiveDayForecast(forecastData);

    addToHistory(label);

    // Keep search input in sync with what we searched
    searchText.value = label;

    refreshCompareCardForLabel(label);

  } catch (err) {
    if (searchId !== latestSearchId) return;
    console.error(err);
    searchedCity.textContent = 'Error';
    clearCurrentWeather();
    // Show message in first card date area as fallback
    if (cards[0]) {
      const d = cards[0].querySelector('.card-date');
      if (d) d.textContent = err.message || 'Not found';
    }
  } finally {
    if (searchId === latestSearchId) {
      searchBtn.textContent = originalBtnText || 'Search';
      searchBtn.removeAttribute('aria-busy');
    }
  }
}

// Search button handler
searchBtn.addEventListener('click', () => {
  doSearch(searchText.value);
});

// Enter key support in search input
searchText.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    doSearch(searchText.value);
  }
});

// Clear history button
clearHistoryBtn.addEventListener('click', () => {
  clearHistory();
});

// Event delegation fallback for history clicks (in case)
historyList.addEventListener('click', (e) => {
  const item = e.target.closest('.history-item');
  if (item && item.textContent !== 'No searches yet') {
    searchText.value = item.textContent;
    doSearch(item.textContent);
  }
});

// Initialize app
async function init() {
  initTheme();
  setTodaysDate();
  initCompare();

  let history = loadHistory();
  if (history.length > 0) {
    history = await upgradeHistoryLabels();
  }
  renderHistory();

  if (history.length > 0) {
    searchText.value = history[0];
    doSearch(history[0]);
  } else {
    searchText.value = '';
    searchedCity.textContent = 'Search for a city';
    clearCurrentWeather();
  }
}

init();
