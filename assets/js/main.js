/**
 * Nexus Diji - Main JavaScript
 * Core functionality: cursor, navigation, reveal animations, FAQ, counters, typing effect
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  // CUSTOM CURSOR (Desktop only)
  // ══════════════════════════════════════════════════════════════
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');

  if (cursor && cursorRing) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX - 3 + 'px';
      cursor.style.top = e.clientY - 3 + 'px';
      cursorRing.style.left = e.clientX - 16 + 'px';
      cursorRing.style.top = e.clientY - 16 + 'px';
    });
  }

  // ══════════════════════════════════════════════════════════════
  // NAVIGATION SCROLL + PROMO BANNER
  // ══════════════════════════════════════════════════════════════
  const navbar = document.getElementById('navbar');
  const promoBanner = document.getElementById('promoBanner');
  const backToTop = document.getElementById('backToTop');
  const toolsOverlay = document.getElementById('toolsOverlay');

  // Hamburger menu elements
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenuBtn = document.getElementById('closeMenuBtn');

  function updateNavAndMenuTop() {
    if (!promoBanner) return;
    const bannerHeight = promoBanner.classList.contains('hidden') ? 0 : promoBanner.offsetHeight;
    const scrolled = window.scrollY > 50;
    navbar.style.top = scrolled ? '0px' : bannerHeight + 'px';
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      mobileMenu.style.top = scrolled ? '0px' : bannerHeight + 'px';
    }
  }

  updateNavAndMenuTop();
  window.addEventListener('resize', updateNavAndMenuTop);

  const heroSection = document.querySelector('.hero');

  let autoHideTimer;
  let manualOverlayControl = false;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);
    if (promoBanner) promoBanner.classList.toggle('hidden', scrolled);

    // Footer detection for hiding floating elements
    const footer = document.querySelector('footer');
    let nearFooter = false;
    if (footer) {
      const footerTop = footer.getBoundingClientRect().top;
      nearFooter = footerTop < window.innerHeight + 20;
    }

    if (backToTop) {
      const shouldShow = window.scrollY > 400 && !nearFooter;
      backToTop.classList.toggle('visible', shouldShow);
    }

    updateNavAndMenuTop();

    // Tools overlay visibility
    if (toolsOverlay) {
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
    }
  });

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

  // Tools overlay mouse events
  if (toolsOverlay && window.innerWidth > 768) {
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

  // ══════════════════════════════════════════════════════════════
  // REVEAL ANIMATIONS (Intersection Observer)
  // ══════════════════════════════════════════════════════════════
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      } else {
        e.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ══════════════════════════════════════════════════════════════
  // HAMBURGER MENU
  // ══════════════════════════════════════════════════════════════
  if (hamburgerBtn && mobileMenu && closeMenuBtn) {
    hamburgerBtn.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      updateNavAndMenuTop();
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
  // BACK TO TOP BUTTON
  // ══════════════════════════════════════════════════════════════
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // FAQ ACCORDION
  // ══════════════════════════════════════════════════════════════
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all FAQ items
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked item
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ══════════════════════════════════════════════════════════════
  // TYPING EFFECT
  // ══════════════════════════════════════════════════════════════
  const typingLine1 = document.getElementById('typingLine1');
  const typingLine2 = document.getElementById('typingLine2');
  const typingLine3 = document.getElementById('typingLine3');
  const typingCursor = document.getElementById('typingCursor');

  const lines = [
    { el: typingLine1, text: 'Wujudkan' },
    { el: typingLine2, text: 'Ide Digital' },
    { el: typingLine3, text: 'Kamu.' }
  ];

  async function typeText(el, text, speed = 80) {
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      await new Promise(r => setTimeout(r, speed));
    }
  }

  async function runTyping() {
    lines.forEach(line => { line.el.textContent = ''; });
    await new Promise(r => setTimeout(r, 900));

    for (let i = 0; i < lines.length; i++) {
      const speed = i === 0 ? 90 : i === 1 ? 80 : 110;
      await typeText(lines[i].el, lines[i].text, speed);
      if (i < lines.length - 1) await new Promise(r => setTimeout(r, 120));
    }
  }

  let typingFired = false;
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!typingFired) {
          typingFired = true;
          runTyping();
        }
      } else {
        typingFired = false;
        lines.forEach(line => { line.el.textContent = ''; });
      }
    });
  }, { threshold: 0.1 });

  if (heroSection) heroObserver.observe(heroSection);

  // ══════════════════════════════════════════════════════════════
  // COUNTER ANIMATION
  // ══════════════════════════════════════════════════════════════
  function animateCounter(el, target, suffix, duration = 1600) {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  }

  const statEls = document.querySelectorAll('.stat-num[data-target]');
  let countersFired = false;
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!countersFired) {
          countersFired = true;
          statEls.forEach(el => {
            const target = parseInt(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            animateCounter(el, target, suffix);
          });
        }
      } else {
        countersFired = false;
        statEls.forEach(el => { el.textContent = '0' + (el.dataset.suffix || ''); });
      }
    });
  }, { threshold: 0.1 });

  function checkInitialCounters() {
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView && !countersFired) {
      countersFired = true;
      statEls.forEach(el => {
        animateCounter(el, parseInt(el.dataset.target), el.dataset.suffix || '');
      });
    }
  }
  setTimeout(checkInitialCounters, 500);
  if (heroSection) counterObserver.observe(heroSection);

  // ══════════════════════════════════════════════════════════════
  // FAB TRIGGER (Tools Overlay Toggle)
  // ══════════════════════════════════════════════════════════════
  const fabTrigger = document.getElementById('fabTrigger');
  const chatPopup = document.getElementById('chatPopup');
  const helpPopup = document.getElementById('helpPopup');

  function closeChat() {
    chatPopup.classList.remove('open');
    setTimeout(() => { chatPopup.style.display = 'none'; }, 300);
    const scrollUp = document.getElementById('backToTop');
    if (scrollUp) scrollUp.classList.remove('hidden-by-chat');
  }

  function closeHelp() {
    helpPopup.classList.remove('open');
    setTimeout(() => { helpPopup.style.display = 'none'; }, 300);
    const scrollUp = document.getElementById('backToTop');
    if (scrollUp) scrollUp.classList.remove('hidden-by-chat');
  }

  if (fabTrigger && toolsOverlay) {
    fabTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.innerWidth <= 768) {
        const isActive = toolsOverlay.classList.toggle('active');
        if (backToTop) backToTop.style.display = isActive ? 'none' : '';
        if (chatPopup.classList.contains('open')) closeChat();
        if (helpPopup.classList.contains('open')) closeHelp();
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

    document.addEventListener('click', (e) => {
      if (!toolsOverlay.contains(e.target) && toolsOverlay.classList.contains('active')) {
        toolsOverlay.classList.remove('active');
        if (backToTop) backToTop.style.display = '';
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // HELP POPUP
  // ══════════════════════════════════════════════════════════════
  const overlayHelpBtn = document.getElementById('overlayHelpBtn');
  const helpCloseBtn = document.getElementById('helpCloseBtn');

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

  // ══════════════════════════════════════════════════════════════
  // CHATBOT
  // ══════════════════════════════════════════════════════════════
  const overlayChatBtn = document.getElementById('overlayChatBtn');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatBody = document.getElementById('chatBody');
  const chatOptions = document.getElementById('chatOptions');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const WA_NUMBER = '6285711171508';

  function openChat() {
    if (helpPopup.classList.contains('open')) closeHelp();
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

  if (overlayChatBtn && chatPopup && chatCloseBtn && chatBody && chatOptions) {
    overlayChatBtn.addEventListener('click', () => {
      chatPopup.style.display === 'flex' ? closeChat() : openChat();
    });
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

    chatSendBtn.addEventListener('click', sendManualMessage);
    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendManualMessage(); });
  }

  console.log('Nexus Diji main scripts initialized');
});