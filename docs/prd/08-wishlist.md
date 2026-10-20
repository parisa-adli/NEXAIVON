# Sub-PRD 08 — Wishlist

|                |                                                                         |
| -------------- | ----------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §6.5 (FR-W-01..04), §8.3 FR-API-07/07b, AC-WISH-01..03, NFR-14 |
| **Priority**   | P0 (P0-9): FR-W-01, FR-W-02. P1: FR-W-03 page, FR-API-07/07b              |
| **Repos**      | `client/`; `server/` for FR-API-07/07b                                  |
| **Depends on** | 01 (`WishlistButton`, `ProductCard`)                                    |
| **Blocks**     | 06 (FR-PDP-12), 02 (FR-H-03 target page)                                |
| **Status**     | Draft v1                                                                |

## 1. Goal

Present the existing server-persisted "likes" as a wishlist with instant, consistent feedback everywhere a product appears, plus a page that lists it. Stop leaking other users' IDs.

## 2. Current state (summary)

`POST /product/like/:id` toggles `Product.likes` and `User.likedProducts`. The list endpoint returns `isLiked` and `likesCount`. Detail endpoints return the raw `likes[]` (other users' IDs). The UI uses a thumbs-up (`LikeProduct.jsx`) and calls `router.refresh()` after toggling. There is no wishlist page.

## 3. Client requirements

| ID          | Requirement                                                                                                   | Priority |
| ----------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| **FR-W-01** | Heart icon, label "علاقه‌مندی", same endpoint.                                                                  | P0       |
| **FR-W-02** | Optimistic toggle with rollback and an error toast (NFR-13), `aria-pressed`, guests redirected to `/auth` (with `next` once FR-AUTH-01 lands). | P0       |
| **FR-W-03** | `/wishlist` page (signed in) showing a `ProductCard` grid, `EmptyState` when empty, guests redirected to auth.        | P1       |

**Implementation notes**

- Add a `useToggleWishlist` hook (FE-07) that updates the `["get-user"]` cache optimistically (`user.likedProducts`) and invalidates it on settle. Replace `router.refresh()`.
- **Single source of truth for "is liked" on the client:** `useGetUser().user.likedProducts`. This keeps card, PDP, and wishlist page consistent (AC-WISH-03) and works on cached or ISR pages (sub-PRD 06 §3.4).
- Interim wishlist page data: filter `GET /product/list` by `likedProducts` IDs (acceptable under A3). Switch to FR-API-07b when it's available.

## 4. Server requirements (P1)

### FR-API-07 / FR-W-04 — Wishlist state on detail

- `GET /product/slug/:slug` and `GET /product/:id` return `isLiked` (when authenticated) and `likesCount`, and **omit `likes[]`** for non-admin callers.
- **Before removal:** check `client/src/app/(admin)/admin/products/[id]/page.jsx` and any other admin consumer for `likes` usage (**[Unverified]** in the parent).

### FR-API-07b — Wishlist endpoint

- `GET /api/user/wishlist`, `verifyAccessToken`, returns `data.products[]` in the list-card shape (same fields as `GET /product/list`) for `user.likedProducts`.

## 5. Acceptance criteria

From the parent, verbatim:

- **AC-WISH-01** Toggling on a card updates the icon immediately. After a reload the state matches the server.
- **AC-WISH-02** A guest toggling is redirected to `/auth`.
- **AC-WISH-03** The same product shows the same state on the listing, PDP, and wishlist page.

Additional (derived):

- **AC-WISH-04** With the network failing, a toggle reverts and shows a Persian error toast (FR-W-02, AC-PDP-09).
- **AC-WISH-05** (P1) A non-admin detail response contains no `likes` field (FR-W-04, NFR-14).
- **AC-WISH-06** (P1) `/wishlist` lists exactly the user's liked products. Un-liking removes the card from the page.

## 6. Risks

- Optimistic cache updates race with the header's `get-user` refetch. Cancel in-flight queries before applying the optimistic update (the standard React Query pattern).
