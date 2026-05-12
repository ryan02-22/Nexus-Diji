/**
 * Portfolio Card - Visit Button Generator & Touch Event Handler
 * Adds "Kunjungi Situs" buttons to portfolio cards
 * Handles click/touch events for all portfolio cards
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  // PORTFOLIO CARD TOUCH/CLICK HANDLER
  // ══════════════════════════════════════════════════════════════

  /**
   * Initialize touch/click handlers for all portfolio cards
   * Works on desktop (mouse click) and mobile/tablet (touch tap)
   */
  function initPortfolioCardHandlers() {
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    portfolioCards.forEach(function (card) {
      // Skip if already an anchor tag (like faryta-card-link)
      if (card.tagName === 'A') {
        // Add touch event for anchor cards
        card.addEventListener('touchstart', function (e) {
          // Trigger click for faster response on mobile
          // The browser will handle the navigation
        }, { passive: true });

        // Log for debugging
        console.log('Portfolio card (link):', card.href || 'no href');
        return;
      }

      // For article cards without links, add visit buttons via JS
      console.log('Portfolio card (article): processed');
    });
  }

  // ══════════════════════════════════════════════════════════════
  // VISIT BUTTON CREATION
  // ══════════════════════════════════════════════════════════════

  /**
   * Create a visit button element
   */
  function createVisitButton(url) {
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'portfolio-visit';
    a.title = 'Kunjungi situs';
    a.setAttribute('aria-label', 'Kunjungi situs eksternal');
    a.innerHTML =
      'Kunjungi Situs <svg class="visit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
      '<polyline points="15 3 21 3 21 9"/>' +
      '<line x1="10" y1="14" x2="21" y2="3"/>' +
      '</svg>';
    return a;
  }

  /**
   * Create a disabled visit button
   */
  function createDisabledButton() {
    var span = document.createElement('span');
    span.className = 'portfolio-visit disabled';
    span.textContent = 'Kunjungi Situs';
    span.setAttribute('aria-disabled', 'true');
    return span;
  }

  /**
   * Get portfolio URL from card
   */
  function getPortfolioUrl(article) {
    // Check for existing links in the card
    var link = article.querySelector('a');
    if (link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('http')) {
        return href;
      }
    }
    return null;
  }

  // Process all portfolio cards
  var portfolioCards = document.querySelectorAll('.portfolio-card:not(.faryta-card-link)');

  portfolioCards.forEach(function (article) {
    var info = article.querySelector('.portfolio-info');
    if (!info) return;

    var url = getPortfolioUrl(article);

    // Remove existing visit buttons to avoid duplicates
    var existingBtn = info.querySelector('.portfolio-visit');
    if (existingBtn) {
      existingBtn.remove();
    }

    // Add appropriate button
    if (url) {
      var btn = createVisitButton(url);
      info.appendChild(btn);
    } else {
      var disabledBtn = createDisabledButton();
      info.appendChild(disabledBtn);
    }
  });

  // ══════════════════════════════════════════════════════════════
  // ENSURE FARYTA STUDIO CARD WORKS ON ALL DEVICES
  // ══════════════════════════════════════════════════════════════
  var farytaCard = document.querySelector('.faryta-card-link');
  if (farytaCard) {
    // The card is an anchor tag, so native behavior should work
    // But we need to ensure touch events don't conflict

    // For the visit button inside, ensure it doesn't block the card click
    var visitBtn = farytaCard.querySelector('.portfolio-visit-premium');
    if (visitBtn) {
      visitBtn.addEventListener('click', function (e) {
        // This button is inside an anchor, so let the default action work
        // Just stop propagation to prevent any double-firing
        e.stopPropagation();
      });

      visitBtn.addEventListener('touchend', function (e) {
        // On touch, trigger the card's click
        e.preventDefault();
        e.stopPropagation();
        // Navigate to the URL
        window.open(farytaCard.href, '_blank');
      }, { passive: false });
    }

    // Also handle the entire card for touchend
    farytaCard.addEventListener('touchend', function (e) {
      // Only prevent default if we want custom handling
      // For now, let the browser handle the click naturally
    }, { passive: true });

    console.log('Faryta Studio card initialized with touch support');
  }

  console.log('Portfolio visit buttons initialized');
});