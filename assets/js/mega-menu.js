/**
 * Nexus Diji - Mega Menu Module
 * Desktop hover, mobile tap, dropdown interaction logic
 * Stable and responsive mega menu with proper state management
 */

function initMegaMenu() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  const desktopMedia = window.matchMedia('(min-width: 1024px)');

  function positionMegaMenu(menu) {
    if (!menu) return;

    if (!desktopMedia.matches) {
      menu.style.removeProperty('--mega-shift-x');
      return;
    }

    menu.style.setProperty('--mega-shift-x', '0px');

    const viewportPadding = 16;
    const rect = menu.getBoundingClientRect();
    let shift = 0;

    if (rect.left < viewportPadding) {
      shift = viewportPadding - rect.left;
    } else if (rect.right > window.innerWidth - viewportPadding) {
      shift = (window.innerWidth - viewportPadding) - rect.right;
    }

    menu.style.setProperty('--mega-shift-x', `${Math.round(shift)}px`);
  }

  function positionAllMegaMenus() {
    dropdowns.forEach(dropdown => {
      positionMegaMenu(dropdown.querySelector('.mega-menu'));
    });
  }

  // Desktop hover behavior (only on screens >= 1024px with hover support)
  if (desktopMedia.matches) {
    dropdowns.forEach(dropdown => {
      let hoverTimeout;
      const megaMenu = dropdown.querySelector('.mega-menu');
      const simpleDropdown = dropdown.querySelector('.simple-dropdown');
      const trigger = dropdown.querySelector('.dropdown-trigger');
      const menu = megaMenu || simpleDropdown;

      if (!menu) return;

      const setOpen = (open) => {
        dropdown.classList.toggle('open', open);
        if (trigger) trigger.setAttribute('aria-expanded', String(open));
      };

      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        setOpen(true);
        if (megaMenu) {
          requestAnimationFrame(() => positionMegaMenu(megaMenu));
        }
      });

      dropdown.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          setOpen(false);
        }, 100);
      });

      // Keep menu open if user hovers over the menu itself
      menu.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        setOpen(true);
        if (megaMenu) {
          positionMegaMenu(megaMenu);
        }
      });

      menu.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          setOpen(false);
        }, 100);
      });
    });
  }

  // Keyboard access: focus opens the submenu, Escape closes it
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.mega-menu, .simple-dropdown');
    if (!trigger || !menu) return;

    trigger.setAttribute('aria-haspopup', 'true');
    if (!trigger.hasAttribute('aria-expanded')) {
      trigger.setAttribute('aria-expanded', 'false');
    }

    const setExpanded = (open) => {
      dropdown.classList.toggle('open', open);
      trigger.setAttribute('aria-expanded', String(open));
    };

    dropdown.addEventListener('focusin', () => {
      if (!desktopMedia.matches) return;
      setExpanded(true);
      const megaMenu = dropdown.querySelector('.mega-menu');
      if (megaMenu) requestAnimationFrame(() => positionMegaMenu(megaMenu));
    });

    dropdown.addEventListener('focusout', (e) => {
      if (e.relatedTarget && dropdown.contains(e.relatedTarget)) return;
      setExpanded(false);
    });

    dropdown.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !dropdown.classList.contains('open')) return;
      setExpanded(false);
      trigger.focus();
    });
  });

  // Prevent dropdown close when clicking inside
  dropdowns.forEach(dropdown => {
    const menus = dropdown.querySelectorAll('.simple-dropdown, .mega-menu, .mobile-dropdown');
    menus.forEach(menu => {
      menu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });
  });

  // Mobile menu: ensure dropdowns don't conflict with mobile toggle
  if (window.innerWidth <= 1023) {
    dropdowns.forEach(dropdown => {
      // Remove desktop hover classes on mobile
      dropdown.classList.remove('open');
    });
  }

  // Handle resize to clean up states
  window.addEventListener('resize', () => {
    const isDesktop = desktopMedia.matches;
    dropdowns.forEach(dropdown => {
      if (!isDesktop) {
        dropdown.classList.remove('open');
      }
    });

    positionAllMegaMenus();
  });

  requestAnimationFrame(positionAllMegaMenus);
  window.addEventListener('load', positionAllMegaMenus, { once: true });

  // Note: Mobile accordion toggle (mobile-dropdown-toggle) is handled by navbar.js
  // to avoid duplicate event listeners. The accordion logic is centralized there.
}

