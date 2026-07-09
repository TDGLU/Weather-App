import { HISTORY_KEY } from './config.js';
import { isCityInCompare } from './compare.js';
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
    li.innerHTML =
      '<span class="state-block__icon" aria-hidden="true">✦</span><span>No searches yet — your next city shows up here</span>';
    fragment.appendChild(li);
  } else {
    history.forEach((city) => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.dataset.city = city;

      const cityBtn = document.createElement('button');
      cityBtn.type = 'button';
      cityBtn.className = 'history-item-city';
      cityBtn.textContent = city;

      const inCompare = isCityInCompare(city);
      const compareBtn = document.createElement('button');
      compareBtn.type = 'button';
      compareBtn.className = 'history-item-compare';
      compareBtn.textContent = inCompare ? 'Added' : 'Compare';
      compareBtn.setAttribute('aria-label', `${inCompare ? 'Already in' : 'Add to'} comparison: ${city}`);
      compareBtn.disabled = inCompare;

      li.append(cityBtn, compareBtn);
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

document.addEventListener('weather-compare-changed', () => renderHistory());

export function bindHistoryDelegation(onSelect, onAddCompare) {
  const { historyList, searchText } = getDom();
  if (!historyList) return;

  historyList.addEventListener('click', async (e) => {
    const compareBtn = e.target.closest('.history-item-compare');
    if (compareBtn) {
      e.stopPropagation();
      const item = compareBtn.closest('.history-item[data-city]');
      if (!item || compareBtn.disabled) return;
      const city = item.dataset.city;
      if (!onAddCompare) return;
      const result = await onAddCompare(city);
      if (result?.ok) renderHistory();
      return;
    }

    const cityBtn = e.target.closest('.history-item-city');
    if (!cityBtn) return;

    const item = cityBtn.closest('.history-item[data-city]');
    if (!item) return;
    const city = item.dataset.city;
    if (searchText) searchText.value = city;
    onSelect(city);
  });
}