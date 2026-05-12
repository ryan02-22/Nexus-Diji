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
  // FARYTA STUDIO CARD - Ensure single click works
  // ══════════════════════════════════════════════════════════════
  const farytaCard = document.querySelector('.faryta-card-link');

  if (farytaCard) {
    // The card is an <a> tag, so native click should work
    // Ensure no event is blocking the native click
    farytaCard.addEventListener('click', function (e) {
      // Allow the default action (navigation) to proceed
      // No preventDefault unless we want to handle it manually
      console.log('Faryta Studio card clicked, navigating to: ' + farytaCard.href);
    });

    // Ensure cursor shows pointer on all devices
    farytaCard.style.cursor = 'pointer';
  }

  // ══════════════════════════════════════════════════════════════
  // PRICING CTA BUTTONS - Single click to WhatsApp
  // ══════════════════════════════════════════════════════════════
  document.querySelectorAll('.pricing-cta').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      // Let the <a> tag handle navigation naturally
      // This ensures single tap works on mobile
      console.log('Pricing CTA clicked');
    });
  });

  // ══════════════════════════════════════════════════════════════
  // BLOG LINKS - Single click navigation
  // ══════════════════════════════════════════════════════════════
  document.querySelectorAll('.blog-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      // Let the <a> tag handle navigation naturally
      console.log('Blog link clicked');
    });
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
        console.log('External link clicked:', href);
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

  // ══════════════════════════════════════════════════════════════
  // PROMO BANNER LINK - Single click
  // ══════════════════════════════════════════════════════════════
  const promoLink = document.querySelector('.promo-banner a');
  if (promoLink) {
    promoLink.addEventListener('click', function () {
      console.log('Promo banner link clicked');
    });
  }

  // ══════════════════════════════════════════════════════════════
  // WA FLOAT BUTTON - Single click
  // ══════════════════════════════════════════════════════════════
  const waFloat = document.querySelector('.wa-float');
  if (waFloat) {
    waFloat.addEventListener('click', function (e) {
      // Let the <a> tag handle navigation naturally
      console.log('WA Float clicked');
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TOOL BUTTONS - Ensure single tap works
  // ══════════════════════════════════════════════════════════════
  document.querySelectorAll('.tool-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      // Let buttons work naturally
      // These are already handled by main.js for chatbot/help
      console.log('Tool button clicked');
    });
  });

  console.log('UI utilities initialized');
});