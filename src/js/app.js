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
import { initPrefs } from './prefs.js';
import { initScrollRegions } from './scroll-regions.js';
import { initTheme } from './theme.js';
import { confirmDialog, initUiChrome, showToast } from './ui-chrome.js';
import {
  clearCurrentWeather,
  initForecastCards,
  setWeatherPanelState,
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
    setWeatherPanelState('empty');
    showToast({
      variant: 'info',
      title: 'City needed',
      message: 'Type a city name, then hit Search.'
    });
    return;
  }

  const searchId = ++latestSearchId;
  const originalBtnText = dom.searchBtn.textContent;
  dom.searchBtn.textContent = 'Loading...';
  dom.searchBtn.classList.add('is-loading');
  dom.searchBtn.setAttribute('aria-busy', 'true');
  setWeatherPanelState('loading');

  try {
    const { currentData, label, forecastData, airData } = await fetchWeatherBundle(searchVal);
    if (searchId !== latestSearchId) return;

    dom.searchedCity.textContent = label;
    updateCurrentWeather(currentData, airData);
    updateFiveDayForecast(forecastData);
    setWeatherPanelState('ready');
    addToHistory(label);
    dom.searchText.value = label;
    refreshCompareCardForLabel(label);
  } catch (err) {
    if (searchId !== latestSearchId) return;
    console.error(err);
    const message = err.message || 'Not found';
    dom.searchedCity.textContent = 'Couldn’t load city';
    clearCurrentWeather();
    setWeatherPanelState('error', message);
    showToast({
      variant: 'error',
      title: 'Search failed',
      message
    });
    const dateEl = getForecastCards()[0]?.querySelector('.card-date');
    if (dateEl) dateEl.textContent = message;
  } finally {
    if (searchId === latestSearchId) {
      dom.searchBtn.textContent = originalBtnText || 'Search';
      dom.searchBtn.classList.remove('is-loading');
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

  dom.clearHistoryBtn.addEventListener('click', async () => {
    const history = loadHistory();
    if (history.length === 0) {
      showToast({
        variant: 'info',
        title: 'Nothing to clear',
        message: 'Your recent adventures list is already empty.'
      });
      return;
    }

    const ok = await confirmDialog({
      title: 'Clear search history?',
      message: 'This removes all recent cities from this browser. You can always search again.',
      confirmLabel: 'Clear history',
      cancelLabel: 'Keep them'
    });
    if (!ok) return;
    clearHistory();
    showToast({
      variant: 'success',
      title: 'History cleared',
      message: 'Recent adventures have been removed.'
    });
  });

  bindHistoryDelegation(doSearch, addCityToCompare);
}

async function bootstrap() {
  initDom();
  initTheme();
  initPrefs();
  initUiChrome();
  initScrollRegions();
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
    setWeatherPanelState('empty');
  }
}

bootstrap();
