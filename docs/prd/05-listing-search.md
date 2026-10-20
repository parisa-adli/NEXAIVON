# Sub-PRD 05 — Product Listing, Search, and Filters (`/products`)

|                |                                                                         |
| -------------- | ----------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §6.3, AC-LIST-01..06, FE-08, NFR-11                    |
| **Priority**   | P0 (P0-6); search, pagination, price and brand filters, price sort are P1 |
| **Repos**      | `client/`                                                               |
| **Depends on** | 01 (`ProductCard`, `Drawer`, states), 02 (header search), 03 (FR-API-03..06) |
| **Blocks**     | —                                                                       |
| **Status**     | Draft v1                                                                |

## 1. Goal

`/products` becomes the single canonical catalogue: browsable by category, sortable, searchable (P1), with correct prices and complete loading, empty, and error states.

## 2. Current state (summary)

`client/src/app/(user)/products/page.jsx` (`force-dynamic`): `CategorySidebar` (`ProductsFilter` checkboxes plus `ProductsSort` radios) and a 4-column grid showing **`price` only** (defect 2). There is no search UI, no empty state, no loading state, and errors are unhandled. An unknown category crashes the API with 500. A duplicate sort UI exists on the homepage (`SortProducts.jsx`).

## 3. URL contract

The URL is the single source of truth for listing state (AC-LIST-05).

| Param      | Values                                                     | Priority | Backend          |
| ---------- | ---------------------------------------------------------- | -------- | ---------------- |
| `category` | Comma-separated `englishTitle`s (existing contract), union | P0       | FR-API-06        |
| `sort`     | `latest` (default label "Newest"), `earliest`, `popular`    | P0 (`popular` only after FR-API-05) | FR-API-05 |
| `sort`     | `price_asc`, `price_desc`                                   | P1       | FR-API-05        |
| `search`   | 1–64 chars                                                 | P1       | FR-API-04        |
| `minPrice`, `maxPrice`, `brand` | —                                     | P1       | FR-API-05        |
| `page`     | ≥ 1, "Load more"                                           | P1       | FR-API-03        |

## 4. Requirements

| Feature            | Requirement                                                                                                                                       | Priority |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Grid and card      | Shared `ProductCard` (FR-F-01) with sale price (FR-F-02), stock badge, and wishlist. 2/3/4 columns at sm/lg/xl. The whole card is one link.           | P0       |
| Category nav       | Keep `?category=a,b`. Desktop uses a sidebar. Mobile uses a "Filters" button opening a `Drawer` (focus trap, Esc closes). Product-type categories only. | P0       |
| Sorting            | **One** sort control (reuse `ProductsSort`). Delete `SortProducts.jsx` (FE-08). Options: Newest, Oldest, and Most liked once FR-API-05 is fixed.          | P0       |
| Empty state        | "محصولی یافت نشد" plus "Clear filters" (resets to `/products`)                                                                                    | P0       |
| Error state        | `error.js` with retry                                                                                                                             | P0       |
| Loading            | `loading.js` skeleton grid                                                                                                                        | P0       |
| Pagination         | P0: render all (A3, < 100 products). P1: "Load more" with `page` and `limit`.                                                                     | P0 / P1  |
| Search             | Results heading "نتایج برای «…»". Combinable with category and sort.                                                                               | P1       |
| Price sort and filters | Price asc/desc, min/max price, brand                                                                                                             | P1       |
| Metadata           | `generateMetadata` for category-filtered views. Canonical URL ignores `sort` (NFR-11).                                                            | P0       |

**Data and rendering rules**

- Fetch in a Server Component and forward cookies (`toStringCookies`) so `isLiked` is correct. User-specific responses must not be cached across users (PRD §9.2).
- Prices shown are server values only (PRD §8.5).

## 5. Acceptance criteria

From the parent, verbatim:

- **AC-LIST-01** `?category=<valid>` shows only that category. Multiple categories union.
- **AC-LIST-02** `?category=<unknown>` shows the empty state (not 500).
- **AC-LIST-03** (P1) `?search=<term>` matches by title (and description if indexed). No match → empty state. *(With Q14 decided as regex, it matches title and brand.)*
- **AC-LIST-04** Sort updates the URL and order. "Most liked" is ordered by `likesCount` descending.
- **AC-LIST-05** Filters persist in the URL. Back and forward restore the state.
- **AC-LIST-06** At 360 px, filters open in a drawer that traps focus and closes on Esc.

Additional (derived):

- **AC-LIST-07** A product with `discount > 0` shows `offPrice` with `price` struck through. Otherwise it shows `price` only (FR-F-02).
- **AC-LIST-08** Only one sort component exists in the codebase (FE-08).

## 6. Decisions (PRD §15.1)

| #   | Decision                                                                                       |
| --- | ---------------------------------------------------------------------------------------------- |
| Q14 | Search uses escaped, case-insensitive regex on `title` and `brand`. Descriptions aren't searched. |

## 7. Risks

- **R5** Search 500s until FR-API-04 ships. The search UI is hidden until then.
- **R15** Persian search relevance.
