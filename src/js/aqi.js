import { AQI_LEVELS } from './config.js';

export function getAqiEntry(airData) {
  return airData?.list?.[0] ?? null;
}

function getAqiBaseClass(visualEl) {
  return visualEl.classList.contains('compare-aqi-visual')
    ? 'aqi-visual compare-aqi-visual'
    : 'aqi-visual';
}

export function pm25ToThumbPercent(pm25, aqi) {
  const anchors = [
    { pm: 0, pos: 6 },
    { pm: 12, pos: 18 },
    { pm: 35, pos: 34 },
    { pm: 55, pos: 52 },
    { pm: 150, pos: 80 },
    { pm: 300, pos: 94 }
  ];
  const fallback = { 1: 8, 2: 28, 3: 50, 4: 74, 5: 92 };

  if (pm25 == null || Number.isNaN(pm25)) return fallback[aqi] ?? 50;
  if (pm25 <= anchors[0].pm) return anchors[0].pos;
  if (pm25 >= anchors[anchors.length - 1].pm) return anchors[anchors.length - 1].pos;

  for (let i = 1; i < anchors.length; i += 1) {
    const hi = anchors[i];
    const lo = anchors[i - 1];
    if (pm25 <= hi.pm) {
      const t = (pm25 - lo.pm) / (hi.pm - lo.pm);
      return lo.pos + t * (hi.pos - lo.pos);
    }
  }

  return fallback[aqi] ?? 50;
}

export function buildAqiSliderMarkup(extraClass) {
  const cls = extraClass ? `aqi-visual ${extraClass}` : 'aqi-visual';
  return `
    <div class="${cls}" data-aqi="0" role="slider" aria-label="Air quality" aria-valuemin="1" aria-valuemax="5" aria-valuenow="0">
      <div class="aqi-slider-track">
        <div class="aqi-slider-thumb" aria-hidden="true"></div>
      </div>
      <p class="aqi-label">—</p>
    </div>
  `;
}

export function applyAqiVisual(visualEl, labelEl, pmEl, airData) {
  const entry = getAqiEntry(airData);
  if (!visualEl) return;

  const baseClass = getAqiBaseClass(visualEl);

  if (!entry?.main?.aqi) {
    visualEl.setAttribute('data-aqi', '0');
    visualEl.className = baseClass;
    visualEl.style.setProperty('--aqi-thumb-pos', '50%');
    visualEl.setAttribute('aria-label', 'Air quality unavailable');
    visualEl.setAttribute('aria-valuenow', '0');
    if (labelEl) labelEl.textContent = '—';
    if (pmEl) pmEl.textContent = '—';
    return;
  }

  const aqi = entry.main.aqi;
  const info = AQI_LEVELS[aqi] || { label: 'Unknown', class: 'aqi-lvl-unknown' };
  const pm = entry.components?.pm2_5;
  const thumbPos = pm25ToThumbPercent(pm, aqi);

  visualEl.setAttribute('data-aqi', String(aqi));
  visualEl.className = `${baseClass} ${info.class}`;
  visualEl.style.setProperty('--aqi-thumb-pos', `${thumbPos}%`);
  visualEl.setAttribute('aria-label', `Air quality: ${info.label}`);
  visualEl.setAttribute('aria-valuenow', String(aqi));
  if (labelEl) labelEl.textContent = info.label;
  if (pmEl) pmEl.textContent = pm != null ? `PM2.5: ${pm.toFixed(1)} µg/m³` : '—';
}