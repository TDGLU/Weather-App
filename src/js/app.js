import { fetchWeatherBundle } from './api.js';
import { addCityToCompare, initCompare, refreshCompareCardForLabel } from './compare.js';
import { getDom, getForecastCards, initDom, setForecastCards } from './dom.js';
import { formatLongDate, getCityQuery } from './format.js';
import {
  addToHistory,
  bindHistoryDelegation,
  clearHistory,
  loadHistory,
  renderHistory,
  upgradeHistoryLabels
} from './history.js';
import { initTheme } from './theme.js';
import {
  clearCurrentWeather,
  initForecastCards,
  updateCurrentWeather,
  updateFiveDayForecast
} from './weather-ui.js';

let latestSearchId = 0;

async function doSearch(searchVal) {
  const dom = getDom();
  const cityQuery = getCityQuery(searchVal);

  if (!cityQuery) {
    dom.searchedCity.textContent = 'Enter a city';
    clearCurrentWeather();
    return;
  }

  const searchId = ++latestSearchId;
  const originalBtnText = dom.searchBtn.textContent;
  dom.searchBtn.textContent = 'Loading...';
  dom.searchBtn.setAttribute('aria-busy', 'true');

  try {
    const { currentData, label, forecastData, airData } = await fetchWeatherBundle(searchVal);
    if (searchId !== latestSearchId) return;

    dom.searchedCity.textContent = label;
    updateCurrentWeather(currentData, airData);
    updateFiveDayForecast(forecastData);
    addToHistory(label);
    dom.searchText.value = label;
    refreshCompareCardForLabel(label);
  } catch (err) {
    if (searchId !== latestSearchId) return;
    console.error(err);
    dom.searchedCity.textContent = 'Error';
    clearCurrentWeather();
    const dateEl = getForecastCards()[0]?.querySelector('.card-date');
    if (dateEl) dateEl.textContent = err.message || 'Not found';
  } finally {
    if (searchId === latestSearchId) {
      dom.searchBtn.textContent = originalBtnText || 'Search';
      dom.searchBtn.removeAttribute('aria-busy');
    }
  }
}

function bindEvents() {
  const dom = getDom();
  dom.searchBtn.addEventListener('click', () => doSearch(dom.searchText.value));
  dom.searchText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch(dom.searchText.value);
  });
  dom.clearHistoryBtn.addEventListener('click', clearHistory);
  bindHistoryDelegation(doSearch, addCityToCompare);
}

async function bootstrap() {
  initDom();
  initTheme();
  bindEvents();

  const dom = getDom();
  dom.todaysDate.textContent = formatLongDate(new Date());
  const forecastCards = initForecastCards();
  setForecastCards(forecastCards);
  getForecastCards();
  initCompare();

  let history = loadHistory();
  if (history.length > 0) {
    history = await upgradeHistoryLabels();
  }
  renderHistory();

  if (history.length > 0) {
    dom.searchText.value = history[0];
    doSearch(history[0]);
  } else {
    dom.searchText.value = '';
    dom.searchedCity.textContent = 'Search for a city';
    clearCurrentWeather();
  }
}

bootstrap();