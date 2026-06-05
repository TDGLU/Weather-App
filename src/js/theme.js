import { THEME_KEY } from './config.js';
import { getDom } from './dom.js';

function updateThemeToggleUi(theme) {
  const { themeToggle } = getDom();
  if (!themeToggle) return;
  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.classList.toggle('is-dark', isDark);
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeToggleUi(next);
}

export function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
  setTheme(theme);

  const { themeToggle } = getDom();
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
  }
}