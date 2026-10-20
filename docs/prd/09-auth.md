# Sub-PRD 09 — Authentication: Return-To and Restyle

|                |                                                                    |
| -------------- | ------------------------------------------------------------------ |
| **Parent**     | [PRD](../PRD.md) §6.6 (FR-AUTH-01..03), NFR-14, R6, Q18             |
| **Priority**   | P0: FR-AUTH-02, FR-AUTH-03, OTP state fix (P0-14). P1: FR-AUTH-01  |
| **Repos**      | `client/`; `server/` for the OTP state fix                         |
| **Depends on** | 01                                                                 |
| **Blocks**     | AC-PDP-08 (06), guest prompts in 07 and 08                         |
| **Status**     | Draft v1                                                           |

## 1. Goal

Make sign-in feel part of the new storefront and return shoppers to where they were, without touching the auth mechanism.

## 2. Non-goals (verbatim from the parent)

No changes to tokens, cookies, the OTP provider (Kavenegar), or roles. The phone OTP → JWT cookie flow stays as it is. The one server change is the OTP state fix in §4.1 (Q18), which is a correctness fix, not an auth redesign.

## 3. Current state (summary)

`client/src/app/(user)/auth/page.jsx`: two steps (`SendOTPForm`, `CheckOTPForm`), 90 s resend timer. After success it redirects to `/` or `/complete-profile`. `complete-profile` uses react-hook-form for name and email. Middleware guards only `/profile` and `/admin`.

## 4. Requirements

| ID             | Requirement                                                                                                                                                                              | Priority |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **FR-AUTH-01** | Support `?next=<path>` on `/auth`, carried through `/complete-profile`. Redirect there after success. Accept **only** same-origin relative paths starting with `/` (reject `//…`, `/\…`, absolute URLs, and `javascript:`). Otherwise fall back to the current behaviour. | P1       |
| **FR-AUTH-02** | Restyle auth and complete-profile with the design system. Preserve the flow, the 90 s timer, and validation.                                                                                | P0       |
| **FR-AUTH-03** | Accessible OTP input: `autocomplete="one-time-code"`, `inputmode="numeric"`, a visible label, LTR digits inside the RTL page. Same for the phone number field.                            | P0       |

### 4.1 OTP state fix — P0-14 (Q18 decided)

- `UserAuthController` stores the generated code on the controller singleton (`this.code`) between generation and SMS send (R6). Move it into request-local variables, so concurrent `get-otp` requests can't overwrite each other's code.
- Behaviour is otherwise unchanged: 6 digits, 90 s TTL, same Kavenegar template.
- **Dev and test OTP (decided):** when `NODE_ENV !== "production"`, skip the Kavenegar call and write the OTP to the server log. Production behaviour is unchanged. Sub-PRD 11 uses this for seed users and e2e tests.

### 4.2 `next` producers

**`next` producers** (callers that must append `?next=`): AddToCart on the PDP and cards (06), the wishlist toggle (08), and the guest cart prompt (07).

**`next` parsing** is a pure utility with unit tests (PRD §12.12, "safe `next` redirect parsing").

## 5. Acceptance criteria

- **AC-AUTH-01** `/auth?next=/products/abc` → after OTP, the user lands on `/products/abc`. A new user goes through `/complete-profile` first and then lands there.
- **AC-AUTH-02** `?next=https://evil.com`, `?next=//evil.com`, and `?next=/\evil.com` → the user is redirected to the default destination (NFR-14).
- **AC-AUTH-03** The 90 s resend timer and server validation messages behave exactly as before (regression, PRD §12.11).
- **AC-AUTH-04** On a mobile device, the OTP field offers SMS code autofill and a numeric keypad. Digits render left-to-right.
- **AC-PDP-08** (from the parent) Guest add-to-cart → auth → returned to the same product.
- **AC-AUTH-05** Two `get-otp` requests for different phone numbers, sent at the same time, each receive and verify their own code (R6 fix).
- **AC-AUTH-06** With `NODE_ENV=development`, `get-otp` makes no Kavenegar call and the code appears in the server log. With `NODE_ENV=production`, the SMS is sent and the code is not logged.

## 6. Decisions (PRD §15.1)

| #   | Decision                                                                                     |
| --- | -------------------------------------------------------------------------------------------- |
| Q18 | The OTP singleton-state issue is fixed in this project (§4.1, P0-14).                         |
| —   | Outside production, OTP skips Kavenegar and is written to the server log.                    |

## 7. Risks

- **R6** Resolved by §4.1.
- The dev OTP log must never be active in production. Guard it on `NODE_ENV` and cover it with AC-AUTH-06.
