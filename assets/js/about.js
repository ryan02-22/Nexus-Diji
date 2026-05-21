/**
 * Nexus Diji - About Page JavaScript
 * Animations, counters, and reveal effects specific to About page
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  // REVEAL ANIMATIONS (Intersection Observer)
  // ══════════════════════════════════════════════════════════════
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ══════════════════════════════════════════════════════════════
  // COUNTER ANIMATION FOR HERO STATS
  // ══════════════════════════════════════════════════════════════
  function animateCounter(el, target, duration = 1600) {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  const statNumbers = document.querySelectorAll('.stat-card__number[data-count]');
  let countersStarted = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        statNumbers.forEach(el => {
          const target = parseInt(el.dataset.count);
          setTimeout(() => {
            animateCounter(el, target);
          }, 300);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.about-hero__stats');
  if (statsSection) {
    counterObserver.observe(statsSection);
  }

  // ══════════════════════════════════════════════════════════════
  // NAVBAR SCROLL BEHAVIOR
  // ══════════════════════════════════════════════════════════════
  const navbar = document.getElementById('navbar');
  const promoBanner = document.getElementById('promoBanner');

  function updateNavbarTop() {
    if (!promoBanner) return;
    const bannerHeight = promoBanner.classList.contains('hidden') ? 0 : promoBanner.offsetHeight;
    const scrolled = window.scrollY > 50;
    navbar.style.top = scrolled ? '0px' : bannerHeight + 'px';
  }

  updateNavbarTop();
  window.addEventListener('resize', updateNavbarTop);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);
    if (promoBanner) promoBanner.classList.toggle('hidden', scrolled);
    updateNavbarTop();
  });

  // ══════════════════════════════════════════════════════════════
  // MOBILE MENU
  // ══════════════════════════════════════════════════════════════
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenuBtn = document.getElementById('closeMenuBtn');

  if (hamburgerBtn && mobileMenu && closeMenuBtn) {
    hamburgerBtn.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      updateNavbarTop();
    });

    function closeMobileMenu() {
      mobileMenu.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    closeMenuBtn.addEventListener('click', closeMobileMenu);
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMobileMenu();
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CUSTOM CURSOR (Desktop only)
  // ══════════════════════════════════════════════════════════════
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');

  if (cursor && cursorRing && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX - 3 + 'px';
      cursor.style.top = e.clientY - 3 + 'px';
      cursorRing.style.left = e.clientX - 16 + 'px';
      cursorRing.style.top = e.clientY - 16 + 'px';
    });

    // Hover effects on interactive elements
    document.querySelectorAll('.team-card, .culture-card, .value-card, .social-link, .btn-primary, .btn-secondary').forEach(el => {
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

  console.log('Nexus Diji About page initialized');
});