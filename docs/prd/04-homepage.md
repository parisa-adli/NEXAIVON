# Sub-PRD 04 — Homepage

|                |                                                                       |
| -------------- | --------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §6.1 B–F, AC-HOME-01..06, FE-10                      |
| **Priority**   | P0 (P0-4); category images P1                                         |
| **Repos**      | `client/`                                                             |
| **Depends on** | 01 (`ProductCard`, `SectionHeader`, states), 02 (shell), 03 (FR-API-03 `limit` recommended, FR-API-06 `type` filter, FR-API-05 for "Most liked") |
| **Blocks**     | —                                                                     |
| **Status**     | Draft v1                                                              |

## 1. Goal

Replace the current text-only homepage with a product-first, editorial homepage that showcases the brand and leads to products in one or two clicks.

## 2. Scope

**In scope:** Hero, Shop by category, Featured products, Technology spotlight, New arrivals, plus a static home config.

**Moved out:** The full product grid with sorting (`LoadProducts` and `SortProducts`) moves to `/products` (sub-PRD 05). The home page no longer duplicates it.

**Non-goals:** Best sellers (not supported by data, PRD §6.1 F) and a server-managed featured flag (P2, sub-PRD 12).

## 3. Current state (summary)

`client/src/app/(user)/page.jsx`: `LatestProducts` (5 newest as text cards, no image or price, fetched with `?undefined` and sorted client-side), `SortProducts` tabs, and `LoadProducts` (the full grid). The page is dynamic because it uses `cookies()`.

## 4. Static home config

There is no CMS or featured capability (**[Verified]**). Phase 1 uses a client config file, for example `client/src/constants/home.js` **[Proposed]**:

```js
// shape only — values are supplied by the owner
export const home = {
  hero: { eyebrow, headline, subline, ctaLabel, productSlug },
  featuredSlugs: [/* 4–8 slugs */],
  spotlight: { eyebrow, headline, highlights: [h1, h2, h3], productSlug },
  categoryImages: { /* englishTitle → /public path */ },
};
```

The config holds **copy and slugs only**. Image, price, and stock are always fetched live, so they never go stale.

## 5. Sections (render order per AC-HOME-01)

### 5.1 Hero — FR-HE-01

- Content: eyebrow, headline (≤ 8 words), supporting line (≤ 20 words), one CTA ("مشاهده محصول" or "خرید"), large product image.
- Data: `GET /product/slug/:slug` for `hero.productSlug`.
- Layout: desktop has two columns, text on the start side (right in RTL) and image on the end side. Mobile has the image on top and a full-width CTA.
- **Fallback:** on 404 or error, render the copy with a CTA to `/products`, hiding the price and image. Never show a broken image.
- Performance: the hero image is the LCP element (`next/image` with `priority` and correct `sizes`).

### 5.2 Shop by category — FR-C-01..03

- Data: `GET /category/list?type=product` → `title`, `englishTitle`, `icon`.
- One card per product category. Clicking it opens the listing pre-filtered to that category, `/products?category=<englishTitle>` (FR-C-02).
- Phase 1 image: `categoryImages[englishTitle]` from config, otherwise a neutral sage or sand fallback tile. Categories come **only** from live data.
- Layout: 2 columns on mobile (horizontal scroll allowed), 3–4 on tablet, 4–6 on desktop.
- States: skeleton while loading. Empty or error hides the section.
- **FR-C-03 (P1):** use `icon.lg`/`icon.sm` once FR-API-11 lands (sub-PRD 10).

### 5.3 Featured products — FR-F-01, FR-F-02

- 4–8 `ProductCard`s from `featuredSlugs`. Fallback: the first N of `sort=popular`, which is meaningful only after FR-API-05.
- Data: `GET /product/list` (with `limit` once FR-API-03 lands). The card fields are listed in PRD §6.1 D.
- Ratings are hidden (never written).
- States: skeleton cards with a fixed aspect ratio. Empty hides the section. Error shows an inline message and a retry link.

### 5.4 Technology spotlight

- A full-bleed charcoal or sand band: large product image, 3 highlights (static config), CTA to the product.
- Data: `GET /product/slug/:slug` for price, image, and link. Highlights have no backend field. Later they may come from `specs` (FR-API-09).
- Motion: optional reveal or parallax ≤ 300 ms, off under reduced motion.
- If the product fails to load, **hide the whole section** (Q6, decided).

### 5.5 New arrivals — FE-10

- `GET /product/list?sort=latest&limit=N`. Without FR-API-03, fall back to fetching the list and slicing on the server.
- Replaces `LatestProducts`. The call must pass explicit params (fixes `?undefined`).
- Optional "Most liked" row only after FR-API-05 fixes `sort=popular`.

## 6. Acceptance criteria

From the parent, verbatim:

- **AC-HOME-01** With products and categories present, renders Header, Hero, Categories, Featured, Spotlight, New arrivals, and Footer in that order, with no console errors.
- **AC-HOME-02** Every product card links to `/products/<slug>`, which returns 200, including for products created after the last build (needs FR-PDP-01, sub-PRD 06).
- **AC-HOME-03** With zero products, product-driven sections are hidden and the hero falls back to a CTA.
- **AC-HOME-04** With the API unreachable, the header, hero copy, and footer render, plus a non-blocking error where product sections would be.
- **AC-HOME-05** No horizontal scroll at 360, 768, 1024, and 1440 px. CTAs are visible and don't overlap.
- **AC-HOME-06** Category cards show only `type: "product"` categories.

Additional (derived):

- **AC-HOME-07** Changing a product's price in admin is reflected on the homepage on the next request, with no stale price from config.
- **AC-HOME-08** Hero LCP image has `priority`. No other homepage image has it (NFR-08).

## 7. Decisions (PRD §15.1)

| #   | Decision                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------- |
| Q6  | Spotlight is hidden entirely when its product is unavailable.                                                 |
| Q19 | Seed categories are smartphones, headphones, smartwatches, accessories. `categoryImages` covers these four.   |
