/**
 * Nexus Diji - Animations Module
 * Reveal animations, counter animations
 */

// ══════════════════════════════════════════════════════════════
// REVEAL ANIMATIONS (Intersection Observer)
// ══════════════════════════════════════════════════════════════
function initRevealAnimations() {
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

function initCounterAnimations() {
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
function initFAQ() {
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
function initAnimations() {
  initRevealAnimations();
  initCounterAnimations();
  initFAQ();
}

