/**
 * Portfolio Card - Visit Button Generator
 * Adds "Kunjungi Situs" buttons to portfolio cards
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // Portfolio card URLs mapping
  const portfolioUrls = {
    'faryta-studio': 'https://faryta-studio.vercel.app'
  };

  /**
   * Create a visit button element
   */
  function createVisitButton(url, isPremium) {
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'portfolio-visit' + (isPremium ? ' portfolio-visit-premium' : '');
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
   * Get portfolio URL from card identifier
   */
  function getPortfolioUrl(article) {
    // Check for faryta-card
    if (article.classList.contains('faryta-card')) {
      return portfolioUrls['faryta-studio'];
    }

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

  /**
   * Check if portfolio card is premium (special styling)
   */
  function isPremiumCard(article) {
    return article.classList.contains('faryta-card');
  }

  // Process all portfolio cards
  var portfolioCards = document.querySelectorAll('.portfolio-card');

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
      var btn = createVisitButton(url, isPremiumCard(article));
      info.appendChild(btn);
    } else {
      var disabledBtn = createDisabledButton();
      info.appendChild(disabledBtn);
    }
  });

  // Log for debugging
  console.log('Portfolio visit buttons initialized');
});