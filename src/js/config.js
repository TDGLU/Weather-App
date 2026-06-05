export const API_KEY = '7b23df2e93e0f4913efaf4a0404c91c0';
export const HISTORY_KEY = 'weatherAppHistory';
export const COMPARE_KEY = 'weatherAppCompare';
export const THEME_KEY = 'weatherAppTheme';
export const MAX_HISTORY = 6;
export const MAX_COMPARE = 10;
export const CACHE_TTL_MS = 10 * 60 * 1000;

export const API_WEATHER = 'https://api.openweathermap.org/data/2.5';
export const API_GEO = 'https://api.openweathermap.org/geo/1.0';
export const ICON_CDN = 'https://openweathermap.org/img/wn';

export const ICON_FALLBACK = './assets/images/icon.png';

export const AQI_LEVELS = {
  1: { label: 'Good', class: 'aqi-lvl-1' },
  2: { label: 'Fair', class: 'aqi-lvl-2' },
  3: { label: 'Moderate', class: 'aqi-lvl-3' },
  4: { label: 'Poor', class: 'aqi-lvl-4' },
  5: { label: 'Very Poor', class: 'aqi-lvl-5' }
};