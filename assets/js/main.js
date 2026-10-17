/**
 * Nexus Diji - Main JavaScript Entry Point
 * Imports and initializes all modules
 */

import { initNavbar, initLanguageSwitch } from './navbar.js?v=mascot-20261017b';
import { initMegaMenu } from './mega-menu.js';
import { initAnimations } from './animations.js';
import { initCursor, initToolsOverlay } from './utilities.js';
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
// CHATBOT MODULE
// ══════════════════════════════════════════════════════════════
function initChatbot() {
  const overlayChatBtn = document.getElementById('overlayChatBtn');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatPopup = document.getElementById('chatPopup');
  const chatBody = document.getElementById('chatBody');
  const chatOptions = document.getElementById('chatOptions');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const WA_NUMBER = '6285711171508';

  function closeChat() {
    chatPopup.classList.remove('open');
    setTimeout(() => { chatPopup.style.display = 'none'; }, 300);
    const scrollUp = document.getElementById('backToTop');
    if (scrollUp) scrollUp.classList.remove('hidden-by-chat');
  }

  function openChat() {
    const helpPopup = document.getElementById('helpPopup');
    if (helpPopup && helpPopup.classList.contains('open')) {
      helpPopup.classList.remove('open');
      setTimeout(() => { helpPopup.style.display = 'none'; }, 300);
    }
    chatPopup.style.display = 'flex';
    requestAnimationFrame(() => chatPopup.classList.add('open'));
    const scrollUp = document.getElementById('backToTop');
    if (scrollUp) scrollUp.classList.add('hidden-by-chat');
  }

  function addBubble(text, isUser = false) {
    const b = document.createElement('div');
    b.className = 'chat-bubble' + (isUser ? ' user-bubble' : '');
    b.innerHTML = text;
    chatBody.appendChild(b);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function showWAButton(msg) {
    const encoded = encodeURIComponent(msg);
    const a = document.createElement('a');
    a.href = `https://wa.me/${WA_NUMBER}?text=${encoded}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'chat-wa-btn';
    a.innerHTML = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Lanjutkan di WhatsApp`;
    chatBody.appendChild(a);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  if (!overlayChatBtn || !chatPopup || !chatCloseBtn || !chatBody || !chatOptions) return;

  // Chat toggle button
  overlayChatBtn.addEventListener('click', () => {
    chatPopup.style.display === 'flex' ? closeChat() : openChat();
  });

  // Close button
  chatCloseBtn.addEventListener('click', closeChat);

  // Quick reply options
  chatOptions.querySelectorAll('.chat-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.dataset.label;
      const msg = btn.dataset.msg;
      const bId = btn.dataset.id;

      addBubble(label, true);
      chatOptions.style.display = 'none';

      const botResponses = {
        "website": "Tentu! Nexus Diji sudah berpengalaman membuat Landing Page, Company Profile, Toko Online, Web App hingga Aplikasi Custom. Ingin lanjut diskusi ke spesifikasi idemu via WhatsApp?",
        "servis": "Tim teknisi kami yang handal siap membantu! Kami melayani Instalasi OS, Upgrade RAM/SSD, pembersihan virus, hingga Recovery Data. Silakan ceritakan keluhan perangkatmu lebih lanjut di WhatsApp ya.",
        "harga": "Sebagai gambaran, harga pembuatan website kami mulai dari Rp500.000 saja, sedangkan servis PC/Laptop start dari Rp50.000. Untuk rincian lebih pas sesuai kebutuhanmu, yuk tanyakan ke admin kami!",
        "konsultasi": "Tentu! Konsultasi di Nexus Diji 100% GRATIS tanpa dipungut biaya. Tim ahli kami siap menjawab pertanyaanmu mengenai solusi digital apa pun. Lanjut di WhatsApp sekarang yuk!"
      };

      const replyText = bId && botResponses[bId] ? botResponses[bId] : `Siap! Saya bantu sambungkan kamu langsung ke tim Nexus Diji via WhatsApp. Klik tombol di bawah ya 👇`;

      setTimeout(() => {
        addBubble(replyText);
        setTimeout(() => showWAButton(msg), 400);
      }, 600);
    });
  });

  // Manual text input -> redirect to WA
  function sendManualMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    addBubble(text, true);
    chatInput.value = '';
    chatOptions.style.display = 'none';
    setTimeout(() => {
      addBubble(`Halo, saya telah menerima pesan manual kamu. Tim kami akan merespons detail pesanmu via WhatsApp secepatnya. Klik tombol di bawah ini ya 📩`);
      setTimeout(() => showWAButton(text), 400);
    }, 600);
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendManualMessage);
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendManualMessage(); });
  }

  // Help Popup
  const overlayHelpBtn = document.getElementById('overlayHelpBtn');
  const helpCloseBtn = document.getElementById('helpCloseBtn');
  const helpPopup = document.getElementById('helpPopup');

  function closeHelp() {
    helpPopup.classList.remove('open');
    setTimeout(() => { helpPopup.style.display = 'none'; }, 300);
    const scrollUp = document.getElementById('backToTop');
    if (scrollUp) scrollUp.classList.remove('hidden-by-chat');
  }

  function openHelp() {
    if (chatPopup.classList.contains('open')) closeChat();
    helpPopup.style.display = 'flex';
    requestAnimationFrame(() => helpPopup.classList.add('open'));
    const scrollUp = document.getElementById('backToTop');
    if (scrollUp) scrollUp.classList.add('hidden-by-chat');
  }

  if (overlayHelpBtn && helpPopup && helpCloseBtn) {
    overlayHelpBtn.addEventListener('click', () => {
      helpPopup.style.display === 'flex' ? closeHelp() : openHelp();
    });
    helpCloseBtn.addEventListener('click', closeHelp);
  }
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