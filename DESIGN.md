# DESIGN.md — PETE site

This document describes the architecture, design system, and conventions of the
**PETE: People for Ethical Treatment of Elves** site — a single-page satirical
landing page for a fictional elf-rights nonprofit, rendered in an 8-bit pixel-art
aesthetic. It is the "how and why" companion to the user-facing `README.md`.

---

## 1. Purpose & scope

PETE is a parody marketing site. It has **one route** (`/`) that scrolls through a
classic nonprofit-advocacy narrative — a crisis, a justification, a call to action,
testimonials, and a partner shout-out — with every claim played for comedy. There is
no backend, no database, no real donation flow, and no user data. Every interactive
surface (donate buttons, action CTAs, legal links) opens a modal with fictional copy.

The design goals, in priority order:

1. **Tone** — commit fully to the parody. Statistics, names, and microcopy are the product.
2. **Aesthetic** — a cohesive, hand-built 8-bit / pixel-art look with no off-the-shelf UI kit.
3. **Performance** — ship as little JS as possible; static HTML + one animation bundle.
4. **Accessibility** — full keyboard support, semantic landmarks, and `prefers-reduced-motion` respect.

---

## 2. Tech stack

| Layer            | Choice                                  | Notes |
| :--------------- | :-------------------------------------- | :---- |
| Framework        | **Astro `^6.1.9`** (static output)      | Zero-JS by default; components are `.astro`. |
| Styling          | **Tailwind CSS `^4.2.4`** via `@tailwindcss/vite` | v4 CSS-first config — no `tailwind.config.js`. Theme lives in `global.css`. |
| Animation        | **GSAP `^3.15.0`** + `ScrambleTextPlugin` | The only client-side runtime dependency. |
| Language         | **TypeScript** (`astro/tsconfigs/strict`) | Strict mode; scripts in `.ts`, component frontmatter typed. |
| Package manager  | **Bun** (`bun.lock`)                    | `node >= 22.12.0` required. |
| Hosting          | **Cloudflare Workers** static assets    | Configured in `wrangler.jsonc`. |
| Dev tooling (MCP)| Astro docs MCP server (`.mcp.json`)     | Used for authoring assistance, not at runtime. |

The site is configured for `https://thisispete.org` (`astro.config.mjs` → `site`).

---

## 3. Build & deploy

Astro builds static HTML/CSS/JS into `./dist`. Cloudflare Workers serves that directory
directly as static assets — there is no Worker script handling requests.

```
astro build   →  ./dist  →  wrangler deploy
```

Relevant `wrangler.jsonc` settings:

- `assets.directory: "./dist"` — serve the Astro build output.
- `assets.not_found_handling: "single-page-application"` — fall back to the app shell on unknown paths.
- `observability.enabled: false`.

npm/bun scripts (`package.json`):

| Script        | Action                                   |
| :------------ | :--------------------------------------- |
| `dev`         | `astro dev` — local dev server           |
| `build`       | `astro build` — emit `./dist`            |
| `preview`     | `astro preview` — preview the build      |
| `preview:cf`  | `wrangler dev` — preview on the CF runtime |
| `deploy`      | `astro build && wrangler deploy`         |

---

## 4. Project structure

```
src/
├── pages/
│   └── index.astro          # the only route; composes all sections + modals
├── layouts/
│   └── BaseLayout.astro      # <html> shell: meta, OG/Twitter, JSON-LD, fonts, script entry
├── components/
│   ├── Nav.astro             # fixed top nav + pixel logo
│   ├── Hero.astro            # headline, CTAs, snowfall, hero elf
│   ├── CrisisStats.astro     # animated counters + "day in the life" vignette
│   ├── WhyElvesMatter.astro  # three "pillar" cards
│   ├── HowToHelp.astro       # four action cards + donate CTA block
│   ├── Testimonials.astro    # three quote cards
│   ├── PetuBanner.astro      # PETU partner cross-promo + founder bio
│   ├── Footer.astro          # links, legal-ish menu, builder credit
│   ├── PortraitToggle.astro  # interactive wrapper for sprites (smile on hover/click/key)
│   ├── DonateModal.astro     # native <dialog>, randomized "receipt"
│   ├── ActionModal.astro     # native <dialog>, per-action confirmation
│   ├── LegalModal.astro      # native <dialog>, per-link fictional disclosure
│   └── sprites/              # hand-coded pixel-art SVGs (one component each)
│       ├── ElfHero.astro
│       ├── ElfWorker.astro
│       ├── ElfScholar.astro
│       ├── ElfLiberated.astro
│       ├── UnicornPartner.astro
│       ├── DavidGumpel.astro       # PETU founder portrait
│       └── BapusahebPatil.astro    # site builder portrait
├── scripts/
│   └── animations.ts        # the single client-side JS bundle (GSAP)
└── styles/
    └── global.css           # Tailwind import + @theme tokens + component classes

public/                       # static, unbundled assets
├── favicon.svg / favicon.ico
└── og-image.svg              # 1200×630 social card (pixel-art SVG)
```

### Composition

`index.astro` is a flat composition: it wraps the section components in `BaseLayout`,
in scroll order — `Nav → Hero → CrisisStats → WhyElvesMatter → HowToHelp → Testimonials
→ PetuBanner → Footer` — and then appends the three `<dialog>` modals (which are
position-fixed and invisible until triggered). Section anchors (`#crisis`, `#why`,
`#help`, `#voices`, `#petu`, `#top`) drive in-page navigation.

---

## 5. Design system

The design system is defined entirely in `src/styles/global.css` using Tailwind v4's
CSS-first `@theme` block. There is no JS config file.

### 5.1 Color tokens

A warm, woodland-at-night palette. Exposed as both Tailwind utilities (e.g. `text-leaf`)
and CSS variables (e.g. `var(--color-leaf)`).

| Token       | Hex       | Role |
| :---------- | :-------- | :--- |
| `night`     | `#0b1510` | Page background (darkest). |
| `forest`    | `#14261c` | Card depth / hard pixel shadows. |
| `moss`      | `#2f5c44` | Borders, dividers, ghost-button shadow. |
| `leaf`      | `#6abf5a` | Primary accent (CTAs, links, "go"). |
| `mushroom`  | `#c48a5a` | Warm secondary / skin tones. |
| `cream`     | `#f4e8cf` | Body text, pixel outlines. |
| `gold`      | `#f2c94c` | Highlight / emphasis / primary buttons. |
| `danger`    | `#d44b3a` | "Crisis" accent, modal close buttons. |

`theme-color` and `color-scheme` are both set to the dark palette in `BaseLayout`.

### 5.2 Typography

Three Google Fonts loaded once in `BaseLayout`, each mapped to a token and a role:

| Token        | Font            | Usage |
| :----------- | :-------------- | :---- |
| `font-pixel` | Press Start 2P  | Headings, buttons, labels, chips — the "blocky" voice. |
| `font-retro` | VT323           | Body prose — readable but still retro. |
| `font-body`  | IBM Plex Sans   | Base fallback / system text. |

Pixel headings deliberately **disable font smoothing** (`-webkit-font-smoothing: none`,
`font-smooth: never`) to preserve crisp edges. Headings use `text-wrap: balance`,
paragraphs use `text-wrap: pretty`.

### 5.3 Component utility classes

Defined under `@layer components` so they compose with Tailwind utilities:

- **`.pixel-card`** — the workhorse surface: dark fill, 4px cream border, hard offset
  `8px 8px` forest drop-shadow (no blur). Every content card uses this.
- **`.pixel-btn`** / **`.pixel-btn-ghost`** — chunky buttons with hard shadows that
  shift on `:hover` (lift) and `:active` (press-in) to mimic a physical key. Ghost
  variant is transparent with leaf/moss accents.
- **`.pixel-border`** — layered `box-shadow` rings (night/cream/night) for a framed look.
- **`.chip`** — small pixel-font tag/badge (e.g. `EST. 1823 • PARODY`, `ACT`, `RECEIPT`).
- **`.scanline`** — hook for CRT-style decoration on cards.
- **`.portrait-toggle`** + descendant rules — the expression-swap machinery for sprites
  (see §6).

### 5.4 Pixel-art rendering

Globally, `svg, img { image-rendering: pixelated; }` and sprites use
`shape-rendering="crispEdges"` so scaling never anti-aliases the pixels.

---

## 6. Sprites & the portrait-toggle system

Sprites are **not raster images**. Each is a hand-authored Astro component that emits an
SVG built from `<rect>` elements on a tiny integer grid (e.g. `ElfHero` is `viewBox="0 0 20 28"`).
This keeps them razor-sharp at any size and lets expressions be controlled via CSS.

### Interactive expressions

`PortraitToggle.astro` wraps a sprite in a focusable, `role="button"` span with
`aria-pressed`. Sprites mark alternate expression layers with data attributes —
`data-mouth="smile|rest"`, `data-brows="raised|rest"`, `data-leg="raised|rest"`,
`data-pose="active|rest"`. CSS in `global.css` toggles the opacity of those layers on
`:hover`, `:focus-visible`, and the `.is-smiling` class.

A small inline script (in `PortraitToggle`) toggles `.is-smiling` on click and on
Enter/Space, keeping `aria-pressed` in sync — so a tired elf can be cheered up by
mouse, keyboard, or touch.

Sprites tagged `data-sprite-idle` additionally get a gentle GSAP float/bob animation
(see §7). The idle outline (`drop-shadow` cream halo) is applied via CSS.

**Cast:** four narrative elves (`ElfHero` sad/hero, `ElfWorker` hunched at a bench,
`ElfScholar` crowned with a book, `ElfLiberated` raising a banner), the `UnicornPartner`
for the PETU banner, and two real-person portraits — `DavidGumpel` (PETU founder) and
`BapusahebPatil` (site builder, in the footer).

---

## 7. Animation & interactivity

All client-side behavior lives in **`src/scripts/animations.ts`**, imported once from
`BaseLayout`'s `<body>`. It is the only shipped JS beyond the per-modal inline scripts.

The script initializes four systems on DOM ready:

1. **`choreographHero()`** — a GSAP timeline that staggers the nav, chip, tagline,
   title, copy, CTAs, supporter count, and hero sprite into view on load.
2. **`animateScrambles()`** — `ScrambleTextPlugin` "decodes" any `[data-scramble]`
   heading. Hero scrambles run in the load timeline; the rest fire via
   `IntersectionObserver` as they scroll into view.
3. **`setupRevealObserver()`** — fades/translates `[data-reveal]` blocks up as they
   enter the viewport, and tweens any `[data-counter]` numbers from 0 to their
   `data-counter-target` (with `decimals`/`suffix` formatting) — e.g. the crisis stats.
4. **`setupSpriteIdles()`** — the continuous bob/rotate loop on `[data-sprite-idle]`.

### Reduced motion

`prefers-reduced-motion: reduce` is honored in **two** places, defensively:

- **CSS** — `@media (prefers-reduced-motion: reduce)` reveals all hidden states,
  resets transforms, and globally kills `animation`/`transition`.
- **JS** — every function checks the media query and short-circuits to the final
  state (text shown, counters set to target, sprites static) instead of animating.

Initial hidden states (`[data-reveal]`, `[data-hero]`, `[data-nav-root]`,
`[data-scramble]`) are set in CSS so there is no flash of unstyled/animated content
before the script runs.

---

## 8. Modals

Three modals — Donate, Action, Legal — share an identical pattern, built on the native
`<dialog>` element:

- Opened via `showModal()` (with an `open`-attribute fallback for old engines),
  closed via `close()`, the close button, or a backdrop click.
- A pop-in keyframe (`cubic-bezier` overshoot), disabled under reduced motion.
- Content is **data-driven**: triggers carry `data-*-key` / `data-*-label` attributes,
  and the inline script swaps headline/body/details from a typed content map. Donate
  picks a random message and dollar label; Action and Legal key off the specific
  button/link. Each stamps a random transaction / case / doc number for flavor.

This keeps the parody copy centralized in each modal's script while letting any number
of triggers reuse a single dialog.

---

## 9. SEO, metadata & social

`BaseLayout.astro` owns the document head:

- Canonical URL and OG image are resolved against `Astro.site` (`https://thisispete.org`).
- Full Open Graph + Twitter Card tags (`summary_large_image`), pointing at
  `public/og-image.svg` (a 1200×630 pixel-art card).
- **JSON-LD** structured data typed as `schema.org/NGO`, including a
  `disambiguatingDescription` that explicitly states the site is a parody — important
  given the satirical claims.
- Author (`Bapusaheb Patil`), keyword list, `robots: index, follow`.
- Google Fonts preconnect + single stylesheet request.

The `image` prop on `BaseLayout` allows per-page OG overrides, though only `index` exists today.

---

## 10. Accessibility

- Semantic landmarks: `<header>` nav, `<main>`, `<footer>`, `<section>` per block,
  `<article>`/`<figure>`/`<blockquote>` for cards and quotes.
- Sprites carry descriptive `aria-label`s when meaningful and `aria-hidden` when decorative.
- `PortraitToggle` is keyboard-operable (`tabindex`, Enter/Space) with `aria-pressed`
  and a visible `:focus-visible` outline.
- Modals use native `<dialog>` (focus trapping, Esc-to-close) with `aria-labelledby`.
- `prefers-reduced-motion` fully respected (§7).
- Decorative elements (snowflakes, ground strip, divider rules) are `aria-hidden`.

---

## 11. Content & tone conventions

The copy is the product, so it follows house rules:

- **Everything is parody, and the site says so** — chips, modal footers, the JSON-LD
  disambiguation, the footer, and the README all reassert "PARODY" / "no elves were harmed."
- **Statistics are precise but fake** (`87%`, `1.2B cookies`, `14mm/day height loss`) —
  specificity sells the joke.
- **Named characters** (Tinsel Cogswaddle, Twinkle Greenleaf, Gilbert the mascot) recur
  for continuity.
- **No real legal/financial claims** — donate flows route to "$0.00", emails bounce
  "into the void", the privacy policy's analytics vendor is "a squirrel named Paul".
- Avoid naming real protected entities directly; the disclaimer leans on satire +
  fair use rather than references.

When adding content, keep the register dry and bureaucratic-absurd, and never break the
parody frame.

---

## 12. Conventions for contributors

- **New section** → add a component under `src/components/`, give its `<section>` an
  `id`, and mount it in `index.astro` in scroll order. Add a nav/footer link if it's a
  primary destination.
- **Animate on scroll** → add `data-reveal` to the block; add `data-scramble` to a
  heading span; for counters, use `data-counter` + `data-counter-target`/`-decimals`/`-suffix`.
  No JS wiring needed — the observers pick them up.
- **New sprite** → add a `<rect>`-based SVG component in `sprites/`, mark expression
  layers with the `data-mouth`/`-brows`/`-leg`/`-pose` attributes, and wrap it in
  `PortraitToggle` (add `data-sprite-idle` for the float).
- **New interactive surface** → prefer reusing an existing `<dialog>` by adding a
  trigger with the right `data-*-key`/`-label`, rather than adding new JS.
- **Styling** → reach for the `.pixel-*` component classes and color/font tokens before
  writing new CSS; keep shadows hard (no blur) and edges crisp.
- Honor `prefers-reduced-motion` for anything new that moves.
```
