# Mandatory Project Development Rules: Integrating .agents Skills

This project strictly adheres to the skills defined in `.agents/skills/`. Every future enhancement, redesign, feature, or project development MUST follow these core pillars:

---

## 1. UI & Visual Design System (`design-ui-designer`)
- **Token-First Architecture**: Always define and consume CSS design tokens (`--color-*`, `--font-*`, `--space-*`, `--shadow-*`, `--radius-*`, `--transition-*`) rather than ad-hoc magic values.
- **Component Consistency**: Maintain unified component patterns across all pages (buttons, inputs, cards, badges, modals, tooltips).
- **Accessibility by Default (WCAG AA)**:
  - All interactive elements must have visible, styled `:focus-visible` outlines.
  - Proper semantic HTML5 elements (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `<footer>`, `<button>`).
  - Required ARIA attributes (`aria-label`, `aria-hidden`, `aria-expanded`, `aria-modal`, `role`).
  - High contrast ratios (text vs. background >= 4.5:1).
- **Pixel-Perfect Micro-Interactions**: Smooth state transitions, hover elevations, active feedback, and hardware-accelerated animations (`transform`, `opacity`).

---

## 2. Distinctive & Opinionated Aesthetic (`frontend-design`)
- **Anti-Generic AI Design**: Avoid cliché AI templates (such as arbitrary gradient text everywhere, cookie-cutter SaaS cards with identical grey shadows, or meaningless uppercase tracking labels).
- **Subject-Matter Grounding**: Every design choice must reflect Nexus Diji's identity (digital innovation, custom web/app development, PC & laptop precision repair).
- **Disciplined Boldness**: Spend visual boldness in one high-impact focal point per view (e.g., the mascot 3D parallax hero or the cyber chatbot drawer); keep supporting elements clean and disciplined.
- **Typographic Craft**: Intentional font pairings with clear hierarchy, line lengths under 80 characters for readability, and deliberate line-heights.
- **User-Centric Copywriting**: Active voice, concise value propositions, clear CTAs (e.g., "Mulai Konsultasi Gratis", "Cek Harga & Promo"), and helpful empty/error states.

---

## 3. Reality-Check & Evidence-Based Verification (`testing-reality-checker`)
- **Default to "NEEDS WORK"**: Treat any initial implementation or first pass as incomplete until rigorously verified.
- **Zero Fantasy Approvals**: Never declare "production ready" or claim perfect scores without comprehensive proof.
- **Mandatory Multi-Device Verification**: Every user interface must be visually validated across:
  - Desktop (1440x900 or 1920x1080)
  - Tablet (768x1024)
  - Mobile (375x667 or 390x844)
- **End-to-End User Journey Validation**: Test real user flows (navigation, form inputs, button clicks, dialog toggles, language switching) and verify before/after interaction states.
- **Automatic Fail Triggers**:
  - Unresponsive or broken layout on any screen size.
  - Non-functioning interactive buttons or triggers.
  - Overlapping elements or unstyled native browser widgets (e.g., default light scrollbars on dark themes).
  - Console errors or unhandled exceptions.

---

## 4. Automated Testing & Browser Inspection (`webapp-testing`)
- Actively verify web applications by inspecting rendered DOM states, running browser interactions, and reviewing visual screenshots.
- Ensure all pages (including subpages `/pages/*`) maintain parity, functional scripts, and working assets.

---

## 5. Theme & Harmony Management (`theme-factory`)
- Maintain cohesive theme harmony across dark and light modes.
- Ensure harmonious color palettes, seamless gradients, and unified typography across artifacts and web pages.
