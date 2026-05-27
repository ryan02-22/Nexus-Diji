/**
 * Nexus Diji - Navbar Module
 * Mobile menu toggle, scroll behavior, navbar state management
 * Production-grade mobile navigation interactions
 */

export function initNavbar() {
  const navbar = document.getElementById('navbar');
  const promoBanner = document.getElementById('promoBanner');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const backMenuBtn = document.getElementById('backMenuBtn');

  // Prevent body scroll lock conflicts
  let scrollPosition = 0;

  // Update navbar and mobile menu top position based on promo banner
  function updateNavAndMenuTop() {
    if (!promoBanner || !navbar) return;
    const bannerHeight = promoBanner.classList.contains('hidden') ? 0 : promoBanner.offsetHeight;
    const scrolled = window.scrollY > 50;

    if (scrolled) {
      navbar.style.top = '0px';
    } else {
      navbar.style.top = bannerHeight + 'px';
    }
  }

  updateNavAndMenuTop();
  window.addEventListener('resize', updateNavAndMenuTop);

  // Scroll handler for navbar state
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);
    if (promoBanner) promoBanner.classList.toggle('hidden', scrolled);
    updateNavAndMenuTop();

    // Detect scroll direction for FAB
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;

    // Hide FAB when scrolling down, show when scrolling up
    const fab = document.getElementById('toolsOverlay');
    if (fab && !fab.classList.contains('active')) {
      if (scrollingDown && currentScrollY > 200) {
        fab.classList.remove('visible');
        fab.classList.add('collapsed');
      }
    }
  });

  // Mobile menu functionality with improved UX
  if (hamburgerBtn && mobileMenu && closeMenuBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMobileMenu();
    });

    closeMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileMenu();
    });

    // Back button - close menu
    if (backMenuBtn) {
      backMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMobileMenu();
      });
    }

    // Close on backdrop click (outside menu content)
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        closeMobileMenu();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    if (mobileMenu.classList.contains('open')) return;
    
    // Save scroll position
    scrollPosition = window.pageYOffset;

    // Lock body scroll
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    // Update menu state
    mobileMenu.classList.add('open');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    navbar.classList.add('menu-open');

    // Focus management for accessibility
    const firstFocusable = mobileMenu.querySelector('a, button');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 50);
    }

    // Hide floating elements
    const toolsOverlay = document.getElementById('toolsOverlay');
    const backToTop = document.getElementById('backToTop');
    if (toolsOverlay) toolsOverlay.style.display = 'none';
    if (backToTop) backToTop.style.display = 'none';
  }

  function closeMobileMenu() {
    if (!mobileMenu.classList.contains('open')) return;
    
    // Remove menu state
    mobileMenu.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    navbar.classList.remove('menu-open');

    // Restore body scroll
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);

    // Show floating elements again
    const toolsOverlay = document.getElementById('toolsOverlay');
    const backToTop = document.getElementById('backToTop');
    if (toolsOverlay) toolsOverlay.style.display = '';
    if (backToTop) backToTop.style.display = '';
  }

  // Mobile dropdown accordion - improved single-click behavior
  const mobileToggles = document.querySelectorAll('.mobile-dropdown-toggle');

  mobileToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = toggle.nextElementSibling;
      if (dropdown && dropdown.classList.contains('mobile-dropdown')) {
        const isCurrentlyOpen = toggle.classList.contains('active');

        // Close all other dropdowns first (accordion behavior)
        mobileToggles.forEach(otherToggle => {
          if (otherToggle !== toggle) {
            otherToggle.classList.remove('active');
            const otherDropdown = otherToggle.nextElementSibling;
            if (otherDropdown && otherDropdown.classList.contains('mobile-dropdown')) {
              otherDropdown.classList.remove('open');
            }
          }
        });

        // Toggle current dropdown
        if (isCurrentlyOpen) {
          toggle.classList.remove('active');
          dropdown.classList.remove('open');
        } else {
          toggle.classList.add('active');
          dropdown.classList.add('open');
        }
      }
    });
  });

  // Prevent links inside dropdown from triggering accordion toggle
  const dropdownLinks = document.querySelectorAll('.mobile-dropdown a');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close menu on link click
      closeMobileMenu();
    });
  });

  // Also close menu on main nav links click
  const mainNavLinks = document.querySelectorAll('.nav-mobile-links > li > a');
  mainNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Back to top button
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Show/hide based on scroll position with debounce
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const footer = document.querySelector('footer');
        let nearFooter = false;
        if (footer) {
          const footerTop = footer.getBoundingClientRect().top;
          nearFooter = footerTop < window.innerHeight + 20;
        }
        const shouldShow = window.scrollY > 400 && !nearFooter;
        backToTop.classList.toggle('visible', shouldShow);
      }, 50);
    });
  }

  // Initialize menu state on page load
  if (mobileMenu && !mobileMenu.classList.contains('open')) {
    // Ensure menu is properly hidden on load
    mobileMenu.classList.remove('open');
    hamburgerBtn.classList.remove('active');
  }

  // Update mobile menu visibility on resize
  window.addEventListener('resize', () => {
    if (mobileMenu) {
      if (window.innerWidth > 1023) {
        mobileMenu.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    }
  });
}

export default initNavbar;