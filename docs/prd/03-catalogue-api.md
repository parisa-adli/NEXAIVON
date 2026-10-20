# Sub-PRD 03 — Catalogue API and Server Hardening

|                |                                                                                       |
| -------------- | ------------------------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §8.1, §8.3 (FR-API-03..06), §8.5, §9.3, NFR-14, NFR-15, R5, R7, R9, R10, R15 |
| **Priority**   | P0: FR-API-03 `limit`, FR-API-06, FR-API-17 (image upload), NFR-15, R7. P1: FR-API-03 pages, FR-API-04, FR-API-05 |
| **Repos**      | `server/`                                                                             |
| **Depends on** | — (a test harness from 11 is strongly recommended first)                              |
| **Blocks**     | 02 (categories, search), 04 (limits), 05 (listing), 06 (related products)              |
| **Status**     | Draft v1                                                                              |

## 1. Goal

Make the public catalogue read endpoints safe, bounded, and correct, so the storefront can request exactly what it renders. Close the two server exposures found during inspection.

Wishlist-related catalogue changes (FR-API-07/07b) are in sub-PRD 08. Model extensions (FR-API-08/09/11) are in sub-PRD 10.

## 2. Compatibility contract (applies to every item)

- **Additive only.** Existing request parameters and response fields keep their meaning (PRD §8.5).
- `GET /product/list` without parameters still returns **all** products. `generateStaticParams` and the admin dashboard (`client/src/services/data.js`) depend on this (§9.3).
- Admin calls to `GET /category/list` without params keep returning all categories.
- Errors use the existing envelope `{statusCode, message}` with Persian messages through `http-errors`. Inputs are validated with Joi following `server/app/http/validators/**`.

## 3. Requirements

### 3.1 FR-API-03 — Pagination and limits on `GET /product/list`

| Param     | Rule                                                      | Priority |
| --------- | --------------------------------------------------------- | -------- |
| `limit`   | Integer 1–48. Omitted = unlimited (backward compatible)   | P0       |
| `page`    | Integer ≥ 1. Only meaningful with `limit`                 | P1       |
| `exclude` | Product ObjectId to leave out (related products)          | P1       |

- When `limit` is supplied, the response adds `data.pagination {page, limit, total, totalPages}`. `data.products` is unchanged.
- Non-numeric or out-of-range values → 400.

### 3.2 FR-API-04 — Search (P1; P0 only if search ships in P0)

- **Decided (Q14): escaped, case-insensitive regex on `title` and `brand`** (suits a small catalogue, A3, and Persian text, R15). It replaces the current `$text` query. No text index is added.
- `search` is validated to 1–64 characters and regex-escaped. Today `$text` is used with no declared index (R5), so this item must land before any search UI.

### 3.3 FR-API-05 — Sorting and filters

| Item                                                 | Priority                              |
| ---------------------------------------------------- | ------------------------------------- |
| `sort=popular` orders by like count (`$size: "$likes"` aggregation or a maintained `likesCount` with a backfill from `likes.length`) | P0 if "Most liked" ships; else P1 |
| `sort=price_asc` / `price_desc` on effective price `offPrice` | P1                            |
| `minPrice`, `maxPrice`, `brand` (comma-separated)    | P1                                    |
| Invalid `sort` → default ordering (no error)          | with the above                        |

### 3.4 FR-API-06 — Safe category handling (P0)

- `GET /product/list?category=`: unknown `englishTitle`s are ignored. If none match, return `products: []` with 200, not 500.
- `GET /category/list`: **whitelist** query keys (`type`, `parentId`) instead of passing `req.query` into `find`. This closes R10 (query-operator injection on a public endpoint). The storefront calls `?type=product`.

### 3.5 NFR-15 — Static file exposure (P0, P0-13)

- `express.static(path.join(__dirname, ".."))` in `server/app/server.js` serves the whole `server/` directory, source included (R9).
- Restrict it to the dedicated public uploads folder created for FR-API-17 (§3.7). First identify which files, if any, are actually meant to be served statically today, and move them there.

### 3.7 FR-API-17 — Image upload (P0, decided Q13)

- An admin-only endpoint (`verifyAccessToken` + `authorize("ADMIN")`) accepts product and category images.
- Files are stored on the server's **local disk** in the dedicated public uploads folder, the only folder served by `express.static` (§3.5).
- The response returns the public URL, which the admin form stores in `imageLink`, `images[].url` (sub-PRD 10), or `icon.*`.
- File type and size limits, and the file-naming scheme, are set at implementation. Uploaded files must never be able to overwrite source files or escape the uploads folder.
- The server host must provide persistent disk storage **[Unverified: hosting]**.
- Client: `next.config.js` `remotePatterns` adds the API host. The two existing external hosts stay allowed so existing products keep rendering.
- Admin: `ProductForm.jsx` and the category form get an upload input. This is a minimal admin dependency, not a redesign.

### 3.6 R7 — Optional auth with an expired token (P0)

- `decideAuthMiddleware` calls `verifyAccessToken` whenever an `accessToken` cookie exists, so an expired cookie makes public catalogue reads return 401 (**[runtime Unverified]**).
- Required behaviour: on optional-auth routes, an invalid or expired token is treated as a guest (no `req.user`), not as a 401. Required-auth routes are unchanged.
- This satisfies AC-ERR-03 from the server side. Clients may still add RSC 401 handling as defence in depth.

## 4. Acceptance criteria

- **AC-API-01** `GET /product/list` with no params returns the same products and fields as before the change.
- **AC-API-02** `?limit=4&sort=latest` returns at most 4 products, newest first, with `pagination.total` equal to the catalogue size.
- **AC-API-03** `?limit=0`, `?limit=49`, and `?limit=abc` → 400 with a Persian message.
- **AC-API-04** `?category=unknown` → 200 with `products: []` (AC-ERR-02, AC-LIST-02).
- **AC-API-05** `GET /category/list?type[$ne]=product` does not apply an operator. Unknown keys are ignored.
- **AC-API-06** `?sort=popular` returns products in descending `likesCount` order (AC-LIST-04).
- **AC-API-07** (P1) `?search=<title fragment>` returns the matching product, and a regex metacharacter input such as `.*` does not match everything.
- **AC-API-08** `GET /app/server.js` (and any other source path) is not served.
- **AC-API-09** A request to `GET /product/list` with an expired `accessToken` cookie returns 200 with guest data (`isLiked` false).
- **AC-API-10** An admin uploads an image and gets back a URL that renders through `next/image`. A non-admin upload returns 401 or 403. A disallowed file type is rejected with 400.
- All covered by Supertest integration tests (sub-PRD 11).

## 5. Decisions (PRD §15.1)

| #   | Decision                                                              |
| --- | --------------------------------------------------------------------- |
| Q13 | Server uploads on local disk (FR-API-17, P0). Existing hosts kept.    |
| Q14 | Escaped, case-insensitive regex search on `title` and `brand`.        |

## 6. Risks

- **R5**, **R7**, **R9**, **R10**, **R15** (PRD §13).
- Local-disk uploads are lost if the server host has no persistent storage. Confirm this before deploying.
