export function formatLongDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatShortDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatWeatherDescription(description) {
  if (!description) return '';
  return description
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatCardDate(dt) {
  return formatLongDate(new Date(dt * 1000));
}

export function degToCompass(deg) {
  if (deg == null || Number.isNaN(deg)) return '';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function formatCityLocalTime(unixUtc, tzOffsetSec) {
  if (unixUtc == null) return '—';
  const offset = tzOffsetSec || 0;
  const d = new Date((unixUtc + offset) * 1000);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  });
}

export function metersToMiles(m) {
  if (m == null) return null;
  return m / 1609.34;
}

export function mmToInches(mm) {
  return mm * 0.0393701;
}

export function getCityQuery(searchVal) {
  const trimmed = (searchVal || '').trim();
  if (!trimmed) return '';
  const part = trimmed.split(',')[0].trim();
  return part || trimmed;
}

export function formatLocationLabel(city, state, country) {
  const parts = [(city || '').trim()];
  const statePart = (state || '').trim();
  const countryPart = (country || '').trim();
  if (statePart) parts.push(statePart);
  if (countryPart) parts.push(countryPart);
  return parts.filter(Boolean).join(', ');
}

export function getHistoryCityKey(label) {
  return getCityQuery(label).toLowerCase();
}

export function labelNeedsUpgrade(label) {
  const parts = (label || '').split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length === 2 && /^[A-Z]{2}$/i.test(parts[1]);
}

export function pickFiveForecastDays(forecastData) {
  if (!forecastData?.list?.length) return [];

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

  while (days.length < 5 && days.length > 0) {
    days.push(days[days.length - 1]);
  }

  return days;
}