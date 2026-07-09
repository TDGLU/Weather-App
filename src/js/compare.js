import { COMPARE_KEY, ICON_FALLBACK, MAX_COMPARE } from './config.js';
import { fetchWeatherBundle } from './api.js';
import { applyAqiVisual, buildAqiSliderMarkup } from './aqi.js';
import { getDom } from './dom.js';
import {
  formatShortDate,
  formatWeatherDescription,
  getHistoryCityKey,
  pickFiveForecastDays
} from './format.js';
import { setWeatherIcon } from './icons.js';
import { confirmDialog, showToast } from './ui-chrome.js';

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

function emitCompareChanged() {
  document.dispatchEvent(new CustomEvent('weather-compare-changed'));
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
        <img src="${ICON_FALLBACK}" alt="" class="compare-day-icon card-icon" width="48" height="48" decoding="async" loading="lazy">
      </span>
      <span class="compare-day-desc weather-type-label">--</span>
      <span class="compare-day-temp">--</span>
    </div>
  `).join('');
}

function buildCompareCardShell(cityLabel, onRemove) {
  const card = document.createElement('article');
  card.className = 'compare-card is-loading';
  card.dataset.cityKey = getHistoryCityKey(cityLabel);

  card.innerHTML = `
    <button type="button" class="compare-remove" aria-label="Remove from comparison">&times;</button>
    <h4 class="compare-city">${cityLabel}</h4>
    <span class="weather-icon-wrap weather-anim-cloud compare-current-icon-wrap">
      <img src="${ICON_FALLBACK}" alt="" class="compare-icon card-icon" width="64" height="64" decoding="async">
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
    emitCompareChanged();
    onRemove();
  });

  return card;
}

function renderCompareForecast(cardEl, forecastDays) {
  const dayEls = cardEl.querySelectorAll('.compare-day');
  dayEls.forEach((dayEl, i) => {
    const entry = forecastDays[i];
    if (!entry?.weather?.[0]) return;

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
  const iconWrap = cardEl.querySelector('.compare-current-icon-wrap')
    || cardEl.querySelector('.weather-icon-wrap:not(.compare-day-icon-wrap)');
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
    applyAqiVisual(aqiVisual, aqiLabel, aqiPm, null);
    cardEl.classList.add('is-error');
    return;
  }

  cardEl.classList.remove('is-error');
  if (cityEl) cityEl.textContent = label;

  const weather = currentData.weather?.[0];
  if (descEl) descEl.textContent = weather ? formatWeatherDescription(weather.description) : '';
  if (tempEl) tempEl.textContent = Math.round(currentData.main.temp);
  if (windEl) windEl.textContent = Math.round(currentData.wind?.speed ?? 0);
  if (humEl) humEl.textContent = currentData.main.humidity;

  if (weather) {
    setWeatherIcon(iconWrap, iconImg, weather.icon, weather.description);
  }

  applyAqiVisual(aqiVisual, aqiLabel, aqiPm, airData);
  renderCompareForecast(cardEl, forecastDays || []);
}

async function loadCompareCardData(cardEl, cityLabel) {
  const loadId = (cardEl._compareLoadId = (cardEl._compareLoadId || 0) + 1);
  try {
    const { currentData, label, forecastData, airData } = await fetchWeatherBundle(cityLabel);
    if (cardEl._compareLoadId !== loadId) return;

    const forecastDays = pickFiveForecastDays(forecastData);
    cardEl.dataset.cityKey = getHistoryCityKey(label);

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

async function renderCompare() {
  const { compareContainer } = getDom();
  if (!compareContainer) return;

  const cities = loadCompare();
  compareContainer.replaceChildren();

  if (cities.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'compare-empty state-block state-empty';
    empty.id = 'compareEmpty';
    empty.innerHTML = `
      <span class="state-block__icon" aria-hidden="true">⇄</span>
      <p class="state-block__title">No cities yet</p>
      <p class="state-block__text">Add a city above — or use Compare from recent adventures — to stack forecasts side by side.</p>
    `;
    compareContainer.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  cities.forEach((cityLabel) => {
    const card = buildCompareCardShell(cityLabel, renderCompare);
    fragment.appendChild(card);
    loadCompareCardData(card, cityLabel);
  });
  compareContainer.appendChild(fragment);
}

async function handleAddCompare(searchVal) {
  const result = addToCompareList(searchVal);
  if (!result.ok) {
    const { compareInput } = getDom();
    if (compareInput) compareInput.focus();
    if (result.message) {
      showToast({ variant: 'info', title: 'Compare', message: result.message });
    }
    return result;
  }
  const { compareInput } = getDom();
  if (compareInput) compareInput.value = '';
  await renderCompare();
  emitCompareChanged();
  showToast({
    variant: 'success',
    title: 'City added',
    message: (searchVal || '').trim() || 'Added to comparison'
  });
  return result;
}

export function isCityInCompare(label) {
  return isInCompareList(label, loadCompare());
}

export async function addCityToCompare(searchVal) {
  const result = await handleAddCompare(searchVal);
  if (result.ok) {
    document.querySelector('.compare-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }
  return result;
}

function setCompareControlsLoading(loading) {
  const { compareAddBtn, compareAddCurrent } = getDom();
  if (compareAddBtn) {
    compareAddBtn.disabled = loading;
    compareAddBtn.textContent = loading ? 'Adding...' : 'Add';
  }
  if (compareAddCurrent) compareAddCurrent.disabled = loading;
}

export function refreshCompareCardForLabel(label) {
  const { compareContainer } = getDom();
  if (!compareContainer || !label) return;
  const key = getHistoryCityKey(label);
  const card = [...compareContainer.querySelectorAll('.compare-card')].find(
    (el) => el.dataset.cityKey === key
  );
  if (card) loadCompareCardData(card, label);
}

export function initCompare() {
  const {
    compareContainer,
    compareAddBtn,
    compareInput,
    compareAddCurrent,
    compareClearBtn,
    searchedCity
  } = getDom();

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
      const current = searchedCity?.textContent.trim() ?? '';
      if (
        !current ||
        current === 'Enter a city' ||
        current === 'Error' ||
        current === 'Search for a city' ||
        current === 'Couldn’t load city'
      ) {
        showToast({
          variant: 'info',
          title: 'No current city',
          message: 'Search for a city first, then add it to compare.'
        });
        return;
      }
      setCompareControlsLoading(true);
      await handleAddCompare(current);
      setCompareControlsLoading(false);
    });
  }

  if (compareClearBtn) {
    compareClearBtn.addEventListener('click', async () => {
      const list = loadCompare();
      if (list.length === 0) {
        showToast({
          variant: 'info',
          title: 'Nothing to clear',
          message: 'Comparison is already empty.'
        });
        return;
      }

      const ok = await confirmDialog({
        title: 'Clear comparison?',
        message: `Remove all ${list.length} cities from the comparison strip?`,
        confirmLabel: 'Clear all',
        cancelLabel: 'Keep them'
      });
      if (!ok) return;

      saveCompare([]);
      emitCompareChanged();
      renderCompare();
      showToast({
        variant: 'success',
        title: 'Comparison cleared',
        message: 'All compared cities were removed.'
      });
    });
  }
}