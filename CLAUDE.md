@AGENTS.md

# Kaya Yapı — Corporate Website

A modern corporate site for Kaya Yapı, balancing architectural refinement with the credibility of a construction and engineering firm. Target impression: as polished as a luxury architecture studio, as dependable as a builder.

## Design Direction

**Palette — brick red and off-white only.** Defined as CSS variables in the `@theme inline` block of `app/globals.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--color-brick` | `#8b3a2f` | Accent and calls to action |
| `--color-brick-deep` | `#4a1d16` | Dark backgrounds, primary text |
| `--color-bone` | `#f2ece1` | Off-white background and text on dark |
| `--color-brick-light` | `#c4523f` | Accent on dark grounds (icons, map marks) |
| `--color-brick-darkest` | `#2c100b` | Footer ground |
| `--color-bone-soft` | `#e7ddcc` | Tonal shift between light sections |

If a new tone is needed, add it to `globals.css` as a tint or shade of these — never step outside the palette.

**Style.** Minimalist, generously spaced, large type, hairline rules (low-opacity borders such as `border-bone/70`). No decorative noise; every element earns its place.

**Typography.** Geist Sans / Geist Mono via `next/font/google`, wired up in `layout.tsx`. Headings use wide `tracking` at a large scale (see `components/Hero.tsx`). **Never set heading `leading` below 1.0** — Turkish uppercase `Ğ` and `İ` carry diacritics that collide with the line above.

**Imagery.** High-resolution architecture and construction photography, layered with a dark gradient plus `brick/20 mix-blend-multiply` for legibility.

## Tech Stack and Rules

- **Next.js App Router** (`app/`). Routing never leaves this structure.
- **Tailwind CSS v4**, CSS-first: brand colors come from `@theme inline` in `app/globals.css`, not a Tailwind config file.
- **Framer Motion** is the only animation library.
- **lucide-react** for icons.
- Do not add packages or files unnecessarily. As long as Next.js + Tailwind + Framer Motion + lucide-react covers it, introduce no new dependency.

## File Layout

- `app/page.tsx` only sequences sections; each section is a separate client component under `app/components/` (`Hero`, `ProjectStrip`, `Manifesto`, `Stats`, `Services`, `Advantages`, `CoverageMap`, `CtaBanner`, `Faq`, `SiteHeader`, `SiteFooter`).
- `app/components/Motion.tsx` exports two shared wrappers: `Reveal` (a one-time rise-in on scroll into view) and `T` (a fade on language change). Use these instead of hand-writing animation in new sections.
- `app/data/site.ts` holds **non-text** constants: Unsplash image URLs, project ids, the map view box and province label settings. Text never goes here.

## Pages

- `/` — hero, project strip, manifesto, figures, services, advantages, coverage map (`#bolgeler`), CTA, FAQ.
- `/hakkimizda`, `/tasarim-ve-inovasyon`, `/iletisim` — `PageHero` plus the matching section component.
- `/projeler` and `/projeler/[slug]` — four projects (`ofis`, `konut`, `mustakil`, `peyzaj`). The slug list comes from the `projects` array in `app/data/site.ts`; copy lives under `dictionary.projects.items` behind the same keys.
- `/yasal-uyari`, `/gizlilik-politikasi`, `/kvkk` — the `LegalDocument` component, copy under `dictionary.legal`.
- `SiteHeader`, `SiteFooter` and `SmoothScroll` live in `app/layout.tsx`; pages return only their own sections.
- `PageHero` resolves its title and breadcrumb from the `page` prop (plus `projectId` / `legalKey` where needed). No copy is written into page files.

## Internationalization

- **Structure.** `app/i18n/dictionary.ts` defines `Locale = "tr" | "en"`, the `Dictionary` type, and the TR/EN dictionaries. `app/i18n/LanguageContext.tsx` provides the active locale and `t` (the active dictionary) through a React context (`LanguageProvider`, `useLanguage()`).
- **Default locale:** Turkish (`tr`).
- **Rule: no hardcoded copy in components.** Every new string goes into `dictionary.ts` in both `tr` and `en` first, then is read through `t` from `useLanguage()`.
- **`html[lang]`.** `LanguageProvider` writes the active locale onto `document.documentElement.lang`. This is required: `text-transform: uppercase` is locale-sensitive, and under `lang="tr"` the English word "Solid" would render as "SOLİD".
- **Language switcher.** `app/components/LanguageSwitcher.tsx` — top right, beside the menu button, a plain `TR | EN`. No flags or icons. The active locale is `text-current`, the inactive one `text-current/40` (`text-current/70` on hover), so one component works on both light and dark grounds.
- **Transition.** Changing language never reloads the page; copy cross-fades via `AnimatePresence`/`motion` with `key={locale}` and `duration: 0.25`.
- **Domain and email.** `siteUrl` and `contactEmail` in `app/data/site.ts` are the single source. `dictionary.ts` imports them and interpolates them into copy (`` `... ${contactEmail} ...` ``); never type the address by hand in legal text or the footer.
- Repeat this pattern exactly for any new locale-aware component. Do not introduce a separate i18n solution (a library, route-based locales, and so on).

## Brand and Interaction

- **Logo.** `app/components/Logo.tsx` — a three-faced rock mark (`LogoMark`) plus `Wordmark`. It works in a single color (`currentColor`); the faces are separated by opacity alone, which is why the same component serves on both bone and dark grounds. The identical geometry lives in `app/icon.svg` as the favicon — change one, change the other.
- **Smooth scrolling.** `app/components/SmoothScroll.tsx` slows wheel travel (`SPEED`) and damps it (`EASE`) so the page settles instead of jumping. Because it runs its own rAF loop, `html { scroll-behavior }` is forced to `auto` at runtime. It stays out of the way on touch devices (`pointer: fine` check) and under `prefers-reduced-motion`. **Any region with its own scrollbar must carry `data-native-scroll`.** The two constants are a balance, not free knobs: an earlier `EASE` of `0.085` left a two-second tail that read as lag, so keep `EASE` at or above `0.15` and slow the page with `SPEED` instead. Nothing else may run per scroll frame on a layout property — scroll-linked work belongs on `transform` or `opacity`.
- **Hero heading** shrinks toward its top-left corner as the page scrolls (`useScroll` + `useTransform`, `transformOrigin: left top`). Do not add `opacity` to that transform — the value jumps when the section leaves the viewport.
- **Coverage map.** All 81 province outlines live in `app/data/turkeyProvinces.ts` as static SVG path data (generated from open GeoJSON, ~60 KB). Never hand-edit it; active provinces and label settings are in `app/data/site.ts`.

## Mobile

The site is built to work fully on phones, and the desktop composition is preserved unchanged. Verified at 320, 375, 414, 768 and 1280 px: no horizontal overflow on any page.

**Breakpoint convention.** Write the mobile value bare and scope the desktop value to a breakpoint (`py-14 sm:py-28`), never the reverse. Vertical rhythm is tighter on phones and identical to before from `sm` up.

**Touch targets.** Every control in the header, mobile menu and footer clears the WCAG 2.2 AA minimum of 24×24 px, and header controls reach 44×44. The technique is padding plus a compensating negative margin (`-m-2 p-2`, `-my-3 min-h-11`) so the touch area grows without shifting the layout. Footer links use `py-1 lg:py-0` so the desktop footer keeps its exact previous dimensions.

**Hover-only affordances need a touch state.** Anything revealed by `group-hover` is invisible on a touch device. Scope the hover reveal to `lg:` and let the element show by default below it — see the arrow badge in `ProjectsGrid.tsx`.

**Coverage map on phones.** The map is drawn in a `0 0 1000 422` view box, so at phone widths its `13px` labels rendered about 5 px tall. Below `sm` the entire label layer (`<g className="hidden sm:block">`) is hidden and the active provinces are listed as text beneath the map instead; the SVG spans the full viewport width (`-ml-6 w-[calc(100%+3rem)] sm:ml-0 sm:w-full`) and province strokes thicken (`[stroke-width:2.5] sm:[stroke-width:0.9]`) so hairlines do not disappear into sub-pixels.

**Hero image** is shown only from `lg` up, where it sits beside the heading rather than stacking beneath it.

**iOS specifics.** The mobile menu panel and the footer pad their bottom with `env(safe-area-inset-bottom)` so nothing hides under the home indicator. `globals.css` sets `-webkit-text-size-adjust: 100%` against font inflation on rotation, and `overflow-x: clip` on `html, body` as a guard — `clip` rather than `hidden`, because `hidden` would break the sticky header.

**Text that sits opposite text in a row** (a card title beside its category, for example) must stack on phones: `flex-col sm:flex-row sm:items-baseline sm:justify-between`. Turkish copy is long and will otherwise push past the edge.

## Contact Details

There is no published phone number — the switchboard is not live. Contact runs through the email address and the contact form only; the form's own phone field stays, because the form promises a callback within two business days.

## Working Principles

- Keep changes surgical: do the requested work, do not "improve" neighbouring code.
- Never write new copy outside the dictionary + context pattern.
- Treat the palette, the animation library and the file layout as fixed. If a request would require changing them, confirm with the user first.
- Heed the Next.js note in `AGENTS.md`: this repository may behave experimentally at runtime — verify any API you are unsure of against `node_modules/next/dist/docs/`.
