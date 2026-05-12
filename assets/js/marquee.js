/**
 * Nexus Diji - Portfolio Marquee
 * Interactive scrolling portfolio carousel with drag and auto-scroll
 * Fixed: Now allows taps/clicks on portfolio cards to work properly
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const marqueeTrack = document.querySelector('.portfolio-marquee-track');
  const marqueeWrapper = document.querySelector('.portfolio-marquee-wrapper');

  if (!marqueeTrack || !marqueeWrapper) {
    console.log('Marquee elements not found');
    return;
  }

  let isDown = false;
  let startX = 0;
  let currentX = 0;
  let speed = 0.8;
  let isPaused = false;
  let hasMoved = false; // Track if user actually dragged
  let touchStartTime = 0;
  const MIN_SWIPE_DISTANCE = 10; // Minimum distance to consider as drag

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

  // Start animation loop
  requestAnimationFrame(updateMarquee);

  // Check if touch was a tap (short duration, minimal movement)
  function wasTap(startX, startY, endX, endY, duration) {
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    return distance < MIN_SWIPE_DISTANCE && duration < 300;
  }

  // Drag start
  const startDrag = (e) => {
    isDown = true;
    hasMoved = false;
    touchStartTime = Date.now();
    const point = e.touches ? e.touches[0] : e;
    startX = point.pageX - currentX;
    marqueeTrack.classList.add('is-dragging');
  };

  // Drag end - Fixed to allow taps on cards
  const endDrag = (e) => {
    if (!isDown) return;

    const wasDragging = hasMoved;
    isDown = false;
    marqueeTrack.classList.remove('is-dragging');

    // If it was a tap (not a drag), let the click event propagate
    // The browser will handle the click on the card
    if (!wasDragging) {
      // Reset for next interaction
      return;
    }
  };

  // Drag move
  const moveDrag = (e) => {
    if (!isDown) return;
    e.preventDefault();

    const point = e.touches ? e.touches[0] : e;
    const x = point.pageX;

    // Check if user has moved enough to consider as drag
    const movedDistance = Math.abs(x - startX + currentX);
    if (movedDistance > MIN_SWIPE_DISTANCE) {
      hasMoved = true;
    }

    currentX = x - startX;

    const halfWidth = marqueeTrack.offsetWidth / 2;
    if (currentX > 0) {
      currentX = -halfWidth;
      startX = x - currentX;
    } else if (Math.abs(currentX) >= halfWidth) {
      currentX = 0;
      startX = x - currentX;
    }

    marqueeTrack.style.transform = `translateX(${currentX}px)`;
  };

  // Mouse events
  marqueeWrapper.addEventListener('mousedown', startDrag);
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('mousemove', moveDrag);

  // Touch events for mobile - use a flag to detect taps
  let touchMoved = false;
  let touchStartPos = { x: 0, y: 0 };

  marqueeWrapper.addEventListener('touchstart', function (e) {
    touchMoved = false;
    touchStartPos = { x: e.touches[0].pageX, y: e.touches[0].pageY };
    startDrag(e);
  }, { passive: true });

  marqueeWrapper.addEventListener('touchmove', function (e) {
    const dx = Math.abs(e.touches[0].pageX - touchStartPos.x);
    const dy = Math.abs(e.touches[0].pageY - touchStartPos.y);

    // If vertical movement is greater than horizontal, it's probably a page scroll
    // Let the browser handle it naturally
    if (dy > dx && dy > 10) {
      isDown = false;
      marqueeTrack.classList.remove('is-dragging');
      return;
    }

    touchMoved = true;
    moveDrag(e);
  }, { passive: false });

  marqueeWrapper.addEventListener('touchend', function (e) {
    // If it wasn't a drag, let clicks pass through
    if (!touchMoved && !hasMoved) {
      isDown = false;
      marqueeTrack.classList.remove('is-dragging');
      // Don't preventDefault - let the click event fire
      return;
    }

    endDrag(e);
  }, { passive: true });

  // Pause on hover (desktop only)
  if (window.matchMedia('(hover: hover)').matches) {
    marqueeWrapper.addEventListener('mouseenter', () => { isPaused = true; });
    marqueeWrapper.addEventListener('mouseleave', () => { if (!isDown) isPaused = false; });
  }

  console.log('Portfolio marquee initialized with tap support');
});