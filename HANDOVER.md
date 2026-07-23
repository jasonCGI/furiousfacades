# Furious Facades AI Handover

This document is the operating brief for AI assistants and human collaborators working on the Furious Facades website.

## Project overview

Furious Facades is Josh Rudloff's horror-themed maker brand. The site promotes original masks, cosplay armor, creature props, sculptural lighting, the Etsy shop, and the Crypteds Kickstarter project.

- Repository: `jasonCGI/furiousfacades`
- Production: <https://furiousfacades-production.up.railway.app/>
- Etsy: <https://www.etsy.com/shop/FuriousFacades>
- Kickstarter: <https://www.kickstarter.com/projects/crypteds/crypteds-adorable-little-costumed-bears-in-a-crate-0?ref=profile_created&category_id=396>
- LinkedIn: <https://www.linkedin.com/in/josh-rudloff-00a5177/>
- Contact address: assembled in JavaScript as `jrudloff` plus `gmail.com` to reduce basic scraping

## Technical architecture

The project intentionally has no third-party runtime dependencies.

- `public/index.html`: the complete landing page, including HTML, CSS, and JavaScript
- `public/404.html`: branded missing-page response
- `public/assets/`: logos, social card, icons, Kickstarter art, and Etsy product images

### Asset versioning

All public assets are content-fingerprinted before deployment. After changing an image or icon, run `npm run assets:version`, then commit the renamed asset, updated references, and `public/assets/asset-manifest.json` together. This gives changed files a new URL, so external visitors receive the update without a forced refresh. Do not reuse an existing fingerprinted filename for different content.
- `server.js`: zero-dependency Node static-file server
- `package.json`: starts the site with `node server.js`
- `railway.json`: Railway deployment configuration
- `public/robots.txt`: crawler rules
- `public/sitemap.xml`: current sitemap
- `public/site.webmanifest`: install and icon metadata

Railway supplies the `PORT` environment variable. No other environment variables are currently required.

## Run and verify locally

```powershell
npm start
```

Open <http://localhost:3000/>. The health endpoint is <http://localhost:3000/health>.

Before committing, run at minimum:

```powershell
node --check server.js
git diff --check
```

Also verify:

1. The page has no horizontal overflow at phone, tablet, desktop, and ultrawide widths.
2. The sticky header remains aligned and does not crop the Etsy mark.
3. `Wear the Nightmare.` fits within mobile padding.
4. The blood fill progresses from top to bottom and completes early enough on large displays.
5. Lazy-loaded images appear after scrolling.
6. All links and visible keyboard focus states work.
7. Reduced-motion mode removes nonessential motion.
8. A missing route returns the branded page with HTTP status `404`.
9. `/health` returns HTTP status `200` with `{"status":"ok"}`.

## Design direction

The visual language is cinematic horror with handmade texture. Keep it dark, restrained, and premium rather than playful or excessively graphic.

- Near-black background
- Bone-white primary text
- Blood-red headline effect
- Orange Etsy call to action
- Green Kickstarter hover accent
- Smoky parallax atmosphere
- Distressed logo artwork
- Strong uppercase typography and generous spacing

The antlered creature in the brand art is a Wendigo.

Do not replace the official Furious Facades logo with generated lettering. The production logo is `public/assets/furious-facades-logo.webp`.

## Responsive behavior

Responsive rules are part of the design, not optional cleanup.

- Mobile header shows the brand and Etsy link. The Crypteds text link is hidden at smaller widths to prevent overflow.
- The hero headline is fitted with JavaScript below `32rem` so both lines fill the available width without side scrolling.
- The logo is intentionally smaller on desktop and prominent on mobile.
- Desktop content uses a bounded shell so ultrawide monitors do not create an overly stretched layout.
- Product cards stack on narrow screens.

Any headline or header change must be tested at approximately 320, 390, 768, 1440, and 2560 CSS pixels.

## Motion behavior

All motion lives in `public/index.html`.

- Reveal animations use `IntersectionObserver`.
- The logo and smoke layers use scroll-position transforms.
- `NIGHTMARE.` uses CSS custom properties updated during scroll.
- Blood fills from the top of the outlined word toward the bottom.
- CSS shapes create the hanging drips and detached droplet.
- `prefers-reduced-motion: reduce` disables nonessential movement and reveals content immediately.

Important custom properties include:

- `--nightmare-alpha`
- `--nightmare-fill`
- `--nightmare-drop-alpha`
- `--nightmare-drop-y`
- `--nightmare-detached-alpha`
- `--nightmare-detached-y`
- `--nightmare-detached-scale`
- `--smoke-far`
- `--smoke-near`

Use `requestAnimationFrame` for scroll and resize work. Avoid adding multiple independent scroll listeners.

## Accessibility requirements

- Keep visible keyboard focus states.
- Preserve the skip link at the start of the body.
- Preserve meaningful image alternative text. Decorative icons should use empty alternative text.
- Maintain logical heading order with one `h1`.
- Text placed over product photography must retain WCAG AA contrast. The existing translucent dark panels provide that contrast while allowing the imagery to remain visible.
- Preserve reduced-motion support.
- Do not communicate meaning through color alone.
- Interactive targets must remain comfortably usable on mobile.

## Copy and content rules

- Keep copy concise and direct.
- Do not use em dashes in visible site copy.
- Refer to the antlered creature as a Wendigo.
- Use `3D-designed` with the hyphen.
- Do not expose the contact email as a plain address in the HTML source. Preserve the current JavaScript assembly and `mailto:` behavior.
- Do not invent sales counts, ratings, launch dates, pricing, testimonials, or product availability.

The current Etsy figures are static display values. They must be confirmed before changes. Etsy does not expose a simple unauthenticated endpoint for this site to read those figures dynamically.

## External brands and links

- Use the Etsy logo in the header rather than a text arrow.
- Use the Kickstarter logo in the Kickstarter button.
- Use the LinkedIn logo in the footer.
- External links open in a new tab with `rel="noopener noreferrer"`.
- Product cards currently link to specific Etsy listings. Confirm listing URLs before replacing photography or titles.

## Images and performance

- Prefer WebP for photographic content when it provides a meaningful size reduction.
- Keep explicit `width` and `height` attributes to limit layout shift.
- Lazy-load below-the-fold photography.
- Do not lazy-load the primary logo.
- Keep `decoding="async"` on images.
- The social-sharing image is `public/assets/furious-facades-social.jpg` at 1200 by 630 pixels. JPEG is retained for broad social crawler compatibility.
- Preserve the favicon, Apple touch icon, and manifest icon set unless the logo changes.

When replacing an image, optimize it locally and remove the superseded asset only after all references have been updated and verified.

## SEO and sharing

`public/index.html` contains:

- Canonical URL
- Search description
- Open Graph metadata
- Twitter card metadata
- Organization and WebSite JSON-LD

The canonical, Open Graph, JSON-LD, sitemap, and robots URLs currently use the Railway production domain. If a custom domain is connected, update every absolute production URL together.

Do not add the email address to JSON-LD because the current implementation intentionally limits casual scraping.

## Server and security

`server.js` provides:

- Static file serving with path traversal protection
- Correct content types
- Asset caching
- A branded 404 response
- Content Security Policy
- Permissions Policy
- Referrer Policy
- `X-Content-Type-Options`

The page currently uses inline CSS and JavaScript, so the Content Security Policy permits inline styles and scripts. If CSS or JavaScript is moved into separate files, tighten the policy rather than weakening it further.

Do not add a framework or dependency without a concrete benefit and maintainer approval.

## Collaboration workflow

1. Pull the latest `main` before editing.
2. Work on a focused branch for collaborative changes.
3. Keep commits small and descriptive.
4. Do not combine unrelated visual, copy, and deployment changes in one commit.
5. Include screenshots for visible desktop or mobile changes.
6. State the viewport sizes used for responsive verification.
7. Run the local checks listed above.
8. Open a pull request for review rather than force-pushing shared history.

Railway deploys from GitHub after changes reach the configured production branch. Confirm the live deployment after merge and test the public URL rather than assuming the build completed.

## Known next steps

Suggested work, in priority order:

1. Connect a custom domain, then replace all Railway-domain canonical and sharing URLs.
2. Register the site with Google Search Console and submit `/sitemap.xml`.
3. Add privacy-friendly analytics after the owner selects a provider.
4. Decide whether Etsy metrics remain manually maintained or use an approved authenticated integration.
5. Add a dedicated Crypteds launch page or email signup when campaign details and a data processor are approved.
6. Repeat real-device checks on current iPhone and Android browsers after major visual changes.

## Current production baseline

The baseline release before this handover is commit `2b49b1b`, titled `Add launch SEO and social assets`.

At that baseline:

- The production homepage returns `200`.
- The social card returns `200` as `image/jpeg`.
- Unknown routes return a branded `404`.
- Security headers are present.
- Mobile and desktop checks show no horizontal overflow.

Update this section when a major architectural or deployment change becomes the new baseline.
