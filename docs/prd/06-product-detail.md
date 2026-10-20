# Sub-PRD 06 — Product Detail Page (`/products/[slug]`)

|                |                                                                                 |
| -------------- | ------------------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §6.2 (FR-PDP-01..17), AC-PDP-01..11, FE-04, FE-05, NFR-11      |
| **Priority**   | P0 (P0-5): FR-PDP-01..06, 10, 12, 17. P1: 02 (gallery), 07 (specs), 09, 13, 14  |
| **Repos**      | `client/`                                                                       |
| **Depends on** | 01 (`Price`, `StockBadge`, `WishlistButton`), 07 (FR-API-01 stock rejection), 08 (wishlist state), 09 (FR-AUTH-01 return-to), 03 (FR-API-03 related), 10 (gallery, specs) |
| **Blocks**     | AC-HOME-02 (sub-PRD 04)                                                        |
| **Status**     | Draft v1                                                                        |

## 1. Goal

A complete, trustworthy product page (objective O2) that is always fresh: image, price and sale price, stock state, description, and a clear add-to-cart, all from the API, reachable for every product without a rebuild.

## 2. Current state (summary)

`client/src/app/(user)/products/[slug]/page.jsx` uses `force-static`, `dynamicParams = false`, and `generateStaticParams`. New products 404 and price and stock are frozen at build time (defect 3, R8). It shows breadcrumbs, one image, title, description, price, and discount badge with `offPrice`. It shows **no stock, brand, or category**. The detail response returns a raw `likes[]` and no `isLiked`.

## 3. Requirements

### 3.1 P0

| ID            | Requirement                                                                                                                                                         | Notes |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **FR-PDP-01** | ISR with `revalidate = 60` s instead of `force-static` with `dynamicParams=false` (FE-05; Q12 decided). Unknown slugs render on demand. API 404 → `notFound()` → branded `not-found.js`.            | Cart and stock correctness never rely on the cached page. |
| **FR-PDP-02** (P0 part) | Single large image, `object-contain`, `alt` = product title. No thumbnails.                                                                                 | Full gallery in §3.2 |
| **FR-PDP-03** | Title, brand, category (link to `/products?category=<englishTitle>`), breadcrumbs Home › Category › Product.                                                        | |
| **FR-PDP-04** | Price block via `Price` (sale vs regular), Toman, Persian digits.                                                                                                   | |
| **FR-PDP-05** | `countInStock` 0 → "ناموجود", add-to-cart disabled. 1–3 → "تنها N عدد باقی مانده" with the exact count (Q7 decided). Otherwise "موجود".                                                     | |
| **FR-PDP-06** | Description as plain-text paragraphs, preserving line breaks.                                                                                                      | |
| **FR-PDP-10** | Add to cart. Guest → `/auth?next=/products/<slug>` (`next` honoured once FR-AUTH-01 lands). Signed in → pending state, success toast, badge update. Already in cart → "View cart". | Reuse `AddToCart.jsx` logic |
| **FR-PDP-11** | A server stock rejection shows the server's Persian message as a toast. The client never decides stock alone.                                                       | Needs FR-API-01 (07) |
| **FR-PDP-12** | Wishlist toggle, optimistic with rollback, guest → auth. Interim `isLiked` comes from `useGetUser().user.likedProducts`, the proper fix is FR-API-07.                  | Behaviour owned by 08 |
| **FR-PDP-17** | `generateMetadata` (title, description, OG image) plus Product JSON-LD (name, image, brand, `offers.price` converted from Toman × 10, `priceCurrency: "IRR"` per Q9 decided, availability from `countInStock`). | |

Route states: `loading.js`, `error.js` (retry, no stack trace), and `not-found.js` under `/products/[slug]` (FE-04).

### 3.2 P1

| ID            | Requirement                                                                                                    | Dependency           |
| ------------- | -------------------------------------------------------------------------------------------------------------- | -------------------- |
| **FR-PDP-02** | Gallery: primary image plus thumbnails, keyboard (arrows) and swipe, `aria-label`s, active thumbnail `aria-current="true"`. | FR-API-08 (10)       |
| **FR-PDP-07** | Grouped specifications table. Hidden when `specs` is empty.                                                    | FR-API-09 (10)       |
| **FR-PDP-09** | Quantity selector from 1 to `countInStock`, with no separate cap (Q8 decided). Until then: add 1, adjust in the cart.       | FR-API-01, FR-API-02 (07) |
| **FR-PDP-13** | Related products: same category, excluding the current product, up to 4 `ProductCard`s.                       | FR-API-03 `limit` and `exclude`, FR-API-06 |
| **FR-PDP-14** | Sticky mobile purchase bar (price plus add-to-cart) once the main CTA scrolls out of view.                    | —                    |

### 3.3 Hidden or out of scope

- **FR-PDP-08** Variants: P2 (sub-PRD 12).
- **FR-PDP-15** Ratings and reviews: hidden, P2 (sub-PRD 12).
- **FR-PDP-16** Delivery and returns info: hidden (Q5 decided).

### 3.4 Data and caching rules

- `isLiked` is user-specific. If the page body is cached (ISR), the wishlist state must be resolved client-side (from `useGetUser` or a client fetch), never baked into the shared cached HTML (PRD §9.2).
- Price and stock on a cached page may be up to `revalidate` seconds old. The server rejects any invalid cart action (FR-API-01), and the toast explains it.

## 4. Acceptance criteria

From the parent, verbatim:

- **AC-PDP-01** Valid slug → 200 with title, image, price block, stock state, description, and breadcrumbs.
- **AC-PDP-02** Unknown slug → branded 404 (HTTP 404).
- **AC-PDP-03** A product created after deployment is reachable without a rebuild.
- **AC-PDP-04** `discount > 0` → `offPrice` main, `price` struck through, badge `discount`%. `discount = 0` → `price` only.
- **AC-PDP-05** `countInStock = 0` → add-to-cart disabled with "ناموجود". A forced `POST /cart/add` returns 4xx (after FR-API-01).
- **AC-PDP-06** (P1) Multiple images: thumbnail click, arrow keys, or swipe change the main image. The active thumbnail has `aria-current="true"`.
- **AC-PDP-07** (P1) Quantity values below 1 or above stock cannot be submitted, and the server rejects them as well.
- **AC-PDP-08** (P1) Guest add-to-cart → auth → returned to the same product.
- **AC-PDP-09** The wishlist state matches the server after a reload. On failure the UI reverts and shows a toast.
- **AC-PDP-10** API 5xx or malformed JSON → route `error.js` with retry and no stack trace.
- **AC-PDP-11** The PDP price equals the cart unit price for the same product (no coupon).

## 5. Decisions (PRD §15.1)

| #   | Decision                                                  |
| --- | --------------------------------------------------------- |
| Q5  | Delivery and returns info stays hidden                    |
| Q7  | Low stock is 1–3 units, with the exact count shown        |
| Q8  | No max-per-order cap. Stock is the only limit             |
| Q9  | JSON-LD uses `IRR`, price = Toman × 10                    |
| Q12 | ISR, `revalidate = 60` s                                  |

## 6. Risks

- **R8** Resolved by FR-PDP-01.
- **R13** Resolved by the server-computed `offPrice` (Q16, sub-PRD 07 §5), which keeps AC-PDP-11 true.
