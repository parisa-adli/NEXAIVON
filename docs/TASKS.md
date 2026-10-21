# NEXAIVON — Task Breakdown (parallel client / server lanes)

This file turns the [sub-PRDs](prd/README.md) into PR-sized tasks that a **server lane** and a **client lane** can work on at the same time. It adds no requirements: every task points to requirement and acceptance IDs in the sub-PRDs, which stay the source of truth.

## How parallel work stays safe

1. **The contract is already written.** Every new or changed endpoint has its request and response shape in a sub-PRD (03, 07, 08, 09, 10). The client lane builds against that shape using test fixtures or mocks, so it does not wait for the server code.
2. **Server changes are additive** (PRD §8.5). Today's client keeps working while server tasks merge.
3. **Gate rule (R16).** A client task marked `⛔ S-xx` may be *developed* at any time, but may only be *shipped* once S-xx is deployed. Until then it stays behind its fallback (noted per task) or unmerged.
4. **One task = one branch = one PR**, named `s-07-list-limit`, `c-04-commerce-components`, and so on. Each PR lists the AC IDs it satisfies.
5. **Tests land with the task.** S-01 and C-01 come first, so every later task can include its tests (sub-PRD 11 §3).

Size: **S** ≈ ½ day, **M** ≈ 1–2 days, **L** ≈ 3–4 days.

---

## Server lane (`server/`)

| ID | Task | Sub-PRD / reqs | Size | Needs | Done when |
| -- | ---- | -------------- | ---- | ----- | --------- |
| **Phase A — foundations (P0)** | | | | | |
| S-01 | Test harness: split `app/server.js` so the Express app can be built without `listen()`/`mongoose.connect()` (today both run in the constructor); add Vitest + Supertest + `mongodb-memory-server`; `npm test` | 11 §3 | M | — | A smoke test hits `GET /api/product/list` in memory |
| S-02 | OTP singleton fix + dev/test OTP written to log (no Kavenegar outside production) | 09 §4.1, P0-14 | S | S-01 | AC-AUTH-05, AC-AUTH-06 |
| S-03 | Server-computed `offPrice` on create/update, Joi drops `offPrice`, one-off migration script | 07 §5, Q16 | S | S-01 | AC-CART-11 |
| S-04 | Seed script `npm run seed`: 4 categories, every fixture of 11 §2 (stock 0/1–3/plenty, coupons, non-product category, admin + user); idempotent, refuses production | 11 §2, Q19 | M | S-03 | Re-running gives identical data; client lane can run against it |
| S-05 | Restrict `express.static` to a dedicated uploads folder; move any file that must stay public | 03 §3.5, NFR-15 | S | S-01 | AC-API-08. Note: serve `server/uploads` at `/uploads`, or the seed's `SERVER_URL/uploads/seed/*` image links (S-04) break |
| S-06 | Admin image upload endpoint (type/size limits, no path escape) | 03 §3.7, FR-API-17 | M | S-05 | AC-API-10 |
| S-07 | Safe category handling: whitelist `/category/list` keys; unknown `?category=` → `[]` | 03 §3.4, FR-API-06 | S | S-01 | AC-API-04, AC-API-05 |
| S-08 | Optional auth treats an expired/invalid token as guest | 03 §3.6, R7 | S | S-01 | AC-API-09 |
| S-09 | `limit` + `pagination` on `/product/list`; fix `sort=popular` | 03 §3.1, §3.3 (FR-API-03 P0, FR-API-05 popular) | M | S-01 | AC-API-01, 02, 03, 06 |
| S-10 | Stock validation on `/cart/add` and `/payment/create`; `countInStock` in cart detail; null-coupon guard | 07 §3.1–3.3 (FR-API-01, 01b, 15) | M | S-01, S-04 | AC-CART-06, AC-CART-08, AC-PDP-05 (server half) |
| S-11 | Quantity-aware conditional stock decrement with compensation | 07 §3.4 (FR-API-16) | M | S-10 | AC-CART-07, 09, 10 |
| **Phase C — P1** | | | | | |
| S-12 | `page` + `exclude`, regex search, price sort, `minPrice`/`maxPrice`/`brand` | 03 §3.1–3.3 (FR-API-03..05) | M | S-09 | AC-API-07 + filter tests |
| S-13 | `PATCH /cart/quantity` | 07 §3.5 (FR-API-02) | S | S-10 | Bounds 1..stock enforced, returns cart detail |
| S-14 | Detail endpoints return `isLiked`/`likesCount`, omit `likes[]` for non-admins (check admin usage first); `GET /user/wishlist` | 08 §4 (FR-API-07, 07b) | M | S-01 | AC-WISH-05 |
| S-15 | Product `images[]`, `specs[]`; category `icon.sm/lg`; `parent` → `parentId` fix | 10 §3 (FR-API-08, 09, 11) | M | S-06 | AC-EXT-01, 02, 04 |
| S-16 | Telegram data model: `AuthSession` + User fields + TTL index; env vars + fail-fast validation | 09 §4.3.2 items 1, 7 | S | S-02 | Model tests pass. Note: extend the S-04 seed with the 11 §2 Telegram users (phone + Telegram linked; Telegram-only, no `phoneNumber`) |
| S-17 | Telegram bot (grammY; `bot`/`log`/`unavailable` modes) started after DB connect | 09 §4.3.2 item 2 | M | S-16 | AC-TG-10 |
| S-18 | Telegram service + routes (`start`, `link`, `status`, `verify`, `resend`, `DELETE`), injectable `now` | 09 §4.3.2 items 3–4 | L | S-17 | AC-TG-01..09 |
| S-19 | `completeProfile` accepts phone **or** Telegram; `express-rate-limit` on Telegram routes | 09 §4.3.2 items 5–6 | S | S-18 | AC-TG-11 + phone OTP regression green |

## Client lane (`client/`)

| ID | Task | Sub-PRD / reqs | Size | Needs (⛔ = ship gate) | Done when |
| -- | ---- | -------------- | ---- | ---------------------- | --------- |
| **Phase A — foundations (P0), no server dependency** | | | | | |
| C-01 | Test harness: Vitest + React Testing Library; `npm test` | 11 §3 | S | — | One component test runs |
| C-02 | Tokens (new CSS variables only), Vazirmatn `swap`, Inter, type scale, remove `user-select: none`, motion policy | 01 §4.2–4.4, 4.7–4.8 | M | — | AC-DS-01, 02, 03, 06, 07 |
| C-03 | UI primitives in `components/ui/`: `Button` (with `type` prop), `IconButton`, `Badge`, `Skeleton`, `EmptyState`, `ErrorState`, `SectionHeader` | 01 §4.5 | M | C-02 | AC-DS-04 |
| C-04 | Commerce components: `Price`, `StockBadge`, `QuantityStepper`, `WishlistButton` (visual only), `ProductCard` + unit tests | 01 §4.5 | M | C-03 | AC-DS-05; tests from 11 §3 |
| C-05 | Pure utilities + tests: API error-message helper, safe `next` parser | 02 §4.5, 09 §4.2 | S | C-01 | AC-SHELL-07; AC-AUTH-02 parser cases |
| C-06 | Brand: wordmark, monogram favicon, storefront metadata defaults | 01 §4.1, 02 §4.4 | S | C-02 | AC-SHELL-06 |
| **Phase B — storefront P0** | | | | | |
| C-07 | `(user)` route states: `loading.js`, `error.js`, `not-found.js` | 02 §4.3 | S | C-03 | AC-SHELL-05 |
| C-08 | Header rewrite (drawer, category menu, unit-count badge, skeletons, guest on error) + footer | 02 §4.1–4.2, 4.6 | L | C-04, C-06 · ⛔ S-08 for AC-SHELL-04 with expired cookie | AC-SHELL-01..04 |
| C-09 | Wishlist P0: `useToggleWishlist` (optimistic + rollback), heart icon, wire into `WishlistButton` | 08 §3 (FR-W-01, 02) | M | C-04, C-05 | AC-WISH-01, 02, 04 |
| C-10 | Homepage: static `constants/home.js`, Hero, Categories, Featured, Spotlight, New arrivals; delete `LatestProducts`/`SortProducts` | 04 | L | C-04, C-08 · ⛔ S-09 (fallback: fetch all and slice on the server) | AC-HOME-01..08 |
| C-11 | Listing P0: `ProductCard` grid, filter drawer, single sort control, empty/error/loading, `generateMetadata` | 05 §4 (P0 rows) | M | C-04, C-07 · ⛔ S-07 for AC-LIST-02 | AC-LIST-01, 02, 04..08 |
| C-12 | PDP P0: ISR `revalidate=60`, layout, price/stock, add-to-cart states, JSON-LD, PDP route states | 06 §3.1 | L | C-04, C-09 · ⛔ S-10 for server-rejection toast | AC-PDP-01..05, 09..11 |
| C-13 | Cart redesign: coupon via `POST /cart/coupon` (drop admin coupon list), no-cart = empty, totals only from `payDetail`, demo-order copy | 07 §4 (FR-CART-01..03, 06, 08) | M | C-04 | AC-CART-01, 03, 04, 05 |
| C-14 | Cart stock UX: "+" disabled at stock, out-of-stock lines block ordering | 07 §4 (FR-CART-04, 05) | S | C-13 · ⛔ S-10 | AC-CART-02 |
| C-15 | Auth restyle + accessible OTP/phone inputs | 09 §4 (FR-AUTH-02, 03) | M | C-03 | AC-AUTH-03, 04 |
| C-16 | Minimal admin changes: `offPrice` read-only, upload inputs, API host in `remotePatterns` | 07 §5, 03 §3.7 | S | ⛔ S-03, S-06 | Admin can save a product with an uploaded image |
| **Phase C — P1** | | | | | |
| C-17 | Return-to: `?next=` through `/auth` and `/complete-profile`; producers in PDP, cards, wishlist, cart | 09 FR-AUTH-01 | S | C-05, C-15 | AC-AUTH-01, AC-PDP-08 |
| C-18 | Listing P1 + header search: search, price sort/filters, "Load more" | 05 §4 (P1 rows), 02 FR-H-04 | M | C-11 · ⛔ S-12 | AC-LIST-03, AC-SHELL-08 |
| C-19 | PDP P1: quantity selector, cart stepper via `PATCH`, related products, sticky mobile bar | 06 §3.2 (FR-PDP-09, 13, 14) | M | C-12, C-14 · ⛔ S-12, S-13 | AC-PDP-07 |
| C-20 | `/wishlist` page (interim: filter list by `likedProducts`; switch to `/user/wishlist`) | 08 FR-W-03 | S | C-09 · S-14 optional | AC-WISH-03, 06 |
| C-21 | Gallery, specs table, category images + admin repeatable inputs | 10, 06 FR-PDP-02/07, 04 FR-C-03 | M | C-12, C-10 · ⛔ S-15 | AC-EXT-03, 05, AC-PDP-06 |
| C-22 | Telegram services + `useTelegramAuth` hook + panel (QR, code, resend, states), method tabs | 09 §4.3.3 items 1–3, §4.3.4 | L | C-15, C-17 · ⛔ S-18 (build against mocked `/user/telegram/*`) | Panel phase tests with mocked API |
| C-23 | Telegram complete-profile prefill/hint, profile sign-in methods card, phone-less display | 09 §4.3.3 items 4–6 | M | C-22 · ⛔ S-19 | AC-TG-07, 08 (UI half) |

## Quality lane (either developer, after Phase B)

| ID | Task | Sub-PRD | Needs | Done when |
| -- | ---- | ------- | ----- | --------- |
| Q-01 | Playwright on seed data: PRD §2.2 journeys, viewport matrix, keyboard path | 11 §3, §5 | S-04, C-08..C-15 | AC-A11Y-02, AC-RESP-01 |
| Q-02 | axe scans + reduced-motion run on Home, Listing, PDP, Cart, Auth | 11 §6 | Q-01 | AC-A11Y-01, 03 |
| Q-03 | Regression suite (PRD §12.11) incl. admin CRUD | 11 §4 | Q-01 | All green |
| Q-04 | Lighthouse on a production build; Telegram manual check through the VPN (P1) | 11 §5 NFR-09, §3.1 | All P0 | Release-ready per 11 §8 |

---

## Suggested two-lane schedule

Each row is a phase; the two columns run at the same time.

| Phase | Server lane | Client lane | Sync point |
| ----- | ----------- | ----------- | ---------- |
| A1 | S-01 → S-02, S-03 | C-01 → C-02 → C-03 | — |
| A2 | S-04, S-05, S-07, S-08 | C-04, C-05, C-06 | **Seed (S-04) ready** → client switches to local seed data |
| A3 | S-09, S-10 → S-11, S-06 | C-07, C-09, C-13, C-15 | — |
| B | *(P0 server done; start P1)* S-12, S-13, S-14 | C-08, C-10, C-11, C-12, C-14, C-16 | **Gates opened:** S-07/08/09/10 deployed → C-08, C-10, C-11, C-12, C-14 can ship |
| C1 | S-15, S-16 → S-17 | C-17, C-18, C-19, C-20 | S-12/13 deployed → C-18, C-19 ship |
| C2 | S-18 → S-19 | C-21, C-22 (mocked), C-23 | S-15 → C-21; S-18/19 → C-22, C-23 ship |
| D | Q-01..Q-04 together | | Release sign-off |

**Critical path:** S-01 → S-10 → S-11 (commerce correctness) on the server, and C-02 → C-03 → C-04 (design system) on the client. Almost every later task waits on one of these two, so start them first.

## Gate summary (client task → server task that must be deployed first)

| Client | Waits for | Fallback while waiting |
| ------ | --------- | ---------------------- |
| C-08 | S-08 | Header already degrades to guest on any fetch error |
| C-10 | S-09 | Fetch full list and slice on the server; hide "Most liked" |
| C-11 | S-07 | Don't link to unknown categories |
| C-12 | S-10 | Ship without the stock-rejection toast path |
| C-14, C-16, C-18, C-19, C-21, C-23 | see table | Keep unmerged |
| C-22 | S-18 | Develop against mocks; keep the Telegram tab hidden |
