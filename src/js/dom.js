let refs = null;

export function initDom() {
  refs = {
    searchText: document.getElementById('searchText'),
    searchBtn: document.getElementById('searchBtn'),
    historyList: document.getElementById('history'),
    clearHistoryBtn: document.getElementById('clearHistory'),
    searchedCity: document.getElementById('searchedCity'),
    currentWeatherIconWrap: document.getElementById('currentWeatherIconWrap'),
    currentWeatherIcon: document.getElementById('currentWeatherIcon'),
    currentWeatherDesc: document.getElementById('currentWeatherDesc'),
    currentCityTemp: document.getElementById('currentCityTemp'),
    currentFeelsLike: document.getElementById('currentFeelsLike'),
    currentHighLow: document.getElementById('currentHighLow'),
    currentCityHumidity: document.getElementById('currentCityHumidity'),
    currentWind: document.getElementById('currentWind'),
    currentGust: document.getElementById('currentGust'),
    currentPressure: document.getElementById('currentPressure'),
    currentVisibility: document.getElementById('currentVisibility'),
    currentClouds: document.getElementById('currentClouds'),
    currentPrecip: document.getElementById('currentPrecip'),
    currentSunrise: document.getElementById('currentSunrise'),
    currentSunset: document.getElementById('currentSunset'),
    currentAqiVisual: document.getElementById('currentAqiVisual'),
    currentAqiLabel: document.getElementById('currentAqiLabel'),
    currentPm25: document.getElementById('currentPm25'),
    todaysDate: document.getElementById('todaysDate'),
    themeToggle: document.getElementById('themeToggle'),
    compareInput: document.getElementById('compareInput'),
    compareAddBtn: document.getElementById('compareAddBtn'),
    compareAddCurrent: document.getElementById('compareAddCurrent'),
    compareClearBtn: document.getElementById('compareClearBtn'),
    compareContainer: document.getElementById('compareContainer'),
    cardsContainer: document.querySelector('.cards-container'),
    cards: []
  };
  return refs;
}

export function getDom() {
  return refs;
}

export function setForecastCards(cards) {
  if (refs) refs.cards = cards;
}