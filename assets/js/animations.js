/**
 * Nexus Diji - Animations Module
 * Reveal animations, typing effect, counter animations
 */

// ══════════════════════════════════════════════════════════════
// REVEAL ANIMATIONS (Intersection Observer)
// ══════════════════════════════════════════════════════════════
export function initRevealAnimations() {
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
}

// ══════════════════════════════════════════════════════════════
// TYPING EFFECT
// ══════════════════════════════════════════════════════════════
export function initTypingEffect() {
  const typingLine1 = document.getElementById('typingLine1');
  const typingLine2 = document.getElementById('typingLine2');
  const typingLine3 = document.getElementById('typingLine3');
  const heroSection = document.querySelector('.hero');

  if (!typingLine1 || !typingLine2 || !typingLine3 || !heroSection) return;

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

  heroObserver.observe(heroSection);
}

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

export function initCounterAnimations() {
  const statEls = document.querySelectorAll('.stat-num[data-target]');
  const heroSection = document.querySelector('.hero');

  if (statEls.length === 0 || !heroSection) return;

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
  counterObserver.observe(heroSection);
}

// ══════════════════════════════════════════════════════════════
// FAQ ACCORDION
// ══════════════════════════════════════════════════════════════
export function initFAQ() {
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
}

// Initialize all animations
export function initAnimations() {
  initRevealAnimations();
  initTypingEffect();
  initCounterAnimations();
  initFAQ();
}

export default initAnimations;