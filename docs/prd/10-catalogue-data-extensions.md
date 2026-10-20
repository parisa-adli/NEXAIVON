# Sub-PRD 10 — Catalogue Data Extensions: Gallery, Specifications, Category Images

|                |                                                                                  |
| -------------- | -------------------------------------------------------------------------------- |
| **Parent**     | [PRD](../PRD.md) §8.4 (FR-API-08, 09, 11), §9.1, FE-06, FR-PDP-02, FR-PDP-07, FR-C-03, R11, A5 |
| **Priority**   | P1                                                                               |
| **Repos**      | `server/` (models, Joi, controllers), `client/` admin form (minimal), `client/` storefront rendering |
| **Depends on** | 03 (patterns), 06 (PDP layout), 04 (category cards)                              |
| **Blocks**     | FR-PDP-02 gallery, FR-PDP-07 specs, FR-C-03 category images                     |
| **Status**     | Draft v1                                                                         |

## 1. Goal

Add the product data electronics shoppers expect (multiple images, technical specs) and make category images settable, through additive schema changes and the smallest admin-form additions needed to enter the data.

## 2. Non-goals

- Admin panel redesign (PRD §3.2). Only new input fields are added.
- The upload endpoint itself. It is FR-API-17 (P0, sub-PRD 03), and this sub-PRD uses it.

## 3. Requirements

### 3.1 FR-API-08 — Product gallery

- Model: `images: [{ url: String, alt: String }]`, max 8, default `[]`.
- `imageLink` stays the cover image (cart aggregation, admin list, and existing data use it).
- Responses (list, slug, id) include `images`. When it's empty, respond with `[{ url: imageLink }]`.
- Joi `addProductSchema` and the update schema accept `images` (URL and length validation).
- Admin: `client/src/components/ProductForm.jsx` gets a repeatable image input (upload through FR-API-17, plus alt text).
- Storefront: the PDP gallery (FR-PDP-02, sub-PRD 06 §3.2).

### 3.2 FR-API-09 — Specifications

- Model: `specs: [{ group: String, label: String, value: String }]`, max 50, default `[]`.
- Joi validation and admin repeatable rows (group, label, value).
- Storefront: grouped table on the PDP (FR-PDP-07). Latin values use the Latin face and `<bdi>` (01). Hidden when empty.
- Optional later use: the spotlight highlights on the homepage (04).

### 3.3 FR-API-11 — Category images and parent fix

- Allow `icon.sm` and `icon.lg` (URLs) in add and update category, with Joi validation.
- **Data-integrity fix:** `addNewCategory` writes `parent`, but the schema field is `parentId`, so the hierarchy is never stored. Write `parentId`.
- Admin: category form gets two image inputs (upload through FR-API-17).
- Storefront: category cards prefer `icon.lg`, then the config image, then the fallback tile (04, FR-C-03).

### 3.4 Image hosts — FE-06, R11, Q13

- `client/next.config.js` `remotePatterns` allows only `dkstatics-public.digikala.com` and `rasanika.com` today.
- **Decided (Q13):** new images are uploaded to the server (FR-API-17), so the API host is added. The two existing hosts stay allowed so existing products keep rendering.

## 4. Migration (PRD §9.1)

| Change               | Migration                                   |
| -------------------- | ------------------------------------------- |
| Product `images[]`   | None. Default `[]`, fallback to `imageLink` |
| Product `specs[]`    | None. Default `[]`                          |
| Category `icon`, `parentId` | None (existing docs are unaffected)    |

All existing cart, coupon, and payment data remain readable (NFR-16).

## 5. Acceptance criteria

- **AC-EXT-01** A product without `images` returns `images: [{url: imageLink}]`. The cart and admin list are unchanged.
- **AC-EXT-02** Saving 9 images or 51 specs → 400 with a Persian message.
- **AC-EXT-03** Admin can add, edit, and remove images and specs on a product. The PDP reflects them on the next request (with FR-PDP-01).
- **AC-EXT-04** Creating a category with a parent stores `parentId`.
- **AC-EXT-05** A category with `icon.lg` shows that image on the homepage card.
- **AC-PDP-06** and the FR-PDP-07 rendering criteria (sub-PRD 06).

## 6. Decisions (PRD §15.1)

| #   | Decision                                                                            |
| --- | ----------------------------------------------------------------------------------- |
| Q13 | Server uploads on local disk (FR-API-17, P0). The two existing external hosts stay allowed. |

## 7. Risks

- **R11** Resolved for new images by uploads. Existing external URLs still depend on the two allowed hosts.
- **A5** Assumes admins will enter the data through the minimal form additions.
