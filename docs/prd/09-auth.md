# Sub-PRD 09 — Authentication: Return-To, Restyle, and Telegram Login

|                |                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §6.6 (FR-AUTH-01..03), §6.6.1 (FR-TG-01..10, AC-TG-01..12), §8.6 (FR-API-18..21), NFR-14, NFR-17, R6, R17–R20, Q18, Q20–Q22 |
| **Priority**   | P0: FR-AUTH-02, FR-AUTH-03, OTP state fix (P0-14). P1: FR-AUTH-01, Telegram login (Q20)               |
| **Repos**      | `client/`; `server/` for the OTP state fix and Telegram login                                         |
| **Depends on** | 01. Telegram login also depends on FR-AUTH-02/03 and P0-14 from this sub-PRD, and on the server test harness (11) |
| **Blocks**     | AC-PDP-08 (06), guest prompts in 07 and 08                                                            |
| **Status**     | Draft v2 (Telegram login added)                                                                       |

## 1. Goal

Make sign-in feel part of the new storefront and return shoppers to where they were, without touching the auth mechanism. Add **Telegram** as a second way to sign in, sign up, and link an account, producing exactly the same session as phone OTP.

## 2. Non-goals (verbatim from the parent)

No changes to the JWT cookies (`accessToken`, `refreshToken`, names, lifetimes, flags), the OTP provider (Kavenegar), or roles. The phone OTP → JWT cookie flow stays as it is. The server changes are the OTP state fix in §4.1 (Q18), which is a correctness fix, and the **additive** Telegram flow in §4.3 (Q20–Q22), which issues the existing session through the existing `setAccessToken` / `setRefreshToken`.

Also out of scope: password sign-in, email verification and delivery, merging duplicate accounts, adding a phone number to a Telegram-only account, and admin tools for Telegram (see sub-PRD 12).

## 3. Current state (summary)

`client/src/app/(user)/auth/page.jsx`: two steps (`SendOTPForm`, `CheckOTPForm`), 90 s resend timer. After success it redirects to `/` or `/complete-profile`. `complete-profile` uses react-hook-form for name and email. Middleware guards only `/profile` and `/admin`.

Server: `UserAuthController.completeProfile` rejects users without `isVerifiedPhoneNumber`. The User model has no Telegram fields, and nothing in either repo talks to Telegram. There is no rate limiting on any auth route. **[Verified]**

## 4. Requirements

| ID             | Requirement                                                                                                                                                                              | Priority |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **FR-AUTH-01** | Support `?next=<path>` on `/auth`, carried through `/complete-profile`. Redirect there after success. Accept **only** same-origin relative paths starting with `/` (reject `//…`, `/\…`, absolute URLs, and `javascript:`). Otherwise fall back to the current behaviour. Applies to phone and Telegram sign-in alike. | P1       |
| **FR-AUTH-02** | Restyle auth and complete-profile with the design system. Preserve the flow, the 90 s timer, and validation.                                                                                | P0       |
| **FR-AUTH-03** | Accessible OTP input: `autocomplete="one-time-code"`, `inputmode="numeric"`, a visible label, LTR digits inside the RTL page. Same for the phone number field. The Telegram code input reuses this component. | P0       |
| **FR-TG-01..09** | Telegram login UI: method tabs, QR and deep link, polling, code step, error states, post-login routing, profile sign-in methods card, complete-profile prefill and hint, phone-less display. Full text in PRD §6.6.1. | P1       |
| **FR-TG-10** / **FR-API-18..21** | Telegram server endpoints, bot, data model, rate limits. Full text in PRD §8.6.                                                                           | P1       |

### 4.1 OTP state fix — P0-14 (Q18 decided)

- `UserAuthController` stores the generated code on the controller singleton (`this.code`) between generation and SMS send (R6). Move it into request-local variables, so concurrent `get-otp` requests can't overwrite each other's code.
- Behaviour is otherwise unchanged: 6 digits, 90 s TTL, same Kavenegar template.
- **Dev and test OTP (decided):** when `NODE_ENV !== "production"`, skip the Kavenegar call and write the OTP to the server log. Production behaviour is unchanged. Sub-PRD 11 uses this for seed users and e2e tests.

### 4.2 `next` producers

**`next` producers** (callers that must append `?next=`): AddToCart on the PDP and cards (06), the wishlist toggle (08), and the guest cart prompt (07).

**`next` parsing** is a pure utility with unit tests (PRD §12.12, "safe `next` redirect parsing"). The Telegram tab reads the same parsed value.

### 4.3 Telegram login — P1 (Q20–Q22 decided)

**Reference:** the Telegram auth flow of `github.com/parisa-adli/-inventory-app-ai` (files listed in PRD §6.6.1). NEXAIVON keeps its mechanics (hashed attempt, single-use nonce in a `t.me` deep link, code sent by the bot, atomic claims, attempt and resend caps) and adapts the edges to this codebase. The adaptations table is in PRD §6.6.1. The two that matter most:

- **A new Telegram user is signed in right after the code** and then completes the existing `/complete-profile`. The reference instead collects username and email on the Telegram panel and emails a verification link; NEXAIVON has no email service.
- **No automatic account merge.** A duplicate email on `/complete-profile` keeps failing as today, with a hint to sign in by phone and link Telegram from the profile.

#### 4.3.1 Attempt state machine (FR-API-20)

```
           POST /start or /link
                  │
                  ▼
   ┌──────────► PENDING ──(5 min)──────────────► EXPIRED
   │              │  bot: /start <nonce>  (atomic claim, single use)
   │              ▼
   │        AWAITING_OTP ──(5 wrong codes)─────► LOCKED
   │              │  POST /verify, correct code (atomic claim on otpHash)
   │              ▼
   │          COMPLETED   purpose = LOGIN (known chat) | SIGNUP (new user) | LINK (caller)
   │
   └── "Start over": POST /start again (the previous attempt of this browser is discarded)
```

Limits: attempt 5 min; code 2 min; resend cooldown 60 s, max 3 resends (each resend resets the wrong-code counter); 5 wrong codes lock the attempt; client polls every 2 s; attempt cookie 15 min. Expired attempts are removed by a TTL index.

#### 4.3.2 Server work items (in delivery order)

1. **Model** (FR-API-20): `AuthSession` collection; `telegramChatId` (unique, sparse) and `telegramUsername` on User.
2. **Bot** (FR-API-19): grammY; `bot` / `log` / `unavailable` modes; polling by default, optional webhook with a secret header; started from `server/index.js` after the database connects; Persian bot texts; no updates in error logs.
3. **Service**: create attempt, bot claim, status view, verify (LOGIN / SIGNUP / LINK), resend, unlink. Pure functions over the models, with injectable `now` for tests, as in the reference.
4. **Routes** (FR-API-18): `POST /start`, `POST /link`, `GET /status`, `POST /verify`, `POST /resend`, `DELETE /` under `/api/user/telegram`, in the existing `{statusCode, data}` envelope with Persian messages. Joi schema for `{code}` (6 digits).
5. **Profile completion guard**: `completeProfile` accepts a verified phone **or** a linked `telegramChatId`.
6. **Rate limits** (FR-API-21): `express-rate-limit` per IP on the Telegram routes.
7. **Environment**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_MODE`, `TELEGRAM_WEBHOOK_SECRET` documented in `server/.env.example`; fail-fast startup validation. The code HMAC uses `ACCESS_TOKEN_SECRET_KEY`; webhook mode uses `SERVER_URL`.

#### 4.3.3 Client work items

1. **Method tabs on `/auth`** (FR-TG-01): phone (default) and Telegram, as an accessible tab list. `next` is kept across tabs.
2. **Telegram panel** (FR-TG-02..05): a `useTelegramAuth` hook that derives the phase (`starting`, `qr`, `otp`, `expired`, `locked`, `unavailable`, `error`) from the start response, the polled status, and local results, following the reference hook; the panel renders the QR code (`qrcode.react`, SVG) plus "Open Telegram", the countdowns, the code input (FR-AUTH-03), resend, and "Start over". All copy is Persian. Charcoal primary button with the Telegram icon (Q3).
3. **Post-login routing** (FR-TG-06): identical to the phone flow, including `next` and `/complete-profile` for `isActive === false`. Invalidate `["get-user"]`.
4. **Complete profile** (FR-TG-08): prefill the name from the Telegram display name; duplicate-email hint.
5. **Profile sign-in methods card** (FR-TG-07): phone and Telegram status, "Link Telegram" (reuses the panel with the `/link` start and an "already signed in" completion), "Unlink" with a confirm dialog and the server's message when refused.
6. **Phone-less display** (FR-TG-09): check the profile panel, the admin user list, and the admin payment detail for a missing `phoneNumber`.

#### 4.3.4 Service module (`client/src/services/`)

Add Telegram calls to `authServices.js`: `startTelegramAuth`, `startTelegramLink`, `getTelegramStatus`, `verifyTelegramCode`, `resendTelegramCode`, `unlinkTelegram`. They go through the existing `httpService` instance, so the 401 → refresh-token retry also covers the `LINK` verify.

## 5. Acceptance criteria

- **AC-AUTH-01** `/auth?next=/products/abc` → after OTP, the user lands on `/products/abc`. A new user goes through `/complete-profile` first and then lands there.
- **AC-AUTH-02** `?next=https://evil.com`, `?next=//evil.com`, and `?next=/\evil.com` → the user is redirected to the default destination (NFR-14).
- **AC-AUTH-03** The 90 s resend timer and server validation messages behave exactly as before (regression, PRD §12.11).
- **AC-AUTH-04** On a mobile device, the OTP field offers SMS code autofill and a numeric keypad. Digits render left-to-right.
- **AC-PDP-08** (from the parent) Guest add-to-cart → auth → returned to the same product.
- **AC-AUTH-05** Two `get-otp` requests for different phone numbers, sent at the same time, each receive and verify their own code (R6 fix).
- **AC-AUTH-06** With `NODE_ENV=development`, `get-otp` makes no Kavenegar call and the code appears in the server log. With `NODE_ENV=production`, the SMS is sent and the code is not logged.

**Telegram (verbatim IDs from PRD §6.6.1; summaries here, the parent holds the full text):**

- **AC-TG-01** Linked account signs in with the same cookies as phone OTP and lands on `next` or `/`.
- **AC-TG-02** Unknown Telegram account → exactly one new `USER` with `telegramChatId`, `isActive = false`, no phone → `/complete-profile` with the name prefilled.
- **AC-TG-03** A nonce works once and never overwrites the stored Telegram account; expired QR → "expired" reply.
- **AC-TG-04** Wrong code → 400 with attempts left; 5th → 423 locked; code older than 2 min → 410.
- **AC-TG-05** Resend cooldown 60 s and max 3 resends (429); a resent code invalidates the old one.
- **AC-TG-06** Parallel verifies with the same code → at most one session and one user.
- **AC-TG-07** Link keeps the caller's session; chat linked elsewhere → 409; different signed-in user → 403.
- **AC-TG-08** Unlink works with a verified phone; refused (400) for Telegram-only accounts.
- **AC-TG-09** The nonce alone (no browser cookie) cannot read or finish the attempt.
- **AC-TG-10** Production without a token → 503 on all Telegram endpoints, phone OTP unaffected; dev without a token → bot messages in the server log.
- **AC-TG-11** Per-IP limits return 429 in the standard envelope.
- **AC-TG-12** The Telegram tab passes axe, is keyboard operable, and always offers the "Open Telegram" link as a non-QR path.
- **Regression** (PRD §12.11): after Telegram ships, phone OTP sign-in, the `check-otp` response, cookie names and lifetimes, and `/complete-profile` for phone users are unchanged.

## 6. Decisions (PRD §15.1)

| #   | Decision                                                                                     |
| --- | -------------------------------------------------------------------------------------------- |
| Q18 | The OTP singleton-state issue is fixed in this project (§4.1, P0-14).                         |
| —   | Outside production, OTP skips Kavenegar and is written to the server log.                    |
| Q20 | Telegram login is P1.                                                                        |
| Q21 | Telegram supports sign-up and sign-in. New users complete the existing `/complete-profile`.   |
| Q22 | Signed-in users can link and unlink Telegram from the profile panel. Unlink is refused when it is the only sign-in method. |
| Q23 | Telegram is reached through a VPN (server and shoppers).                                     |
| Q24 | The owner created the bot; token and username go in `server/.env`.                            |

## 7. Risks

- **R6** Resolved by §4.1.
- The dev OTP log must never be active in production. Guard it on `NODE_ENV` and cover it with AC-AUTH-06. The same rule applies to the Telegram `log` mode (AC-TG-10).
- **R17** The bot exists (Q24); its token and username go in NEXAIVON's `server/.env`. The polling bot still needs an always-on server process. Confirm hosting before enabling `bot` mode, or use webhook mode.
- **R18** `PATCH /user/update` changes `phoneNumber` without verification and phone numbers are not unique. This predates Telegram, but phone-less accounts make it easier to hit. Tracked in sub-PRD 12.
- **R19** Telegram is restricted in Iran. **Decided (Q23):** the server reaches `api.telegram.org` through a VPN and shoppers use their own. If the VPN is a proxy rather than system-wide, the bot needs a proxy setting (PRD §9.2). Phone OTP stays the default tab.
- **R20** A phone user who signs up with Telegram instead of linking gets a second account. Mitigated by the complete-profile hint and the profile link flow. No merge in this project.
