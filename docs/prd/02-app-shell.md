# Sub-PRD 02 — App Shell: Header, Navigation, Footer, Route States, SEO Baseline

|                |                                                                              |
| -------------- | ---------------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §6.1 A and G, §7 FE-04, §10 NFR-02, NFR-04, NFR-11, NFR-13 |
| **Priority**   | P0 (P0-3, P0-10); header search is P1                                        |
| **Repos**      | `client/`                                                                    |
| **Depends on** | 01 (components, tokens), 03 (FR-API-06 `type` filter; FR-API-04 for search) |
| **Blocks**     | 04, 05, 06, 07 (all pages render inside the shell)                           |
| **Status**     | Draft v1                                                                     |

## 1. Goal

Give every storefront page a branded, accessible frame. Shop, categories, search, account, wishlist, and cart are reachable at every breakpoint. Every route has defined loading, error, and not-found states.

## 2. Scope

**In scope:** `client/src/app/Header.jsx` (rewrite), a new footer, `loading.js`/`error.js`/`not-found.js` for `(user)`, storefront metadata defaults, and API error message handling.

**Non-goals:** admin and profile layouts (they own their own root `<html>`, PRD §4.2), and any new business-policy content (shipping, returns, contact).

## 3. Current state (summary)

PRD §4.2 and §4.7. The header shows the logo `/shop.png` and "NEXAIVON". The "Products" link is `hidden sm:block` and there is no mobile menu (defect 5). The account trigger is a clickable `<div>`. The cart badge counts distinct products (defect 6). While the user query loads, the whole header is blurred (`blur-sm pointer-events-none`). There are no footer, no route-state files, and static `metadata` only.

## 4. Requirements

### 4.1 Header — FR-H-01..04

| ID          | Requirement                                                                                                                                         | Priority | Dependency     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------- |
| **FR-H-01** | Shop, categories, search, account, wishlist, and cart reachable at all breakpoints. Mobile reaches them through a `Drawer`.                                       | P0       | FR-API-06      |
| **FR-H-02** | Cart badge = **total units** (Σ `cart.productDetail[].quantity` from `GET /user/profile`), with an accessible label such as "سبد خرید، ۳ کالا".                | P0       | —              |
| **FR-H-03** | Wishlist icon → `/wishlist` when signed in, `/auth` when signed out.                                                                                | P0 link / P1 page | 08 (FR-W-03) |
| **FR-H-04** | Search submit → `/products?search=<term>`. Empty search is blocked.                                                                                    | P1       | FR-API-04 (03) |

**Layout and behaviour (PRD §6.1 A)**

- Sticky header with reduced height on scroll.
- Content: NEXAIVON wordmark → `/`; "فروشگاه" → `/products`; category menu (desktop dropdown or mega-menu, mobile drawer); search; account; wishlist; cart.
- < 640 px: logo, search icon, cart, and menu button. The drawer holds Shop, categories, account, wishlist, and the dark-mode toggle. ≥ 1024 px: all items inline.
- Search: inline on desktop, full-width overlay on mobile.
- The account control is a `<button aria-expanded>` (NFR-04).
- Categories come from `GET /category/list?type=product` (FR-C-01).
- **Loading:** skeleton placeholders for account and cart only, with no full-header blur. **Error:** guest state (AC-ERR-01).
- Reuse: `common/Drawer`, `common/DropDown` with `useOutsideClick`, `DarkModeToggle`, `useGetUser`.

### 4.2 Footer — PRD §6.1 G

- Content: wordmark, short brand line, links (Shop, categories, Account, Cart), optional dark-mode toggle, copyright.
- **Must not** show delivery promises, return windows, phone numbers, addresses, or "secure payment" claims (no gateway exists). Policy and contact content stays hidden (Q5, decided).
- **No** "portfolio project / demo store" notice (Q2, decided). Only the checkout copy calls orders a demo (Q10, sub-PRD 07).

### 4.3 Route states — FE-04, NFR-12

- Add `loading.js`, `error.js` (with retry, no stack trace), and `not-found.js` (branded, HTTP 404) under `client/src/app/(user)/`.
- Sub-PRD 06 adds the PDP-specific ones under `/products/[slug]`.

### 4.4 Metadata and SEO baseline — NFR-11

- Root storefront metadata in `(user)/layout.jsx`: title template `<page title> | NEXAIVON`, Open Graph `siteName: "NEXAIVON"`, and a storefront description. The text "پنل مدیریت ادمین" must not appear on storefront pages.
- Favicon uses the monogram (01).
- Per-page `generateMetadata` is owned by 05 (filtered listing) and 06 (PDP).

### 4.5 API error messages — NFR-13

- A shared helper returns `error.response.data.message` when present, otherwise a generic Persian message. Use it everywhere a toast or inline error is shown, so `undefined` is never toasted.

### 4.6 Accessibility — NFR-02, NFR-04

- Landmarks `header`, `nav`, `main`, `footer`. One `<h1>` per page (the pages own it).
- The drawer traps focus, closes on Esc, and returns focus to the trigger.
- Icon-only buttons (cart, wishlist, dark mode, menu, search) have `aria-label`.

## 5. Acceptance criteria

- **AC-SHELL-01** At 360 px every FR-H-01 destination is reachable through the drawer by touch and by keyboard. *(FR-H-01, NFR-02.)*
- **AC-SHELL-02** With 2 units of product A and 1 of product B in the cart, the badge shows ۳ and its accessible name includes the count. *(FR-H-02.)*
- **AC-SHELL-03** The category menu lists only `type: "product"` categories (AC-HOME-06).
- **AC-SHELL-04** With the API down, the header renders in the guest state and the footer renders (AC-ERR-01, AC-HOME-04).
- **AC-SHELL-05** An unknown storefront URL returns the branded 404 with HTTP 404.
- **AC-SHELL-06** Every storefront page `<title>` ends with `| NEXAIVON`.
- **AC-SHELL-07** No toast ever renders the text `undefined` (NFR-13).
- **AC-SHELL-08** (P1) Submitting an empty search does nothing. Submitting "x" navigates to `/products?search=x` (FR-H-04).

## 6. Decisions (PRD §15.1)

| #   | Decision                                                      |
| --- | ------------------------------------------------------------- |
| Q2  | No portfolio or demo-store notice.                            |
| Q5  | Shipping, returns, and contact info stay hidden.              |

## 7. Risks

- **R7** An expired `accessToken` can make server-rendered fetches return 401. The shell must degrade to the guest state. The server-side fix is in 03.
