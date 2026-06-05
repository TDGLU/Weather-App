const SCROLL_REGION_SELECTOR = '.scroll-region';
const STEP_X = 280;
const STEP_Y = 56;
/** Wheel delta multiplier for horizontal strips (feels sluggish at 1:1). */
const WHEEL_HORIZONTAL_SPEED = 3;

let hoveredScrollRegion = null;

function resolveScrollAxis(el) {
  const explicit = el.dataset.scrollAxis;
  if (explicit === 'x' || explicit === 'y' || explicit === 'both') return explicit;

  const { overflowX, overflowY } = getComputedStyle(el);
  const scrollX =
    (overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1;
  const scrollY =
    (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1;

  if (scrollX && scrollY) return 'both';
  if (scrollX) return 'x';
  if (scrollY) return 'y';
  return null;
}

function getActiveScrollRegion() {
  const focused = document.activeElement?.closest?.(SCROLL_REGION_SELECTOR);
  if (focused) return focused;
  return hoveredScrollRegion;
}

function scrollRegionBy(region, axis, delta) {
  if (!delta) return false;

  if (axis === 'x' || axis === 'both') {
    const maxLeft = region.scrollWidth - region.clientWidth;
    if (maxLeft > 0) {
      const next = Math.max(0, Math.min(maxLeft, region.scrollLeft + delta));
      if (next !== region.scrollLeft) {
        region.scrollLeft = next;
        return true;
      }
    }
  }

  if (axis === 'y' || axis === 'both') {
    const maxTop = region.scrollHeight - region.clientHeight;
    if (maxTop > 0) {
      const next = Math.max(0, Math.min(maxTop, region.scrollTop + delta));
      if (next !== region.scrollTop) {
        region.scrollTop = next;
        return true;
      }
    }
  }

  return false;
}

function canScrollFurther(region, axis, direction) {
  if (axis === 'x' || axis === 'both') {
    const maxLeft = region.scrollWidth - region.clientWidth;
    if (maxLeft > 0) {
      if (direction < 0 && region.scrollLeft > 0) return true;
      if (direction > 0 && region.scrollLeft < maxLeft - 1) return true;
    }
  }
  if (axis === 'y' || axis === 'both') {
    const maxTop = region.scrollHeight - region.clientHeight;
    if (maxTop > 0) {
      if (direction < 0 && region.scrollTop > 0) return true;
      if (direction > 0 && region.scrollTop < maxTop - 1) return true;
    }
  }
  return false;
}

function onWheel(e) {
  const region = e.target.closest(SCROLL_REGION_SELECTOR);
  if (!region) return;

  const axis = resolveScrollAxis(region);
  if (!axis) return;

  const deltaX = e.deltaX;
  const deltaY = e.deltaY;
  if (deltaX === 0 && deltaY === 0) return;

  let handled = false;

  if (axis === 'x' || axis === 'both') {
    const raw = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;
    const horizontalDelta = raw * WHEEL_HORIZONTAL_SPEED;
    if (horizontalDelta !== 0 && canScrollFurther(region, 'x', horizontalDelta)) {
      e.preventDefault();
      region.scrollLeft += horizontalDelta;
      handled = true;
    }
  }

  if (!handled && (axis === 'y' || axis === 'both')) {
    const verticalDelta = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;
    if (verticalDelta !== 0 && canScrollFurther(region, 'y', verticalDelta)) {
      e.preventDefault();
      region.scrollTop += verticalDelta;
    }
  }
}

function onKeyDown(e) {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;

  const region = getActiveScrollRegion();
  if (!region) return;

  const axis = resolveScrollAxis(region);
  if (!axis) return;

  const inInput = e.target.closest('input, textarea, select, [contenteditable="true"]');
  if (inInput && document.activeElement === inInput) return;

  let deltaX = 0;
  let deltaY = 0;

  switch (e.key) {
    case 'ArrowLeft':
      deltaX = -STEP_X;
      break;
    case 'ArrowRight':
      deltaX = STEP_X;
      break;
    case 'ArrowUp':
      deltaY = -STEP_Y;
      break;
    case 'ArrowDown':
      deltaY = STEP_Y;
      break;
    case 'Home':
      e.preventDefault();
      if (axis === 'x' || axis === 'both') region.scrollLeft = 0;
      if (axis === 'y' || axis === 'both') region.scrollTop = 0;
      return;
    case 'End':
      e.preventDefault();
      if (axis === 'x' || axis === 'both') {
        region.scrollLeft = region.scrollWidth - region.clientWidth;
      }
      if (axis === 'y' || axis === 'both') {
        region.scrollTop = region.scrollHeight - region.clientHeight;
      }
      return;
    default:
      return;
  }

  if (axis === 'x' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    deltaX = e.key === 'ArrowUp' ? -STEP_X : STEP_X;
    deltaY = 0;
  }

  const moved =
    (deltaX && scrollRegionBy(region, 'x', deltaX)) ||
    (deltaY && scrollRegionBy(region, 'y', deltaY));

  if (moved) e.preventDefault();
}

function enhanceScrollRegion(el) {
  if (!el || el.dataset.scrollEnhanced === 'true') return;

  el.classList.add('scroll-region');
  el.dataset.scrollEnhanced = 'true';
  el.setAttribute('tabindex', '0');

  if (!el.hasAttribute('role')) el.setAttribute('role', 'region');

  if (!el.hasAttribute('aria-label')) {
    if (el.classList.contains('history')) el.setAttribute('aria-label', 'Recent searches');
    else if (el.classList.contains('cards-scroll')) el.setAttribute('aria-label', 'Five-day forecast');
    else if (el.classList.contains('compare-scroll')) el.setAttribute('aria-label', 'City comparison');
  }

  el.addEventListener('mouseenter', () => {
    hoveredScrollRegion = el;
  });
  el.addEventListener('mouseleave', () => {
    if (hoveredScrollRegion === el) hoveredScrollRegion = null;
  });
}

export function initScrollRegions() {
  document.querySelectorAll('.history, .cards-scroll, .compare-scroll').forEach(enhanceScrollRegion);

  document.addEventListener('wheel', onWheel, { passive: false, capture: true });
  document.addEventListener('keydown', onKeyDown);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.('.history, .cards-scroll, .compare-scroll')) {
          enhanceScrollRegion(node);
        }
        node.querySelectorAll?.('.history, .cards-scroll, .compare-scroll').forEach(enhanceScrollRegion);
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}