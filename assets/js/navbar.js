/**
 * Nexus Diji - Navbar Module
 * Mobile menu toggle, scroll behavior, navbar state management
 * Production-grade mobile navigation interactions
 */

import {
  TRANSLATIONS,
  ATTRIBUTE_TRANSLATIONS,
  TITLE_TRANSLATIONS,
  REVERSE_TRANSLATIONS,
  REVERSE_TITLES
} from './translations.js?v=auto-sync-20261018c';

export function initNavbar() {
  initLanguageSwitch();

  const navbar = document.getElementById('navbar');
  const promoBanner = document.getElementById('promoBanner');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const backMenuBtn = document.getElementById('backMenuBtn');

  // Prevent body scroll lock conflicts
  let scrollPosition = 0;

  // Cached state to eliminate layout thrashing
  let cachedBannerHeight = -1;
  let cachedScrolled = null;

  // Update navbar and mobile menu top position based on promo banner
  function updateNavAndMenuTop(force = false) {
    if (!navbar) return;
    const isHidden = !promoBanner || promoBanner.classList.contains('hidden');
    const bannerHeight = isHidden ? 0 : Math.round(promoBanner.getBoundingClientRect().height);

    // Sync CSS variable only when actual height changes
    if (force || bannerHeight !== cachedBannerHeight) {
      cachedBannerHeight = bannerHeight;
      document.documentElement.style.setProperty('--promo-banner-height', `${bannerHeight}px`);
    }

    const scrolled = window.scrollY > 50;
    if (force || scrolled !== cachedScrolled) {
      cachedScrolled = scrolled;
      navbar.style.top = scrolled ? '0px' : `${bannerHeight}px`;
    }
  }

  updateNavAndMenuTop(true);
  window.addEventListener('resize', () => updateNavAndMenuTop(true), { passive: true });

  if (window.ResizeObserver && promoBanner) {
    const promoRo = new ResizeObserver(() => updateNavAndMenuTop(true));
    promoRo.observe(promoBanner);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => updateNavAndMenuTop(true));
  }
  window.addEventListener('load', () => updateNavAndMenuTop(true), { passive: true });

  // Scroll handler for navbar state with rAF throttling and passive listener
  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  function handleNavbarScroll() {
    const currentScrollY = window.scrollY;
    const scrolled = currentScrollY > 50;

    if (scrolled !== cachedScrolled) {
      if (navbar) navbar.classList.toggle('scrolled', scrolled);
      if (promoBanner) promoBanner.classList.toggle('hidden', scrolled);
      updateNavAndMenuTop();
    }

    // Detect scroll direction for FAB
    const scrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;

    // Hide FAB when scrolling down, show when scrolling up
    const fab = document.getElementById('toolsOverlay');
    if (fab && !fab.classList.contains('active')) {
      if (scrollingDown && currentScrollY > 200) {
        fab.classList.remove('visible');
        fab.classList.add('collapsed');
      } else if (!scrollingDown && currentScrollY > 200) {
        fab.classList.remove('collapsed');
        fab.classList.add('visible');
      }
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(handleNavbarScroll);
      scrollTicking = true;
    }
  }, { passive: true });

  // Mobile menu functionality with improved UX
  if (hamburgerBtn && mobileMenu && closeMenuBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMobileMenu();
    });

    closeMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileMenu();
    });

    // Back button - close menu
    if (backMenuBtn) {
      backMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMobileMenu();
      });
    }

    // Close on backdrop click (outside menu content)
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        closeMobileMenu();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    if (mobileMenu.classList.contains('open')) return;
    
    // Save scroll position
    scrollPosition = window.pageYOffset;

    // Lock body scroll
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    // Update menu state
    mobileMenu.classList.add('open');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    navbar.classList.add('menu-open');

    // Focus management for accessibility
    const firstFocusable = mobileMenu.querySelector('a, button');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 50);
    }

    // Hide floating elements and promo banner to prevent overlap
    if (promoBanner) {
      promoBanner.style.opacity = '0';
      promoBanner.style.visibility = 'hidden';
      promoBanner.style.pointerEvents = 'none';
    }
    const toolsOverlay = document.getElementById('toolsOverlay');
    const backToTop = document.getElementById('backToTop');
    if (toolsOverlay) toolsOverlay.style.display = 'none';
    if (backToTop) backToTop.style.display = 'none';
  }

  function closeMobileMenu() {
    if (!mobileMenu.classList.contains('open')) return;
    
    // Remove menu state
    mobileMenu.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    navbar.classList.remove('menu-open');

    // Restore promo banner
    if (promoBanner) {
      promoBanner.style.opacity = '';
      promoBanner.style.visibility = '';
      promoBanner.style.pointerEvents = '';
    }
    updateNavAndMenuTop();

    mobileMenu.querySelectorAll('.mobile-dropdown-toggle').forEach((toggle) => {
      const dropdown = toggle.nextElementSibling;
      toggle.classList.remove('open', 'active');
      toggle.setAttribute('aria-expanded', 'false');
      if (dropdown && dropdown.classList.contains('mobile-dropdown')) dropdown.classList.remove('open');
    });

    // Restore body scroll
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);

    // Show floating elements again
    const toolsOverlay = document.getElementById('toolsOverlay');
    const backToTop = document.getElementById('backToTop');
    if (toolsOverlay) toolsOverlay.style.display = '';
    if (backToTop) backToTop.style.display = '';
  }

  // Mobile dropdown accordion: keep visual and accessible states in sync.
  const mobileToggles = Array.from(document.querySelectorAll('.mobile-dropdown-toggle'));

  mobileToggles.forEach((toggle) => {
    const dropdown = toggle.nextElementSibling;
    if (!dropdown || !dropdown.classList.contains('mobile-dropdown')) return;

    const initiallyOpen = dropdown.classList.contains('open') || toggle.getAttribute('aria-expanded') === 'true';
    toggle.classList.toggle('open', initiallyOpen);
    toggle.classList.toggle('active', initiallyOpen);
    dropdown.classList.toggle('open', initiallyOpen);
    toggle.setAttribute('aria-expanded', String(initiallyOpen));

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const shouldOpen = !toggle.classList.contains('open');
      mobileToggles.forEach((otherToggle) => {
        const otherDropdown = otherToggle.nextElementSibling;
        const isOpen = otherToggle === toggle && shouldOpen;

        otherToggle.classList.toggle('open', isOpen);
        otherToggle.classList.toggle('active', isOpen);
        otherToggle.setAttribute('aria-expanded', String(isOpen));

        if (otherDropdown && otherDropdown.classList.contains('mobile-dropdown')) {
          otherDropdown.classList.toggle('open', isOpen);
        }
      });
    });
  });

  // Prevent links inside dropdown from triggering accordion toggle
  const dropdownLinks = document.querySelectorAll('.mobile-dropdown a');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close menu on link click
      closeMobileMenu();
    });
  });

  // Also close menu on main nav links click
  const mainNavLinks = document.querySelectorAll('.nav-mobile-links > li > a');
  mainNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Back to top button
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Show/hide based on scroll position with debounce
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const footer = document.querySelector('footer');
        let nearFooter = false;
        if (footer) {
          const footerTop = footer.getBoundingClientRect().top;
          nearFooter = footerTop < window.innerHeight + 20;
        }
        const shouldShow = window.scrollY > 400 && !nearFooter;
        backToTop.classList.toggle('visible', shouldShow);
      }, 50);
    });
  }

  // Initialize menu state on page load
  if (mobileMenu && !mobileMenu.classList.contains('open')) {
    // Ensure menu is properly hidden on load
    mobileMenu.classList.remove('open');
    hamburgerBtn.classList.remove('active');
  }

  // Update mobile menu visibility on resize
  window.addEventListener('resize', () => {
    if (mobileMenu) {
      if (window.innerWidth > 1023) {
        mobileMenu.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    }
  });
}

export default initNavbar;

// ══════════════════════════════════════════════════════════════
// DYNAMIC BIDIRECTIONAL TRANSLATION ENGINE (ID <-> EN)
// ══════════════════════════════════════════════════════════════

let currentLanguage = 'id';
let isApplyingLanguage = false;
let mutationDebounceTimer = null;

const CACHE_STORAGE_KEY = 'nexus-diji-dynamic-translations-v1';
const BRAND_NAME = 'Nexus Diji';
const BRAND_TOKEN = '__NEXUS_DIJI__';

// In-memory dynamic translation cache
let dynamicCache = {};
let dynamicReverseCache = {};
let isCacheLoaded = false;

function loadDynamicCache() {
  if (isCacheLoaded) return;
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      dynamicCache = parsed.id_to_en || {};
      dynamicReverseCache = parsed.en_to_id || {};
    }
  } catch (e) {
    dynamicCache = {};
    dynamicReverseCache = {};
  }
  isCacheLoaded = true;
}

let saveCacheTimer = null;
function scheduleSaveCache() {
  clearTimeout(saveCacheTimer);
  saveCacheTimer = setTimeout(() => {
    try {
      const keys = Object.keys(dynamicCache);
      if (keys.length > 1200) {
        const prunedId = {};
        const prunedRev = {};
        for (const k of keys.slice(keys.length - 1000)) {
          prunedId[k] = dynamicCache[k];
          if (dynamicCache[k]) prunedRev[dynamicCache[k]] = k;
        }
        dynamicCache = prunedId;
        dynamicReverseCache = prunedRev;
      }
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify({
        id_to_en: dynamicCache,
        en_to_id: dynamicReverseCache
      }));
    } catch {
      // Storage quota or sandbox fallback
    }
  }, 250);
}

// Vocabulary map for dynamic / untranslated phrase & word fallback
const VOCABULARY_DICTIONARY = {
  'Pembuatan': 'Development',
  'Pengembangan': 'Development',
  'Layanan': 'Services',
  'Servis': 'Repair',
  'Perbaikan': 'Repair',
  'Solusi': 'Solutions',
  'Kebutuhan': 'Needs',
  'Bisnis': 'Business',
  'Perangkat': 'Device',
  'Perangkatmu': 'Your Device',
  'Toko Online': 'Online Store',
  'Toko': 'Store',
  'dan lainnya': 'and others',
  'hingga': 'up to',
  'dari': 'from',
  'untuk': 'for',
  'semua': 'all',
  'siap': 'ready',
  'kami': 'we',
  'bantu': 'assist',
  'Lihat Detail': 'View Details',
  'Lihat Semua': 'View All',
  'Selengkapnya': 'Read More',
  'Konsultasi': 'Consultation',
  'Gratis': 'Free',
  'Hubungi Kami': 'Contact Us',
  'Terjangkau': 'Affordable',
  'Berkualitas': 'High Quality',
  'Cepat': 'Fast',
  'Aman': 'Secure',
  'Responsif': 'Responsive',
  'Profesional': 'Professional',
  'Garansi': 'Warranty',
  'Fitur': 'Features',
  'Harga': 'Pricing',
  'Paket': 'Package',
  'Tentang Kami': 'About Us',
  'Kontak': 'Contact',
  'Artikel': 'Article',
  'Berita': 'News'
};

// Helper: Normalize spaces and decode common HTML entities for accurate matching
function normalizeText(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&bull;/g, '•')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Text & Element Exclusions
const EXCLUDED_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE']);

function shouldExcludeElement(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  if (EXCLUDED_TAGS.has(el.tagName)) return true;
  if (el.closest('script, style, svg, noscript, textarea, code, pre, .nav-language, [translate="no"], .notranslate, [data-no-translate]')) {
    return true;
  }
  return false;
}

function shouldExcludeText(str) {
  if (!str) return true;
  const trimmed = str.trim();
  if (!trimmed || trimmed.length <= 1) return true;

  // Exact Brand
  if (trimmed === 'Nexus Diji' || trimmed === 'Nexus Diji.') return true;

  // Pure numbers, currencies, dates, version codes (e.g. "Rp 500.000", "2026", "© 2025", "100+", "10:00 - 18:00")
  if (!/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmed)) return true;

  // URLs, Emails
  if (/^(https?:\/\/|www\.|mailto:|[\w.-]+@[\w.-]+\.\w+)/i.test(trimmed)) return true;

  // HTML fragments
  if (/^<[\s\S]+>$/.test(trimmed)) return true;

  return false;
}

// Free client-side translation APIs with CORS and fallbacks
async function requestApiTranslation(text) {
  const maskedText = text.replace(/Nexus\s+Diji/gi, BRAND_TOKEN);

  // Provider 1: Google GTX (Public CORS endpoint, fast & reliable)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(maskedText)}`;
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 5500);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        let result = data[0].map((item) => (item && item[0]) || '').join('').trim();
        if (result) {
          result = result.replace(new RegExp(BRAND_TOKEN, 'gi'), BRAND_NAME);
          return result;
        }
      }
    }
  } catch {
    // GTX failed, try fallback
  }

  // Provider 2: MyMemory Translated (Public CORS endpoint)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(maskedText)}&langpair=id|en`;
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      let result = data?.responseData?.translatedText?.trim();
      if (result && !result.includes('MYMEMORY WARNING')) {
        result = result.replace(new RegExp(BRAND_TOKEN, 'gi'), BRAND_NAME);
        return result;
      }
    }
  } catch {
    // MyMemory failed, try fallback
  }

  // Provider 3: LibreTranslate CORS instances
  const libreInstances = [
    'https://libretranslate.de/translate',
    'https://translate.terraprint.co/translate'
  ];
  for (const inst of libreInstances) {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch(inst, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: maskedText, source: 'id', target: 'en', format: 'text' }),
        signal: ctrl.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        let result = data?.translatedText?.trim();
        if (result) {
          result = result.replace(new RegExp(BRAND_TOKEN, 'gi'), BRAND_NAME);
          return result;
        }
      }
    } catch {
      // Continue to next
    }
  }

  // All failed: return null for graceful degradation
  return null;
}

// Translation Queue & Batching
const pendingSubscribers = new Map(); // cleanText -> Array<(translated) => void>
const inFlightRequests = new Set();
const queuedTexts = new Set();
let queueFlushTimer = null;

function queueTranslation(cleanText, callback) {
  loadDynamicCache();

  if (!pendingSubscribers.has(cleanText)) {
    pendingSubscribers.set(cleanText, []);
  }
  if (callback) {
    pendingSubscribers.get(cleanText).push(callback);
  }

  queuedTexts.add(cleanText);

  clearTimeout(queueFlushTimer);
  queueFlushTimer = setTimeout(() => {
    flushTranslationQueue();
  }, 45);
}

async function flushTranslationQueue() {
  if (!queuedTexts.size) return;
  const textsToProcess = [...queuedTexts];
  queuedTexts.clear();

  const concurrency = 3;
  let index = 0;

  async function worker() {
    while (index < textsToProcess.length) {
      const text = textsToProcess[index++];
      if (inFlightRequests.has(text)) continue;

      // Check if cache or static dictionary satisfied it in meantime
      if (dynamicCache[text] || TRANSLATIONS[text]) {
        const hit = dynamicCache[text] || TRANSLATIONS[text];
        notifySubscribers(text, hit);
        continue;
      }

      inFlightRequests.add(text);
      try {
        let translated = await requestApiTranslation(text);
        if (!translated && VOCABULARY_DICTIONARY[text]) {
          translated = VOCABULARY_DICTIONARY[text];
        }
        if (translated) {
          dynamicCache[text] = translated;
          dynamicReverseCache[translated] = text;
          scheduleSaveCache();
          notifySubscribers(text, translated);
        } else {
          // Failure: clear pending subscribers without modifying DOM
          pendingSubscribers.delete(text);
        }
      } catch {
        pendingSubscribers.delete(text);
      } finally {
        inFlightRequests.delete(text);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(concurrency, textsToProcess.length); i++) {
    workers.push(worker());
  }
  await Promise.allSettled(workers);
}

function notifySubscribers(cleanText, translated) {
  const subs = pendingSubscribers.get(cleanText);
  pendingSubscribers.delete(cleanText);
  if (subs && subs.length) {
    subs.forEach((cb) => {
      try { cb(translated); } catch {}
    });
  }
}

function applyTranslationToNode(node, originalRaw, translated) {
  if (currentLanguage !== 'en') return;
  const match = originalRaw.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const formatted = match ? match[1] + translated + match[3] : translated;

  isApplyingLanguage = true;
  try {
    node.nodeValue = formatted;
    node._ndLastAppliedText = formatted;
    node._ndCurrentLang = 'en';
  } finally {
    isApplyingLanguage = false;
  }
}

// Record original text for all unrecorded DOM nodes
function recordOriginalTexts() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || shouldExcludeElement(parent)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node._ndOrigText === undefined) {
      node._ndOrigText = node.nodeValue;
      node._ndCurrentLang = 'id';
      node._ndLastAppliedText = node.nodeValue;
    }
  }
}

export function applyLanguage(targetLang) {
  if (isApplyingLanguage) return;
  isApplyingLanguage = true;

  loadDynamicCache();

  const isEnglish = targetLang === 'en';
  currentLanguage = isEnglish ? 'en' : 'id';
  document.documentElement.lang = currentLanguage;
  document.documentElement.dataset.language = currentLanguage;

  try {
    // 1. Update UI button states and container glider position
    document.querySelectorAll('.nav-language').forEach((container) => {
      container.dataset.activeLang = currentLanguage;
    });
    const buttons = document.querySelectorAll('.nav-language__option[data-lang]');
    buttons.forEach((btn) => {
      const active = btn.dataset.lang === currentLanguage;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    // 2. Element-level HTML translation for composite tags with inner spans (e.g. Card Titles)
    document.querySelectorAll('[data-i18n-en-html]').forEach((el) => {
      const targetHtml = isEnglish
        ? el.getAttribute('data-i18n-en-html')
        : el.getAttribute('data-i18n-id-html');
      if (targetHtml && el.innerHTML !== targetHtml) {
        el.innerHTML = targetHtml;
      }
    });

    // 3. Translate or restore DOM text nodes
    const dict = isEnglish ? TRANSLATIONS : REVERSE_TRANSLATIONS;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (shouldExcludeElement(parent)) return NodeFilter.FILTER_REJECT;
          if (parent.closest('[data-i18n-en-html]')) return NodeFilter.FILTER_REJECT;
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      const rawVal = node.nodeValue;
      const trimmed = rawVal.trim();

      // Always save original text if not yet recorded
      if (node._ndOrigText === undefined) {
        node._ndOrigText = rawVal;
      }

      if (shouldExcludeText(trimmed)) {
        continue;
      }

      const normalized = trimmed.replace(/\s+/g, ' ');
      const cleanEntity = normalizeText(trimmed);
      const match = rawVal.match(/^(\s*)([\s\S]*?)(\s*)$/);

      if (isEnglish) {
        // Already applied English to this node
        if (node._ndCurrentLang === 'en' && node.nodeValue === node._ndLastAppliedText) {
          continue;
        }

        // Check primary static dictionary
        let translated = dict[normalized] || dict[cleanEntity];

        // Check dynamic persistent cache
        if (!translated) {
          translated = dynamicCache[cleanEntity] || dynamicCache[normalized];
        }

        // Check exact single vocabulary word
        if (!translated && VOCABULARY_DICTIONARY[cleanEntity]) {
          translated = VOCABULARY_DICTIONARY[cleanEntity];
        }

        if (translated) {
          const newVal = match ? match[1] + translated + match[3] : translated;
          node.nodeValue = newVal;
          node._ndLastAppliedText = newVal;
          node._ndCurrentLang = 'en';
        } else {
          // Untranslated text: Queue for automatic background translation
          const capturedNode = node;
          const capturedRaw = rawVal;
          queueTranslation(cleanEntity, (apiTranslated) => {
            applyTranslationToNode(capturedNode, capturedRaw, apiTranslated);
          });
        }
      } else {
        // RESTORE TO ID
        if (node._ndOrigText !== undefined) {
          node.nodeValue = node._ndOrigText;
          node._ndLastAppliedText = node._ndOrigText;
          node._ndCurrentLang = 'id';
        } else {
          let restored = dynamicReverseCache[cleanEntity] || dynamicReverseCache[normalized] || dict[normalized] || dict[cleanEntity];
          if (restored) {
            const newVal = match ? match[1] + restored + match[3] : restored;
            node.nodeValue = newVal;
            node._ndLastAppliedText = newVal;
            node._ndCurrentLang = 'id';
          }
        }
      }
    }

    // 4. Form placeholders
    const placeholderMap = ATTRIBUTE_TRANSLATIONS?.placeholders || {};
    const reversePlaceholderMap = Object.entries(placeholderMap).reduce((acc, [idVal, enVal]) => {
      acc[enVal] = idVal;
      return acc;
    }, {});

    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((el) => {
      const current = el.getAttribute('placeholder');
      if (!current) return;

      if (el._ndOrigPlaceholder === undefined) {
        el._ndOrigPlaceholder = current;
      }

      if (isEnglish) {
        let target = placeholderMap[current] || dynamicCache[current];
        if (target) {
          el.setAttribute('placeholder', target);
        } else {
          const capturedEl = el;
          const cleanP = normalizeText(current);
          queueTranslation(cleanP, (trans) => {
            if (currentLanguage === 'en') {
              capturedEl.setAttribute('placeholder', trans);
            }
          });
        }
      } else {
        if (el._ndOrigPlaceholder) {
          el.setAttribute('placeholder', el._ndOrigPlaceholder);
        } else {
          const target = reversePlaceholderMap[current] || dynamicReverseCache[current];
          if (target) el.setAttribute('placeholder', target);
        }
      }
    });

    // 5. Accessibility aria-labels
    const ariaMap = ATTRIBUTE_TRANSLATIONS?.ariaLabels || {};
    const reverseAriaMap = Object.entries(ariaMap).reduce((acc, [idVal, enVal]) => {
      acc[enVal] = idVal;
      return acc;
    }, {});

    document.querySelectorAll('[aria-label]').forEach((el) => {
      if (el.classList.contains('nav-language__option')) return;
      const current = el.getAttribute('aria-label');
      if (!current) return;

      if (el._ndOrigAriaLabel === undefined) {
        el._ndOrigAriaLabel = current;
      }

      if (isEnglish) {
        let target = ariaMap[current] || dynamicCache[current];
        if (target) {
          el.setAttribute('aria-label', target);
        } else {
          const capturedEl = el;
          const cleanA = normalizeText(current);
          queueTranslation(cleanA, (trans) => {
            if (currentLanguage === 'en') {
              capturedEl.setAttribute('aria-label', trans);
            }
          });
        }
      } else {
        if (el._ndOrigAriaLabel) {
          el.setAttribute('aria-label', el._ndOrigAriaLabel);
        } else {
          const target = reverseAriaMap[current] || dynamicReverseCache[current];
          if (target) el.setAttribute('aria-label', target);
        }
      }
    });

    // 6. Document title
    if (document._ndOrigTitle === undefined) {
      document._ndOrigTitle = document.title;
    }
    const currentTitle = document.title.trim();
    if (isEnglish) {
      if (TITLE_TRANSLATIONS[currentTitle]) {
        document.title = TITLE_TRANSLATIONS[currentTitle];
      } else if (dynamicCache[currentTitle]) {
        document.title = dynamicCache[currentTitle];
      }
    } else {
      if (document._ndOrigTitle) {
        document.title = document._ndOrigTitle;
      } else if (REVERSE_TITLES[currentTitle]) {
        document.title = REVERSE_TITLES[currentTitle];
      }
    }

    // 7. Homepage typing animation headline sync
    const typingLine1 = document.getElementById('typingLine1');
    const typingLine2 = document.getElementById('typingLine2');
    const typingLine3 = document.getElementById('typingLine3');
    if (typingLine1 && typingLine2 && typingLine3) {
      if (isEnglish) {
        typingLine1.textContent = 'Bring Your';
        typingLine2.textContent = 'Digital Ideas';
        typingLine3.textContent = 'to Life.';
      } else {
        typingLine1.textContent = 'Wujudkan';
        typingLine2.textContent = 'Ide Digital';
        typingLine3.textContent = 'Kamu.';
      }
    }
  } finally {
    isApplyingLanguage = false;
  }
}

// 8. Auto-Translate Mutation Observer: Automatically updates newly inserted or updated text
function initAutoTranslateObserver() {
  if (typeof window === 'undefined' || window._nexusTranslationObserver) return;

  const observer = new MutationObserver((mutations) => {
    if (isApplyingLanguage) return;

    let hasRelevantChanges = false;
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes.length > 0) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (shouldExcludeElement(node)) continue;
            hasRelevantChanges = true;
            break;
          } else if (node.nodeType === Node.TEXT_NODE) {
            if (shouldExcludeElement(node.parentElement)) continue;
            if (node._ndLastAppliedText && node.nodeValue === node._ndLastAppliedText) continue;
            if (node.nodeValue && node.nodeValue.trim()) {
              hasRelevantChanges = true;
              break;
            }
          }
        }
      } else if (m.type === 'characterData') {
        const node = m.target;
        if (node.nodeType === Node.TEXT_NODE) {
          if (shouldExcludeElement(node.parentElement)) continue;
          if (node._ndLastAppliedText && node.nodeValue === node._ndLastAppliedText) continue;
          if (node.nodeValue && node.nodeValue.trim()) {
            hasRelevantChanges = true;
          }
        }
      }
      if (hasRelevantChanges) break;
    }

    if (!hasRelevantChanges) return;

    clearTimeout(mutationDebounceTimer);
    mutationDebounceTimer = setTimeout(() => {
      if (isApplyingLanguage) return;
      if (currentLanguage === 'en') {
        applyLanguage('en');
      } else if (currentLanguage === 'id') {
        recordOriginalTexts();
      }
    }, 60);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  window._nexusTranslationObserver = observer;

  // Custom event listener for external/dynamic scripts to trigger auto-translation
  document.addEventListener('nexus:content-updated', () => {
    if (currentLanguage === 'en' && !isApplyingLanguage) {
      applyLanguage('en');
    }
  });
}

export function initLanguageSwitch() {
  const buttons = [...document.querySelectorAll('.nav-language__option[data-lang]')];
  if (!buttons.length) return;

  let storedLang = 'id';
  try {
    storedLang = localStorage.getItem('nexus-diji-language') === 'en' ? 'en' : 'id';
  } catch {
    storedLang = 'id';
  }

  // Apply stored language
  applyLanguage(storedLang);

  // Initialize observer for automatic real-time translation of new or updated text
  initAutoTranslateObserver();

  // Setup click listeners for seamless bidirectional translation
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = button.dataset.lang;
      if (targetLang !== 'id' && targetLang !== 'en') return;
      if (targetLang === currentLanguage) return;

      try {
        localStorage.setItem('nexus-diji-language', targetLang);
      } catch {
        // Storage fallback
      }

      applyLanguage(targetLang);
    });
  });
}

