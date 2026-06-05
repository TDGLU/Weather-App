// Weather App - Functional Search + 5-Day Forecast

const APIKey = '7b23df2e93e0f4913efaf4a0404c91c0';
const HISTORY_KEY = 'weatherAppHistory';
const MAX_HISTORY = 6;

// DOM Elements
const searchText = document.getElementById('searchText');
const searchBtn = document.getElementById('searchBtn');
const historyList = document.getElementById('history');
const clearHistoryBtn = document.getElementById('clearHistory');

const searchedCity = document.getElementById('searchedCity');
const currentCityTemp = document.getElementById('currentCityTemp');
const currentCityWind = document.getElementById('currentCityWind');
const currentCityHumidity = document.getElementById('currentCityHumidity');

const todaysDate = document.getElementById('todaysDate');
const cards = document.querySelectorAll('.card');

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

// CSS animation class from OpenWeather icon code
function getWeatherAnimClass(iconCode) {
  const code = (iconCode || '01d').replace(/@.*$/, '').slice(0, 2);
  if (code === '11') return 'weather-anim-storm';
  if (code === '09' || code === '10') return 'weather-anim-rain';
  if (code === '13') return 'weather-anim-snow';
  if (code === '50') return 'weather-anim-mist';
  if (code === '01') return 'weather-anim-sun';
  return 'weather-anim-cloud';
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

// Update a single forecast card
function updateCard(cardEl, entry) {
  if (!entry || !entry.main || !entry.weather || !entry.weather[0]) return;

  const dateP = cardEl.querySelector('.card-date');
  const iconWrap = cardEl.querySelector('.weather-icon-wrap');
  const iconImg = cardEl.querySelector('.card-icon');
  const tempSpan = cardEl.querySelector('.card-temp span');
  const windSpan = cardEl.querySelector('.card-wind span');
  const humSpan = cardEl.querySelector('.card-humidity span');

  if (dateP) dateP.textContent = formatCardDate(entry.dt);
  if (iconImg) {
    const iconCode = entry.weather[0].icon || '01d';
    iconImg.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconImg.alt = entry.weather[0].description || 'weather icon';
    if (iconWrap) {
      iconWrap.className = `weather-icon-wrap ${getWeatherAnimClass(iconCode)}`;
    }
  }
  if (tempSpan) tempSpan.textContent = Math.round(entry.main.temp);
  if (windSpan) windSpan.textContent = Math.round(entry.wind ? entry.wind.speed : 0);
  if (humSpan) humSpan.textContent = entry.main.humidity;
}

// Update all 5 forecast cards from the forecast list (pick one per day, using local calendar days)
function updateFiveDayForecast(forecastData) {
  if (!forecastData || !forecastData.list || forecastData.list.length === 0) return;

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

  // If fewer than 5, pad by repeating last (rare)
  while (days.length < 5 && days.length > 0) {
    days.push(days[days.length - 1]);
  }

  cards.forEach((card, i) => {
    if (days[i]) {
      updateCard(card, days[i]);
    }
  });
}

// Fetch current + forecast, update UI
async function doSearch(searchVal) {
  const cityQuery = getCityQuery(searchVal);
  if (!cityQuery) {
    searchedCity.textContent = 'Enter a city';
    return;
  }

  // Visual loading feedback
  const originalBtnText = searchBtn.textContent;
  searchBtn.textContent = 'Loading...';
  searchBtn.disabled = true;

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityQuery)}&appid=${APIKey}&units=imperial`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityQuery)}&appid=${APIKey}&units=imperial`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok) {
      const err = await currentRes.json().catch(() => ({}));
      throw new Error(err.message || `City not found: ${cityQuery}`);
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    const label = await buildLabelFromWeatherData(currentData, cityQuery);

    // Update CURRENT weather
    searchedCity.textContent = label;
    currentCityTemp.textContent = Math.round(currentData.main.temp);
    currentCityWind.textContent = Math.round(currentData.wind.speed);
    currentCityHumidity.textContent = currentData.main.humidity;

    // Update 5-day forecast cards
    updateFiveDayForecast(forecastData);

    addToHistory(label);

    // Keep search input in sync with what we searched
    searchText.value = label;

  } catch (err) {
    console.error(err);
    searchedCity.textContent = 'Error';
    currentCityTemp.textContent = '--';
    currentCityWind.textContent = '--';
    currentCityHumidity.textContent = '--';
    // Show message in first card date area as fallback
    if (cards[0]) {
      const d = cards[0].querySelector('.card-date');
      if (d) d.textContent = err.message || 'Not found';
    }
  } finally {
    searchBtn.textContent = originalBtnText || 'Search';
    searchBtn.disabled = false;
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
  setTodaysDate();

  // Seed some example history on very first run (like original static list)
  let history = loadHistory();
  if (history.length === 0) {
    const seeds = ['Perris, US', 'Los Angeles, US', 'Bakersfield, US', 'Fontana, US'];
    saveHistory(seeds);
    history = seeds;
  }

  // Upgrade legacy "City, US" entries to "City, State, Country"
  history = await upgradeHistoryLabels();
  renderHistory();

  const defaultCity = history[0] || 'Perris, US';
  searchText.value = defaultCity;
  doSearch(defaultCity);
}

init();
