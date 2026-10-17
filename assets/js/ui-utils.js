/**
 * Nexus Diji - UI Utilities
 * Event delegation and interactive elements
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  // MOBILE MENU - Delegate click events
  // ══════════════════════════════════════════════════════════════
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenu) {
    mobileMenu.addEventListener('click', function (e) {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        const targetId = link.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);

        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });

          // Close menu after navigation
          mobileMenu.classList.remove('open');
          const hamburgerBtn = document.getElementById('hamburgerBtn');
          if (hamburgerBtn) {
            hamburgerBtn.setAttribute('aria-expanded', 'false');
          }
          document.body.style.overflow = '';
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // HELP POPUP - Convert inline onclick to event listeners
  // ══════════════════════════════════════════════════════════════
  const helpPopup = document.getElementById('helpPopup');

  if (helpPopup) {
    helpPopup.querySelectorAll('.help-opt-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const sectionId = btn.dataset.section;
        if (sectionId) {
          const section = document.getElementById(sectionId);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
          }
        }

        // Close help popup
        helpPopup.classList.remove('open');
        setTimeout(function () {
          helpPopup.style.display = 'none';
        }, 300);

        // Restore back to top visibility
        const scrollUp = document.getElementById('backToTop');
        if (scrollUp) scrollUp.classList.remove('hidden-by-chat');
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ENSURE ALL INTERACTIVE ELEMENTS USE PROPER CLICK HANDLING
  // Fix for single-click/tap to work immediately on mobile
  // ══════════════════════════════════════════════════════════════

  // Remove any touch-delay by ensuring passive event listeners where appropriate
  // and ensuring buttons have proper touch-action CSS

  // Apply touch-action: manipulation to all clickable elements
  const interactiveElements = document.querySelectorAll(
    'a, button, [role="button"], .portfolio-card, .service-card, .pricing-card, ' +
    '.testimonial-card, .blog-card, .faq-q, .nav-cta, .btn-primary, .btn-secondary'
  );

  interactiveElements.forEach(function (el) {
    // Skip elements that are already links
    if (el.tagName === 'A' && el.href && el.href.startsWith('http')) {
      return;
    }
    el.style.touchAction = 'manipulation';
    el.style.webkitTapHighlightColor = 'transparent';
  });

  // ══════════════════════════════════════════════════════════════
  // FOOTER LINKS - Ensure proper navigation
  // ══════════════════════════════════════════════════════════════
  document.querySelectorAll('footer a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ══════════════════════════════════════════════════════════════
  // NAV CTA - Single click
  // ══════════════════════════════════════════════════════════════
  const navCta = document.querySelector('.nav-cta');
  if (navCta) {
    navCta.addEventListener('click', function (e) {
      const href = navCta.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // HERO CTA BUTTONS - Single click
  // ══════════════════════════════════════════════════════════════
  document.querySelectorAll('.hero-cta a, .cta-buttons a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      // Let external links work normally
      if (href && href.startsWith('http')) {
        return;
      }
      // Internal hash links
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

});