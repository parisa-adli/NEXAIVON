# PRD — NEXAIVON Storefront Upgrade

|                          |                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Document**             | Product Requirements Document: customer-facing storefront upgrade                                                    |
| **Project / brand name** | NEXAIVON (see §5.1)                                                                                                  |
| **Repositories covered** | `client/` (git remote `parisa-adli/Next.js-next-shop-panel`), `server/` (git remote `parisa-adli/next-shop-backend`) |
| **Status**               | Draft v1. For design and implementation planning                                                                     |
| **Date**                 | 2026-10-20                                                                                                           |
| **UI locale decision**   | Keep **Persian (fa) / RTL** for the storefront (decided by the project owner). This PRD is written in English.       |

---

## 0. How to read this document

### 0.1 Evidence labels

Every statement about the current system carries one of these labels:

| Label            | Meaning                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| **[Verified]**   | Confirmed by reading the source code at the path cited.                                                           |
| **[Unverified]** | Could not be confirmed from source alone (for example runtime database state, deployment, third-party behaviour). |
| **[Proposed]**   | New requirement or change suggested by this PRD. It does not exist today.                                         |
| **[Assumption]** | A working assumption that needs confirmation. Listed again in §15.                                                |
| **[Open]**       | An unresolved decision. All are now resolved; see §15.1.                                                          |

### 0.2 Inspection method and limits

- I read every source file in `client/src`, `client/` config files, and every file in `server/app`, `server/utils`, and `server/index.js`.
- I did **not** run the applications, connect to MongoDB, or call any endpoint. Behaviour that depends on runtime state (database indexes, existing data, the SMS provider, deployment) is marked **[Unverified]**.
- Secrets in `.env` files were not read into this document. Only variable **names** are referenced.
- Paths below are relative to the repository root `NEXAIVON/`. Client route-group folders are written as they appear on disk, for example `client/src/app/(user)/products/page.jsx`.

---

## 1. Product vision and objectives

### 1.1 Vision

Upgrade **NEXAIVON** into a polished consumer-electronics and gadgets storefront suitable for a professional developer portfolio. The presentation combines:

- **Apple-inspired product presentation:** large product imagery, generous whitespace, calm typography, and a short, obvious path to purchase.
- **Awwwards-inspired art direction, used sparingly:** one or two expressive editorial sections, strong contrast blocks, and subtle motion that never blocks shopping.

The upgrade must stay practical: accessible, responsive, fast, RTL-correct, and faithful to the server's business rules.

### 1.2 Objectives

| #   | Objective                                                                                | Measured by                                                                                               |
| --- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| O1  | A distinctive, coherent visual identity across homepage, listing, product page, and cart | Design-token adoption (§5.4); visual review against acceptance criteria (§12)                             |
| O2  | A complete, trustworthy product presentation                                             | Product page shows image, price/sale price, stock state, and description, all sourced from the API (§6.2) |
| O3  | Correct commerce behaviour                                                               | No add-to-cart beyond stock; totals equal server totals; stock never goes negative (§8)                   |
| O4  | Accessible and performant                                                                | WCAG 2.2 AA contrast; keyboard operable; Lighthouse targets in §10                                        |
| O5  | No regressions                                                                           | Existing auth, cart, coupon, payment, profile, and admin flows keep working (§12.11)                      |

---

## 2. Target users and journeys

### 2.1 Users

| User                   | Description                                   | Current support                                                                                                                                                       |
| ---------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Guest shopper**      | Persian-speaking visitor browsing electronics | Can browse the homepage, listing, and product pages. Cannot add to cart (redirected to `/auth`). **[Verified]** `client/src/app/(user)/products/[slug]/AddToCart.jsx` |
| **Signed-in shopper**  | Logged in via phone OTP                       | Server-side cart, likes ("wishlist"), coupons, order placement, profile. **[Verified]**                                                                               |
| **Admin**              | User with `role === "ADMIN"`                  | Admin panel at `/admin` for products, categories, coupons, users, payments. **Out of scope to redesign; must be preserved.** **[Verified]**                           |
| **Portfolio reviewer** | Recruiter or engineer evaluating the project  | Not a system role. Drives the quality bar for design, accessibility, and code. **[Assumption]**                                                                       |

### 2.2 Key journeys (target state)

1. **Discover → product → cart (guest):** Home → category card → listing → product page → "Add to cart" → prompted to sign in → after OTP, returned to the product page (return-to is **[Proposed]**; today the user is sent to `/` or `/complete-profile`, see `client/src/app/(user)/auth/page.jsx`).
2. **Search (any user):** Header search → results listing → product page. Search UI is **[Proposed]**. The backend `search` parameter exists but its index is **[Unverified]** (§8.3).
3. **Wishlist (signed in):** Toggle the heart on a card or product page → the state persists across pages. A "My wishlist" page is **[Proposed]**.
4. **Checkout (signed in):** Cart → adjust quantity → apply coupon → "Place order". The flow is preserved. Correctness fixes are **[Proposed]** (§8.2).

---

## 3. Scope and non-goals

### 3.1 In scope

- Customer-facing pages in the `(user)` route group: `/`, `/products`, `/products/[slug]`, `/cart`, `/auth`, `/complete-profile`. The shared `Header.jsx` and a new footer are also in scope.
- A design-system refresh: tokens, typography, reusable UI components.
- Backend changes **only where a storefront requirement depends on them**, each documented in §8.
- Correctness fixes to price and stock handling that the storefront relies on.

### 3.2 Non-goals

- Redesigning the **admin panel** `(admin)` or **profile panel** `(profile)`. They must keep working and may inherit tokens, but they get no new layout work. Minimal admin form additions needed to _enter_ new product data (for example multiple images) are listed as dependencies, not as redesigns.
- Replacing **authentication** (phone OTP via Kavenegar plus JWT cookies).
- Integrating a **real payment gateway**. The current "payment" records an order as paid without a gateway (§4.4). **Decided (Q10):** keep the simulated order and label it clearly as a demo order. No gateway is integrated in this project.
- Changing the UI locale away from Persian/RTL.
- Inventing business policies such as shipping times, returns, warranties, or store address (Q5: kept hidden).

---

## 4. Existing system overview

### 4.1 Architecture

```
Browser ──(Next.js 15 App Router, RSC + client components)── client/
   │  axios (withCredentials) → NEXT_PUBLIC_API_URL  (e.g. http://localhost:5000/api per .env.example)
   ▼
Express 4 API (server/app/server.js) ── /api/* ── Mongoose 7 ── MongoDB (APP_DB)
   │                                     └─ Kavenegar SMS (OTP)
   └─ Auth: JWT in signed, httpOnly cookies `accessToken` (1 day) / `refreshToken` (1 year)
```

### 4.2 Client (`client/`) [Verified]

| Area         | Finding                                                                                                                                                                | Evidence                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Framework    | Next.js `15.2.2` App Router, React `^18.3.1`, JavaScript (no TypeScript)                                                                                               | `client/package.json`                                                                               |
| Data         | `@tanstack/react-query ^5.69`, `axios ^1.8`, `query-string`                                                                                                            | `client/package.json`, `client/src/app/Providers.jsx`                                               |
| Forms        | `react-hook-form` (only in `complete-profile`); other forms use controlled `useState`                                                                                  | `client/src/app/(user)/complete-profile/page.jsx`                                                   |
| Styling      | Tailwind `3.3.2` with CSS-variable tokens (`--color-primary-*` blue, `--color-secondary-*` gray, success/warning/error), class-based dark mode (`dark-mode`)           | `client/tailwind.config.js`, `client/src/app/globals.css`, `client/src/context/DarkModeContext.jsx` |
| Fonts        | Vazirmatn (local woff2, weights 400–900, `display: "block"`)                                                                                                           | `client/src/constants/localFonts.js`                                                                |
| Icons        | `react-icons`                                                                                                                                                          | various                                                                                             |
| Feedback     | `react-hot-toast`, `react-loader-spinner` (`ThreeDots`)                                                                                                                | `client/src/common/Loading.jsx`                                                                     |
| Images       | `next/image`; `remotePatterns` allow **only** `dkstatics-public.digikala.com` and `rasanika.com`                                                                       | `client/next.config.js`                                                                             |
| Auth guard   | `middleware.js` protects `/profile/*` and `/admin/*` by calling `GET /user/profile`                                                                                    | `client/src/middleware.js`, `client/src/utils/middlewareAuth.js`                                    |
| Layouts      | Each route group has its **own root `<html>` layout**: `(user)/layout.jsx`, `(profile)/profile/layout.jsx`, `(admin)/admin/layout.jsx`. All are `lang="fa" dir="rtl"`. | files listed                                                                                        |
| Metadata     | Static `metadata` only (`title: "NEXAIVON"`). No `generateMetadata`.                                                                                                   | `client/src/app/(user)/layout.jsx`                                                                  |
| Route states | No `loading.js`, `error.js`, or `not-found.js` files anywhere in `src/app`                                                                                             | directory listing                                                                                   |
| Tests        | **None** (no test files, no test runner, no `test` script)                                                                                                             | `client/package.json`, file search                                                                  |
| Deploy       | README says Vercel; `netlify.toml` also exists (`publish = "out"`). The real target is **[Unverified]**.                                                               | `client/README.md`, `client/netlify.toml`                                                           |

**Storefront routes and components [Verified]:**

| Route                   | File                                      | Rendering                                                                                 | What it shows today                                                                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                     | `(user)/page.jsx`                         | Dynamic (LoadProducts uses `cookies()`, `force-dynamic`)                                  | `LatestProducts`: 5 newest products as text cards (title, created date, link, AddToCart; **no image or price**), sorted client-side. `SortProducts` tabs. `LoadProducts`: the full product grid (title, date, Like, link, AddToCart; **no image or price**). |
| `/products`             | `(user)/products/page.jsx`                | `force-dynamic`                                                                           | `CategorySidebar` (category checkboxes from `ProductsFilter` plus sort radios from `ProductsSort`) and a grid with image, title, Like, **`price` only (ignores sale price)**, AddToCart.                                                                     |
| `/products/[slug]`      | `(user)/products/[slug]/page.jsx`         | **`force-static`, `dynamicParams = false`, `generateStaticParams` from the product list** | Breadcrumbs, single image, title, description, price, discount badge plus `offPrice` when `discount > 0`, AddToCart. **No stock, brand, or category display.**                                                                                               |
| `/cart`                 | `(user)/cart/page.jsx` (client component) | Client                                                                                    | `CartItem` (+/− buttons, trash at quantity 1) and `CartSummary` (gross total, coupon input, discount, payable, "Place order").                                                                                                                               |
| `/auth`                 | `(user)/auth/page.jsx`                    | Client                                                                                    | Two-step OTP (`SendOTPForm`, `CheckOTPForm`), 90 s resend timer.                                                                                                                                                                                             |
| `/complete-profile`     | `(user)/complete-profile/page.jsx`        | Client                                                                                    | Name and email (react-hook-form).                                                                                                                                                                                                                            |
| Header (all user pages) | `client/src/app/Header.jsx`               | Client                                                                                    | Logo `/shop.png` plus "NEXAIVON", "Products" link (**hidden below `sm`** in the current working tree), dark-mode toggle, user dropdown or login link, cart icon with a badge of distinct item count.                                                         |

**Reusable building blocks [Verified]:** `common/BreadCrumbs`, `Button` (always `type="submit"`), `CheckBox`, `RadioInput`, `Drawer` (portal, right side), `Modal`, `DropDown`, `Loading`, `Fallback`, `TextField`, `RHFTextField`, `DarkModeToggle`. Also: hooks `useGetUser` (`hooks/useAuth.js`), `useAddToCart`/`useDecrementFromCart` (`hooks/useCart.js`), `useAddCouponToCart` (`hooks/useCoupons.js`), and `useOutsideClick`. Utilities: `toPersianNumbers`, `toPersianNumbersWithComma` (`utils/toPersianNumber.js`), `toLocalDateString*` (`utils/toLocalDate.js`), `toStringCookies`, `setCookieOnReq`.

**Client API layer [Verified]:** `client/src/services/httpService.js` creates an axios instance (`baseURL = NEXT_PUBLIC_API_URL`, `withCredentials`). On a 401 it retries once after `GET /user/refresh-token`. Service modules: `productService.js`, `categoryService.js`, `cartService.js`, `couponServices.js`, `authServices.js`, `paymentService.js`.

### 4.3 Server (`server/`) [Verified]

| Area              | Finding                                                                                                                                                                                                              | Evidence                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Framework         | Express `^4.18`, Mongoose `^7.1`, Joi `^17.9`, `jsonwebtoken`, `cookie-parser` (signed cookies), `http-errors`, `kavenegar`, `moment-jalali`                                                                         | `server/package.json`                  |
| Entry             | `server/index.js` → `server/app/server.js` (`Application` class). Routes are mounted at `/api`. CORS uses `ALLOW_CORS_ORIGIN` with credentials.                                                                      | `server/app/server.js`                 |
| Static files      | `express.static(path.join(__dirname, ".."))` serves the **whole `server/` directory**                                                                                                                                | `server/app/server.js`                 |
| Response envelope | Success: `{ statusCode, data: {...} }`. Error: `{ statusCode, message }`. Messages are in Persian.                                                                                                                   | controllers, `server.js` error handler |
| Auth middleware   | `verifyAccessToken` (required); `decideAuthMiddleware` (optional: verifies only if an `accessToken` cookie exists); `authorize(...roles)`                                                                            | `server/app/http/middlewares/*.js`     |
| Validation        | Joi schemas for admin product/category/coupon and user OTP/profile                                                                                                                                                   | `server/app/http/validators/**`        |
| Scripts           | `dev` (nodemon), `start`. No test, lint, or seed scripts.                                                                                                                                                            | `server/package.json`                  |
| Tests / seed      | **None**                                                                                                                                                                                                             | file search                            |
| Env names         | `APP_DB, KAVENEGAR_API_KEY, ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY, COOKIE_PARSER_SECRET_KEY, TOKEN_SECRET_KEY, ZARINPAL_CALLBACK_URL, CLIENT_URL, SERVER_URL, NODE_ENV, PORT, ALLOW_CORS_ORIGIN, DOMAIN` | `server/.env` (names only)             |

### 4.4 Endpoint inventory (all under `/api`) [Verified]

| Method | Path                                              | Auth           | Controller                               | Notes                                                                                                                                                                                                                                                                                                                                            |
| ------ | ------------------------------------------------- | -------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/product/list`                                   | optional       | `ProductController.getListOfProducts`    | Query: `search` (`$text`), `category` (comma-separated `englishTitle`s), `sort` = `latest` \| `earliest` \| `popular` (default: `createdAt` ascending). `type` is read but unused. **No pagination or limit.** Response `data.products[]`: product fields plus `category {_id,title,englishTitle}`, `likesCount`, `isLiked`. `likes` is removed. |
| GET    | `/product/slug/:slug`                             | optional       | `getOneProductBySlug`                    | `data.product` with `category {title, icon, englishTitle}`. **Returns the raw `likes` array (user IDs); no `isLiked`, no `likesCount`.** 404 if not found.                                                                                                                                                                                       |
| GET    | `/product/:id`                                    | optional       | `getProductById`                         | Same shape as slug. 400 on an invalid ObjectId, 404 if not found.                                                                                                                                                                                                                                                                                |
| POST   | `/product/like/:id`                               | required       | `likeProduct`                            | Toggles `product.likes` and `user.likedProducts`. Returns `data.message`.                                                                                                                                                                                                                                                                        |
| GET    | `/category/list`                                  | none           | `CategoryController.getListOfCategories` | `CategoryModel.find(req.query)`: **any query string is passed straight into the Mongo filter**. Returns all types (`product`, `comment`, `post`, `ticket`) unless filtered.                                                                                                                                                                      |
| GET    | `/category/:id`                                   | none           | `getCategoryById`                        | 400 if not found.                                                                                                                                                                                                                                                                                                                                |
| POST   | `/cart/add`                                       | required       | `CartController.addToCart`               | Body `{productId}`. Adds 1 (push or `$inc`). **No stock check.**                                                                                                                                                                                                                                                                                 |
| POST   | `/cart/remove`                                    | required       | `removeFromCart`                         | Body `{productId}`. Removes 1, or pulls the item at quantity 1. Unsets the coupon when the cart becomes empty.                                                                                                                                                                                                                                   |
| POST   | `/cart/coupon`                                    | required       | `addCouponToCart`                        | Body `{couponCode}`. Checks existence, usage limit, expiry, active, and that it applies to at least one cart product. Returns `data.cart`.                                                                                                                                                                                                       |
| DELETE | `/cart/coupon`                                    | required       | `removeCouponFromCart`                   | Returns `data.cart`.                                                                                                                                                                                                                                                                                                                             |
| POST   | `/user/get-otp`                                   | none           | `UserAuthController.getOtp`              | Body `{phoneNumber}`. Creates or updates the user and sends the SMS through Kavenegar template `registerVerify`. Code TTL 90 s.                                                                                                                                                                                                                  |
| POST   | `/user/check-otp`                                 | none           | `checkOtp`                               | Body `{phoneNumber, otp}`. Sets both cookies and returns `data.user`.                                                                                                                                                                                                                                                                            |
| POST   | `/user/complete-profile`                          | required       | `completeProfile`                        | `{name, email}`. Rejects a duplicate email. Sets `isActive = true`.                                                                                                                                                                                                                                                                              |
| GET    | `/user/refresh-token`                             | refresh cookie | `refreshToken`                           | Re-issues both cookies.                                                                                                                                                                                                                                                                                                                          |
| PATCH  | `/user/update`                                    | required       | `updateProfile`                          | `{name, email, phoneNumber, biography}`                                                                                                                                                                                                                                                                                                          |
| GET    | `/user/profile`                                   | required       | `getUserProfile`                         | `data.user`, `data.payments`, **`data.cart` (computed by `getUserCartDetail`)**                                                                                                                                                                                                                                                                  |
| POST   | `/user/logout`                                    | none           | `logout`                                 | Clears cookies                                                                                                                                                                                                                                                                                                                                   |
| POST   | `/payment/create`                                 | required       | `PaymentController.createPayment`        | See §4.6                                                                                                                                                                                                                                                                                                                                         |
| \*     | `/admin/{category,product,coupon,user,payment}/*` | ADMIN          | various                                  | Admin CRUD. **Preserve unchanged.** `GET /admin/coupon/list` is admin-only.                                                                                                                                                                                                                                                                      |

### 4.5 Data models [Verified]

**Product** (`server/app/models/product.js`)

| Field                    | Type                                         | Notes                                                               |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------------- |
| `title`                  | String, required                             | Admin Joi limits it to 3–30 chars (`product.schema.js`)             |
| `description`            | String, required                             | Plain text. No rich text or specs.                                  |
| `slug`                   | String, required, unique, lowercase          | Used in storefront URLs                                             |
| `category`               | ObjectId → Category, required                | **Single** category                                                 |
| `imageLink`              | String, required                             | **Single image URL**. No gallery.                                   |
| `price`                  | Number, required                             | Toman (display suffix "تومان") **[Assumption: integer Toman]**      |
| `offPrice`               | Number, required in schema (optional in Joi) | **Entered manually by the admin**. Not derived from `discount`.     |
| `discount`               | Number, default 0                            | Percentage label shown as a badge                                   |
| `brand`                  | String, required                             | Not shown on the storefront today                                   |
| `tags`                   | [String]                                     | Not used on the storefront                                          |
| `rating`, `numReviews`   | Number, default 0                            | **No code path writes these**. No reviews model or endpoint exists. |
| `countInStock`           | Number, default 0                            | Not shown on the storefront. Not checked on add-to-cart.            |
| `likes`                  | [ObjectId → User]                            | "Wishlist" source                                                   |
| `createdAt`, `updatedAt` | timestamps                                   |                                                                     |

No text index is declared on Product, yet `getListOfProducts` uses `$text`. Whether an index exists in the live database is **[Unverified]**. Without one, MongoDB rejects `$text` queries.

**Category** (`server/app/models/category.js`): `title` (unique), `englishTitle` (unique, used as the URL/filter key), `description` (lowercased), `type` enum `product|comment|post|ticket`, `parentId`, `icon {sm, lg}`. A text index exists on `title` and `englishTitle`. **No endpoint sets `icon`**, and `addNewCategory` writes `parent` (not `parentId`), so the hierarchy is never stored. **[Verified]**

**User** (`server/app/models/user.js`): `name, avatar, biography, email, phoneNumber, otp{code,expiresIn}, isVerifiedPhoneNumber, isActive, role (default "USER"), likedProducts[] (declared twice), Products[] (purchased), cart { products[{productId, quantity}], coupon }`, timestamps.

**Coupon** (`server/app/models/coupon.js`): `code, type (fixedProduct|percent), amount, expireDate, isActive, usageCount, usageLimit, productIds[]`.

**Payment** (`server/app/models/payment.js`): `invoiceNumber, paymentMethod (default "ZARINPAL"), amount, description, refId, cardHash, status (UNCOMPLETED|COMPLETED), isPaid, authority, user, paymentDate, cart (snapshot)`.

**Not present anywhere:** variants, multiple images, specifications, reviews, orders separate from payments, shipping, addresses, inventory reservations, featured or hero content, CMS. **[Verified]**

### 4.6 Business rules as implemented [Verified]

- **Cart pricing** (`getUserCartDetail`, `server/utils/functions.js`): line price = `offPrice × quantity`. Gross = `price × quantity`. If a valid coupon applies to a product **with `discount` = 0**, the coupon overrides `offPrice` (`fixedProduct`: `price − amount`; `percent`: `price × (1 − amount/100)`). Products with their own discount ignore coupons. Output: `productDetail[]`, `coupon`, `payDetail {totalOffAmount, totalPrice, totalGrossPrice, orderItems, productIds, description}`.
- **Implicit rule:** for a non-discounted product the admin must set `offPrice = price`. Otherwise the cart total is wrong. **[Verified: nothing enforces it]**
- **Coupon invalid after application** (expired or limit reached): the `discountDetail` stage returns `null`, and the next stage reads `null.newProductDetail`. Whether this makes `GET /user/profile` fail is **[Unverified at runtime]** and is flagged as a risk (§13).
- **Order placement** (`POST /payment/create`): no gateway. It creates a `Payment` with `status: "COMPLETED"` and `isPaid: true`, appends product IDs to `user.Products`, empties the cart, decrements `countInStock` **by 1 per distinct product regardless of quantity, with no lower-bound check**, and increments coupon `usageCount`.
- **Auth:** OTP code is 6 digits, 90 s TTL. The access cookie lasts 1 day and the refresh cookie 1 year. Both are signed, httpOnly, and `SameSite=Lax`. The OTP code is stored on the **controller singleton** (`this.code`) between generation and SMS send. **[Verified]** Concurrency risk in §13.

### 4.7 Page → endpoint trace [Verified]

| Client surface                   | Call(s)                                                                                                                                                                                                | Where the call is made               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| Header user state and cart badge | `GET /user/profile` (`useGetUser`)                                                                                                                                                                     | Browser (React Query key `get-user`) |
| Home `LatestProducts`            | `GET /product/list?undefined` (called with no args), then sorted and sliced client-side                                                                                                                | Next server (RSC)                    |
| Home `LoadProducts`              | `GET /product/list?<searchParams>` with forwarded cookies                                                                                                                                              | Next server (RSC)                    |
| `/products`                      | `GET /product/list?<qs>` (with cookies) and `GET /category/list` (no params)                                                                                                                           | Next server (RSC)                    |
| `/products/[slug]`               | Build time: `GET /product/list` for params, `GET /product/slug/:slug`                                                                                                                                  | Next build (SSG)                     |
| AddToCart                        | `POST /cart/add`, then invalidate `get-user`                                                                                                                                                           | Browser                              |
| Like                             | `POST /product/like/:id`, then `router.refresh()`                                                                                                                                                      | Browser                              |
| Cart page                        | `GET /user/profile` (cart plus `payDetail`), `POST /cart/add`, `POST /cart/remove`, **`GET /admin/coupon/list`** (`useGetCoupons`), `POST /cart/coupon`, `DELETE /cart/coupon`, `POST /payment/create` | Browser                              |
| Auth                             | `POST /user/get-otp`, `POST /user/check-otp`                                                                                                                                                           | Browser                              |
| Complete profile                 | `POST /user/complete-profile`                                                                                                                                                                          | Browser                              |

**Integration defects found while tracing [Verified in code]:**

1. **Coupons are effectively admin-only in the UI.** `CartSummary.jsx` looks the code up in `GET /admin/coupon/list` before calling `POST /cart/coupon`. A normal user gets 403, so `coupons` is `undefined` and `coupons.find(...)` throws. The server endpoint itself works for any signed-in user.
2. **Listing card ignores sale price.** `/products` shows `product.price` only.
3. **Product page is frozen at build time.** With `force-static` and `dynamicParams = false`, new products return 404 until a rebuild, and price and stock reflect build time.
4. **Cart page assumes `user.cart` exists.** A user who has never added an item may have no `cart` subdocument, so `user.cart.products` would throw. **[Unverified at runtime; likely]**
5. **Mobile navigation gap.** The "Products" link is `hidden sm:block` (uncommitted working-tree change) and there is no mobile menu.
6. **Badge semantics.** The cart badge counts distinct products (`payDetail.productIds.length`), not units.

---

## 5. Brand and visual identity

### 5.1 Brand name

The website name is **NEXAIVON**.

| Aspect                   | Usage                                                                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wordmark                 | Always written in Latin capitals: `NEXAIVON`. Generous letter-spacing suits the minimal, Apple-inspired direction. A short monogram (for example `NX` or `N`) is proposed for the favicon and small sizes. |
| In Persian (RTL) text    | Use the Latin form `NEXAIVON`, isolated with `<bdi>` so it renders correctly inside RTL text.                                                                                                              |
| Page titles and metadata | Storefront `<title>` and Open Graph site name use `NEXAIVON`, with per-page titles in the format `<page title> \| NEXAIVON` (see NFR-11). |

### 5.2 Visual direction [Proposed]

- **Foundation:** light, warm, product-first. Large imagery on warm-white surfaces, with charcoal for text and primary actions.
- **Creative moments:** at most two per page (for example a charcoal "Technology Spotlight" band and an oversized type treatment in the hero). Everything else stays quiet.
- **Imagery:** products on neutral or transparent backgrounds, consistent aspect ratios (1:1 for cards, 4:5 or 1:1 for the gallery), `object-contain` so product edges are never cropped.
- **Shape:** controlled radii. 12 px for cards and inputs, 999 px (pill) for chips and badges, 20–24 px for large media panels. The current mixed `rounded-xl`/`rounded-2xl`/`rounded-lg` gets normalized.
- **Motion:** opacity and translate transitions of 150–300 ms, image-swap cross-fades, and hover lift on cards (desktop pointer only). No scroll-jacking. Everything is disabled under `prefers-reduced-motion: reduce`.
- **RTL:** layouts mirror naturally (logical properties such as `ps-*`/`pe-*`/`ms-*`/`me-*`, or Tailwind RTL-aware equivalents). Directional icons such as arrows flip. Latin product names and model numbers are rendered with `dir="auto"` or `<bdi>` so they don't scramble.

### 5.3 Palette with measured contrast [Proposed]

I computed contrast ratios with the WCAG 2.x relative-luminance formula. AA requires ≥ 4.5:1 for normal text and ≥ 3:1 for large text and UI components.

| Token              | Hex       | Proposed role                                                 | Contrast                                                              |
| ------------------ | --------- | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| `warm-white`       | `#F5F2EC` | Page background, light surfaces                               | —                                                                     |
| `charcoal`         | `#242424` | Body text, primary button fill, dark sections                 | 13.89:1 on warm-white ✅                                              |
| `sage`             | `#A4AD98` | Decorative surfaces, category-card fills, focus halos on dark | **2.09:1 on warm-white ❌ text**; 6.66:1 for charcoal text on sage ✅ |
| `sand`             | `#D9BDA7` | Editorial surfaces, highlights                                | **1.59:1 on warm-white ❌ text**; 8.71:1 for charcoal text on sand ✅ |
| `sage-ink` _(new)_ | `#5E6B52` | Sage-family text and links on light                           | 5.08:1 on warm-white ✅                                               |
| `sand-ink` _(new)_ | `#7A5C46` | Sand-family text and eyebrow labels                           | 5.45:1 on warm-white ✅                                               |
| `muted` _(new)_    | `#5C5C5C` | Secondary text                                                | 5.98:1 on warm-white ✅                                               |
| `sale` _(new)_     | `#B42318` | Sale price and discount badge text                            | 5.88:1 on warm-white ✅                                               |
| `in-stock` _(new)_ | `#1F7A4D` | Availability text                                             | 4.76:1 on warm-white ✅                                               |

**Adjustments and rationale:**

1. Sage and sand **must not be used for text or meaningful icons** on warm-white. They are surface colors only. Text in those hues uses the darker `-ink` variants.
2. The **primary CTA is charcoal with warm-white text** (13.89:1). This is calm and premium, and it avoids introducing a saturated brand color. **Decided (Q3):** no saturated accent. The palette stays fully neutral, and focus rings use charcoal (warm-white on dark surfaces).
3. The current primary blue scale (`--color-primary-*` in `globals.css`) is replaced by the new tokens on storefront pages. Admin and profile pages may keep the old values until migrated (§9.3).
4. **Dark mode exists today** (`DarkModeContext`) and must keep working. Proposed dark tokens: background `#242424` / `#1A1A1A`; text `#F5F2EC` (13.89:1); sage and sand become accent surfaces with charcoal text (6.66:1 and 8.71:1). Each dark pair must be re-checked during design.

### 5.4 Typography [Proposed]

- **Persian UI and body:** keep **Vazirmatn** (already bundled, `client/src/constants/localFonts.js`). Change `display: "block"` to `"swap"` to avoid invisible text while loading.
- **Latin wordmark and model numbers:** add **Inter** (variable) via `next/font` (**decided, Q4**). It applies only to the logo wordmark and Latin spec values.
- **Scale (desktop / mobile):** Display 56/36, H1 40/28, H2 28/22, H3 20/18, Body 16/16, Small 14/14, Caption 12/12. Line height 1.6–1.8 for Persian body text and 1.2–1.3 for headings.
- **Numerals:** keep Persian digits through the existing `toPersianNumbers*` utilities for prices and quantities.

### 5.5 Spacing, grid, components [Proposed]

- 4 px base spacing (Tailwind default). Section vertical rhythm 64–96 px desktop, 40–56 px mobile.
- Container: the existing `container xl:max-w-screen-xl` pattern, with a 16 px mobile gutter.
- Consistent interaction states on every interactive element: default, hover, focus-visible (2 px ring with ≥ 3:1 contrast), active, disabled, loading.

---

## 6. Functional requirements

Requirement IDs: `FR-<area>-<n>`. Each states its implementation status.

### 6.1 Homepage

The current homepage (`client/src/app/(user)/page.jsx`) is replaced by the sections below. The existing full product grid with sorting (`LoadProducts` plus `SortProducts`) moves to `/products` as the single canonical listing (§6.3), so it isn't duplicated.

#### A. Header and navigation

| Aspect                 | Requirement                                                                                                                                                                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose                | Brand, primary navigation, search, account, wishlist, cart                                                                                                                                                                                                                                |
| Content                | NEXAIVON wordmark → `/`; "فروشگاه" (Shop) → `/products`; category menu (desktop dropdown or mega-menu; mobile drawer); search field; account entry; wishlist icon; cart icon with count                                                                                                   |
| Layout and interaction | Sticky with a reduced height on scroll. Search opens inline on desktop and as a full-width overlay on mobile. The account control is a `<button>` with `aria-expanded` (today it is a clickable `<div>`, `Header.jsx`).                                                                   |
| Responsive             | < 640 px: logo, search icon, cart, and menu button; the drawer contains Shop, categories, account, wishlist, dark-mode toggle. ≥ 1024 px: all items inline.                                                                                                                               |
| Reuse                  | `Header.jsx` (rewrite), `common/Drawer.jsx` (mobile menu), `common/DropDown.jsx` plus `useOutsideClick`, `DarkModeToggle`, `useGetUser`                                                                                                                                                   |
| API                    | `GET /user/profile` (user, `cart.payDetail`, `cart.productDetail[].quantity`) — **Supported**. `GET /category/list?type=product` — **Partially supported** (works because of pass-through filtering; see §8.3, FR-API-06). Search → `GET /product/list?search=` — **Unverified** (index). |
| States                 | While the user query loads, show account and cart skeleton placeholders instead of blurring the whole header (today: `blur-sm pointer-events-none`). On error, show the guest state.                                                                                                      |
| Dependencies           | FR-API-06 (category type filter), FR-API-04 (search index)                                                                                                                                                                                                                                |

- **FR-H-01** [Proposed] The header shows Shop, categories, search, account, wishlist, and cart at all breakpoints. Mobile reaches them through a drawer.
- **FR-H-02** [Proposed] The cart badge shows the **total units** (sum of `productDetail[].quantity`) with an accessible label such as "سبد خرید، ۳ کالا". This is computable client-side from the existing `/user/profile` response.
- **FR-H-03** [Proposed] The wishlist icon links to `/wishlist` when signed in and to `/auth` when signed out (depends on FR-W-03).
- **FR-H-04** [Proposed] Submitting search navigates to `/products?search=<term>`. Empty search is blocked.

#### B. Hero

| Aspect      | Requirement                                                                                                                                                                                                                                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose     | Present one featured product or collection with a single clear CTA                                                                                                                                                                                                                                                                                         |
| Content     | Eyebrow, headline (≤ 8 words), supporting line (≤ 20 words), primary CTA ("مشاهده محصول" or "خرید"), large product image                                                                                                                                                                                                                                   |
| Data source | **No featured-content or CMS capability exists [Verified].** Phase 1 uses a **static config file in the client** (for example `client/src/constants/home.js` **[Proposed]**) holding copy and a product `slug`. Image and price are fetched live via `GET /product/slug/:slug` so they never go stale. A server-managed "featured" flag is P2 (FR-API-12). |
| Layout      | Desktop: two columns, text on the start side (right in RTL) and the image on the end side. Mobile: image on top, text below, CTA full-width.                                                                                                                                                                                                               |
| States      | If the configured slug returns 404 or errors, render the hero with copy and a CTA to `/products`, hiding price and product image. Never show a broken image.                                                                                                                                                                                               |
| Performance | Hero image is the LCP element: `next/image` with `priority` and correct `sizes`.                                                                                                                                                                                                                                                                           |

- **FR-HE-01** [Proposed] The hero renders from static config plus live product data. When the product is missing it falls back to a CTA to `/products`.

#### C. Shop by category

| Aspect  | Requirement                                                                                                                                                                                                                                                                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content | One card per **product-type** category: title (Persian), image or illustration, link to `/products?category=<englishTitle>` (the existing filter contract, `ProductsFilter.jsx`)                                                                                                                                                                               |
| Data    | `GET /category/list?type=product` → `title`, `englishTitle`, `icon.lg`/`icon.sm`. **Category images are not settable today** (no endpoint writes `icon`) [Verified].                                                                                                                                                                                           |
| Phase 1 | Map `englishTitle` → static image in `client/public` **[Proposed]**, with a neutral fallback tile using sage or sand fills. Categories come only from live data. The examples smartphones, headphones, smartwatches, accessories are **sample content** to be created by the admin, not current data. **[Unverified]** which categories exist in the database. The seed data uses these four categories (**decided, Q19**). |
| Layout  | 2 columns on mobile (horizontal scroll allowed), 3–4 on tablet, 4–6 on desktop                                                                                                                                                                                                                                                                                 |
| States  | Loading: skeleton tiles. Empty: hide the section. Error: hide the section (non-critical).                                                                                                                                                                                                                                                                      |

- **FR-C-01** [Proposed] Only categories with `type === "product"` are displayed.
- **FR-C-02** [Proposed] Clicking a card opens the listing pre-filtered to that category.
- **FR-C-03** [P1, Proposed] Admin can set a category image (FR-API-11).

#### D. Featured products

| Aspect    | Requirement                                                                                                                                                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Content   | 4–8 product cards: image, title, brand, price, sale price plus discount badge when `discount > 0`, stock badge when `countInStock === 0`, wishlist toggle, link to `/products/<slug>`                                                                                    |
| Selection | **No "featured" field exists [Verified].** Phase 1: static slug list in client config (as for the hero). Fallback: the first N of `sort=popular`.                                                                                                                        |
| Data      | `GET /product/list` → `_id, title, slug, imageLink, brand, price, offPrice, discount, countInStock, isLiked, likesCount, category` — **Supported**. Fetching N products requires fetching the whole list (no `limit`) — **Partially supported**; FR-API-03 adds `limit`. |
| Ratings   | **Hidden.** `rating` and `numReviews` are never written [Verified].                                                                                                                                                                                                      |
| States    | Skeleton cards (fixed aspect ratio to avoid layout shift). Empty: hide the section. Error: inline message plus retry link.                                                                                                                                               |

- **FR-F-01** [Proposed] Introduce one shared `ProductCard` component used by home, listing, related products, and wishlist (it replaces three divergent card markups in `LatestProducts.jsx`, `LoadProducts.jsx`, `products/page.jsx`).
- **FR-F-02** [Proposed] The card shows `offPrice` as the payable price and the struck-through `price` only when `discount > 0`. When `discount === 0` it shows `price`. (Fixes integration defect 2.)

#### E. Technology spotlight

| Aspect  | Requirement                                                                                                                                                                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content | A charcoal or sand full-bleed editorial band: large product image, 3 short feature highlights, CTA to the product                                                                                                                               |
| Data    | Static editorial copy plus one product via `GET /product/slug/:slug` (price, image, link). **Feature highlights have no backend field [Verified]**, so they live in static config in Phase 1. Structured `specs` (FR-API-09) can feed it later. |
| Motion  | Optional subtle parallax or reveal on the image (≤ 300 ms, disabled under reduced motion)                                                                                                                                                       |
| States  | If the product fails to load, hide the section entirely (**decided, Q6**).                                                                                                                |

#### F. New arrivals / best sellers

- **New arrivals — Supported.** `GET /product/list?sort=latest` (`createdAt` descending) [Verified]. It replaces `LatestProducts` (which currently fetches all products and sorts client-side). Needs `limit` (FR-API-03) to avoid over-fetching.
- **Best sellers — Not supported. Excluded.** Payments store a `cart` snapshot, but there is no sales counter and `countInStock` is decremented incorrectly (§4.6). Labelling products "best sellers" would be unfounded. A future option is aggregating `Payment.cart.productDetail` quantities (P2, FR-API-13).
- **"Popular" (most liked)** may be shown instead, but **only after** FR-API-05 fixes `sort=popular` to sort by like count. Today it sorts on the `likes` array itself, which MongoDB orders by array element value, not by length [Verified code; ordering semantics per MongoDB array sort rules].

#### G. Trust and footer

| Aspect         | Requirement                                                                                                                                                                                                                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content        | Wordmark, short brand line, navigation links (Shop, categories, Account, Cart), dark-mode toggle (optional), copyright                                                                                                                                                                                                                                                |
| Policies       | **No shipping, returns, warranty, or contact data exists in the codebase [Verified].** Do **not** display delivery promises, return windows, phone numbers, or addresses (**decided, Q5:** kept hidden; they may be added later only if the owner supplies real copy). Trust items limited to verifiable facts, for example "پرداخت امن" only if a real gateway exists. Today none exists, so this item is excluded. |
| Portfolio note | No portfolio or demo-store notice is shown (**decided, Q2**). The demo nature of orders appears only in the checkout copy (Q10).                                                                                                                                                                                                                                                                                         |

#### Homepage acceptance criteria

- **AC-HOME-01** With products and categories present, the homepage renders Header, Hero, Categories, Featured, Spotlight, New arrivals, and Footer in that order, with no console errors.
- **AC-HOME-02** Every product card links to `/products/<slug>` and that page returns 200 (including for products created after the last build; see FR-PDP-01).
- **AC-HOME-03** With zero products, product-driven sections are hidden and the hero falls back to a CTA. No empty grids, no runtime errors.
- **AC-HOME-04** With the API unreachable, the page still renders the header, hero copy, and footer, plus a non-blocking error message where product sections would be.
- **AC-HOME-05** At 360 px, 768 px, 1024 px, and 1440 px wide there is no horizontal scrolling, and all CTAs are visible without overlapping.
- **AC-HOME-06** Category cards show only `type: "product"` categories.

### 6.2 Single product page (`/products/[slug]`)

#### Data feasibility [Verified]

`GET /product/slug/:slug` returns `title, description, slug, category{title, icon, englishTitle}, imageLink, price, offPrice, discount, brand, tags, rating, numReviews, countInStock, likes[], createdAt, updatedAt`.

#### Requirements

| ID            | Requirement                                                                                                                                                                                                                                                                               | Status                                                                                                                                                                                                                                                                    | Dependency           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **FR-PDP-01** | Render on request or with ISR instead of `force-static` + `dynamicParams = false`, so that new slugs work and price and stock are fresh. Use `notFound()` on API 404, with a branded `not-found.js`.                                                                                      | Proposed (frontend only)                                                                                                                                                                                                                                                  | —                    |
| **FR-PDP-02** | Gallery: primary image plus thumbnails, keyboard and swipe navigation, `aria-label`s, `object-contain`.                                                                                                                                                                                   | **Partially supported.** Only one `imageLink` exists. Phase 1 renders a single large image with no thumbnails. Multi-image needs FR-API-08.                                                                                                                               | FR-API-08            |
| **FR-PDP-03** | Title, brand, category (link to the filtered listing), breadcrumbs (Home › Category › Product).                                                                                                                                                                                           | Supported by data; frontend change                                                                                                                                                                                                                                        | —                    |
| **FR-PDP-04** | Price block: when `discount > 0`, show `offPrice` as the main price, `price` struck through, and a `discount`% badge. Otherwise show `price`. All values in Toman with Persian digits.                                                                                                    | Supported (logic exists in `[slug]/page.jsx`)                                                                                                                                                                                                                             | —                    |
| **FR-PDP-05** | Stock state from `countInStock`: `0` → "ناموجود" and add-to-cart disabled; `1–3` → "تنها N عدد باقی مانده" (**decided, Q7:** threshold 3, exact count shown); otherwise "موجود".                                                                                                                          | Data supported; UI not implemented                                                                                                                                                                                                                                        | —                    |
| **FR-PDP-06** | Description as plain-text paragraphs (preserve line breaks).                                                                                                                                                                                                                              | Supported                                                                                                                                                                                                                                                                 | —                    |
| **FR-PDP-07** | Technical specifications table.                                                                                                                                                                                                                                                           | **Not supported.** No field exists. Hide the section until FR-API-09 lands.                                                                                                                                                                                               | FR-API-09            |
| **FR-PDP-08** | Variants (color, capacity, model).                                                                                                                                                                                                                                                        | **Not supported.** No variant model. P2 (FR-API-10). Out of scope for P0/P1.                                                                                                                                                                                              | FR-API-10            |
| **FR-PDP-09** | Quantity selector, 1 to `countInStock`. There is no separate max-per-order cap (**decided, Q8**).                                                                                                                                                                                                                 | **Partially supported.** The server only supports +1/−1 (`/cart/add`, `/cart/remove`). Phase 1 option: "Add to cart" adds 1, and quantity is managed on the cart page (current behaviour). The full selector needs FR-API-02 (set quantity) plus FR-API-01 (stock check). | FR-API-01, FR-API-02 |
| **FR-PDP-10** | Add to cart: guests are redirected to `/auth?next=/products/<slug>` (the `next` parameter is **Proposed**; auth currently ignores it). Signed-in users get pending state, success toast, and badge update. If already in the cart, show "View cart" (existing `AddToCart.jsx` behaviour). | Supported, with an enhancement                                                                                                                                                                                                                                            | FR-AUTH-01           |
| **FR-PDP-11** | Server-side rejection beyond stock shows the server message (Persian) as a toast. The client never decides stock alone.                                                                                                                                                                   | **Not supported server-side today**                                                                                                                                                                                                                                       | FR-API-01            |
| **FR-PDP-12** | Wishlist toggle with optimistic UI, reverting on failure; guests are sent to auth.                                                                                                                                                                                                        | **Partially supported.** Toggle endpoint exists. The detail response lacks `isLiked`. Interim: derive it from `useGetUser().user.likedProducts` (array of IDs, present in the `/user/profile` response). Proper fix: FR-API-07.                                           | FR-API-07 (optional) |
| **FR-PDP-13** | Related products: same category, excluding the current product, up to 4.                                                                                                                                                                                                                  | **Partially supported.** `GET /product/list?category=<englishTitle>` works but returns everything (no `limit`) and fails on unknown categories.                                                                                                                           | FR-API-03, FR-API-06 |
| **FR-PDP-14** | Sticky mobile purchase bar (price plus add-to-cart) once the main CTA scrolls out of view.                                                                                                                                                                                                | Proposed (frontend only), P1                                                                                                                                                                                                                                              | —                    |
| **FR-PDP-15** | Ratings and reviews.                                                                                                                                                                                                                                                                      | **Not supported.** Fields exist but are never written; no reviews model. Hidden. P2.                                                                                                                                                                                      | FR-API-14            |
| **FR-PDP-16** | Delivery and returns info.                                                                                                                                                                                                                                                                | **Not supported.** No data or policy. Hidden (**decided, Q5**). Added later only if the owner supplies static copy.                                                                                                                                                                                   | Q5                   |
| **FR-PDP-17** | Per-product metadata (`generateMetadata`: title, description, Open Graph image) and Product JSON-LD (name, image, brand, offers.price, priceCurrency `IRR` with the price converted from Toman × 10 (**decided, Q9**), availability).                                                                                                | Proposed (frontend only)                                                                                                                                                                                                                                                  | —                    |

#### PDP acceptance criteria

- **AC-PDP-01** Valid slug → 200 with title, image, price block, stock state, description, and breadcrumbs.
- **AC-PDP-02** Unknown slug → branded 404 page (HTTP 404), not a crash.
- **AC-PDP-03** A product created after deployment is reachable at its slug without a rebuild.
- **AC-PDP-04** `discount > 0` → `offPrice` is shown as the price, `price` is struck through, and the badge shows `discount`%. `discount = 0` → only `price` is shown.
- **AC-PDP-05** `countInStock = 0` → add-to-cart is disabled with the "ناموجود" label, and a forced `POST /cart/add` returns a 4xx error (after FR-API-01).
- **AC-PDP-06** When multiple images exist (after FR-API-08): clicking a thumbnail, pressing arrow keys, or swiping changes the main image. The active thumbnail has `aria-current="true"`.
- **AC-PDP-07** Quantity (after FR-API-02): values below 1 or above available stock cannot be submitted, and the server rejects them as well.
- **AC-PDP-08** Guest add-to-cart → redirected to auth and returned to the same product after login (after FR-AUTH-01).
- **AC-PDP-09** The wishlist state shown matches the server after a reload; on toggle failure the UI reverts and shows the error toast.
- **AC-PDP-10** If the API returns 5xx or malformed JSON, the page shows the route `error.js` boundary with a retry and no raw stack trace.
- **AC-PDP-11** The price shown on the PDP equals the unit price later shown in the cart for the same product (no coupon).

### 6.3 Product listing, search, and categories (`/products`)

| Feature                 | 1. Current frontend                                                          | 2. Current backend                                        | 3. Required behaviour                                                                                                    | 4. Reuse                               | 5. Changes                                                                                |
| ----------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| Grid and card           | 4-column grid; card shows image, title, like, **`price` only**               | List returns all fields                                   | Shared `ProductCard` (FR-F-01) with sale price, stock badge, wishlist; 2/3/4 columns at sm/lg/xl                         | `AddToCart`, `LikeProduct` logic       | Frontend only                                                                             |
| Category navigation     | Sidebar checkboxes (`ProductsFilter.jsx`), multi-select, URL `?category=a,b` | `category` = comma-separated `englishTitle`s → `$in`      | Keep the URL contract. Desktop: sidebar. Mobile: "Filters" button opening a `Drawer`. Show only product-type categories. | `ProductsFilter`, `CheckBox`, `Drawer` | Backend: FR-API-06 (ignore or 400 on unknown category instead of crashing; `type` filter) |
| Search                  | **None in UI**                                                               | `search` → `$text` on Product; **no text index declared** | Header search → `?search=`; results heading "نتایج برای «…»"; combinable with category and sort                          | —                                      | Backend: FR-API-04 (text index or regex fallback). Frontend: new search input.            |
| Sorting                 | Radio list (`ProductsSort.jsx`) and duplicated tab list (`SortProducts.jsx`) | `latest`, `earliest`, `popular` (incorrect)               | Single sort control: Newest, Oldest, Most liked (after FR-API-05). Price sort **[Proposed P1]** needs FR-API-05.         | `ProductsSort`                         | Remove the duplicate `SortProducts`. FR-API-05.                                           |
| Price and brand filters | None                                                                         | None                                                      | P1 only. Requires new query params.                                                                                      | —                                      | FR-API-05 (P1)                                                                            |
| Pagination / load more  | None (renders everything)                                                    | None                                                      | P0: acceptable while the catalogue is small **[Assumption: < 100 products]**. P1: "Load more" with `page` and `limit`.   | —                                      | FR-API-03                                                                                 |
| Product navigation      | Title link to `/products/<slug>`                                             | —                                                         | The whole card is clickable (one link; wishlist and cart buttons are separate controls)                                  | —                                      | Frontend                                                                                  |
| Empty state             | None (empty grid)                                                            | —                                                         | "محصولی یافت نشد" plus "Clear filters"                                                                                   | —                                      | Frontend                                                                                  |
| Error state             | Unhandled (RSC throws)                                                       | 500 on unknown category                                   | `error.js` with retry                                                                                                    | —                                      | Frontend plus FR-API-06                                                                   |
| Loading                 | None                                                                         | —                                                         | `loading.js` skeleton grid                                                                                               | —                                      | Frontend                                                                                  |

#### Listing acceptance criteria

- **AC-LIST-01** `/products?category=<valid>` shows only products in that category. Multiple categories union.
- **AC-LIST-02** `/products?category=<unknown>` shows the empty state (not a 500).
- **AC-LIST-03** `/products?search=<term>` returns matches by title (and description if indexed). No match → empty state.
- **AC-LIST-04** Sort selection updates the URL and order. "Most liked" is ordered by `likesCount` descending.
- **AC-LIST-05** Filters persist in the URL. Back and forward restore the state.
- **AC-LIST-06** On mobile (360 px), filters open in a drawer that traps focus and closes on Esc.

### 6.4 Cart

**Current [Verified]:** server-side, signed-in only. Read via `GET /user/profile` → `cart` (`productDetail[]` with `quantity`, `payDetail` totals). Mutations: `POST /cart/add` (+1), `POST /cart/remove` (−1 or remove). Totals are computed by the server (`getUserCartDetail`). Coupon application exists server-side but is broken in the UI for non-admins (§4.7 #1). "Place order" calls `POST /payment/create`.

| ID             | Requirement                                                                                                                                                                                                                         | Type                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **FR-CART-01** | Redesign the cart page: line items with image (`imageLink` is in `productDetail`), title, unit price (sale and original), quantity stepper, line total, remove; summary with gross, discount, coupon, and payable from `payDetail`. | Frontend only                                                             |
| **FR-CART-02** | Fix coupon application: call `POST /cart/coupon` directly with `{couponCode}` and show the server's message. Remove the dependency on `GET /admin/coupon/list`. Removing the coupon calls `DELETE /cart/coupon`.                    | Frontend only (bug fix)                                                   |
| **FR-CART-03** | Handle a user with no cart subdocument (treat as an empty cart).                                                                                                                                                                    | Frontend only                                                             |
| **FR-CART-04** | The stepper's "+" is disabled at stock, and the server rejects quantities above stock.                                                                                                                                              | Needs FR-API-01                                                           |
| **FR-CART-05** | Items that are out of stock or deleted while in the cart are flagged, and checkout is blocked until resolved.                                                                                                                       | Needs FR-API-01 (validation at payment) plus a response flag (FR-API-01b) |
| **FR-CART-06** | Totals displayed are **only** the server's `payDetail` values. The client never recomputes payable amounts.                                                                                                                         | Frontend rule                                                             |
| **FR-CART-07** | Guest cart (local, merged at login).                                                                                                                                                                                                | **Optional future** (P2). Not required.                                   |
| **FR-CART-08** | "Place order" keeps the current behaviour (no gateway). Copy labels it clearly as a demo order with no real payment (**decided, Q10**).                                                                                                                            | Frontend copy                                                             |

### 6.5 Wishlist ("likes")

**Current [Verified]:** server-persisted. `POST /product/like/:id` toggles `Product.likes` and `User.likedProducts`. The list endpoint returns `isLiked` and `likesCount`; detail endpoints return a raw `likes[]`. There is no wishlist page. The UI uses a thumbs-up icon (`LikeProduct.jsx`) and calls `router.refresh()` after toggling.

| ID          | Requirement                                                                                                 | Type                                                                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **FR-W-01** | Present "likes" as a **wishlist** (heart icon, label "علاقه‌مندی"), keeping the same endpoint.              | Frontend only                                                                                                                                                                                                                                    |
| **FR-W-02** | Optimistic toggle with rollback, `aria-pressed`, guests redirected to auth.                                 | Frontend only                                                                                                                                                                                                                                    |
| **FR-W-03** | `/wishlist` page listing liked products.                                                                    | **Partially supported.** `user.likedProducts` (IDs) comes from `/user/profile`, but there's no endpoint that returns the products. Interim: filter `GET /product/list` by ID client-side (acceptable for a small catalogue). Proper: FR-API-07b. |
| **FR-W-04** | Stop exposing other users' IDs: detail endpoints should return `isLiked`/`likesCount` instead of `likes[]`. | Backend, FR-API-07                                                                                                                                                                                                                               |

### 6.6 Authentication

**Current [Verified]:** phone OTP → cookies → optional complete-profile. Middleware guards `/profile` and `/admin` only. The cart page handles guests itself.

| ID             | Requirement                                                                                                                                                  | Type          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| **FR-AUTH-01** | Support `?next=<path>` on `/auth` (and through `/complete-profile`). Redirect there after success. Accept only same-origin relative paths starting with `/`. | Frontend only |
| **FR-AUTH-02** | Restyle the auth and complete-profile screens to the new design system. Preserve the flow, the 90 s timer, and validation.                                   | Frontend only |
| **FR-AUTH-03** | Accessible OTP input: one-time-code autocomplete, labelled, LTR digits within the RTL page.                                                                  | Frontend only |
| —              | No changes to tokens, cookies, OTP provider, or roles.                                                                                                       | Non-goal      |

---

## 7. Frontend requirements

| ID        | Requirement                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FE-01** | **Design tokens:** extend `client/tailwind.config.js` and `globals.css` with the §5.3 tokens as CSS variables (keeping the existing `withOpacity` pattern), plus light and dark values. Storefront components use only tokens, never raw hex values.                                                                                                                                    |
| **FE-02** | **Component library** (in a new `client/src/components/ui/`, **decided Q11**; existing `src/common` components stay until migrated): `ProductCard`, `Price`, `StockBadge`, `WishlistButton`, `QuantityStepper`, `SectionHeader`, `Skeleton`, `EmptyState`, `ErrorState`, `IconButton`, `Badge`, plus a refactored `Button` (variants primary, secondary, ghost; sizes; `type` prop, since today it is always `submit`). |
| **FE-03** | **Server-first rendering:** keep product data fetching in Server Components (as today) and limit `"use client"` to interactive leaves (AddToCart, WishlistButton, filters, header menus).                                                                                                                                                                                               |
| **FE-04** | **Route states:** add `loading.js`, `error.js`, and `not-found.js` for `(user)` and `/products/[slug]`.                                                                                                                                                                                                                                                                                 |
| **FE-05** | **PDP rendering:** replace `force-static`/`dynamicParams=false` with ISR, `revalidate = 60` s (**decided, Q12**). Cart and stock correctness never rely on the cached page (the server validates).                                                                                                                                            |
| **FE-06** | **Images:** `next/image` everywhere with explicit `sizes`, and `priority` only on the LCP image. `remotePatterns` must include every host used for product images. Today only two hosts are allowed. **Decided (Q13):** new images are uploaded to the server (FR-API-17), so the API host is added. The two existing hosts stay allowed so existing products keep rendering.                                                                                                       |
| **FE-07** | **Data hooks:** reuse `useGetUser` as the single source of cart and user state. Add `useToggleWishlist` and `useCart` helpers that invalidate `["get-user"]` as current code does.                                                                                                                                                                                                      |
| **FE-08** | **Remove duplication:** consolidate `SortProducts` and `ProductsSort`, and the three product-card markups.                                                                                                                                                                                                                                                                              |
| **FE-09** | **RTL correctness:** logical spacing, mirrored icons, `<bdi>` for Latin strings.                                                                                                                                                                                                                                                                                                        |
| **FE-10** | **Fix the `LatestProducts` call:** it should call the list with explicit params (`sort=latest`) instead of `getProducts()` (which produces `?undefined`).                                                                                                                                                                                                                               |
| **FE-11** | **Remove `user-select: none`** from `html, body` in `globals.css`. It blocks copying product names and model numbers.                                                                                                                                                                                                                                                                   |
| **FE-12** | **No heavy animation libraries in P0.** Use CSS transitions only. Any motion library in P1/P2 must be justified by bundle impact (§10).                                                                                                                                                                                                                                                 |

---

## 8. Backend and API requirements

### 8.1 Feature → API mapping

| Feature                            | Existing endpoint / service                    | Required data                                       | Status                                               | Proposed action                                                        |
| ---------------------------------- | ---------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Header user and cart count         | `GET /user/profile`                            | `user`, `cart.productDetail[].quantity`             | **Supported**                                        | Compute units client-side                                              |
| Category nav and cards             | `GET /category/list`                           | `title, englishTitle, type, icon`                   | **Partially supported**                              | FR-API-06 (explicit `type` filter, whitelist query), FR-API-11 (image) |
| Search                             | `GET /product/list?search=`                    | text match                                          | **Unverified**                                       | FR-API-04                                                              |
| Hero / spotlight product           | `GET /product/slug/:slug`                      | `title, imageLink, price, offPrice, discount, slug` | **Supported** (static config picks the slug)         | P2: FR-API-12                                                          |
| Featured products                  | `GET /product/list`                            | card fields                                         | **Partially supported** (no featured flag, no limit) | FR-API-03; P2 FR-API-12                                                |
| New arrivals                       | `GET /product/list?sort=latest`                | card fields                                         | **Supported** (over-fetches)                         | FR-API-03                                                              |
| Most liked                         | `GET /product/list?sort=popular`               | `likesCount`                                        | **Partially supported** (wrong sort key)             | FR-API-05                                                              |
| Best sellers                       | —                                              | units sold                                          | **Not supported**                                    | Excluded; P2 FR-API-13                                                 |
| Listing filter by category         | `GET /product/list?category=`                  | —                                                   | **Partially supported** (crash on unknown)           | FR-API-06                                                              |
| Pagination                         | —                                              | `page, limit, total`                                | **Not supported**                                    | FR-API-03                                                              |
| Price and brand filter, price sort | —                                              | —                                                   | **Not supported**                                    | FR-API-05 (P1)                                                         |
| PDP core info                      | `GET /product/slug/:slug`                      | all core fields                                     | **Supported**                                        | —                                                                      |
| PDP wishlist state                 | `GET /product/slug/:slug`                      | `isLiked`, `likesCount`                             | **Partially supported** (raw `likes[]`)              | FR-API-07                                                              |
| Gallery                            | —                                              | `images[]`                                          | **Not supported**                                    | FR-API-08                                                              |
| Specs                              | —                                              | `specs[]`                                           | **Not supported**                                    | FR-API-09                                                              |
| Variants                           | —                                              | variant model and stock                             | **Not supported**                                    | FR-API-10 (P2)                                                         |
| Ratings and reviews                | — (`rating`, `numReviews` fields unused)       | reviews                                             | **Not supported**                                    | FR-API-14 (P2)                                                         |
| Related products                   | `GET /product/list?category=`                  | same-category list                                  | **Partially supported**                              | FR-API-03 (`limit`, `exclude`)                                         |
| Add to cart                        | `POST /cart/add`                               | stock check                                         | **Partially supported** (no stock check)             | FR-API-01                                                              |
| Set quantity                       | —                                              | `{productId, quantity}`                             | **Not supported**                                    | FR-API-02                                                              |
| Decrement / remove                 | `POST /cart/remove`                            | —                                                   | **Supported**                                        | —                                                                      |
| Coupon apply / remove              | `POST`/`DELETE /cart/coupon`                   | `couponCode`                                        | **Supported** (UI bug only)                          | FR-CART-02 (frontend)                                                  |
| Cart totals                        | `getUserCartDetail` via `/user/profile`        | `payDetail`                                         | **Supported** (see risk R4)                          | FR-API-15 (null-coupon guard)                                          |
| Place order and stock decrement    | `POST /payment/create`                         | quantity-aware, validated                           | **Partially supported** (decrements by 1, no floor)  | FR-API-01 (validation), FR-API-16                                      |
| Wishlist toggle                    | `POST /product/like/:id`                       | —                                                   | **Supported**                                        | —                                                                      |
| Wishlist page                      | `GET /user/profile` (`likedProducts` IDs only) | populated products                                  | **Partially supported**                              | FR-API-07b                                                             |
| Auth OTP                           | `/user/get-otp`, `/user/check-otp`             | —                                                   | **Supported**                                        | Unchanged (risk R6 noted)                                              |
| Category image                     | — (`icon` never set)                           | `icon.lg`                                           | **Not supported**                                    | FR-API-11                                                              |

### 8.2 Required changes: commerce correctness (P0)

**FR-API-01 — Stock validation on cart mutation**

- **Behaviour:** `POST /cart/add` rejects when `countInStock <= 0` or when the resulting quantity would exceed `countInStock`.
- **Error:** HTTP 400, `{statusCode, message}` (Persian, for example "موجودی این محصول کافی نیست").
- **Also:** `POST /payment/create` re-validates every line (`quantity <= countInStock`, product still exists) before creating the payment. On failure it returns 400 and creates nothing.
- **FR-API-01b:** `getUserCartDetail` adds per-line `countInStock` to `productDetail` (projection change), so the cart UI can flag shortages. This adds a field without removing any, so existing clients are unaffected.

**FR-API-02 — Set quantity**

- **New:** `PATCH /api/cart/quantity`, auth required, body `{productId, quantity}` (integer ≥ 1).
- **Validation:** Joi (integer, `1 ≤ quantity ≤ countInStock`, no separate max-per-order cap, Q8). The product must exist and be in the cart (else 400).
- **Response:** `{statusCode: 200, data: {message, cart}}` with `cart` = `getUserCartDetail` output (same shape as the coupon endpoints).
- **Compatibility:** additive. `/cart/add` and `/cart/remove` stay.

**FR-API-16 — Quantity-aware stock decrement on order**

- `POST /payment/create` decrements `countInStock` by each line's `quantity` (today it's `-1` per product).
- It uses a conditional update (`countInStock >= quantity`) so stock can never go negative. Concurrency: per-product conditional `updateOne`. If any line fails, abort before creating the payment (or use a MongoDB transaction if the deployment is a replica set, **[Unverified]**).
- Edge cases: deleted products in the cart, a coupon that becomes invalid between view and order (R4).

**FR-API-15 — Null-coupon guard in cart aggregation**

- When an applied coupon is no longer valid, `discountDetail` should return `{newProductDetail: productDetail, coupon: null}` instead of `null`, so totals still compute (§4.6). Optionally unset the stale `cart.coupon`.

### 8.3 Required changes: catalogue (P0/P1)

**FR-API-03 — Pagination and limits on `GET /product/list`** (P0 for `limit`, P1 for pages)

- Query: `limit` (1–48, default unlimited **for backward compatibility** with admin and `generateStaticParams` callers), `page` (≥ 1), `exclude` (product ID, for related products).
- Response adds `data.pagination {page, limit, total, totalPages}` when `limit` is supplied. `data.products` is unchanged.
- Validation: non-numeric or out-of-range values → 400.

**FR-API-04 — Search** (P0 if search ships in P0, else P1)

- **Decided (Q14):** escaped, case-insensitive regex on `title` and `brand`, which suits a small catalogue and Persian text. Replace the current `$text` query. No text index is added in this project.
- A `search` value of 1–64 chars is validated and regex-escaped.
- _Rejected alternative:_ a MongoDB text index on `title`, `description`, `brand`, `tags`. Persian tokenisation under MongoDB's default text language is limited.

**FR-API-05 — Sorting and filters** (P1, except the popular fix which is P0 if "Most liked" ships)

- `sort=popular` → order by like count (aggregation `$size: "$likes"` or a maintained `likesCount` field).
- New: `sort=price_asc|price_desc` (by the effective price `offPrice`), `minPrice`, `maxPrice`, `brand` (comma-separated).
- Invalid `sort` → default ordering (backward compatible).

**FR-API-06 — Safe category handling**

- `GET /product/list?category=`: unknown `englishTitle`s are ignored. If none match, return an empty `products` list (not 500).
- `GET /category/list`: whitelist query keys (`type`, `parentId`) instead of passing `req.query` into `find`. The storefront calls `?type=product`. Admin calls without params keep working.

**FR-API-07 — Wishlist state on detail**

- `GET /product/slug/:slug` and `GET /product/:id` return `isLiked` (when authenticated) and `likesCount`, and **omit `likes[]`** for non-admin callers.
- **Compatibility check:** the admin product detail page (`client/src/app/(admin)/admin/products/[id]/page.jsx`) must be checked for `likes` usage before removal **[Unverified: not inspected line-by-line for `likes`]**.
- **FR-API-07b:** `GET /api/user/wishlist` (auth) returns `data.products[]` in the list-card shape for `user.likedProducts`.

### 8.4 Data-model extensions (P1/P2)

**FR-API-08 — Product gallery (P1)**

- Add `images: [{ url: String, alt: String }]` (max 8) to Product. Keep `imageLink` as the primary/cover image for backward compatibility (cart aggregation, admin list, and existing data use it).
- Responses include `images` and fall back to `[{url: imageLink}]` when it is empty.
- The admin add/edit form (`client/src/components/ProductForm.jsx`) and Joi `addProductSchema` need an `images` input that uses the upload endpoint (FR-API-17). That's a minimal admin dependency, not a redesign.
- Image hosting is **decided (Q13):** server uploads (FR-API-17). Existing external URLs on the two allowed hosts stay valid.

**FR-API-09 — Specifications (P1)**

- Add `specs: [{ group: String, label: String, value: String }]` (max 50), with Joi validation and admin input. Rendered as a grouped table on the PDP.

**FR-API-10 — Variants (P2)**

- **Decided (Q15): variants are not needed now.** Each variant is modelled as a separate product. The options below are kept for reference if this is revisited:
  - **(a)** separate products linked by a `variantGroup` key (minimal change; each variant keeps its own price, stock, and slug), or
  - **(b)** an embedded `variants[{sku, attributes{color,capacity}, price, offPrice, countInStock, images}]` with cart lines keyed by `(productId, sku)`.
- Option (b) changes the cart schema, `getUserCartDetail`, coupons, payment, and admin. Recommendation: **(a)** if variants are needed at all.

**FR-API-11 — Category image (P1):** allow `icon.sm`/`icon.lg` (URLs, normally produced by the upload endpoint FR-API-17) in add and update category plus Joi validation. Also fix `parent` → `parentId` in `addNewCategory` (data-integrity fix; admin-side).

**FR-API-17 — Image upload (P0, decided Q13):** an admin-only endpoint (`authorize("ADMIN")`) that accepts product and category images and stores them on the server's **local disk** in a dedicated public uploads folder served by Express. This folder replaces the current whole-directory `express.static` (NFR-15). The response returns the public URL, which is stored in `imageLink`, `images[].url`, or `icon.*`. File type and size limits are set at implementation. The server host needs persistent disk storage **[Unverified: hosting]**.

**FR-API-12 — Featured flag (P2):** `isFeatured: Boolean` (default false) plus `featuredOrder: Number` on Product; `GET /product/list?featured=true`. Admin toggle.

**FR-API-13 — Best sellers (P2):** `soldCount` incremented by quantity in `POST /payment/create`, or an aggregation over `Payment.cart`. `sort=bestselling`.

**FR-API-14 — Reviews (P2):** new `Review` model `{product, user, rating 1–5, comment, status}`, one review per user per product (restricted to purchasers via `user.Products`), moderation in admin, and maintained `rating` and `numReviews`.

### 8.5 Cross-cutting API rules

- The **server is authoritative** for price, discount, coupon effect, stock, and permissions. The client displays server values only.
- All new inputs are validated with Joi following existing patterns (`server/app/http/validators/**`), returning `http-errors` 400s with Persian messages in the existing envelope.
- All changes are additive. Existing request and response fields keep their meaning, so the admin panel and current clients keep working.
- Authorization: cart, wishlist, and quantity endpoints sit behind `verifyAccessToken`. Catalogue reads keep `decideAuthMiddleware`.

---

## 9. Data and integration requirements

### 9.1 Model deltas (all Proposed)

| Model    | Change                                                                                          | Priority | Migration                                   |
| -------- | ----------------------------------------------------------------------------------------------- | -------- | ------------------------------------------- |
| Product  | Text index (FR-API-04)                                                                          | P0/P1    | Index build only                            |
| Product  | `images[]` (FR-API-08)                                                                          | P1       | None; default `[]`, fallback to `imageLink` |
| Product  | `specs[]` (FR-API-09)                                                                           | P1       | None; default `[]`                          |
| Product  | `likesCount` (optional, FR-API-05)                                                              | P1       | Backfill from `likes.length`                |
| Product  | `isFeatured`, `featuredOrder`, `soldCount`                                                      | P2       | Defaults                                    |
| Category | Persist `parentId` correctly; `icon` writable                                                   | P1       | None                                        |
| User     | No change required. (The duplicate `likedProducts` declaration should be removed as a cleanup.) | P2       | None                                        |
| Review   | New collection                                                                                  | P2       | —                                           |

### 9.2 Integration rules

- **Seed data:** none exists [Verified]. A seed script with electronics sample categories and products is **[Proposed, P0 dev dependency]** so design QA and tests have deterministic data. Seed categories: smartphones, headphones, smartwatches, accessories (**decided, Q19**). Seed images are stored in the uploads folder (FR-API-17). **Dev OTP (decided):** outside production the server skips Kavenegar and writes the OTP to the server log; tests read it from there.
- **Pricing invariant (decided, Q16):** the server computes `offPrice = Math.round(price × (1 − discount / 100))` (nearest whole Toman) on create and update. Admins no longer enter `offPrice`. A one-off migration recomputes it for existing products.
- **Currency:** prices are displayed as Toman (`"تومان"` labels in the client) **[Assumption: stored values are Toman]**.
- **Cookies across client and API:** the Next server forwards cookies to the API for RSC fetches (`toStringCookies`). New server-rendered, user-specific data (for example `isLiked`) must keep forwarding cookies and must not be cached across users (dynamic rendering or `no-store` for those fetches).

### 9.3 Compatibility with existing surfaces

- Admin and profile pages share `globals.css` and `tailwind.config.js`. Token changes must either keep the existing `--color-primary-*`/`--color-secondary-*` variables working for admin, or migrate admin in the same change. Recommendation: introduce **new** token names for the storefront and leave the old ones intact in P0.
- `generateStaticParams` and the admin dashboard (`client/src/services/data.js`) call `GET /product/list` without params. Defaults must stay unlimited (FR-API-03).

---

## 10. Non-functional requirements

| ID     | Area                   | Requirement (testable)                                                                                                                                                                                                                                                                                                                                               |
| ------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-01 | Responsive             | Layouts verified at 360, 390, 768, 1024, 1280, and 1440 px wide: no horizontal page scroll, tap targets ≥ 44×44 px on touch layouts.                                                                                                                                                                                                                                 |
| NFR-02 | Keyboard               | Every interactive element is reachable and operable by keyboard. The drawer and modal trap focus and close on Esc. Focus returns to the trigger.                                                                                                                                                                                                                     |
| NFR-03 | Focus                  | A visible `:focus-visible` ring with ≥ 3:1 contrast against adjacent colors on every focusable element.                                                                                                                                                                                                                                                              |
| NFR-04 | Semantics              | One `<h1>` per page. Landmarks `header`, `nav`, `main`, `footer`. Buttons are `<button>` (fixes the clickable `<div>` account trigger in `Header.jsx`). Icon-only buttons have `aria-label` (cart, wishlist, dark mode, quantity ±).                                                                                                                                 |
| NFR-05 | Contrast               | Text ≥ 4.5:1 (≥ 3:1 for large text). Palette usage per §5.3.                                                                                                                                                                                                                                                                                                         |
| NFR-06 | Motion                 | All non-essential motion is disabled under `prefers-reduced-motion: reduce`. No auto-playing carousels.                                                                                                                                                                                                                                                              |
| NFR-07 | Language and direction | `lang="fa" dir="rtl"` preserved. Latin fragments isolated. Persian digits for prices.                                                                                                                                                                                                                                                                                |
| NFR-08 | Images                 | `next/image` with `sizes`. LCP image `priority`. All product images have meaningful `alt` (product title). CLS is prevented by fixed aspect-ratio containers.                                                                                                                                                                                                        |
| NFR-09 | Performance            | On a production build (mobile emulation): Lighthouse Performance ≥ 85, LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms on Home, Listing, and PDP **[targets Proposed]**. No new client-side animation or 3D library in P0.                                                                                                                                                      |
| NFR-10 | Fonts                  | `font-display: swap` (FE: `localFonts.js`). At most one additional Latin font family.                                                                                                                                                                                                                                                                                |
| NFR-11 | SEO                    | Unique `<title>` and description per page, using the format `<page title> \| NEXAIVON`; Open Graph `siteName` is `NEXAIVON`. `generateMetadata` on the PDP and the category-filtered listing. Product JSON-LD on the PDP. Canonical URL on `/products` ignoring sort params **[Proposed]**. Description text no longer reads "پنل مدیریت ادمین" on storefront pages. |
| NFR-12 | States                 | Every data-driven section implements loading (skeleton), empty, and error states as specified in §6.                                                                                                                                                                                                                                                                 |
| NFR-13 | API errors             | The client shows the server `message` when present, otherwise a generic Persian message. No raw error objects or `undefined` toasts (today `toast.error(error?.response?.data?.message)` can toast `undefined`).                                                                                                                                                     |
| NFR-14 | Security               | User-specific operations stay behind `verifyAccessToken`. The `next` redirect parameter only accepts relative same-origin paths. No client-trusted price or stock. Detail endpoints stop leaking liker IDs (FR-API-07).                                                                                                                                              |
| NFR-15 | Security (existing)    | `express.static(path.join(__dirname, ".."))` serves the `server/` directory (source files). Restrict it to the dedicated public uploads folder (FR-API-17) **[Proposed, P0 risk fix]**. Dotfiles such as `.env` are ignored by Express's static defaults, but this is **[Unverified at runtime]**.                                                                                         |
| NFR-16 | Data integrity         | Existing cart, coupon, auth, and payment data remain readable after all migrations. All schema changes are additive.                                                                                                                                                                                                                                                 |

---

## 11. Priorities

### 11.1 P0 — Essential

| #     | Item                                                                                                                           | Frontend                  | Backend                                          | Depends on          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------- | ------------------------------------------------ | ------------------- |
| P0-1  | Brand application (NEXAIVON wordmark and monogram, tokens, typography, footer)                                                 | FE-01, §5                 | —                                                | —                   |
| P0-2  | Shared UI components (`ProductCard`, `Price`, `StockBadge`, `WishlistButton`, `Button` variants, Skeleton/Empty/Error)         | FE-02, FE-08              | —                                                | P0-1                |
| P0-3  | Header and mobile navigation, footer                                                                                           | FR-H-01..04               | FR-API-06 (`type` filter)                        | P0-2                |
| P0-4  | Homepage: Hero, Categories, Featured, Spotlight, New arrivals                                                                  | §6.1                      | FR-API-03 (`limit`) recommended                  | P0-2, static config |
| P0-5  | PDP redesign: dynamic or ISR rendering, price, stock state, breadcrumbs, single-image presentation, metadata                   | FR-PDP-01..06, 10, 12, 17 | FR-API-07 (or the interim client-side `isLiked`) | P0-2                |
| P0-6  | Listing: shared card, sale price, category filter (incl. mobile drawer), single sort control, empty, error, and loading states | §6.3                      | FR-API-06                                        | P0-2                |
| P0-7  | Stock and price correctness                                                                                                    | FR-CART-04..06, FR-PDP-11 | **FR-API-01, FR-API-16, FR-API-15**              | —                   |
| P0-8  | Cart redesign plus coupon bug fix plus no-cart guard                                                                           | FR-CART-01..03            | —                                                | P0-2                |
| P0-9  | Wishlist presentation and optimistic toggle                                                                                    | FR-W-01, FR-W-02          | —                                                | P0-2                |
| P0-10 | Route boundaries (`loading`, `error`, `not-found`)                                                                             | FE-04                     | —                                                | —                   |
| P0-11 | Accessibility and responsive baseline                                                                                          | NFR-01..08                | —                                                | all above           |
| P0-12 | Regression protection: smoke tests and seed data                                                                               | §12.11                    | seed script                                      | —                   |
| P0-13 | Close static exposure of server source                                                                                         | —                         | NFR-15                                           | —                   |
| P0-14 | Fix OTP singleton state (decided, Q18)                                                                                         | —                         | R6 fix                                           | —                   |
| P0-15 | Server image upload (decided, Q13)                                                                                             | admin image inputs        | FR-API-17                                        | P0-13               |
| P0-16 | Server-computed `offPrice` (decided, Q16)                                                                                      | admin form                | §9.2 pricing invariant                           | —                   |

### 11.2 P1 — Valuable enhancements

| Item                                                      | Frontend   | Backend                         |
| --------------------------------------------------------- | ---------- | ------------------------------- |
| Header search and search results                          | FR-H-04    | FR-API-04                       |
| Pagination or load more                                   | listing    | FR-API-03 (pages)               |
| Price sort, price and brand filters, correct "Most liked" | listing    | FR-API-05                       |
| Multi-image gallery                                       | FR-PDP-02  | FR-API-08 plus admin form input |
| Specifications table                                      | FR-PDP-07  | FR-API-09 plus admin form input |
| Quantity selector on PDP and cart "set quantity"          | FR-PDP-09  | FR-API-02                       |
| Related products                                          | FR-PDP-13  | FR-API-03 (`exclude`)           |
| Sticky mobile purchase bar                                | FR-PDP-14  | —                               |
| Wishlist page                                             | FR-W-03    | FR-API-07b (optional)           |
| Auth return-to (`next`)                                   | FR-AUTH-01 | —                               |
| Category images                                           | FR-C-03    | FR-API-11                       |
| Light micro-interactions (CSS-only)                       | §5.2       | —                               |

**Justification:** search and filters directly serve shopping. Gallery and specs are expected for electronics. Each depends on a contained, additive backend change.

### 11.3 P2 — Optional

| Item                                         | Why optional                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Variants (FR-API-10)                         | Large cross-cutting change (cart, coupon, payment, admin). Separate products work in the meantime. |
| Reviews and ratings (FR-API-14)              | Needs moderation and a purchase-verification policy. No data exists.                               |
| Best sellers (FR-API-13)                     | Needs reliable sales counting, which depends on FR-API-16.                                         |
| Featured flag and admin curation (FR-API-12) | Static config suffices for a portfolio.                                                            |
| Guest cart (FR-CART-07)                      | Auth-gated cart is acceptable. Merge logic adds risk.                                              |
| Advanced motion or 3D product views          | Performance cost. Only with a measured budget.                                                     |
| Personalisation and recommendations          | No data basis.                                                                                     |

### 11.4 Dependency order

```
Tokens (P0-1) → UI components (P0-2) → Header/Home/PDP/Listing/Cart (P0-3..9)
FR-API-01/15/16 (server) ──► FR-CART-04/05, FR-PDP-11 (client)
FR-API-06 (server) ──► category cards + listing filter (client)
FR-API-03 ──► limits, related products, pagination
FR-API-04 ──► search UI         FR-API-08/09 + admin form ──► gallery/specs UI
FR-API-02 ──► quantity selector FR-API-07(b) ──► wishlist detail/page (interim client fallback exists)
```

---

## 12. Acceptance criteria and testing

### 12.1–12.10 Feature acceptance criteria

Homepage: **AC-HOME-01..06** (§6.1). PDP: **AC-PDP-01..11** (§6.2). Listing: **AC-LIST-01..06** (§6.3). Additional criteria:

**Cart**

- **AC-CART-01** A signed-in user with no cart subdocument sees the empty-cart state, not an error.
- **AC-CART-02** "+" increases the quantity by 1 and the totals update to the server values. At `quantity = countInStock`, "+" is disabled and a forced request returns 400 (FR-API-01).
- **AC-CART-03** "−" at quantity 1 removes the line. Emptying the cart clears the coupon (existing server behaviour).
- **AC-CART-04** A non-admin user can apply a valid coupon. Invalid, expired, exhausted, and non-applicable codes show the server's message.
- **AC-CART-05** Displayed totals equal `payDetail.totalGrossPrice`, `totalOffAmount`, and `totalPrice` exactly.
- **AC-CART-06** Placing an order with a line quantity above stock fails with 400, and no payment is created and no stock changes (FR-API-01/16).
- **AC-CART-07** After a successful order, each product's `countInStock` decreases by the ordered quantity and never goes below 0.

**Wishlist**

- **AC-WISH-01** Toggling on a card updates the icon immediately. After a reload the state matches the server.
- **AC-WISH-02** A guest toggling is redirected to `/auth`.
- **AC-WISH-03** The same product shows the same state on the listing, PDP, and wishlist page.

**Variants (only if FR-API-10 is implemented)**

- **AC-VAR-01** Selecting a variant updates price, stock, image, and URL. Unavailable variants are disabled with an explanation. The cart line records the chosen variant.

**Responsive and accessibility**

- **AC-A11Y-01** axe-core reports no serious or critical violations on Home, Listing, PDP, Cart, and Auth.
- **AC-A11Y-02** A keyboard-only user can browse to a product, add it to the cart, and reach "Place order".
- **AC-A11Y-03** Under reduced motion, no transform or parallax animation runs.
- **AC-RESP-01** NFR-01 holds on all storefront pages.

**API failures and empty data**

- **AC-ERR-01** API down → error boundaries render with retry. The header falls back to the guest state.
- **AC-ERR-02** `/products?category=unknown` → empty state, HTTP 200 (FR-API-06).
- **AC-ERR-03** An expired access token on public catalogue pages either refreshes or degrades to guest data. Product pages never fail because of a stale cookie **[Unverified today; see R7]**.

### 12.11 Regression checks (existing functionality)

- OTP login → complete profile → profile page shows the user and payments.
- Admin can list, add, edit, and delete products, categories, and coupons; view users and payments. `/admin` is still blocked for non-admins (`client/src/middleware.js`).
- Dark-mode toggle persists (`localStorage` key `isDarkMode`).
- Logout clears the session.
- The order flow still creates a `COMPLETED` payment and empties the cart.

### 12.12 Test strategy (recommendations; no tests exist today [Verified])

| Layer                       | Tooling **[Proposed]**                                     | Coverage                                                                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server unit and integration | Jest or Vitest plus Supertest plus `mongodb-memory-server` | `getUserCartDetail` (discounts, coupons, invalid coupon), cart add/remove/quantity with stock limits, payment validation and decrement, product list filters/sort/pagination/unknown category, wishlist toggle |
| Client unit and component   | Vitest or Jest plus React Testing Library                  | `Price`, `StockBadge`, `ProductCard`, `QuantityStepper` bounds, `WishlistButton` optimistic rollback, safe `next` redirect parsing                                                                             |
| End-to-end                  | Playwright (with seed data)                                | Journeys in §2.2; AC-HOME, AC-PDP, AC-LIST, AC-CART; viewport matrix; axe scan                                                                                                                                 |
| Manual                      | Visual QA in RTL, light and dark                           | Design sign-off                                                                                                                                                                                                |

Adding these tools changes `package.json`, **Decided (Q17):** Vitest + Supertest + `mongodb-memory-server` (server), Vitest + React Testing Library (client), and Playwright (end-to-end). They are set up first, before the server stock and cart changes.

---

## 13. Dependencies and risks

| ID  | Risk / dependency                                                                                                                 | Evidence                                      | Impact                                                       | Mitigation                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| R1  | Overselling: no stock check on add-to-cart or order                                                                               | `cart.controller.js`, `payment.controller.js` | Orders beyond stock; negative stock                          | FR-API-01, FR-API-16 (P0)                                                                                 |
| R2  | Stock decremented by 1 regardless of quantity                                                                                     | `payment.controller.js`                       | Inventory drift                                              | FR-API-16                                                                                                 |
| R3  | No real payment gateway; orders are marked paid                                                                                   | `payment.controller.js`                       | Misleading for real use                                      | Demo-order copy (FR-CART-08); decided Q10                                                                 |
| R4  | A stale coupon may break cart aggregation (`null.newProductDetail`)                                                               | `utils/functions.js`                          | `/user/profile` failure breaks the header, cart, and profile | FR-API-15 **[runtime Unverified]**                                                                        |
| R5  | `$text` search with no declared index                                                                                             | `product.js`, `product.controller.js`         | Search 500s                                                  | FR-API-04                                                                                                 |
| R6  | OTP code held on the controller singleton (`this.code`)                                                                           | `user.controller.js`                          | Concurrent logins may receive or verify the wrong code       | **Decided (Q18):** fixed in this project (P0-14); the code is held in request-local variables              |
| R7  | An expired `accessToken` cookie makes optional-auth catalogue endpoints return 401 (`decideAuthMiddleware` → `verifyAccessToken`) | `user.middleware.js`                          | Server-rendered pages may error for returning users          | Treat an invalid token as a guest in optional auth, or handle 401 in RSC fetches **[runtime Unverified]** |
| R8  | PDP is SSG with `dynamicParams=false`                                                                                             | `[slug]/page.jsx`                             | 404 for new products; stale price and stock                  | FR-PDP-01                                                                                                 |
| R9  | `express.static` exposes server source                                                                                            | `server.js`                                   | Information disclosure                                       | NFR-15                                                                                                    |
| R10 | `GET /category/list` passes raw query into `find`                                                                                 | `category.js` controller                      | Query-operator injection on a public endpoint                | FR-API-06                                                                                                 |
| R11 | `next/image` host whitelist (2 hosts)                                                                                             | `next.config.js`                              | New product images fail to render                            | Uploads (FR-API-17) plus the API host; existing hosts kept (Q13)                                          |
| R12 | Token changes may restyle admin and profile unexpectedly                                                                          | shared `globals.css`                          | Admin visual regressions                                     | New token names (§9.3)                                                                                    |
| R13 | Manual `offPrice` entry                                                                                                           | admin form, `product.schema.js`               | Wrong cart totals                                            | Server-computed `offPrice` (Q16)                                                                          |
| R14 | No tests or seed data                                                                                                             | repo                                          | Regressions go undetected                                    | P0-12                                                                                                     |
| R15 | Persian full-text search quality                                                                                                  | MongoDB text-search language support          | Poor search relevance                                        | Regex fallback (FR-API-04) **[Unverified]**                                                               |
| R16 | Two separate git repos with independent deploys                                                                                   | `client/.git`, `server/.git`                  | Frontend features shipping before their API                  | Feature flags or ordering per §11.4                                                                       |

---

## 14. Existing capabilities vs proposed changes

| Capability                                                      | Exists today [Verified]           | Proposed change                                          | Layer                 |
| --------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------- | --------------------- |
| Product catalogue (single image, price, discount, stock, brand) | Yes                               | Better presentation                                      | FE                    |
| Category filter (multi, URL-based)                              | Yes (crashes on unknown)          | Safe handling, type filter, mobile drawer                | FE + BE               |
| Sort latest/earliest                                            | Yes                               | Keep                                                     | —                     |
| Sort popular                                                    | Yes (wrong key)                   | Sort by like count                                       | BE                    |
| Search                                                          | Backend param only                | Index plus UI                                            | FE + BE               |
| Pagination                                                      | No                                | `limit`/`page`                                           | FE + BE               |
| Product detail                                                  | Yes (SSG, stale)                  | Dynamic or ISR, stock, brand, metadata                   | FE                    |
| Gallery / specs / variants                                      | No                                | P1 / P1 / P2                                             | FE + BE + Admin input |
| Ratings / reviews                                               | Fields only, unused               | P2                                                       | FE + BE               |
| Server cart (+1/−1), totals, coupons                            | Yes                               | Stock validation, set quantity, UI coupon fix            | FE + BE               |
| Order placement                                                 | Yes (no gateway, buggy decrement) | Validation plus quantity-aware decrement                 | BE                    |
| Wishlist (likes) toggle                                         | Yes                               | Heart UI, optimistic, `isLiked` on detail, wishlist page | FE + BE               |
| OTP auth plus profile completion                                | Yes                               | Restyle plus `next` redirect                             | FE                    |
| Dark mode                                                       | Yes                               | New tokens for both themes                               | FE                    |
| Admin panel                                                     | Yes                               | Preserved; small inputs for new fields only              | Admin                 |
| Featured content / CMS                                          | No                                | Static config (P0); flag (P2)                            | FE / BE               |
| Loading, error, and 404 states                                  | No                                | Added                                                    | FE                    |
| Tests / seed data                                               | No                                | Added                                                    | FE + BE               |

---

## 15. Decisions and assumptions

### 15.1 Decisions (resolved with the project owner, 2026-10-20)

All open questions are resolved. Question IDs are kept stable so references elsewhere in this document stay valid. Q1 is no longer used.

| #   | Question                                               | Decision                                                                                                                                        | Affects                    |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Q2  | Show a "portfolio / demo store" notice?                | **No notice.**                                                                                                                                   | Footer                     |
| Q3  | Saturated accent, or fully neutral?                    | **Fully neutral.** Focus rings use charcoal (warm-white on dark surfaces).                                                                       | Tokens                     |
| Q4  | Latin display face for the wordmark?                   | **Inter** (variable, via `next/font`), for the wordmark and Latin spec values only.                                                              | Typography                 |
| Q5  | Shipping, returns, warranty, contact info?             | **Kept hidden.** Added later only if the owner supplies real copy.                                                                               | Footer, FR-PDP-16          |
| Q6  | Spotlight when its product is unavailable?             | **Hide the whole section.**                                                                                                                      | Spotlight                  |
| Q7  | Low-stock threshold and exact counts?                  | **Threshold 3, exact count shown** ("تنها N عدد باقی مانده").                                                                                    | FR-PDP-05                  |
| Q8  | Max quantity per order line?                           | **No separate cap.** The limit is `countInStock`.                                                                                                | FR-API-02, FR-PDP-09       |
| Q9  | Currency for structured data?                          | **`IRR`**, price converted from Toman × 10.                                                                                                      | FR-PDP-17                  |
| Q10 | Simulated payment?                                     | **Keep it, and label it clearly as a demo order** in the checkout copy. No gateway in this project.                                              | FR-CART-08, R3             |
| Q11 | Location for new UI components?                        | **`client/src/components/ui/`.** Existing `src/common` components stay until migrated.                                                         | FE-02                      |
| Q12 | PDP freshness?                                         | **ISR, `revalidate = 60` s.**                                                                                                                    | FE-05, FR-PDP-01           |
| Q13 | Image hosting?                                         | **Server uploads, stored on local disk** in a dedicated public uploads folder (FR-API-17, **P0**). The two existing external hosts stay allowed. | FE-06, FR-API-08/11/17, R11 |
| Q14 | Search: text index or regex?                           | **Escaped, case-insensitive regex** on `title` and `brand`.                                                                                     | FR-API-04                  |
| Q15 | Variants?                                              | **Not needed now.** Each variant is a separate product. FR-API-10 stays in the P2 backlog.                                                      | FR-API-10                  |
| Q16 | Enforce or compute `offPrice`?                         | **Computed by the server**: `Math.round(price × (1 − discount / 100))`, nearest whole Toman. A one-off migration recomputes existing products. | §9.2, R13                  |
| Q17 | Test runners, and when?                                | **Vitest + Supertest + `mongodb-memory-server`** (server), **Vitest + React Testing Library** (client), **Playwright** (e2e). Set up first.   | §12.12                     |
| Q18 | Fix the OTP singleton-state issue here?                | **Yes, in this project (P0-14).**                                                                                                                | R6                         |
| Q19 | Seed category set?                                     | **Smartphones, headphones, smartwatches, accessories.**                                                                                         | Seed data, category cards  |
| —   | OTP in development and tests?                          | **Outside production, skip Kavenegar and write the OTP to the server log.** Tests read it from there.                                           | Seed data, tests           |

### 15.2 Assumptions

| #   | Assumption                                                                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | The storefront remains Persian/RTL with Toman prices (owner decision).                                                                                          |
| A2  | Prices are stored as integer Toman values.                                                                                                                      |
| A3  | The catalogue is small (< 100 products) during the portfolio phase, so client-side fallbacks (wishlist filtering, unpaginated lists) are acceptable short-term. |
| A4  | The MongoDB deployment's index state, existing data, and replica-set status (needed for transactions) are unknown.                                              |
| A5  | Admin users will enter new product data (images, specs) through minimal additions to the existing admin form.                                                   |
| A6  | Deployment targets (Vercel vs Netlify for the client; server host) don't constrain the proposed rendering modes.                                                |
| A7  | "Portfolio reviewer" is a design-quality persona, not a system role.                                                                                            |

---

_End of document._
