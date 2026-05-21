/**
 * Nexus Diji - Navbar Module
 * Mobile menu toggle, scroll behavior, navbar state management
 */

export function initNavbar() {
  const navbar = document.getElementById('navbar');
  const promoBanner = document.getElementById('promoBanner');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenuBtn = document.getElementById('closeMenuBtn');

  // Update navbar and mobile menu top position based on promo banner
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

  // Scroll handler for navbar state
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);
    if (promoBanner) promoBanner.classList.toggle('hidden', scrolled);
    updateNavAndMenuTop();
  });

  // Mobile menu functionality
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

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  // Back to top button
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      const footer = document.querySelector('footer');
      let nearFooter = false;
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        nearFooter = footerTop < window.innerHeight + 20;
      }
      const shouldShow = window.scrollY > 400 && !nearFooter;
      backToTop.classList.toggle('visible', shouldShow);
    });
  }
}

export default initNavbar;