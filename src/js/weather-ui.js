import { ICON_FALLBACK } from './config.js';
import { applyAqiVisual } from './aqi.js';
import { getDom, getForecastCards } from './dom.js';
import {
  degToCompass,
  formatCardDate,
  formatCityLocalTime,
  formatWeatherDescription,
  metersToMiles,
  mmToInches,
  pickFiveForecastDays
} from './format.js';
import { resetWeatherIcon, setWeatherIcon } from './icons.js';

function setText(el, text) {
  if (el) el.textContent = text ?? '—';
}

export function buildForecastCardMarkup() {
  return `
    <p class="card-date">—</p>
    <span class="weather-icon-wrap weather-anim-cloud">
      <img src="${ICON_FALLBACK}" alt="" class="card-icon" width="64" height="64" decoding="async" loading="lazy">
    </span>
    <p class="card-weather-desc weather-type-label">—</p>
    <p class="card-temp">Temp: <span class="card-value">—</span><span class="stat-unit">°F</span></p>
    <p class="card-wind">Wind: <span class="card-value">—</span><span class="stat-unit"> mph</span></p>
    <p class="card-humidity">Humidity: <span class="card-value">—</span><span class="stat-unit">%</span></p>
  `;
}

export function initForecastCards() {
  const { cardsContainer } = getDom();
  if (!cardsContainer) return [];

  const fragment = document.createDocumentFragment();
  const cards = [];

  for (let i = 0; i < 5; i += 1) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = buildForecastCardMarkup();
    fragment.appendChild(card);
    cards.push(card);
  }

  cardsContainer.appendChild(fragment);
  return cards;
}

export function clearCurrentWeather() {
  const dom = getDom();
  setText(dom.currentWeatherDesc, '—');
  resetWeatherIcon(dom.currentWeatherIconWrap, dom.currentWeatherIcon, 'current-hero-icon-wrap');

  [
    dom.currentCityTemp,
    dom.currentFeelsLike,
    dom.currentHighLow,
    dom.currentCityHumidity,
    dom.currentWind,
    dom.currentGust,
    dom.currentPressure,
    dom.currentVisibility,
    dom.currentClouds,
    dom.currentPrecip,
    dom.currentSunrise,
    dom.currentSunset
  ].forEach((el) => setText(el, '—'));

  applyAqiVisual(dom.currentAqiVisual, dom.currentAqiLabel, dom.currentPm25, null);
}

export function updateCurrentWeather(currentData, airData) {
  const dom = getDom();
  const main = currentData.main || {};
  const weather = currentData.weather?.[0];
  const wind = currentData.wind || {};
  const clouds = currentData.clouds || {};
  const tz = currentData.timezone || 0;

  if (weather) {
    setText(dom.currentWeatherDesc, formatWeatherDescription(weather.description));
    setWeatherIcon(
      dom.currentWeatherIconWrap,
      dom.currentWeatherIcon,
      weather.icon,
      weather.description,
      'current-hero-icon-wrap'
    );
  }

  setText(dom.currentCityTemp, main.temp != null ? Math.round(main.temp) : '—');
  setText(dom.currentFeelsLike, main.feels_like != null ? Math.round(main.feels_like) : '—');

  if (main.temp_max != null && main.temp_min != null) {
    setText(dom.currentHighLow, `${Math.round(main.temp_max)}° / ${Math.round(main.temp_min)}°`);
  } else {
    setText(dom.currentHighLow, '—');
  }

  setText(dom.currentCityHumidity, main.humidity != null ? main.humidity : '—');

  const windSpeed = wind.speed != null ? Math.round(wind.speed) : null;
  const windDir = degToCompass(wind.deg);
  if (windSpeed != null) {
    setText(dom.currentWind, windDir ? `${windSpeed} mph ${windDir}` : `${windSpeed} mph`);
  } else {
    setText(dom.currentWind, '—');
  }

  setText(dom.currentGust, wind.gust != null ? `${Math.round(wind.gust)} mph` : '—');
  setText(dom.currentPressure, main.pressure != null ? `${main.pressure} hPa` : '—');

  const visMi = metersToMiles(currentData.visibility);
  setText(dom.currentVisibility, visMi != null ? `${visMi.toFixed(1)} mi` : '—');
  setText(dom.currentClouds, clouds.all != null ? clouds.all : '—');

  const rainMm = currentData.rain?.['1h'];
  const snowMm = currentData.snow?.['1h'];
  if (rainMm != null) {
    setText(dom.currentPrecip, `${mmToInches(rainMm).toFixed(2)} in rain`);
  } else if (snowMm != null) {
    setText(dom.currentPrecip, `${mmToInches(snowMm).toFixed(2)} in snow`);
  } else {
    setText(dom.currentPrecip, '0 in');
  }

  setText(dom.currentSunrise, formatCityLocalTime(currentData.sys?.sunrise, tz));
  setText(dom.currentSunset, formatCityLocalTime(currentData.sys?.sunset, tz));
  applyAqiVisual(dom.currentAqiVisual, dom.currentAqiLabel, dom.currentPm25, airData);
}

function updateForecastCard(cardEl, entry) {
  if (!entry?.main || !entry?.weather?.[0]) return;

  const dateP = cardEl.querySelector('.card-date');
  const weatherDescP = cardEl.querySelector('.card-weather-desc');
  const iconWrap = cardEl.querySelector('.weather-icon-wrap');
  const iconImg = cardEl.querySelector('.card-icon');
  const tempSpan = cardEl.querySelector('.card-temp .card-value');
  const windSpan = cardEl.querySelector('.card-wind .card-value');
  const humSpan = cardEl.querySelector('.card-humidity .card-value');

  if (dateP) dateP.textContent = formatCardDate(entry.dt);
  if (weatherDescP) weatherDescP.textContent = formatWeatherDescription(entry.weather[0].description);
  if (iconImg) setWeatherIcon(iconWrap, iconImg, entry.weather[0].icon, entry.weather[0].description);
  if (tempSpan) tempSpan.textContent = String(Math.round(entry.main.temp ?? 0));
  if (windSpan) windSpan.textContent = String(Math.round(entry.wind?.speed ?? 0));
  if (humSpan) humSpan.textContent = entry.main.humidity != null ? String(entry.main.humidity) : '—';
}

export function updateFiveDayForecast(forecastData) {
  const cards = getForecastCards();
  const days = pickFiveForecastDays(forecastData);
  cards.forEach((card, i) => {
    if (days[i]) updateForecastCard(card, days[i]);
  });
}