import { ICON_CDN, ICON_FALLBACK } from './config.js';

export function getDisplayIconCode(iconCode) {
  const code = (iconCode || '01d').replace(/@.*$/, '');
  if (code.length >= 3 && code.endsWith('n')) {
    return `${code.slice(0, -1)}d`;
  }
  return code;
}

export function getWeatherAnimClass(iconCode) {
  const code = getDisplayIconCode(iconCode).slice(0, 2);
  if (code === '11') return 'weather-anim-storm';
  if (code === '09' || code === '10') return 'weather-anim-rain';
  if (code === '13') return 'weather-anim-snow';
  if (code === '50') return 'weather-anim-mist';
  if (code === '01') return 'weather-anim-sun';
  return 'weather-anim-cloud';
}

export function setWeatherIcon(iconWrap, iconImg, rawIconCode, description, extraWrapClass = '') {
  if (!iconImg) return;
  const iconCode = getDisplayIconCode(rawIconCode);
  const nextSrc = `${ICON_CDN}/${iconCode}@2x.png`;
  if (iconImg.src !== nextSrc) iconImg.src = nextSrc;
  iconImg.alt = description || 'weather icon';
  iconImg.decoding = 'async';
  iconImg.loading = 'lazy';
  iconImg.width = 64;
  iconImg.height = 64;
  if (iconWrap) {
    const extra = extraWrapClass ? ` ${extraWrapClass}` : '';
    iconWrap.className = `weather-icon-wrap ${getWeatherAnimClass(iconCode)}${extra}`;
  }
}

export function resetWeatherIcon(iconWrap, iconImg, extraWrapClass = '') {
  if (iconImg) {
    iconImg.src = ICON_FALLBACK;
    iconImg.alt = '';
  }
  if (iconWrap) {
    const extra = extraWrapClass ? ` ${extraWrapClass}` : '';
    iconWrap.className = `weather-icon-wrap weather-anim-cloud${extra}`;
  }
}