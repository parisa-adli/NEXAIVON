# Sub-PRD 12 — Future Backlog (P2)

|                |                                                                     |
| -------------- | ------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §11.3, FR-API-10, 12, 13, 14, FR-PDP-08, FR-PDP-15, FR-CART-07, AC-VAR-01 |
| **Priority**   | P2 (optional). None of these items is required for release           |
| **Repos**      | `client/` and `server/`                                             |
| **Depends on** | 07 (FR-API-16 for sales counts), 10 (data-model patterns)          |
| **Status**     | Parking lot. Each item needs its own decision before it gets a full sub-PRD |

## 1. Purpose

Record the deferred items with their prerequisites, so they aren't lost and aren't started before their foundations exist.

## 2. Items

### 2.1 Variants — FR-API-10, FR-PDP-08

- **Decided (Q15): not needed now.** Each variant is modelled as a separate product. If this is revisited, the options are:
  - **(a)** Separate products linked by a `variantGroup` key. Minimal change, each variant keeps its own price, stock, and slug. **Parent recommendation.**
  - **(b)** Embedded `variants[{sku, attributes, price, offPrice, countInStock, images}]`, with cart lines keyed by `(productId, sku)`. This touches the cart schema, `getUserCartDetail`, coupons, payment, and admin.
- Acceptance: **AC-VAR-01** Selecting a variant updates price, stock, image, and URL. Unavailable variants are disabled with an explanation. The cart line records the variant.
- Interim: separate products already work.

### 2.2 Reviews and ratings — FR-API-14, FR-PDP-15

- New `Review` model `{product, user, rating 1–5, comment, status}`. One review per user per product, purchasers only (via `user.Products`). Admin moderation. Maintains `rating` and `numReviews`, which are never written today.
- Needs a moderation and purchase-verification policy (owner).

### 2.3 Best sellers — FR-API-13

- `soldCount` incremented by quantity in `POST /payment/create`, or an aggregation over `Payment.cart`. `sort=bestselling`.
- **Prerequisite:** FR-API-16 (07). Counts are unreliable until the decrement is quantity-aware.

### 2.4 Featured flag and admin curation — FR-API-12

- `isFeatured: Boolean`, `featuredOrder: Number` on Product. `GET /product/list?featured=true`. Admin toggle.
- Replaces the static `featuredSlugs` config (04). Static config is enough for a portfolio.

### 2.5 Guest cart — FR-CART-07

- Local cart for guests, merged into the server cart at login.
- Risk: merge rules (stock limits, duplicate lines, coupons).

### 2.6 Advanced motion or 3D product views

- Only with a measured performance budget against NFR-09, and a bundle-impact justification (FE-12).

### 2.7 Personalisation and recommendations

- No data basis today.

### 2.8 Cleanups (low risk; may be pulled earlier)

- Remove the duplicate `likedProducts` declaration in the User model (PRD §9.1).

(The R6 OTP singleton fix moved into P0, sub-PRD 09 §4.1, per Q18.)

## 3. Decisions (PRD §15.1)

| #   | Decision                                                   |
| --- | ---------------------------------------------------------- |
| Q15 | Variants aren't needed now. Each variant is a separate product. |
