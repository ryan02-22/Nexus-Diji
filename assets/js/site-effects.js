/* Nexus Diji visual interactions: section atmosphere, reveal, parallax, mascot, and magnetic buttons. */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const mascotScriptEl = document.currentScript || document.querySelector('script[src*="site-effects.js"]');
const mascotUrl = mascotScriptEl ? new URL("../images/robot-nd.webp", mascotScriptEl.src).href : "../images/robot-nd.webp";

function addAtmosphere() {
  if (document.querySelector(".scroll-atmosphere")) return;
  ["cyan", "violet", "blue"].forEach((tone) => {
    const layer = document.createElement("div");
    layer.className = "scroll-atmosphere scroll-atmosphere--" + tone;
    layer.setAttribute("aria-hidden", "true");
    document.body.append(layer);
  });
}

function getThemeSections() {
  const selectors = [
    "main > section",
    "main.article-wrap",
    ".hero",
    ".about-hero",
    ".story-section",
    ".services-section",
    ".workflow-section",
    ".values-section",
    ".trust-section",
    ".team-section",
    ".about-cta"
  ];
  return [...new Set(document.querySelectorAll(selectors.join(",")))];
}

function initSectionThemes() {
  const sections = getThemeSections();
  if (!sections.length) return;

  const tones = ["cyan", "violet", "blue", "violet"];
  sections.forEach((section, index) => {
    section.dataset.scrollTone = tones[index % tones.length];
  });
  document.body.dataset.scrollTheme = sections[0].dataset.scrollTone;

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;

    const midpoint = window.innerHeight * 0.5;
    const active = sections
      .map((section) => {
        const rect = section.getBoundingClientRect();
        return { section, distance: Math.abs((rect.top + rect.bottom) * 0.5 - midpoint) };
      })
      .filter(({ section }) => {
        const rect = section.getBoundingClientRect();
        return rect.top < midpoint && rect.bottom > midpoint;
      })
      .sort((a, b) => a.distance - b.distance)[0]?.section;

    if (!active) return;
    sections.forEach((section) => section.classList.toggle("scroll-theme-active", section === active));
    document.body.dataset.scrollTheme = active.dataset.scrollTone;
  }, { rootMargin: "-8% 0px -8% 0px", threshold: 0 });

  sections.forEach((section) => observer.observe(section));
}

function initScrollReveals() {
  if (reduceMotion.matches || !("IntersectionObserver" in window)) return;

  const targets = document.querySelectorAll([
    "main > section h2",
    "main > section .section-label",
    "main > section .section-desc",
    "main > section .story-title",
    "main > section .service-card",
    "main > section .portfolio-card",
    "main > section .pricing-card",
    "main > section .testimonial-card",
    "main > section .blog-card",
    "main > section .team-card",
    "main > section .process-card",
    "main > section .faq-item",
    ".about-hero__title",
    ".about-hero__desc",
    ".story-section .story-title",
    ".services-section .service-card",
    ".workflow-section .workflow-card",
    ".team-section .team-card",
    ".about-cta h2"
  ].join(","));

  if (!targets.length) return;
  const cardsByParent = new Map();
  targets.forEach((element) => {
    if (element.classList.contains("reveal")) return;
    element.classList.add("nd-reveal");

    const parent = element.parentElement;
    if (!parent) return;
    const index = cardsByParent.get(parent) || 0;
    cardsByParent.set(parent, index + 1);
    element.style.setProperty("--nd-reveal-delay", Math.min(index * 70, 280) + "ms");
  });

  document.documentElement.classList.add("scroll-effects-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".nd-reveal").forEach((element) => observer.observe(element));
}

function initParallax() {
  if (reduceMotion.matches || window.innerWidth <= 768) return;
  const targets = [...document.querySelectorAll(".hero-bg, .hero-visual")];
  if (!targets.length) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    targets.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const distance = Math.max(-18, Math.min(18, (rect.top / window.innerHeight) * -14));
      element.style.setProperty("--nd-parallax-y", distance.toFixed(1) + "px");
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  schedule();
}

function initMagneticButtons() {
  if (reduceMotion.matches || !finePointer.matches) return;

  document.querySelectorAll(".btn-primary, .btn-secondary, .nav-cta, .cta-btn-primary, .cta-btn-secondary")
    .forEach((button) => {
      button.classList.add("magnetic-target");
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) * 0.1;
        const y = (event.clientY - (rect.top + rect.height / 2)) * 0.1;
        button.style.setProperty("--magnetic-x", Math.max(-6, Math.min(6, x)).toFixed(1) + "px");
        button.style.setProperty("--magnetic-y", Math.max(-6, Math.min(6, y)).toFixed(1) + "px");
      });
      button.addEventListener("pointerleave", () => {
        button.style.setProperty("--magnetic-x", "0px");
        button.style.setProperty("--magnetic-y", "0px");
      });
    });
}

function initHistoryBackButtons() {
  document.querySelectorAll("[data-history-back]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const modifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (event.defaultPrevented || event.button !== 0 || modifiedClick || window.history.length <= 1) return;

      event.preventDefault();
      window.history.back();
    });
  });
}

function initMascot() {
  const aboutHero = document.querySelector(".about-hero");
  if (aboutHero && !aboutHero.querySelector(".about-hero-mascot")) {
    const mascot = document.createElement("img");
    mascot.className = "about-hero-mascot";
    mascot.src = mascotUrl;
    mascot.alt = "";
    mascot.setAttribute("aria-hidden", "true");
    mascot.loading = "lazy";
    aboutHero.append(mascot);
  }
}

function initSiteEffects() {
  initLanguageSwitch();
  initHistoryBackButtons();
  addAtmosphere();
  initSectionThemes();
  initScrollReveals();
  initParallax();
  initMagneticButtons();
  initMascot();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSiteEffects, { once: true });
} else {
  initSiteEffects();
}