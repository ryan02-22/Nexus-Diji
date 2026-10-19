# Nexus Diji - Agent Guidelines & Mandatory Skill Standards

This document establishes the binding guidelines for all AI agents working on the Nexus Diji codebase. Every task, redesign, feature, or refactor must strictly adhere to the skills in `.agents/skills/`.

---

## 🎯 Mandatory Skill Rules

### 1. Visual Design & Component Architecture (`design-ui-designer`)
- **Token System**: All styles must derive from design tokens in CSS (`--color-*`, `--font-*`, `--space-*`, `--shadow-*`, `--radius-*`, `--transition-*`).
- **Component Libraries**: Keep UI components modular, reusable, and uniform across all pages.
- **Accessibility (WCAG AA)**:
  - Clear `:focus-visible` states for keyboard navigability.
  - Descriptive `aria-label`, `aria-hidden`, `aria-expanded`, and `role` attributes on all dynamic widgets.
  - Text contrast ratio must meet or exceed WCAG AA standards.
- **Micro-Interactions**: Smooth spring cubic-bezier transitions, hover elevations, and active feedback states.

### 2. Opinionated & Distinctive Frontend (`frontend-design`)
- **Anti-Generic Identity**: No template defaults, no cliché SaaS cards, no arbitrary gradients scattered aimlessly.
- **Brand Grounding**: Reflect Nexus Diji's core value proposition: modern, high-tech, reliable custom web & app development and precision PC/laptop repair.
- **Visual Restraint**: Focus boldness on one memorable hero/signature element; maintain disciplined restraint everywhere else.
- **Human-Centric Copy**: Clear active-voice CTAs, concise copy, and helpful guidance in empty or error states.

### 3. Reality-Check Integration & Evidence-Based QA (`testing-reality-checker`)
- **Default to "NEEDS WORK"**: Never rubber-stamp work as "perfect" or "production ready" on the first pass without verification.
- **Visual Evidence Required**: Must verify actual rendered UI with screenshots across:
  - Desktop (1440x900 / 1920x1080)
  - Tablet (768x1024)
  - Mobile (375x667 / 390x844)
- **End-to-End Journeys**: Validate entire flows (e.g., clicking triggers, opening modals, submitting inputs, toggling languages).
- **Zero-Tolerance Triggers**: Broken journeys, element overlaps, unstyled native scrollbars on dark surfaces, console errors.

### 4. Browser Testing & DOM Inspection (`webapp-testing`)
- Validate interactive behavior and visual appearance using browser automation and screenshots before declaring tasks complete.
- Verify both root page (`index.html`) and subpages (`/pages/*.html`) for asset paths and script initialization.

### 5. Curated Themes & Color Harmony (`theme-factory`)
- Ensure all palettes, font pairings, and contrast levels maintain visual harmony and brand consistency.
