/**
 * Nexus Diji - Portfolio Marquee
 * Interactive scrolling portfolio carousel with drag and auto-scroll
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

  // Drag start
  const startDrag = (e) => {
    isDown = true;
    marqueeTrack.classList.add('is-dragging');
    startX = (e.pageX || (e.touches && e.touches[0].pageX)) - currentX;
  };

  // Drag end
  const endDrag = () => {
    isDown = false;
    marqueeTrack.classList.remove('is-dragging');
  };

  // Drag move
  const moveDrag = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = (e.pageX || (e.touches && e.touches[0].pageX));
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

  // Touch events for mobile
  marqueeWrapper.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchend', endDrag);
  window.addEventListener('touchmove', moveDrag, { passive: false });

  // Pause on hover
  marqueeWrapper.addEventListener('mouseenter', () => { isPaused = true; });
  marqueeWrapper.addEventListener('mouseleave', () => { if (!isDown) isPaused = false; });

  console.log('Portfolio marquee initialized');
});