# Sub-PRD 01 — Design System and Brand Foundation

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §5, §7 (FE-01, FE-02, FE-08, FE-09, FE-11, FE-12), §9.3 |
| **Priority**   | P0 (parent items P0-1, P0-2)                                     |
| **Repos**      | `client/`                                                        |
| **Depends on** | —                                                                |
| **Blocks**     | 02, 04, 05, 06, 07, 08, 09                                       |
| **Status**     | Draft v1                                                         |

## 1. Goal

Give every storefront page one coherent visual language (objective O1) and one set of reusable, accessible components, so the feature sub-PRDs only assemble pages and don't invent styling.

## 2. Scope

**In scope**

- Brand application: `NEXAIVON` wordmark, monogram for favicon and small sizes (PRD §5.1).
- Design tokens for color, radius, spacing, and motion, in light and dark themes (PRD §5.2–5.5).
- Typography: Vazirmatn with `display: "swap"`, an optional Latin display face, and the type scale.
- Shared UI component library (FE-02) and removal of duplicated markup (FE-08).
- Global CSS fixes: remove `user-select: none` (FE-11).
- RTL conventions (FE-09) and the motion policy (FE-12, NFR-06).

**Non-goals**

- Restyling the admin `(admin)` or profile `(profile)` panels. They must keep working with their existing tokens (§9.3, R12). The P1 Telegram "sign-in methods" card added to the profile panel (FR-TG-07, sub-PRD 09) uses that panel's existing styles and is not a restyle.
- Adding any animation, 3D, or UI-kit library in P0.

## 3. Current state (summary)

See PRD §4.2. Tailwind `3.3.2` with CSS-variable tokens (`--color-primary-*` blue, `--color-secondary-*` gray) in `client/src/app/globals.css` and `client/tailwind.config.js`. Class-based dark mode (`dark-mode`) via `DarkModeContext`. Vazirmatn with `display: "block"` in `client/src/constants/localFonts.js`. `common/Button` is always `type="submit"`. Three divergent product-card markups and two sort controls exist.

## 4. Requirements

### 4.1 Brand (PRD §5.1)

- Wordmark is always Latin capitals `NEXAIVON`, isolated with `<bdi>` inside Persian text.
- A monogram (for example `NX` or `N`) is used for the favicon and small sizes.

### 4.2 Tokens — FE-01

- Add the §5.3 palette as **new** CSS variables, using the existing `withOpacity` pattern in `tailwind.config.js`. **Do not** repurpose `--color-primary-*` or `--color-secondary-*`. Admin and profile pages keep using them (§9.3).

| Token        | Light     | Role                                      | Allowed as text on warm-white? |
| ------------ | --------- | ----------------------------------------- | ------------------------------ |
| `warm-white` | `#F5F2EC` | Page background, light surfaces           | —                              |
| `charcoal`   | `#242424` | Body text, primary button, dark sections  | Yes (13.89:1)                  |
| `sage`       | `#A4AD98` | Decorative surfaces only                  | **No** (2.09:1)                |
| `sand`       | `#D9BDA7` | Editorial surfaces only                   | **No** (1.59:1)                |
| `sage-ink`   | `#5E6B52` | Sage-family text and links                | Yes (5.08:1)                   |
| `sand-ink`   | `#7A5C46` | Sand-family text, eyebrow labels          | Yes (5.45:1)                   |
| `muted`      | `#5C5C5C` | Secondary text                            | Yes (5.98:1)                   |
| `sale`       | `#B42318` | Sale price, discount badge                | Yes (5.88:1)                   |
| `in-stock`   | `#1F7A4D` | Availability text                         | Yes (4.76:1)                   |

- Dark theme: background `#242424` / `#1A1A1A`, text `#F5F2EC`. Sage and sand become accent surfaces with charcoal text. **Every dark pair is re-measured during design** (PRD §5.3 note 4).
- Primary CTA: charcoal fill with warm-white text.
- **No saturated accent (Q3, decided).** The focus ring is charcoal on light surfaces and warm-white on dark surfaces.
- Radii: 12 px for cards and inputs, pill (999 px) for chips and badges, 20–24 px for large media panels. Replace the current mix of `rounded-lg`/`xl`/`2xl` on storefront pages.
- Storefront components reference tokens only, never raw hex values.

### 4.3 Typography (PRD §5.4, NFR-10)

- Vazirmatn `display: "swap"`.
- **Inter** (variable) via `next/font`, used only for the wordmark and Latin spec values (Q4, decided). No other additional family.
- Scale (desktop/mobile): Display 56/36, H1 40/28, H2 28/22, H3 20/18, Body 16, Small 14, Caption 12. Line height 1.6–1.8 for Persian body text, 1.2–1.3 for headings.
- Prices and quantities use Persian digits via the existing `toPersianNumbers*` utilities.

### 4.4 Spacing, layout, and states (PRD §5.5)

- 4 px base. Section rhythm is 64–96 px on desktop and 40–56 px on mobile.
- Container `container xl:max-w-screen-xl`, with a 16 px mobile gutter.
- Every interactive element defines default, hover, focus-visible (2 px ring, ≥ 3:1 contrast, NFR-03), active, disabled, and loading states.

### 4.5 Component library — FE-02, FE-08

Location: **`client/src/components/ui/`** (Q11, decided). Existing `src/common` components stay where they are until they are migrated.

| Component         | Responsibilities                                                                                                                                                       | Consumers           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `Button`          | Refactor. Variants: primary, secondary, ghost. Sizes. **`type` prop** (default `button`), loading and disabled states.                                                    | all                 |
| `IconButton`      | Icon-only button. A required `aria-label` and a ≥ 44×44 px touch target.                                                                                                     | header, cards, cart |
| `Badge`           | Pill label (discount, stock, count)                                                                                                                                    | cards, PDP          |
| `Price`           | `discount > 0`: `offPrice` as the main price, `price` struck through, `discount`% badge. Otherwise `price` only. Toman suffix, Persian digits (FR-F-02, FR-PDP-04).          | cards, PDP, cart    |
| `StockBadge`      | `countInStock` 0 → "ناموجود". 1–3 → "تنها N عدد باقی مانده" (exact count). Otherwise "موجود" (FR-PDP-05, Q7 decided)                                                    | cards, PDP, cart    |
| `WishlistButton`  | Heart toggle with `aria-pressed`. Behaviour is owned by sub-PRD 08.                                                                                                        | cards, PDP          |
| `QuantityStepper` | Labelled − / value / + with min and max bounds and disabled states                                                                                                      | cart, PDP (P1)      |
| `ProductCard`     | Single card (FR-F-01): 1:1 image `object-contain`, title, brand, `Price`, `StockBadge`, `WishlistButton`. The **whole card is one link**, with wishlist and cart as separate controls. | home, listing, related, wishlist |
| `SectionHeader`   | Eyebrow, title, optional "view all" link                                                                                                                               | home                |
| `Skeleton`        | Fixed aspect-ratio placeholders (prevents CLS)                                                                                                                         | all data sections   |
| `EmptyState`      | Message plus optional action                                                                                                                                           | listing, cart, wishlist |
| `ErrorState`      | Message plus retry                                                                                                                                                     | all data sections   |

- **FE-08:** delete the three card markups in `LatestProducts.jsx`, `LoadProducts.jsx`, and `products/page.jsx` once `ProductCard` replaces them. Sort control consolidation is owned by sub-PRD 05.

### 4.5a Server-first rendering — FE-03

- Data fetching stays in Server Components. `"use client"` is limited to interactive leaves (AddToCart, `WishlistButton`, filters, header menus). Components in this library are server-safe by default. Only the interactive ones are client components.

### 4.6 RTL — FE-09, NFR-07

- Use logical spacing utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, or RTL-aware equivalents) and no physical `left`/`right` in storefront components.
- Directional icons such as arrows and chevrons mirror in RTL.
- Latin product names and model numbers use `dir="auto"` or `<bdi>`.

### 4.7 Motion — FE-12, NFR-06

- CSS transitions only, opacity and translate, 150–300 ms. Hover lift applies only to `(hover: hover) and (pointer: fine)`.
- Everything non-essential is disabled under `prefers-reduced-motion: reduce`. No scroll-jacking and no auto-playing carousels.

### 4.8 Global CSS — FE-11

- Remove `user-select: none` from `html, body` in `globals.css`.

## 5. Acceptance criteria

- **AC-DS-01** No storefront component contains a raw hex color. Every color comes from a token. *(Derived from FE-01.)*
- **AC-DS-02** Admin and profile pages look unchanged after the token change (screenshot comparison of the admin dashboard and the profile page). *(R12, §9.3.)*
- **AC-DS-03** Every token pair used for text meets NFR-05 in both light and dark themes. The measured ratios are recorded in this document.
- **AC-DS-04** `Button` without a `type` prop does not submit an enclosing form.
- **AC-DS-05** `Price` renders the two cases of AC-PDP-04 exactly.
- **AC-DS-06** Under reduced motion, no transform transition runs (AC-A11Y-03).
- **AC-DS-07** Text on the storefront can be selected and copied (FE-11).
- Component unit tests per PRD §12.12 (`Price`, `StockBadge`, `ProductCard`, `QuantityStepper`), delivered through sub-PRD 11.

## 6. Decisions (PRD §15.1)

| #   | Decision                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------- |
| Q3  | Fully neutral palette. No saturated accent.                                                                          |
| Q4  | Inter for the wordmark and Latin spec values.                                                                        |
| Q11 | Components go in `client/src/components/ui/`.                                                                        |
| Q13 | Images are uploaded to the server (FR-API-17, sub-PRD 03). `next.config.js` adds the API host and keeps the two existing hosts. |

## 7. Risks

- **R12** Shared `globals.css` can restyle the admin panel. Mitigation: new token names only, leaving the old ones intact.
