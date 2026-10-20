# Sub-PRD 11 — Quality: Seed Data, Tests, Accessibility, Performance

|                |                                                                                    |
| -------------- | ---------------------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §9.2 (seed), §10 (NFR-01..16), §12 (all AC, §12.11 regression, §12.12 strategy), R14 |
| **Priority**   | P0 (P0-11, P0-12)                                                                  |
| **Repos**      | `client/` and `server/`                                                            |
| **Depends on** | Spans all. The seed script and server test harness should start in Phase A          |
| **Blocks**     | Release sign-off                                                                   |
| **Status**     | Draft v1                                                                           |

## 1. Goal

Make the upgrade verifiable and regression-safe (objectives O4, O5). Today there are **no tests and no seed data** (**[Verified]**, R14).

## 2. Seed data (P0 dev dependency)

- A `server/` seed script (for example `npm run seed`) that creates deterministic electronics sample data in four categories: **smartphones, headphones, smartwatches, accessories** (Q19 decided).
- Must include fixtures that exercise every rule:
  - Discounted and non-discounted products. `offPrice` is computed by the server (Q16), so fixtures set only `price` and `discount`.
  - `countInStock` values 0, 1–3 (low stock), and plenty.
  - A product with a long Persian description with line breaks, and one with a Latin model name.
  - Coupons: valid `percent`, valid `fixedProduct`, expired, exhausted, inactive, and non-applicable.
  - A non-product-type category (to prove the `type` filter).
  - An admin user and a normal user. Outside production, OTP skips Kavenegar and is written to the server log (decided; implemented in sub-PRD 09 §4.1). Tests read the code from there.
- Seed images are sample files copied into the server uploads folder (FR-API-17), so their URLs are on the API host allowed by `next.config.js`.
- Idempotent: re-running resets to the same state. Never runs against `NODE_ENV=production`.

## 3. Test strategy (PRD §12.12; tooling decided in Q17)

| Layer                       | Tooling (decided)                                    | Must cover                                                                                                                                                     |
| --------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server unit and integration | Vitest, Supertest, `mongodb-memory-server`           | `getUserCartDetail` (discounts, coupons, invalid coupon), cart add/remove/quantity with stock limits, payment validation and decrement, list filters/sort/pagination/unknown category, wishlist toggle, sub-PRD 03 AC-API-* |
| Client unit and component   | Vitest, React Testing Library                        | `Price`, `StockBadge`, `ProductCard`, `QuantityStepper` bounds, `WishlistButton` optimistic rollback, safe `next` parsing                                          |
| End-to-end                  | Playwright with seed data                            | Journeys in PRD §2.2. AC-HOME, AC-PDP, AC-LIST, AC-CART. Viewport matrix. axe scan                                                                             |
| Manual                      | Visual QA in RTL, light and dark                     | Design sign-off                                                                                                                                                |

**Sequencing:** stand up the server harness **before** sub-PRD 07's server changes, so that FR-API-01/15/16 land with tests (they are the highest-risk changes).

## 4. Regression suite (PRD §12.11, must stay green)

- OTP login → complete profile → profile page shows the user and payments.
- Admin can list, add, edit, and delete products, categories, and coupons, and view users and payments. `/admin` is blocked for non-admins.
- The dark-mode toggle persists (`localStorage` key `isDarkMode`).
- Logout clears the session.
- An order creates a `COMPLETED` payment and empties the cart.

## 5. Non-functional verification

| NFR    | Verification method                                                                 |
| ------ | ----------------------------------------------------------------------------------- |
| NFR-01 | Playwright viewport matrix 360/390/768/1024/1280/1440: no horizontal scroll, tap targets ≥ 44×44 |
| NFR-02 | Keyboard-only e2e (AC-A11Y-02). Drawer and modal focus-trap tests                   |
| NFR-03, NFR-05 | Token contrast table (01) plus axe                                          |
| NFR-04 | axe plus a lint or test for a single `<h1>` and the landmarks                        |
| NFR-06 | e2e with `reducedMotion: "reduce"` (AC-A11Y-03)                                     |
| NFR-07 | Visual QA. `lang`/`dir` assertions                                                  |
| NFR-08 | Lighthouse CLS, plus an `alt` presence check                                        |
| NFR-09 | Lighthouse on a production build, mobile emulation: Performance ≥ 85, LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms on Home, Listing, PDP |
| NFR-10 | Font config review                                                                  |
| NFR-11 | e2e title and meta assertions                                                       |
| NFR-12 | e2e with mocked empty or failing API per section                                    |
| NFR-13 | Unit test of the error-message helper (02)                                          |
| NFR-14 | Server tests for auth-gated routes. `next` parser tests (09). AC-WISH-05            |
| NFR-15 | AC-API-08                                                                           |
| NFR-16 | Run against a copy of pre-upgrade data, if available                                |

## 6. Accessibility acceptance (from the parent, verbatim)

- **AC-A11Y-01** axe-core reports no serious or critical violations on Home, Listing, PDP, Cart, and Auth.
- **AC-A11Y-02** A keyboard-only user can browse to a product, add it to the cart, and reach "Place order".
- **AC-A11Y-03** Under reduced motion, no transform or parallax animation runs.
- **AC-RESP-01** NFR-01 holds on all storefront pages.
- **AC-ERR-01..03** API failure, unknown category, and expired-token behaviour.

## 7. Decisions (PRD §15.1)

| #   | Decision                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------- |
| Q16 | `offPrice` is computed by the server. Fixtures don't set it                                                    |
| Q17 | Vitest + Supertest + `mongodb-memory-server`, Vitest + RTL, Playwright. Set up first, in Phase A               |
| Q19 | Seed categories are smartphones, headphones, smartwatches, accessories                                       |
| —   | Dev and test OTP is written to the server log, with no Kavenegar call outside production                     |

## 8. Definition of release-ready

All P0 sub-PRD acceptance criteria pass, the regression suite is green, AC-A11Y-01..03 pass, and the NFR-09 targets are met on a production build.
