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

  // Update navbar and mobile menu top position based on promo banner
  function updateNavAndMenuTop() {
    if (!navbar) return;
    const isHidden = !promoBanner || promoBanner.classList.contains('hidden');
    const bannerHeight = isHidden ? 0 : Math.round(promoBanner.getBoundingClientRect().height);

    // Sync CSS variable so all CSS rules have exact value
    document.documentElement.style.setProperty('--promo-banner-height', `${bannerHeight}px`);

    const scrolled = window.scrollY > 50;
    navbar.style.top = scrolled ? '0px' : `${bannerHeight}px`;
  }

  updateNavAndMenuTop();
  window.addEventListener('resize', updateNavAndMenuTop);

  if (window.ResizeObserver && promoBanner) {
    const promoRo = new ResizeObserver(() => updateNavAndMenuTop());
    promoRo.observe(promoBanner);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateNavAndMenuTop);
  }
  window.addEventListener('load', updateNavAndMenuTop);

  // Scroll handler for navbar state
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    if (navbar) navbar.classList.toggle('scrolled', scrolled);
    if (promoBanner) promoBanner.classList.toggle('hidden', scrolled);
    updateNavAndMenuTop();

    // Detect scroll direction for FAB
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;

    // Hide FAB when scrolling down, show when scrolling up
    const fab = document.getElementById('toolsOverlay');
    if (fab && !fab.classList.contains('active')) {
      if (scrollingDown && currentScrollY > 200) {
        fab.classList.remove('visible');
        fab.classList.add('collapsed');
      }
    }
  });

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

let currentLanguage = 'id';
let isApplyingLanguage = false;
let mutationDebounceTimer = null;

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
    .replace(/&bull;/g, '•')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function applyLanguage(targetLang) {
  if (isApplyingLanguage) return;
  isApplyingLanguage = true;

  const isEnglish = targetLang === 'en';
  currentLanguage = isEnglish ? 'en' : 'id';
  document.documentElement.lang = currentLanguage;
  document.documentElement.dataset.language = currentLanguage;

  try {
    // 1. Update UI button states
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

    // 3. Translate DOM text nodes
    const dict = isEnglish ? TRANSLATIONS : REVERSE_TRANSLATIONS;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.closest('script, style, svg, noscript, textarea, code, pre, .nav-language, [data-i18n-en-html]')) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      const rawVal = node.nodeValue;
      const trimmed = rawVal.trim();
      const normalized = trimmed.replace(/\s+/g, ' ');
      const cleanEntity = normalizeText(trimmed);

      // Check primary dictionary
      let translated = dict[normalized] || dict[cleanEntity];

      // Fallback: Check vocabulary replacement if in English and not found
      if (!translated && isEnglish && cleanEntity.length > 2) {
        let candidate = cleanEntity;
        let hasReplacement = false;
        for (const [idWord, enWord] of Object.entries(VOCABULARY_DICTIONARY)) {
          const reg = new RegExp(`\\b${idWord}\\b`, 'gi');
          if (reg.test(candidate)) {
            hasReplacement = true;
            candidate = candidate.replace(reg, (match) => {
              if (match[0] === match[0].toUpperCase()) {
                return enWord.charAt(0).toUpperCase() + enWord.slice(1);
              }
              return enWord.toLowerCase();
            });
          }
        }
        if (hasReplacement) {
          translated = candidate;
        }
      }

      if (translated) {
        const match = rawVal.match(/^(\s*)([\s\S]*?)(\s*)$/);
        if (match) {
          node.nodeValue = match[1] + translated + match[3];
        } else {
          node.nodeValue = translated;
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
      const target = isEnglish ? placeholderMap[current] : reversePlaceholderMap[current];
      if (target) el.setAttribute('placeholder', target);
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
      const target = isEnglish ? ariaMap[current] : reverseAriaMap[current];
      if (target) el.setAttribute('aria-label', target);
    });

    // 6. Document title
    const currentTitle = document.title.trim();
    if (isEnglish) {
      if (TITLE_TRANSLATIONS[currentTitle]) {
        document.title = TITLE_TRANSLATIONS[currentTitle];
      }
    } else {
      if (REVERSE_TITLES[currentTitle]) {
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
    if (currentLanguage !== 'en') return;

    let shouldUpdate = false;
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes.length > 0) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.closest && node.closest('script, style, svg, .nav-language')) continue;
            shouldUpdate = true;
            break;
          } else if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
            shouldUpdate = true;
            break;
          }
        }
      } else if (m.type === 'characterData') {
        const parent = m.target.parentElement;
        if (!parent || !parent.closest('script, style, svg, .nav-language')) {
          shouldUpdate = true;
        }
      }
      if (shouldUpdate) break;
    }

    if (shouldUpdate) {
      clearTimeout(mutationDebounceTimer);
      mutationDebounceTimer = setTimeout(() => {
        if (currentLanguage === 'en' && !isApplyingLanguage) {
          applyLanguage('en');
        }
      }, 70);
    }
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
