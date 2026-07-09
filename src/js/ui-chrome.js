/**
 * Liquid-glass UI chrome: toasts and confirm modals.
 */

let toastRegion = null;
let modalEls = null;
let activeConfirm = null;
let lastFocus = null;

function ensureToastRegion() {
  if (toastRegion?.isConnected) return toastRegion;
  toastRegion = document.getElementById('toastRegion');
  if (!toastRegion) {
    toastRegion = document.createElement('div');
    toastRegion.id = 'toastRegion';
    toastRegion.className = 'toast-region';
    toastRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastRegion);
  }
  return toastRegion;
}

function ensureModal() {
  if (modalEls?.backdrop?.isConnected) return modalEls;

  const backdrop = document.getElementById('confirmModal');
  if (!backdrop) {
    modalEls = null;
    return null;
  }

  modalEls = {
    backdrop,
    title: document.getElementById('confirmModalTitle'),
    body: document.getElementById('confirmModalBody'),
    cancel: document.getElementById('confirmModalCancel'),
    confirm: document.getElementById('confirmModalConfirm')
  };
  return modalEls;
}

/**
 * @param {object} opts
 * @param {string} opts.message
 * @param {'info'|'success'|'error'} [opts.variant]
 * @param {string} [opts.title]
 * @param {number} [opts.duration]
 */
export function showToast({ message, variant = 'info', title = '', duration = 4200 } = {}) {
  if (!message) return;

  const region = ensureToastRegion();
  const toast = document.createElement('div');
  toast.className = `toast toast--${variant}`;
  toast.setAttribute('role', variant === 'error' ? 'alert' : 'status');

  const icon = variant === 'error' ? '⚠' : variant === 'success' ? '✓' : '☁';
  toast.innerHTML = `
    <span class="toast__icon" aria-hidden="true">${icon}</span>
    <div class="toast__body">
      ${title ? `<p class="toast__title">${title}</p>` : ''}
      <p class="toast__text"></p>
    </div>
    <button type="button" class="toast__close" aria-label="Dismiss">&times;</button>
  `;
  toast.querySelector('.toast__text').textContent = message;

  const remove = () => {
    if (!toast.isConnected) return;
    toast.classList.add('is-leaving');
    window.setTimeout(() => toast.remove(), 180);
  };

  toast.querySelector('.toast__close').addEventListener('click', remove);
  region.appendChild(toast);

  if (duration > 0) {
    window.setTimeout(remove, duration);
  }
}

function closeModal(result) {
  const els = ensureModal();
  if (!els) return;

  els.backdrop.classList.remove('is-open');
  els.backdrop.hidden = true;
  document.removeEventListener('keydown', onModalKeydown);

  if (lastFocus && typeof lastFocus.focus === 'function') {
    lastFocus.focus();
  }
  lastFocus = null;

  const resolver = activeConfirm;
  activeConfirm = null;
  if (resolver) resolver(result);
}

function onModalKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal(false);
  }
}

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.confirmLabel]
 * @param {string} [opts.cancelLabel]
 * @returns {Promise<boolean>}
 */
export function confirmDialog({
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel'
} = {}) {
  const els = ensureModal();
  if (!els) {
    return Promise.resolve(window.confirm(message));
  }

  if (activeConfirm) {
    closeModal(false);
  }

  return new Promise((resolve) => {
    activeConfirm = resolve;
    lastFocus = document.activeElement;

    els.title.textContent = title;
    els.body.textContent = message;
    els.confirm.textContent = confirmLabel;
    els.cancel.textContent = cancelLabel;

    els.backdrop.hidden = false;
    // Force reflow so the open transition plays
    void els.backdrop.offsetWidth;
    els.backdrop.classList.add('is-open');
    document.addEventListener('keydown', onModalKeydown);
    els.confirm.focus();
  });
}

export function initUiChrome() {
  const els = ensureModal();
  if (!els) return;

  els.cancel.addEventListener('click', () => closeModal(false));
  els.confirm.addEventListener('click', () => closeModal(true));
  els.backdrop.addEventListener('click', (e) => {
    if (e.target === els.backdrop) closeModal(false);
  });
}
