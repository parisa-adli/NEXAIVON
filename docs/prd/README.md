# NEXAIVON Storefront Upgrade — Sub-PRDs

This folder decomposes the parent [PRD](../PRD.md) into independently plannable and deliverable slices.

**Rules for these documents**

- The parent PRD remains the source of truth for evidence (**[Verified]** findings, file paths, endpoint inventory). Sub-PRDs reference it as `PRD §x.y` instead of repeating it.
- Requirement IDs (`FR-*`, `FE-*`, `NFR-*`, `AC-*`, `Q*`, `R*`, `A*`) are **kept verbatim** from the parent. No sub-PRD invents a new requirement; each one only groups, sequences, and clarifies ownership.
- Evidence labels (**[Verified]**, **[Proposed]**, **[Open]**, …) keep the meaning defined in PRD §0.1.
- If a sub-PRD and the parent disagree, fix the parent first and then propagate.

## Index

| #   | Sub-PRD                                                                    | Priority | Repos            | Depends on     |
| --- | -------------------------------------------------------------------------- | -------- | ---------------- | -------------- |
| 01  | [Design system and brand foundation](01-design-system.md)                  | P0       | client           | —              |
| 02  | [App shell: header, navigation, footer, route states, SEO](02-app-shell.md) | P0 / P1  | client           | 01, 03         |
| 03  | [Catalogue API and server hardening](03-catalogue-api.md)                  | P0 / P1  | server           | —              |
| 04  | [Homepage](04-homepage.md)                                                 | P0       | client           | 01, 02, 03     |
| 05  | [Product listing, search, and filters](05-listing-search.md)               | P0 / P1  | client           | 01, 02, 03     |
| 06  | [Product detail page](06-product-detail.md)                                | P0 / P1  | client           | 01, 03, 07, 08 |
| 07  | [Cart, checkout, and stock correctness](07-cart-checkout.md)               | P0 / P1  | client + server  | 01             |
| 08  | [Wishlist](08-wishlist.md)                                                 | P0 / P1  | client + server  | 01             |
| 09  | [Authentication: return-to and restyle](09-auth.md)                        | P0 / P1  | client           | 01             |
| 10  | [Catalogue data extensions: gallery, specs, category images](10-catalogue-data-extensions.md) | P1 | server + admin + client | 03, 06 |
| 11  | [Quality: seed data, tests, accessibility, performance](11-quality.md)     | P0       | client + server  | spans all      |
| 12  | [Future backlog (P2)](12-future-backlog.md)                                | P2       | client + server  | 07, 10         |

## Delivery order

```
Phase A (foundations, parallel)
  01 Design system ─────────────┐
  03 Catalogue API (P0 part) ───┤      11 Seed data + server test harness (start early)
  07 Server correctness (BE) ───┤
                                ▼
Phase B (storefront P0)
  02 App shell ──► 04 Homepage
               ├─► 05 Listing (P0)
               ├─► 06 PDP (P0)  ◄── 08 Wishlist (P0)
               ├─► 07 Cart UI
               └─► 09 Auth restyle
                                ▼
Phase C (P1)
  03 search/sort/pagination ──► 05 P1      10 gallery/specs/category images ──► 06 P1, 04
  07 set-quantity ──► 06 quantity selector  08 wishlist page   09 return-to
                                ▼
Phase D: 11 full regression + Lighthouse/axe sign-off, then 12 as needed
```

Because `client/` and `server/` deploy independently (R16), every server change ships **before** the client feature that relies on it, and every server change is additive (PRD §8.5).

## Traceability: parent P0 items → sub-PRDs

| Parent item (PRD §11.1)            | Sub-PRD    |
| ---------------------------------- | ---------- |
| P0-1 Brand application             | 01, 02     |
| P0-2 Shared UI components          | 01         |
| P0-3 Header, mobile nav, footer    | 02, 03     |
| P0-4 Homepage                      | 04         |
| P0-5 PDP redesign                  | 06         |
| P0-6 Listing                       | 05, 03     |
| P0-7 Stock and price correctness   | 07         |
| P0-8 Cart redesign and coupon fix  | 07         |
| P0-9 Wishlist presentation         | 08         |
| P0-10 Route boundaries             | 02         |
| P0-11 Accessibility and responsive | 01, 11     |
| P0-12 Smoke tests and seed data    | 11         |
| P0-13 Static exposure fix          | 03         |
| P0-14 OTP singleton-state fix      | 09         |
| P0-15 Server image upload          | 03, 10     |
| P0-16 Server-computed `offPrice`   | 07         |

## Decisions

All open questions were resolved with the project owner on 2026-10-20. The full decision table is in [PRD §15.1](../PRD.md). Each sub-PRD lists the decisions that affect it.

| Question | Applied in | Question | Applied in |
| -------- | ---------- | -------- | ---------- |
| Q2       | 02         | Q11      | 01         |
| Q3       | 01         | Q12      | 06         |
| Q4       | 01         | Q13      | 03, 10, 01 |
| Q5       | 02, 06     | Q14      | 03, 05     |
| Q6       | 04         | Q15      | 12         |
| Q7       | 06, 07     | Q16      | 07, 11     |
| Q8       | 07, 06     | Q17      | 11         |
| Q9       | 06         | Q18      | 09         |
| Q10      | 07         | Q19      | 11, 04     |
| Dev OTP  | 09, 11     |          |            |
