import {
  API_KEY,
  API_GEO,
  API_WEATHER
} from './config.js';
import { cacheKey, cached } from './cache.js';
import {
  formatLocationLabel,
  getCityQuery
} from './format.js';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getStateFromCoords(lat, lon) {
  if (lat == null || lon == null) return '';
  const url = `${API_GEO}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
  try {
    const data = await cached(cacheKey('geo', lat, lon), () => fetchJson(url));
    return data[0]?.state ?? '';
  } catch {
    return '';
  }
}

export async function buildLabelFromWeatherData(currentData, cityQuery) {
  const cityName = currentData.name || cityQuery;
  const country = currentData.sys?.country ?? '';
  let state = '';
  if (currentData.coord) {
    state = await getStateFromCoords(currentData.coord.lat, currentData.coord.lon);
  }
  return formatLocationLabel(cityName, state, country);
}

async function fetchCurrentWeatherRaw(cityQuery) {
  const url = `${API_WEATHER}/weather?q=${encodeURIComponent(cityQuery)}&appid=${API_KEY}&units=imperial`;
  return fetchJson(url);
}

export async function fetchCurrentWeather(searchVal) {
  const cityQuery = getCityQuery(searchVal);
  if (!cityQuery) throw new Error('Enter a city name');

  const currentData = await cached(cacheKey('weather', cityQuery), () =>
    fetchCurrentWeatherRaw(cityQuery)
  );
  const label = await buildLabelFromWeatherData(currentData, cityQuery);
  return { currentData, label, cityQuery };
}

export async function fetchForecast(cityQuery) {
  const url = `${API_WEATHER}/forecast?q=${encodeURIComponent(cityQuery)}&appid=${API_KEY}&units=imperial`;
  try {
    return await cached(cacheKey('forecast', cityQuery), () => fetchJson(url));
  } catch {
    return { list: [] };
  }
}

export async function fetchAirPollution(lat, lon) {
  if (lat == null || lon == null) return null;
  const url = `${API_WEATHER}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  try {
    return await cached(cacheKey('air', lat, lon), () => fetchJson(url));
  } catch {
    return null;
  }
}

export async function fetchWeatherBundle(searchVal) {
  const cityQuery = getCityQuery(searchVal);
  return cached(cacheKey('bundle', cityQuery), async () => {
    const { currentData, label, cityQuery: query } = await fetchCurrentWeather(searchVal);
    const lat = currentData.coord?.lat;
    const lon = currentData.coord?.lon;
    const [forecastData, airData] = await Promise.all([
      fetchForecast(query),
      fetchAirPollution(lat, lon)
    ]);
    return { currentData, label, cityQuery: query, forecastData, airData };
  });
}

export async function resolveLocationLabel(searchVal) {
  const cityQuery = getCityQuery(searchVal);
  if (!cityQuery) return searchVal;
  try {
    const { label } = await fetchCurrentWeather(searchVal);
    return label;
  } catch {
    return searchVal;
  }
}