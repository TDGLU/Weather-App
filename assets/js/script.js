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

// Set today's date
function setTodaysDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  todaysDate.textContent = `${mm}/${dd}/${yyyy}`;
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

// Add a city to history (dedup + recent first + limit)
function addToHistory(cityLabel) {
  if (!cityLabel) return;
  let history = loadHistory();
  // remove existing (case-insensitive match)
  history = history.filter(h => h.toLowerCase() !== cityLabel.toLowerCase());
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

// Format date from unix ts to M/D/YYYY (no leading zero on month/day to match original style)
function formatCardDate(dt) {
  const d = new Date(dt * 1000);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

// Update a single forecast card
function updateCard(cardEl, entry) {
  if (!entry || !entry.main || !entry.weather || !entry.weather[0]) return;

  const dateP = cardEl.querySelector('.card-date');
  const iconImg = cardEl.querySelector('.card-icon');
  const tempSpan = cardEl.querySelector('.card-temp span');
  const windSpan = cardEl.querySelector('.card-wind span');
  const humSpan = cardEl.querySelector('.card-humidity span');

  if (dateP) dateP.textContent = formatCardDate(entry.dt);
  if (iconImg) {
    const iconCode = entry.weather[0].icon || '01d';
    iconImg.src = `https://openweathermap.org/img/wn/${iconCode}.png`;
    iconImg.alt = entry.weather[0].description || 'weather icon';
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

    // Update CURRENT weather
    searchedCity.textContent = currentData.name || cityQuery;
    currentCityTemp.textContent = Math.round(currentData.main.temp);
    currentCityWind.textContent = Math.round(currentData.wind.speed);
    currentCityHumidity.textContent = currentData.main.humidity;

    // Update 5-day forecast cards
    updateFiveDayForecast(forecastData);

    // Add to history using resolved name + country (e.g. "Perris, US")
    const label = `${currentData.name}, ${currentData.sys && currentData.sys.country ? currentData.sys.country : 'US'}`;
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
function init() {
  setTodaysDate();

  // Seed some example history on very first run (like original static list)
  let history = loadHistory();
  if (history.length === 0) {
    const seeds = ['Perris, US', 'Los Angeles, US', 'Bakersfield, US', 'Fontana, US'];
    saveHistory(seeds);
    history = seeds;
  }

  // Render (now has items)
  renderHistory();

  // Auto-load weather for last (most recent) history item so app shows data immediately
  const defaultCity = history[0] || 'Perris, US';

  // Set input to default and fetch immediately so app "works" on load
  searchText.value = defaultCity;
  doSearch(defaultCity);
}

init();
