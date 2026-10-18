/**
 * Nexus Diji - 3D Curved Arc Coverflow Carousel & Portfolio Marquee
 * Inspired by ultra-modern 3D perspective showcases
 */

function initPortfolioShowcase() {
  'use strict';

  // =========================================================================
  // 1. 3D CURVED COVERFLOW ARC CAROUSEL (Image 2 Style)
  // =========================================================================
  const stage = document.getElementById('portfolio3DStage');
  const track = document.getElementById('portfolio3DTrack');
  const prevBtn = document.getElementById('stagePrevBtn');
  const nextBtn = document.getElementById('stageNextBtn');
  const dotsContainer = document.getElementById('stageDots');

  if (stage && track) {
    const cards = Array.from(track.querySelectorAll('.portfolio-3d-card'));
    const totalCards = cards.length;
    let activeIndex = 0;
    let autoPlayTimer = null;
    let isHovered = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragDistance = 0;

    // Generate indicator dots
    if (dotsContainer && totalCards > 0) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalCards; i++) {
        const dot = document.createElement('button');
        dot.className = 'stage-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('type', 'button');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', String(i === 0));
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          goToIndex(i);
          restartAutoPlay();
        });
        dotsContainer.appendChild(dot);
      }
    }

    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.stage-dot')) : [];

    // Calculate card layout in 3D Arc perspective (Matching Image 2)
    function updateLayout() {
      const isSmallMobile = window.innerWidth <= 420;
      const isMobile = window.innerWidth <= 768 && !isSmallMobile;
      const isTablet = window.innerWidth <= 1080 && !isMobile && !isSmallMobile;

      // Spacing constants based on viewport width for tight overlapping arc
      const x1 = isSmallMobile ? 88 : (isMobile ? 135 : (isTablet ? 175 : 215));
      const x2 = isSmallMobile ? 165 : (isMobile ? 255 : (isTablet ? 335 : 415));
      const xFar = isSmallMobile ? 240 : (isMobile ? 380 : (isTablet ? 500 : 640));

      cards.forEach((card, i) => {
        let diff = (i - activeIndex) % totalCards;
        if (diff > totalCards / 2) diff -= totalCards;
        if (diff < -totalCards / 2) diff += totalCards;

        const absDiff = Math.abs(diff);
        const sign = Math.sign(diff);

        card.classList.toggle('is-active', absDiff === 0);

        if (absDiff === 0) {
          // 1. Center Active Card
          const scale = isSmallMobile ? 0.98 : (isMobile ? 1.02 : 1.06);
          card.style.transform = `translate3d(0px, -12px, 80px) rotateY(0deg) rotateZ(0deg) scale(${scale})`;
          card.style.opacity = '1';
          card.style.zIndex = '10';
          card.style.pointerEvents = 'auto';
        } else if (absDiff === 1) {
          // 2. Immediate left / right cards
          const yOffset = (isMobile || isSmallMobile) ? 14 : 20;
          const rotY = (isMobile || isSmallMobile) ? 20 : 25;
          const rotZ = (isMobile || isSmallMobile) ? 3 : 4;
          const scale = isSmallMobile ? 0.82 : (isMobile ? 0.88 : 0.91);

          card.style.transform = `translate3d(${sign * x1}px, ${yOffset}px, -15px) rotateY(${-sign * rotY}deg) rotateZ(${sign * rotZ}deg) scale(${scale})`;
          card.style.opacity = '0.94';
          card.style.zIndex = '8';
          card.style.pointerEvents = 'auto';
        } else if (absDiff === 2) {
          // 3. Outer left / right cards
          const yOffset = (isMobile || isSmallMobile) ? 32 : 48;
          const rotY = (isMobile || isSmallMobile) ? 32 : 40;
          const rotZ = (isMobile || isSmallMobile) ? 6 : 8;
          const scale = isSmallMobile ? 0.68 : (isMobile ? 0.76 : 0.81);

          card.style.transform = `translate3d(${sign * x2}px, ${yOffset}px, -70px) rotateY(${-sign * rotY}deg) rotateZ(${sign * rotZ}deg) scale(${scale})`;
          card.style.opacity = isSmallMobile ? '0' : (isMobile ? '0.4' : '0.82');
          card.style.zIndex = '6';
          card.style.pointerEvents = isSmallMobile ? 'none' : 'auto';
        } else {
          // 4. Far hidden cards
          const farSign = sign || 1;
          card.style.transform = `translate3d(${farSign * xFar}px, 70px, -160px) rotateY(${-farSign * 50}deg) scale(0.62)`;
          card.style.opacity = '0';
          card.style.zIndex = '1';
          card.style.pointerEvents = 'none';
        }
      });

      // Update dots
      dots.forEach((dot, idx) => {
        const isActive = idx === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });
    }

    function goToIndex(index) {
      activeIndex = (index + totalCards) % totalCards;
      updateLayout();
    }

    function nextCard() {
      goToIndex(activeIndex + 1);
    }

    function prevCard() {
      goToIndex(activeIndex - 1);
    }

    // Auto-play continuous rotation
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        if (!isHovered && !isDragging) {
          nextCard();
        }
      }, 3600);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function restartAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    // Card click event
    cards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        // If clicking action button or link directly, let it open
        if (e.target.closest('.card-action, a')) {
          return;
        }

        if (idx !== activeIndex) {
          e.preventDefault();
          goToIndex(idx);
          restartAutoPlay();
        } else {
          // If clicked center card and it has a link
          const link = card.dataset.link;
          if (link) {
            const isExternal = card.dataset.external === 'true';
            if (isExternal) {
              window.open(link, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = link;
            }
          }
        }
      });
    });

    // Control buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevCard();
        restartAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextCard();
        restartAutoPlay();
      });
    }

    // Pause on hover
    stage.addEventListener('mouseenter', () => { isHovered = true; });
    stage.addEventListener('mouseleave', () => { isHovered = false; });

    // Touch & Mouse Drag / Swipe
    const handleDragStart = (x) => {
      isDragging = true;
      dragStartX = x;
      dragDistance = 0;
      stage.classList.add('is-dragging');
    };

    const handleDragMove = (x) => {
      if (!isDragging) return;
      dragDistance = x - dragStartX;
    };

    const handleDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      stage.classList.remove('is-dragging');

      if (Math.abs(dragDistance) > 40) {
        if (dragDistance < 0) {
          nextCard();
        } else {
          prevCard();
        }
        restartAutoPlay();
      }
    };

    // Mouse drag
    stage.addEventListener('mousedown', (e) => {
      if (e.target.closest('a, button')) return;
      handleDragStart(e.pageX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        handleDragMove(e.pageX);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) handleDragEnd();
    });

    // Touch swipe
    stage.addEventListener('touchstart', (e) => {
      if (e.target.closest('a, button')) return;
      handleDragStart(e.touches[0].pageX);
    }, { passive: true });

    stage.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      handleDragMove(e.touches[0].pageX);
    }, { passive: true });

    stage.addEventListener('touchend', () => {
      if (isDragging) handleDragEnd();
    }, { passive: true });

    // Keyboard navigation when stage is in viewport
    window.addEventListener('keydown', (e) => {
      const rect = stage.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowLeft') {
        prevCard();
        restartAutoPlay();
      } else if (e.key === 'ArrowRight') {
        nextCard();
        restartAutoPlay();
      }
    });

    // Responsive update
    window.addEventListener('resize', () => {
      updateLayout();
    });

    // Initialize layout and start timer
    updateLayout();
    startAutoPlay();
  }

  // =========================================================================
  // 2. BACKWARD COMPATIBILITY: Legacy Horizontal Marquee Track (if present)
  // =========================================================================
  const marqueeTrack = document.querySelector('.portfolio-marquee-track');
  const marqueeWrapper = document.querySelector('.portfolio-marquee-wrapper');

  if (marqueeTrack && marqueeWrapper) {
    let isDown = false;
    let startX = 0;
    let currentX = 0;
    let speed = 0.8;
    let isPaused = false;
    let hasMoved = false;

    const updateMarquee = () => {
      if (!isDown && !isPaused) {
        currentX -= speed;
        const halfWidth = marqueeTrack.offsetWidth / 2;
        if (Math.abs(currentX) >= halfWidth) {
          currentX = 0;
        }
        marqueeTrack.style.transform = `translateX(${currentX}px)`;
      }
      requestAnimationFrame(updateMarquee);
    };

    requestAnimationFrame(updateMarquee);

    marqueeWrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      hasMoved = false;
      startX = e.pageX - currentX;
      marqueeTrack.classList.add('is-dragging');
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
      marqueeTrack.classList.remove('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      hasMoved = true;
      currentX = e.pageX - startX;
      marqueeTrack.style.transform = `translateX(${currentX}px)`;
    });

    marqueeWrapper.addEventListener('mouseenter', () => { isPaused = true; });
    marqueeWrapper.addEventListener('mouseleave', () => { if (!isDown) isPaused = false; });
  }
}

window.initPortfolioShowcase = initPortfolioShowcase;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioShowcase);
} else {
  initPortfolioShowcase();
}