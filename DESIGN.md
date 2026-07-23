# Furious Facades Design System

This is the visual contract for Furious Facades. Read it before changing the public website. The goal is a cohesive, premium horror-maker identity, not a generic dark landing page.

## 1. Visual theme and atmosphere

Furious Facades is handmade cinematic horror. The work should feel like a worn occult poster lit by ember glow and moonlight.

- Dark, spacious, and deliberate
- Hand-built, distressed, and tactile
- Menacing but not campy
- Premium and editorial, never game UI or Halloween novelty
- Motion is slow, atmospheric, and optional

The antlered creature in the official logo is a Wendigo.

## 2. Color roles

Use the existing CSS custom properties. Do not introduce decorative colors without a specific content or accessibility reason.

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#0b0b0b` | Base page canvas and near-black surfaces |
| `--paper` | `#f2eee7` | Primary text, headline outlines, and bone-white accents |
| `--muted` | `#aaa39a` | Supporting copy |
| `--line` | `#2c2926` | Quiet dividers and panel borders |
| `--ember` | `#f05a28` | Primary action, Etsy emphasis, and small high-energy accents |
| `--ember-dark` | `#a92f13` | Deeper ember accents |
| `--blood` | `#8f2118` | Blood-fill headline effect only |
| Kickstarter green | `#05ce78` | Kickstarter control and its hover state only |

Favor black, bone, and restrained orange. Blood red is an effect color, not the default text color. Keep text contrast at WCAG AA or better.

## 3. Typography and copy

- Display typography is condensed, bold, uppercase, and high contrast.
- Supporting copy uses a straightforward sans serif for legibility.
- Eyebrows are uppercase, letter-spaced, and short.
- Hero copy is direct and compact. Let artwork and space carry the mood.
- Do not use em dashes in visible copy.
- Use `3D-designed` with the hyphen.
- Do not invent sales counts, ratings, testimonials, dates, pricing, or availability.

The hero headline is a display treatment. Keep `Wear the` solid bone-white and `nightmare.` as the outlined blood-fill word. Do not replace it with a generic type effect.

## 4. Layout and spacing

- Keep content inside the bounded `.shell` width. The page must not stretch edge-to-edge on ultrawide displays.
- Use generous vertical spacing between major sections.
- The sticky header is compact and stable.
- The hero is an asymmetrical desktop composition: official logo on the left, copy on the right.
- On mobile, center the logo, eyebrow, hero title, and primary calls to action. Keep descriptive paragraphs and work-card copy left-aligned.
- Work cards and media must have breathing room and clear section boundaries.
- Avoid dense grids, rounded-card SaaS styling, glassmorphism, and excessive pills.

Test visible layout at approximately 320, 390, 768, 1440, and 2560 CSS pixels. There must be no horizontal scrolling.

## 5. Image direction

- Use authentic product and event photography whenever available.
- Favor tight, cinematic framing that makes the masks, armor, creature props, and lighting feel physical.
- Preserve the full official brand logo. Do not crop it for the hero or recreate it with generated text.
- `public/assets/furious-facades-logo.webp` is the production logo source.
- Photography behind copy must have a dark translucent overlay or panel that preserves WCAG AA contrast.
- Keep explicit image dimensions and lazy-load only below-the-fold media.
- Prefer WebP for photographs when it gives a meaningful file-size benefit.

## 6. Components

### Header

- Keep it sticky with the brand at left and external shop actions at right.
- Use official Etsy and LinkedIn logos. Do not substitute text arrows.
- On small screens, hide the Crypteds text link before the header overflows.

### Buttons and links

- Etsy is the main orange action.
- Kickstarter uses its green brand color, with the `K` mark becoming green on hover.
- Buttons are squared-off, bold, uppercase, and generous enough for touch.
- All interactive elements need visible keyboard focus.
- External links open in a new tab with `rel="noopener noreferrer"`.

### Work cards

- Product photography is the feature.
- Copy sits on a translucent black panel so the image remains visible.
- Use strong uppercase titles and plain, readable descriptions.
- Do not add decorative sequence numbers.

### Footer

- Mobile footer content and contact actions are centered.
- Keep the mailto address assembled in JavaScript to avoid casual scraping.
- The LinkedIn action includes the official mark.

## 7. Motion and atmosphere

- Motion should feel like slow environmental change, never a dashboard animation.
- The fog is a two-layer, low-opacity atmosphere with subtle SVG turbulence and slow opposing drift.
- Fog clears as the visitor moves into the page. Do not make it obscure critical copy or controls.
- The logo has slight scroll parallax only. Do not animate or redraw parts of the mark independently.
- The blood effect fills `nightmare.` from top to bottom early in the first scroll experience, then resolves into drips and a detached droplet.
- Use `requestAnimationFrame` for scroll work and avoid competing scroll listeners.
- `prefers-reduced-motion: reduce` must disable nonessential animation and reveal content immediately.

## 8. Accessibility and performance guardrails

- Preserve the skip link, heading order, meaningful alternative text, and focus styles.
- Decorative icons and layers use empty alternative text or `aria-hidden="true"`.
- Do not convey meaning by color alone.
- Maintain touch-friendly control sizes.
- Do not introduce a framework or dependency without a concrete maintenance benefit and approval.
- Do not add large videos, autoplay audio, or high-cost visual filters without testing lower-power mobile devices.

## 9. Agent checklist

Before shipping a design change:

1. Preserve the official logo and existing brand tokens.
2. Check phone, tablet, desktop, and ultrawide layouts for overflow and cropping.
3. Test keyboard focus and reduced-motion mode.
4. Ensure text over imagery remains readable.
5. Keep edits focused. Do not bundle unrelated copy, visual, and infrastructure work.
6. Run `node --check server.js` and `git diff --check`.
7. Confirm the Railway production deployment after publishing.
