/**
 * Lightweight display preferences (localStorage).
 * Glass form controls in the search panel wire into these keys.
 */

import { PREFS_KEY } from './config.js';
import { getDom } from './dom.js';
import { getTheme, setTheme } from './theme.js';

const DEFAULTS = {
  followSystem: false,
  compactStats: true,
  motion: 'full'
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function applyPrefs(prefs) {
  document.body.classList.toggle('prefs-stats-roomy', !prefs.compactStats);
  document.body.classList.toggle('prefs-motion-reduced', prefs.motion === 'reduced');
  document.documentElement.dataset.motion = prefs.motion;
}

function syncControls(prefs) {
  const dom = getDom();
  if (dom.prefFollowSystem) dom.prefFollowSystem.checked = !!prefs.followSystem;
  if (dom.prefCompactStats) dom.prefCompactStats.checked = !!prefs.compactStats;
  if (dom.prefMotion) dom.prefMotion.value = prefs.motion === 'reduced' ? 'reduced' : 'full';
}

function applySystemThemeIfNeeded(prefs) {
  if (!prefs.followSystem) return;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

export function initPrefs() {
  const prefs = loadPrefs();
  applyPrefs(prefs);
  syncControls(prefs);
  applySystemThemeIfNeeded(prefs);

  const dom = getDom();

  const persist = (patch) => {
    const next = { ...loadPrefs(), ...patch };
    savePrefs(next);
    applyPrefs(next);
    return next;
  };

  if (dom.prefFollowSystem) {
    dom.prefFollowSystem.addEventListener('change', () => {
      const next = persist({ followSystem: dom.prefFollowSystem.checked });
      if (next.followSystem) {
        applySystemThemeIfNeeded(next);
      }
    });
  }

  if (dom.prefCompactStats) {
    dom.prefCompactStats.addEventListener('change', () => {
      persist({ compactStats: dom.prefCompactStats.checked });
    });
  }

  if (dom.prefMotion) {
    dom.prefMotion.addEventListener('change', () => {
      persist({ motion: dom.prefMotion.value === 'reduced' ? 'reduced' : 'full' });
    });
  }

  // When "match system" is on, follow OS changes and re-apply on theme toggle reverse
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onScheme = () => {
    const current = loadPrefs();
    if (current.followSystem) applySystemThemeIfNeeded(current);
  };
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onScheme);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(onScheme);
  }

  // Manual theme toggle turns off follow-system so the choice sticks
  if (dom.themeToggle) {
    dom.themeToggle.addEventListener('click', () => {
      const current = loadPrefs();
      if (!current.followSystem) return;
      // Theme module already flipped theme; mark follow-system off after toggle
      window.setTimeout(() => {
        const after = getTheme();
        const next = persist({ followSystem: false });
        syncControls(next);
        // Keep the theme the user just selected
        setTheme(after);
      }, 0);
    });
  }
}
