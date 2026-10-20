/**
 * Nexus Diji - Interactive Window Manager & Draggable Cards System
 * Enables free window dragging, resizing, maximize/restore,
 * and interactive draggable/reorderable grid cards.
 */

export function initWindowManager() {
  'use strict';

  // 1. Initialize floating windows: Help Hub & AI Chat
  const helpPopup = document.getElementById('helpPopup');
  const chatPopup = document.getElementById('chatPopup');

  if (helpPopup) {
    setupWindowInteractions(helpPopup, {
      headerSelector: '.help-header',
      dragGripSelector: '.window-drag-grip',
      resizeHandleSelector: '.window-resize-br',
      maximizeBtnSelector: '#helpMaximizeBtn',
      resetBtnSelector: '#helpResetPosBtn',
      minWidth: 320,
      maxWidth: 920,
      minHeight: 400,
      maxHeight: 880
    });
  }

  if (chatPopup) {
    setupWindowInteractions(chatPopup, {
      headerSelector: '.chat-header',
      dragGripSelector: '.window-drag-grip',
      resizeHandleSelector: '.window-resize-br',
      maximizeBtnSelector: '#chatMaximizeBtn',
      resetBtnSelector: '#chatResetPosBtn',
      minWidth: 320,
      maxWidth: 900,
      minHeight: 420,
      maxHeight: 880
    });
  }

  // 2. Initialize Draggable & Reorderable Cards
  initDraggableCardGrids();
}

/**
 * Attaches Dragging, Resizing, Maximize & Reset to a floating window
 */
function setupWindowInteractions(win, options) {
  if (win.dataset.windowMgrInitialized === 'true') return;
  win.dataset.windowMgrInitialized = 'true';

  const header = win.querySelector(options.headerSelector);
  const resizeHandle = win.querySelector(options.resizeHandleSelector);
  const maximizeBtn = win.querySelector(options.maximizeBtnSelector);
  const resetBtn = win.querySelector(options.resetBtnSelector);

  let isDragging = false;
  let isResizing = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;
  let initialWidth = 0, initialHeight = 0;

  // Bring to front on click
  win.addEventListener('pointerdown', () => {
    win.style.zIndex = '10000';
    const otherId = win.id === 'helpPopup' ? 'chatPopup' : 'helpPopup';
    const other = document.getElementById(otherId);
    if (other) other.style.zIndex = '9998';
  });

  // ── A. DRAGGING ──
  if (header) {
    header.addEventListener('pointerdown', (e) => {
      // Don't drag if clicking buttons inside the header or on mobile/tablet screens
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
        return;
      }
      if (window.innerWidth <= 768) return;
      if (win.classList.contains('is-maximized')) return;

      isDragging = true;
      header.setPointerCapture(e.pointerId);

      const rect = win.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = rect.left;
      initialTop = rect.top;

      // Lock current dimensions & switch transform to absolute left/top
      win.style.width = `${rect.width}px`;
      win.style.height = `${rect.height}px`;
      win.style.transform = 'none';
      win.style.left = `${initialLeft}px`;
      win.style.top = `${initialTop}px`;
      win.style.bottom = 'auto';
      win.style.right = 'auto';

      win.classList.add('is-dragging');
      document.body.classList.add('window-dragging-active');
    });

    header.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const rect = win.getBoundingClientRect();

      // Clamp so window header stays accessible
      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      const minLeft = 10;
      const maxLeft = Math.max(10, viewportWidth - rect.width - 10);
      const minTop = 10;
      const maxTop = Math.max(10, viewportHeight - 80);

      newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
      newTop = Math.max(minTop, Math.min(newTop, maxTop));

      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
    });

    const stopDragging = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try { header.releasePointerCapture(e.pointerId); } catch (_) {}
      win.classList.remove('is-dragging');
      document.body.classList.remove('window-dragging-active');
    };

    header.addEventListener('pointerup', stopDragging);
    header.addEventListener('pointercancel', stopDragging);
  }

  // ── B. RESIZING ──
  if (resizeHandle) {
    resizeHandle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (win.classList.contains('is-maximized')) return;

      isResizing = true;
      resizeHandle.setPointerCapture(e.pointerId);

      const rect = win.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      initialWidth = rect.width;
      initialHeight = rect.height;

      // Ensure transform is cleared
      win.style.transform = 'none';
      win.style.left = `${rect.left}px`;
      win.style.top = `${rect.top}px`;
      win.style.bottom = 'auto';
      win.style.right = 'auto';

      win.classList.add('is-resizing');
      document.body.classList.add('window-resizing-active');
    });

    resizeHandle.addEventListener('pointermove', (e) => {
      if (!isResizing) return;
      e.preventDefault();

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const maxAllowedW = Math.min(options.maxWidth, window.innerWidth - 20);
      const maxAllowedH = Math.min(options.maxHeight, window.innerHeight - 30);
      const minAllowedW = Math.min(options.minWidth, window.innerWidth - 20);
      const minAllowedH = Math.min(options.minHeight, window.innerHeight - 60);

      const newWidth = Math.max(minAllowedW, Math.min(initialWidth + dx, maxAllowedW));
      const newHeight = Math.max(minAllowedH, Math.min(initialHeight + dy, maxAllowedH));

      win.style.width = `${newWidth}px`;
      win.style.height = `${newHeight}px`;
    });

    const stopResizing = (e) => {
      if (!isResizing) return;
      isResizing = false;
      try { resizeHandle.releasePointerCapture(e.pointerId); } catch (_) {}
      win.classList.remove('is-resizing');
      document.body.classList.remove('window-resizing-active');
    };

    resizeHandle.addEventListener('pointerup', stopResizing);
    resizeHandle.addEventListener('pointercancel', stopResizing);
  }

  // ── C. MAXIMIZE / RESTORE ──
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (win.classList.contains('is-maximized')) {
        // Restore
        win.classList.remove('is-maximized');
        win.style.left = win.dataset.prevLeft || '';
        win.style.top = win.dataset.prevTop || '';
        win.style.width = win.dataset.prevWidth || '';
        win.style.height = win.dataset.prevHeight || '';
        maximizeBtn.setAttribute('title', 'Perbesar Ukuran');
      } else {
        // Maximize
        win.dataset.prevLeft = win.style.left || '';
        win.dataset.prevTop = win.style.top || '';
        win.dataset.prevWidth = win.style.width || '';
        win.dataset.prevHeight = win.style.height || '';
        win.classList.add('is-maximized');
        maximizeBtn.setAttribute('title', 'Kembalikan Ukuran');
      }
    });
  }

  // ── D. RESET POSITION / SIZE ──
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      win.classList.remove('is-maximized');
      win.style.left = '';
      win.style.top = '';
      win.style.width = '';
      win.style.height = '';
      win.style.transform = '';
      win.style.bottom = '';
      win.style.right = '';
      if (maximizeBtn) maximizeBtn.setAttribute('title', 'Perbesar Ukuran');

      // Visual feedback ripple
      win.classList.add('window-reset-flash');
      setTimeout(() => win.classList.remove('window-reset-flash'), 400);
    });
  }
}

/**
 * Interactive Draggable Grid Cards System
 * Allows users to grab, slide, reorder, and swap cards inside grids
 */
export function initDraggableCardGrids() {
  const containers = [
    { selector: '.estimator-option-cards', itemSelector: '.estimator-card' },
    { selector: '.help-warranty-grid', itemSelector: '.warranty-card' },
    { selector: '.chat-options', itemSelector: '.option-btn' }
  ];

  containers.forEach(({ selector, itemSelector }) => {
    const container = document.querySelector(selector);
    if (!container) return;
    if (container.dataset.cardReorderInitialized === 'true') return;
    container.dataset.cardReorderInitialized = 'true';
    setupCardReorder(container, itemSelector);
  });
}

function setupCardReorder(container, itemSelector) {
  let draggedCard = null;
  let startX = 0, startY = 0;
  let hasMoved = false;
  let placeholder = null;

  container.addEventListener('pointerdown', (e) => {
    const card = e.target.closest(itemSelector);
    if (!card) return;

    draggedCard = card;
    startX = e.clientX;
    startY = e.clientY;
    hasMoved = false;

    // Listen globally for moves & drops
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { once: true });
    window.addEventListener('pointercancel', onPointerUp, { once: true });
  });

  function onPointerMove(e) {
    if (!draggedCard) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const dist = Math.hypot(dx, dy);

    if (!hasMoved && dist > 5) {
      const rect = draggedCard.getBoundingClientRect();
      hasMoved = true;
      draggedCard.classList.add('is-card-dragging');
      document.body.classList.add('card-dragging-active');

      // Create placeholder matching the card dimensions
      placeholder = document.createElement('div');
      placeholder.className = 'card-drag-placeholder';
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      draggedCard.parentNode.insertBefore(placeholder, draggedCard);

      // Float dragged card out of layout flow so siblings keep their natural positions
      draggedCard.style.width = `${rect.width}px`;
      draggedCard.style.height = `${rect.height}px`;
      draggedCard.style.position = 'fixed';
      draggedCard.style.left = `${rect.left}px`;
      draggedCard.style.top = `${rect.top}px`;
      draggedCard.style.zIndex = '99999';
    }

    if (hasMoved) {
      e.preventDefault();
      draggedCard.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.05) rotate(1.5deg)`;

      // Check hover over sibling cards for live reorder
      const siblings = Array.from(container.querySelectorAll(itemSelector)).filter(c => c !== draggedCard);
      for (const sib of siblings) {
        const rect = sib.getBoundingClientRect();
        if (
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom
        ) {
          const isAfter = (e.clientX > rect.left + rect.width / 2);
          if (isAfter) {
            container.insertBefore(placeholder, sib.nextElementSibling);
          } else {
            container.insertBefore(placeholder, sib);
          }
          break;
        }
      }
    }
  }

  function onPointerUp(e) {
    window.removeEventListener('pointermove', onPointerMove);

    if (!draggedCard) return;

    if (hasMoved && placeholder) {
      e.stopPropagation();
      e.preventDefault();

      // Put card in placeholder's place
      placeholder.parentNode.insertBefore(draggedCard, placeholder);
      placeholder.remove();
      placeholder = null;

      // Clean up floating styles
      draggedCard.style.position = '';
      draggedCard.style.left = '';
      draggedCard.style.top = '';
      draggedCard.style.width = '';
      draggedCard.style.height = '';
      draggedCard.style.zIndex = '';
      draggedCard.style.transform = '';

      // Prevent accidental card click/selection immediately following a drag
      const preventClick = (clickEv) => {
        clickEv.stopImmediatePropagation();
        clickEv.preventDefault();
      };
      draggedCard.addEventListener('click', preventClick, { capture: true, once: true });
      setTimeout(() => {
        try { draggedCard.removeEventListener('click', preventClick, { capture: true }); } catch (_) {}
      }, 100);

      // Animate settle
      draggedCard.classList.add('card-settle-pop');
      setTimeout(() => {
        draggedCard && draggedCard.classList.remove('card-settle-pop');
      }, 350);
    } else {
      draggedCard.style.position = '';
      draggedCard.style.left = '';
      draggedCard.style.top = '';
      draggedCard.style.width = '';
      draggedCard.style.height = '';
      draggedCard.style.zIndex = '';
      draggedCard.style.transform = '';
    }

    draggedCard.classList.remove('is-card-dragging');
    document.body.classList.remove('card-dragging-active');
    draggedCard = null;
    hasMoved = false;
  }
}

export default {
  initWindowManager,
  initDraggableCardGrids
};
