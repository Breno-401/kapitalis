# Kapitalis Landing Polish Implementation Plan

> **For agentic workers:** Work through the checkboxes in order. Preserve the current experiment branch and existing commits; do not merge, push, open a PR, touch `.idea/`, or change financial formulas.

**Goal:** Finish the Kapitalis landing polish without losing the approved hero, responsive laptop fixes, calculators, or brand identity.

**Architecture:** Keep the current React/Vite structure and existing CSS modules. Make narrow component changes, use tests for behavior, CSS/SVG for motion, and verify the assembled page visually across requested viewport sizes and both themes.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vitest, Vite.

**Spec:** User-provided request at `C:\Users\breno\.codex\attachments\7ef000ae-350e-41c4-ab0a-818c6511e1af\Texto colado.txt`.

## Global Constraints

- Work only on `experiment/kapitalis-hero-reviews-polish`, whose initial HEAD is `c0c99f6e72295266ac11a0096d85423765f2fac4`.
- Keep the manual `main` responsiveness port and the three existing experiment commits.
- Preserve approved navy/cobalt Hero, exact supplied real portrait and photos, mobile behavior, and large desktop behavior.
- Keep Google facts at 5.0 and 52 reviews; display “Mais de 50”.
- Preserve the existing continuous reviews rail; no Instagram feed, map, unconfirmed services, invented metrics, or calculator formula changes.
- Do not send WhatsApp messages; verify link destinations and local click affordances only.

## Review Focus

- Hero headline/portrait/navbar clearance at low-height laptop viewports and mobile.
- Section order, navigation anchors, reserved FAQ answer height, and keyboard access.
- SVG chapter flow direction, legibility in both themes, and reduced-motion behavior.
- WhatsApp service CTAs and removal of nonfunctional card controls.
- Stable calculator/tool shells, privacy panel, and no horizontal overflow at 320px.

---

### Task 1: Hero interaction and responsive integration

**Files:** `src/sections/HeroSection.tsx`, `src/sections/HeroSection.module.css`, `src/sections/HeroSection.test.tsx`.

- [x] Add regression coverage for pointer cursor and CTA destination/accessible affordance.
- [x] Preserve the existing laptop width+height rule, hero atmosphere, supplied Alex image, and reduced-motion/touch behavior; change portrait edge integration only when viewport captures show a visible hard edge.
- [x] Verify CTA hover, focus-visible, active state, URL and stable dimensions.

### Task 2: Page flow and Google reviews

**Files:** `src/pages/HomePage.tsx`, `src/sections/ReviewsSection.tsx`, `src/sections/ReviewsSection.module.css`, related tests.

- [x] Move Reviews after System, services, BPO, tools, and process; keep FAQ near the end and final CTA/footer after it.
- [x] Reproduce the observed TEC2D mechanics as a compact Google rating badge and centered bordered pill CTA; keep source link, 5.0/52 facts, external-link semantics, existing continuous RAF rail, mobile drag/pause, and reduced motion.
- [x] Add tests for the CTA affordance and page order.

### Task 3: System chapters and shared motion

**Files:** `src/components/FinancialCore.tsx`, `src/components/FinancialCore.module.css`, `src/story/StoryMedia.tsx`, `src/story/StorySection.module.css`, related tests.

- [x] Animate Chapter 01 input connections with slow directional dash flow.
- [x] Redraw Chapter 02 with three readable nested rings and Conciliação/Fechamento as waypoints; remove the unexplained straight zigzag.
- [x] Give Chapter 03 directed circular information paths and keep a simplified diagram on mobile.
- [x] Keep Chapter 04 rings/flows active, keep Folha/Notas visible, lengthen the decision path, and place one visible Próximo passo WhatsApp link below it.
- [x] Keep the complete central emblem in frame and use one restrained clip/opacity/micro-scale reveal for the supplied Chapter 01/02/04 photos.
- [x] Preserve reduced-motion and high-contrast light/dark theme styles.

### Task 4: Services and global closeout details

**Files:** `src/data/services.ts`, `src/sections/ServicesSection.tsx`, corresponding CSS/tests; `src/components/SectionTransition.module.css`; `src/components/PrivacyNotice.module.css`; footer only if QA finds a defect.

- [x] Replace each service's dead anchor with its own prefilled WhatsApp CTA; remove the useless circular back control while preserving the flip/fade and keyboard/touch behavior.
- [x] Keep the gold divider and replace fast converging markers with a restrained 14–22 second environmental glow; keep reduced-motion static.
- [x] Check privacy-notice presence/scale at small screens and retain browser-only processing copy and local dismissal preference.
- [x] Leave the footer logo intact unless visual QA demonstrates a crop or aspect-ratio defect.

### Task 5: Full regression and visual verification

**Commands:** `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check`, Impeccable detector once after UI changes.

- [x] Verify links, navbar anchors, reviews, FAQ keyboard/height, services, tools, privacy, themes, Hero and next-step CTAs. Reduced-motion paths were reviewed in CSS/JS and existing tests; the browser preference itself was not emulated.
- [x] Verify viewport widths/heights: 320×812, 375×812, 390×844, 402×874, 430×932, 768×1024, 1024×768, 1280×720, 1366×768, 1440×900, 1536×864, 1600×900, 1680×1050, 1920×1080.
- [x] Report what was actually inspected and measured; the browser policy blocked `view-source:` for TEC2D, so its CSS/chunks were not inspected.
- [x] Commit coherent local checkpoints in Portuguese only after each checkpoint passes.

## Execution Notes

- The requested viewports were checked for horizontal overflow and Hero/navbar clearance. At 1600×900 the portrait intentionally bleeds 8px past the viewport behind its fade.
- Reduced-motion behavior was inspected in code and covered by existing tests where applicable, but was not runtime-emulated by the browser.
- TEC2D was inspected visually and through its accessibility tree; browser policy blocked `view-source:`, so its CSS/chunks were unavailable.
- Tests passed serially after an initial parallel run exceeded Windows memory. Final verification: 21 test files / 121 tests, lint, typecheck, build, and `git diff --check`.
