/**
 * Nexus Diji - Main JavaScript Entry Point
 * Imports and initializes all modules
 */

import { initNavbar, initLanguageSwitch } from './navbar.js?v=auto-sync-20261018c';
import { initMegaMenu } from './mega-menu.js';
import { initAnimations } from './animations.js';
import { initCursor, initToolsOverlay } from './utilities.js';
import { initChatbot } from './chatbot.js?v=mascot-ai-20261018';
import './site-effects.js';

function bootstrapApp() {
  'use strict';

  // Apply language immediately across any page
  try {
    initLanguageSwitch();
  } catch (err) {
    console.warn('initLanguageSwitch error:', err);
  }

  // Initialize all modules safely
  try { initCursor(); } catch (e) { console.warn('initCursor error:', e); }
  try { initNavbar(); } catch (e) { console.warn('initNavbar error:', e); }
  try { initMegaMenu(); } catch (e) { console.warn('initMegaMenu error:', e); }
  try { initAnimations(); } catch (e) { console.warn('initAnimations error:', e); }
  try { initToolsOverlay(); } catch (e) { console.warn('initToolsOverlay error:', e); }
  try { if (typeof window.initPortfolioShowcase === 'function') window.initPortfolioShowcase(); } catch (e) { console.warn('initPortfolioShowcase error:', e); }

  // Initialize chatbot functionality
  try { initChatbot(); } catch (e) { console.warn('initChatbot error:', e); }
  try { initContactCards(); } catch (e) { console.warn('initContactCards error:', e); }
  try { initHeroMascotParallax(); } catch (e) { console.warn('initHeroMascotParallax error:', e); }

  console.log('Nexus Diji initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp, { once: true });
} else {
  bootstrapApp();
}


// ══════════════════════════════════════════════════════════════
// 3D CONTACT CARDS INTERACTION (Copy & Tilt)
// ══════════════════════════════════════════════════════════════
function initContactCards() {
  const cards = document.querySelectorAll('.contact-3d-card');
  if (!cards.length) return;

  // 1. Interactive Copy Button
  cards.forEach(card => {
    const infoBox = card.querySelector('.contact-3d-card__info-box');
    const copyBtn = card.querySelector('.info-box__copy-btn');
    if (!infoBox) return;

    const copyText = infoBox.getAttribute('data-copy');
    if (!copyText) return;

    function handleCopy(e) {
      if (e) e.stopPropagation();
      navigator.clipboard.writeText(copyText).then(() => {
        if (copyBtn) {
          copyBtn.classList.add('copied');
          const tooltip = copyBtn.querySelector('.copy-tooltip');
          if (tooltip) tooltip.textContent = 'Tersalin!';
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            if (tooltip) tooltip.textContent = 'Salin';
          }, 2000);
        }
      }).catch(err => {
        console.warn('Clipboard copy failed:', err);
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', handleCopy);
    }
  });

  // 2. Subtle 3D Mouse Tilt on Desktop
  if (window.matchMedia('(min-width: 992px)').matches) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
}

// ══════════════════════════════════════════════════════════════
// HERO MASCOT 3D PARALLAX & TILT
// ══════════════════════════════════════════════════════════════
function initHeroMascotParallax() {
  const stage = document.getElementById('heroRobotStage');
  const heroSection = document.querySelector('.hero');
  if (!stage || !heroSection) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth <= 768) return;

  const mascot = stage.querySelector('.robot-mascot-wrapper');
  const cards = stage.querySelectorAll('.hero-bento-card');
  const props = stage.querySelector('.stage-props');
  const pedestal = stage.querySelector('.stage-pedestal');
  const orbit = stage.querySelector('.stage-orbit-wrap');

  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let rafId = null;

  function onMouseMove(e) {
    const rect = stage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    targetX = (e.clientX - centerX) / (rect.width / 2);
    targetY = (e.clientY - centerY) / (rect.height / 2);

    targetX = Math.max(-1.2, Math.min(1.2, targetX));
    targetY = Math.max(-1.2, Math.min(1.2, targetY));

    if (!rafId) {
      rafId = requestAnimationFrame(updateParallax);
    }
  }

  function updateParallax() {
    mouseX += (targetX - mouseX) * 0.08;
    mouseY += (targetY - mouseY) * 0.08;

    const rotX = -mouseY * 7;
    const rotY = mouseX * 9;

    if (mascot) {
      mascot.style.transform = `translate3d(${mouseX * 10}px, ${mouseY * 7}px, 20px) rotateY(${rotY * 0.7}deg) rotateX(${rotX * 0.5}deg)`;
    }

    if (pedestal) {
      pedestal.style.transform = `translateX(calc(-50% + ${mouseX * 5}px)) rotateX(72deg) rotateZ(${mouseX * 3}deg)`;
    }

    if (orbit) {
      orbit.style.transform = `translate(calc(-50% + ${mouseX * 7}px), calc(-50% + ${mouseY * 5}px)) rotate(-15deg) rotateX(63deg) rotateY(${rotY * 0.35}deg)`;
    }

    if (props) {
      props.style.transform = `translate3d(${mouseX * -8}px, ${mouseY * -6}px, 0)`;
    }

    cards.forEach((card, i) => {
      const depth = (i + 1) * 5;
      card.style.translate = `${mouseX * depth}px ${mouseY * (depth * 0.7)}px`;
    });

    if (Math.abs(targetX - mouseX) > 0.002 || Math.abs(targetY - mouseY) > 0.002) {
      rafId = requestAnimationFrame(updateParallax);
    } else {
      rafId = null;
    }
  }

  function onMouseLeave() {
    targetX = 0;
    targetY = 0;
    if (!rafId) {
      rafId = requestAnimationFrame(updateParallax);
    }
  }

  heroSection.addEventListener('mousemove', onMouseMove, { passive: true });
  heroSection.addEventListener('mouseleave', onMouseLeave);
}