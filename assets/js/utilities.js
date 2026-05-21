/**
 * Nexus Diji - Utilities Module
 * Helper functions, scroll utilities, custom cursor
 */

// ══════════════════════════════════════════════════════════════
// CUSTOM CURSOR (Desktop only)
// ══════════════════════════════════════════════════════════════
export function initCursor() {
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');

  if (!cursor || !cursorRing) return;

  // Only show on desktop with fine pointer
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cursor.style.display = 'none';
    cursorRing.style.display = 'none';
    return;
  }

  let cursorVisible = false;
  let cursorRingVisible = false;

  document.addEventListener('mousemove', (e) => {
    // Main cursor - immediate follow
    cursor.style.left = e.clientX - 3 + 'px';
    cursor.style.top = e.clientY - 3 + 'px';

    if (!cursorVisible) {
      cursor.style.opacity = '1';
      cursorVisible = true;
    }

    // Ring cursor - slight delay (handled via CSS transition)
    cursorRing.style.left = e.clientX - 16 + 'px';
    cursorRing.style.top = e.clientY - 16 + 'px';

    if (!cursorRingVisible) {
      cursorRing.style.opacity = '0.9';
      cursorRingVisible = true;
    }
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorRing.style.opacity = '0';
    cursorVisible = false;
    cursorRingVisible = false;
  });

  // Hover state on interactive elements
  document.querySelectorAll('a, button, .mega-card, .service-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'scale(2)';
      cursor.style.opacity = '0.5';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'scale(1)';
      cursor.style.opacity = '1';
    });
  });
}

// ══════════════════════════════════════════════════════════════
// SCROLL UTILITIES
// ══════════════════════════════════════════════════════════════
export function scrollToElement(selector, offset = 120) {
  const element = document.querySelector(selector);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

export function isInViewport(element, offset = 0) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top < (window.innerHeight || document.documentElement.clientHeight) - offset &&
    rect.bottom > offset
  );
}

export function isNearFooter(threshold = 100) {
  const footer = document.querySelector('footer');
  if (!footer) return false;
  const footerTop = footer.getBoundingClientRect().top;
  return footerTop < window.innerHeight + threshold;
}

// ══════════════════════════════════════════════════════════════
// DEBOUNCE & THROTTLE
// ══════════════════════════════════════════════════════════════
export function debounce(func, wait = 250) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit = 100) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

// ══════════════════════════════════════════════════════════════
// DOM UTILITIES
// ══════════════════════════════════════════════════════════════
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  });

  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });

  return el;
}

// ══════════════════════════════════════════════════════════════
// STRING UTILITIES
// ══════════════════════════════════════════════════════════════
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function truncate(str, length, suffix = '...') {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

// ══════════════════════════════════════════════════════════════
// NUMBER UTILITIES
// ══════════════════════════════════════════════════════════════
export function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

// ══════════════════════════════════════════════════════════════
// TOOLS OVERLAY (FAB)
// ══════════════════════════════════════════════════════════════
export function initToolsOverlay() {
  const toolsOverlay = document.getElementById('toolsOverlay');
  const backToTop = document.getElementById('backToTop');
  const fabTrigger = document.getElementById('fabTrigger');

  if (!toolsOverlay || !fabTrigger) return;

  let autoHideTimer;
  let manualOverlayControl = false;

  function resetAutoHideTimer() {
    if (!toolsOverlay || manualOverlayControl) return;
    clearTimeout(autoHideTimer);
    if (toolsOverlay.classList.contains('visible')) {
      autoHideTimer = setTimeout(() => {
        toolsOverlay.classList.remove('visible');
        toolsOverlay.classList.add('collapsed');
      }, 4000);
    }
  }

  // Auto-hide on scroll
  window.addEventListener('scroll', () => {
    const nearFooter = isNearFooter(20);

    if (window.innerWidth <= 768) {
      if (nearFooter) {
        toolsOverlay.classList.add('fab-hidden');
        toolsOverlay.classList.remove('active');
      } else {
        toolsOverlay.classList.remove('fab-hidden');
      }
    } else {
      if (nearFooter) {
        toolsOverlay.classList.remove('visible', 'collapsed');
      } else if (!toolsOverlay.classList.contains('visible') && !toolsOverlay.classList.contains('collapsed')) {
        toolsOverlay.classList.add('visible');
        resetAutoHideTimer();
      }
    }
  });

  // Mouse events for desktop
  if (window.innerWidth > 768) {
    toolsOverlay.addEventListener('mouseenter', () => clearTimeout(autoHideTimer));
    toolsOverlay.addEventListener('mouseleave', () => {
      if (toolsOverlay.classList.contains('visible')) resetAutoHideTimer();
    });

    setTimeout(() => {
      if (window.scrollY < 400) {
        toolsOverlay.classList.add('visible');
        resetAutoHideTimer();
      }
    }, 1000);
  }

  // Toggle button
  fabTrigger.addEventListener('click', (e) => {
    e.stopPropagation();

    if (window.innerWidth <= 768) {
      const isActive = toolsOverlay.classList.toggle('active');
      if (backToTop) backToTop.style.display = isActive ? 'none' : '';
      closePopups();
    } else {
      manualOverlayControl = true;
      clearTimeout(autoHideTimer);
      if (toolsOverlay.classList.contains('visible')) {
        toolsOverlay.classList.remove('visible');
        toolsOverlay.classList.add('collapsed');
      } else {
        toolsOverlay.classList.add('visible');
        toolsOverlay.classList.remove('collapsed');
      }
    }
  });

  // Close on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (!toolsOverlay.contains(e.target) && toolsOverlay.classList.contains('active')) {
      toolsOverlay.classList.remove('active');
      if (backToTop) backToTop.style.display = '';
    }
  });

  function closePopups() {
    const chatPopup = document.getElementById('chatPopup');
    const helpPopup = document.getElementById('helpPopup');
    if (chatPopup) {
      chatPopup.classList.remove('open');
      setTimeout(() => { chatPopup.style.display = 'none'; }, 300);
    }
    if (helpPopup) {
      helpPopup.classList.remove('open');
      setTimeout(() => { helpPopup.style.display = 'none'; }, 300);
    }
    if (backToTop) backToTop.classList.remove('hidden-by-chat');
  }
}

export default {
  initCursor,
  scrollToElement,
  isInViewport,
  isNearFooter,
  debounce,
  throttle,
  $,
  $$,
  createElement,
  slugify,
  truncate,
  formatNumber,
  randomInt,
  lerp,
  initToolsOverlay
};