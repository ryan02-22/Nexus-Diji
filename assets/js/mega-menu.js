/**
 * Nexus Diji - Mega Menu Module
 * Desktop hover, mobile tap, dropdown interaction logic
 */

export function initMegaMenu() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  // Desktop hover behavior
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    dropdowns.forEach(dropdown => {
      let hoverTimeout;
      let isHovering = false;

      dropdown.addEventListener('mouseenter', () => {
        isHovering = true;
        clearTimeout(hoverTimeout);
        dropdown.classList.add('open');
      });

      dropdown.addEventListener('mouseleave', () => {
        isHovering = false;
        hoverTimeout = setTimeout(() => {
          if (!isHovering) {
            dropdown.classList.remove('open');
          }
        }, 150); // Small delay to prevent accidental close
      });
    });
  }

  // Mobile tap behavior
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.dropdown-trigger');
      const mobileDropdown = dropdown.querySelector('.mobile-dropdown');

      if (trigger && mobileDropdown) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          // Close other dropdowns
          dropdowns.forEach(other => {
            if (other !== dropdown) {
              other.classList.remove('open');
            }
          });
          dropdown.classList.toggle('open');
        });
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-dropdown')) {
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('open');
        });
      }
    });
  }

  // Mobile dropdown toggle for accordion-style navigation
  const mobileToggles = document.querySelectorAll('.mobile-dropdown-toggle');
  mobileToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const dropdown = toggle.nextElementSibling;
      if (dropdown && dropdown.classList.contains('mobile-dropdown')) {
        toggle.classList.toggle('open');
        dropdown.classList.toggle('open');
      }
    });
  });

  // Prevent dropdown close when clicking inside
  dropdowns.forEach(dropdown => {
    const menu = dropdown.querySelector('.simple-dropdown, .mega-menu, .mobile-dropdown');
    if (menu) {
      menu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  });
}

export default initMegaMenu;