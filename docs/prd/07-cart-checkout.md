# Sub-PRD 07 — Cart, Checkout, and Stock Correctness

|                |                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §4.6, §6.4 (FR-CART-01..08), §8.2 (FR-API-01, 01b, 02, 15, 16), §9.2, AC-CART-01..07, R1–R4, R13 |
| **Priority**   | P0 (P0-7, P0-8). FR-API-02 and the set-quantity UI are P1. Guest cart FR-CART-07 is P2 (sub-PRD 12)       |
| **Repos**      | `server/` (ships first), then `client/`                                                                 |
| **Depends on** | 01 (`QuantityStepper`, `Price`, states)                                                                 |
| **Blocks**     | 06 (FR-PDP-09, FR-PDP-11), 12 (best sellers need FR-API-16)                                             |
| **Status**     | Draft v1                                                                                                |

## 1. Goal

Correct commerce behaviour (objective O3): no add-to-cart beyond stock, displayed totals equal server totals, stock never goes negative. Also a redesigned cart page that works for every signed-in user, including coupons for non-admins.

## 2. Current state (summary)

PRD §4.6 and §4.7. Server-side cart only, signed-in only. `POST /cart/add` has **no stock check** (R1). `POST /payment/create` marks the order paid with no gateway (R3), decrements `countInStock` **by 1 per distinct product, with no floor** (R2). A stale coupon may make `getUserCartDetail` read `null.newProductDetail` (R4). The UI looks coupons up in admin-only `GET /admin/coupon/list`, so non-admins crash (defect 1). The cart page assumes `user.cart` exists (defect 4).

## 3. Server requirements (ship before the client)

### 3.1 FR-API-01 — Stock validation (P0)

- `POST /cart/add` rejects with 400 when `countInStock <= 0` or when the resulting quantity would exceed `countInStock`. Message, for example: "موجودی این محصول کافی نیست".
- `POST /payment/create` re-validates **every** line (product exists, `quantity <= countInStock`) before creating anything. On failure: 400, no payment, no stock change, cart untouched.

### 3.2 FR-API-01b — Stock in cart detail (P0)

- `getUserCartDetail` projects per-line `countInStock` into `productDetail[]`. Additive.

### 3.3 FR-API-15 — Null-coupon guard (P0)

- When the applied coupon is no longer valid (expired, limit reached, inactive), the `discountDetail` stage returns `{ newProductDetail: productDetail, coupon: null }` instead of `null`. Optionally unset the stale `cart.coupon`.

### 3.4 FR-API-16 — Quantity-aware stock decrement (P0)

- `POST /payment/create` decrements `countInStock` by each line's `quantity`.
- Per product, use a conditional `updateOne({_id, countInStock: {$gte: qty}}, {$inc: {countInStock: -qty}})`. If any line fails, abort before creating the payment. Use a transaction only if the deployment is a replica set (**[Unverified]**, A4). Without a transaction, compensate (re-increment) the lines already decremented.
- Edge cases: a product deleted while in the cart, and a coupon that became invalid between view and order (R4).

### 3.5 FR-API-02 — Set quantity (P1)

- `PATCH /api/cart/quantity`, `verifyAccessToken`, body `{productId, quantity}`.
- Joi: integer, `1 ≤ quantity ≤ countInStock`. No separate max-per-order cap (Q8 decided). The product must exist and be in the cart, otherwise 400.
- Response: `{statusCode: 200, data: {message, cart}}`, where `cart` is the `getUserCartDetail` output (same shape as the coupon endpoints).
- `/cart/add` and `/cart/remove` remain.

## 4. Client requirements

| ID             | Requirement                                                                                                                                                                   | Priority | Needs           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------- |
| **FR-CART-01** | Redesign: lines with image (`imageLink`), title, unit price (sale and original), `QuantityStepper`, line total, remove. Summary with gross, discount, coupon, and payable from `payDetail`. | P0       | 01              |
| **FR-CART-02** | Coupon: call `POST /cart/coupon {couponCode}` directly and show the server's message. **Remove `useGetCoupons` / `GET /admin/coupon/list`** from the cart. Remove the coupon via `DELETE /cart/coupon`. | P0 (bug) | —               |
| **FR-CART-03** | A user without a `cart` subdocument is treated as an empty cart.                                                                                                            | P0 (bug) | —               |
| **FR-CART-04** | "+" disabled at stock. The server rejection is shown as a toast.                                                                                                              | P0       | FR-API-01, 01b  |
| **FR-CART-05** | Lines that are out of stock or deleted are flagged, and "Place order" is blocked until they're resolved.                                                                       | P0       | FR-API-01, 01b  |
| **FR-CART-06** | Displayed totals are **only** `payDetail` values. The client never recomputes payable amounts.                                                                                 | P0       | —               |
| **FR-CART-08** | "Place order" keeps the current behaviour. The button and confirmation copy label it clearly as a **demo order with no real payment** (Q10 decided).                         | P0       | —               |
| —              | (P1) Stepper uses `PATCH /cart/quantity` for direct entry.                                                                                                                    | P1       | FR-API-02       |

- Mutations invalidate `["get-user"]`, so the header badge (FR-H-02) and the cart stay in sync (FE-07).
- Empty cart uses `EmptyState` with a link to `/products`. Guests see a sign-in prompt using `/auth?next=/cart` (FR-AUTH-01, sub-PRD 09).

## 5. Pricing invariant (Q16 decided, R13) — P0

`getUserCartDetail` charges `offPrice × quantity`. For a non-discounted product the admin must set `offPrice = price`, and nothing enforces it today.

**Decision: the server computes `offPrice`.**

- On product create and update: `offPrice = Math.round(price × (1 − discount / 100))` (nearest whole Toman). With `discount = 0`, `offPrice = price`.
- `offPrice` is no longer accepted from the admin form. The Joi schema drops it and `ProductForm.jsx` removes the field or makes it read-only (a minimal admin change).
- A one-off migration recomputes `offPrice` for all existing products. Run it before the storefront shows sale prices.
- Response shapes are unchanged: `offPrice` is still returned.

## 6. Acceptance criteria

From the parent, verbatim:

- **AC-CART-01** A signed-in user with no cart subdocument sees the empty state, not an error.
- **AC-CART-02** "+" adds 1 and the totals update to the server values. At `quantity = countInStock`, "+" is disabled and a forced request returns 400.
- **AC-CART-03** "−" at quantity 1 removes the line. Emptying the cart clears the coupon.
- **AC-CART-04** A non-admin can apply a valid coupon. Invalid, expired, exhausted, and non-applicable codes show the server's message.
- **AC-CART-05** Displayed totals equal `payDetail.totalGrossPrice`, `totalOffAmount`, and `totalPrice` exactly.
- **AC-CART-06** Ordering a line above stock fails with 400, with no payment created and no stock change.
- **AC-CART-07** After a successful order, each product's `countInStock` decreases by the ordered quantity and never goes below 0.

Additional (derived):

- **AC-CART-08** With an applied coupon that has since expired, `GET /user/profile` returns 200 and totals are computed without the coupon (FR-API-15).
- **AC-CART-09** Two concurrent orders for the last unit: exactly one succeeds (FR-API-16).
- **AC-CART-10** Regression: a successful order still creates a `COMPLETED` payment and empties the cart (PRD §12.11).
- **AC-CART-11** Saving a product with `price = 1,000,000` and `discount = 15` stores `offPrice = 850,000`. With `discount = 0`, `offPrice = price` (Q16).

## 7. Decisions (PRD §15.1)

| #   | Decision                                                                           |
| --- | ---------------------------------------------------------------------------------- |
| Q7  | Low stock is 1–3 units with the exact count, same as the PDP (`StockBadge`)        |
| Q8  | No max-per-order cap                                                               |
| Q10 | Keep the simulated order and label it as a demo order. No gateway                  |
| Q16 | `offPrice` computed by the server, rounded to the nearest whole Toman              |

## 8. Risks

- **R1**, **R2**, **R4**: resolved by this sub-PRD.
- **R3** No gateway: mitigated by demo-order copy (FR-CART-08).
- **R13** Manual `offPrice`: resolved by §5.
- **R16** The client must not ship FR-CART-04/05 before FR-API-01/01b are deployed.
