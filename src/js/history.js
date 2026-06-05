import { HISTORY_KEY, MAX_HISTORY } from './config.js';
import { getDom } from './dom.js';
import { getHistoryCityKey, labelNeedsUpgrade } from './format.js';
import { resolveLocationLabel } from './api.js';

export function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function renderHistory() {
  const { historyList } = getDom();
  if (!historyList) return;

  const history = loadHistory();
  const fragment = document.createDocumentFragment();

  if (history.length === 0) {
    const li = document.createElement('li');
    li.className = 'history-item history-item--empty';
    li.textContent = 'No searches yet';
    fragment.appendChild(li);
  } else {
    history.forEach((city) => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.textContent = city;
      li.dataset.city = city;
      fragment.appendChild(li);
    });
  }

  historyList.replaceChildren(fragment);
}

export function addToHistory(cityLabel) {
  if (!cityLabel) return;
  const cityKey = getHistoryCityKey(cityLabel);
  let history = loadHistory();
  history = history.filter((h) => getHistoryCityKey(h) !== cityKey);
  history.unshift(cityLabel);
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  saveHistory(history);
  renderHistory();
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

export async function upgradeHistoryLabels() {
  const history = loadHistory();
  const upgraded = await Promise.all(
    history.map((label) => (labelNeedsUpgrade(label) ? resolveLocationLabel(label) : label))
  );
  if (upgraded.some((label, i) => label !== history[i])) {
    saveHistory(upgraded);
  }
  return upgraded;
}

export function bindHistoryDelegation(onSelect) {
  const { historyList, searchText } = getDom();
  if (!historyList) return;

  historyList.addEventListener('click', (e) => {
    const item = e.target.closest('.history-item[data-city]');
    if (!item) return;
    const city = item.dataset.city;
    if (searchText) searchText.value = city;
    onSelect(city);
  });
}