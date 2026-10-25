# NEXAIVON Design System & UI Spec

The source of truth is the three reference mockups in `docs/design/`:

| File | Page |
|---|---|
| `docs/design/homepage.png` | Homepage |
| `docs/design/products.png` | Product listing (`/products`) |
| `docs/design/singleproduct.png` | Product detail (`/products/[slug]`) |

How to read this document:

- All mockups are **desktop only**. Each is 1024 × 1536 px, which looks like a scaled-down full-page capture, so pixel sizes here are **proportions of a 1024 px wide canvas**, not final CSS values. Real px values are **unspecified**.
- Hex colors were **sampled from the PNGs** (dominant pixel in the region). Compression and anti-aliasing can shift them by a few points, so treat them as close approximations.
- **Unspecified** means the references don't show it. Don't invent a value. Ask, or use the closest existing token in the codebase.
- **Inconsistent** means the mockups disagree with each other. Each case notes which variant belongs to which page.

---

## 1. Global principles

- **Direction: RTL.** UI language is Persian (Farsi). Layouts mirror RTL: the logo sits on the right, primary content starts at the right, "back"/"see all" arrows point left.
- **Mixed scripts.** Persian UI copy is mixed with Latin product names, specs and brand names (e.g. `iPhone 16 Pro Max`, `256GB | Titanium Natural`, `A18 Pro`). Latin runs are left-to-right inside RTL lines.
- **Digits.** Prices, review counts and most numbers use **Persian digits** (`۱۲,۹۹۰,۰۰۰ تومان`, `(۱۳۲)`). Exceptions that use Latin digits in the mockups: the rating value `4.8`, the pagination numbers (`1 2 3 4 5 … 10`), the gallery counter `1 / 7`, the `+3` thumbnail and spec values like `48MP` and `6.9" OLED`.
- **Currency.** The amount comes first, then `تومان`, with a comma as the thousands separator (`۹۹,۹۰۰,۰۰۰ تومان`).
- **Aesthetic.** Clean, airy, light-neutral surfaces. A single deep forest-green brand color handles every primary action and active state. Product photos sit on soft gray tiles. Icons are thin outline icons. Shadows are minimal or absent; flat fills and hairline borders separate content.

---

## 2. Color palette

### 2.1 Brand and actions

| Role | Hex (sampled) | Where it appears |
|---|---|---|
| **Primary / brand green** | `#264E35` (range `#264E35`–`#324C32`) | "Add to cart" CTA, hero CTA, active pagination page, active grid-view toggle, checked checkboxes, price-range slider, cart count badge, logo mark |
| Primary green (lighter tint used for badges on the product page) | `#3C6F4D` | "پرفروش" badge, `٪۹` discount badge on the product detail page |
| Active nav / tab text and underline | `#49614B` (approximately the primary green) | Active header nav item, active tab "توضیحات" |
| Selected-swatch / check icon green | `#536E5E`–`#5B7F6B` | Selected color swatch, checklist check-circle icons, "in stock" dot |
| **Sage tint** (icon-button background) | `#D9E0CB` (homepage `#CFD3C1`) | Background of the small square cart button on product cards |
| On-primary text | `#FFFFFF` | Text and icons on green buttons and badges |

### 2.2 Neutrals and surfaces

| Role | Hex (sampled) | Where it appears |
|---|---|---|
| Header background | `#FDFEFE` / white | Top header on all pages |
| Page background | `#FCFCFC` (homepage), `#F8FAFB` (product detail) | Body |
| Card / panel surface | `#FFFFFF` | Product cards, filter sidebar, tab panel, key-specs card, sort dropdown, qty stepper |
| Image tile / soft panel | `#F4F5F5`–`#F5F6F8` | Category tiles, product-card image area, search field fill (`#F5F5F7`), brand strip (`#F7F7F9`), homepage trust bar (`#F5F6F8`) |
| Pale green panel | `#EFF4F2` | Product-detail trust bar, gallery thumbnail background (`#F0F4F2`) |
| Hairline border / divider | Unspecified exact hex. Very light gray, visually about `#E5E7EB` | Card borders, sidebar section dividers, spec row dividers, trust bar item separators |
| Ink (primary text) | Unspecified exact hex. Near-black, dark charcoal | Headings, product titles, prices |
| Muted text | Unspecified exact hex. Mid gray | Subtitles, captions, counts, breadcrumbs, old prices, key-spec labels |
| **Footer background** | `#18212B` (range `#151E27`–`#1A232E`) | Full-width footer |
| Footer text | White (headings), light gray (links/body) | Footer |

### 2.3 Status and badge colors

| Role | Hex (sampled) | Notes |
|---|---|---|
| Rating star (filled) | `#F8A206` (amber) | 5-star row. Partial/half stars appear. Empty stars are light gray |
| Badge "پرفروش" (best seller) | `#119923` green (homepage, listing) / `#3C6F4D` dark green (detail) | **Inconsistent** between pages |
| Badge "پیشنهاد ویژه" (special offer) | `#139627` green | Homepage only |
| Badge "جدید" (new) | `#0A7EC9` blue | Homepage, listing |
| Badge "تخفیف" (discount) | `#FD7672` coral-red | Homepage, listing (JBL card). One listing card (Xiaomi Watch 2) shows "تخفیف" in green: **inconsistent** |
| In-stock indicator | Green dot + "موجود در انبار" | Detail page |
| Promo banner (dark) background | `#36483F` (deep green-gray, photographic) | Homepage watch banner |

### 2.4 Product color swatches (data, not theme)

Listing filter: black, white (with outline), blue, purple, sage green, beige. Detail page: sage green (selected), dark gray, beige/peach, light blue, white. These come from product data.

### 2.5 Dark mode

**Unspecified.** No dark-mode references exist.

---

## 3. Typography

- **Font family: unspecified.** Persian text uses a modern geometric/humanist sans-serif with clear, even strokes (in the style of Vazirmatn / IRANSansX / Yekan Bakh, but the exact family can't be determined from the images). Latin text (product names, specs, footer copyright) uses a neutral sans-serif.
- **Logo wordmark.** "NEXAIVON" in uppercase, wide letter-spacing, medium/semibold weight, next to an "N"-shaped geometric mark. Dark green on light backgrounds, white in the footer.

Relative type scale (sizes estimated on the 1024 px canvas, final values unspecified):

| Style | Approx. size on canvas | Weight | Usage |
|---|---|---|---|
| Display / Hero H1 | ~26–30 px | Bold / Extra-bold | Hero "جدیدترین گوشی‌های هوشمند", listing banner "محصولات" |
| Product title (detail) | ~22 px | Bold | "iPhone 16 Pro Max" |
| Price (detail) | ~20 px | Bold | "۹۹,۹۰۰,۰۰۰ تومان" |
| Section heading | ~16 px | Bold | "پرفروش‌ترین محصولات", "محصولات مشابه", "مشخصات کلیدی", "فیلترها" |
| Promo banner title | ~18 px | Bold | "سبک زندگی هوشمند" |
| Body / description | ~11–12 px | Regular | Product description, hero subtitle, tab content |
| Card title | ~10–11 px | Medium | Product card name |
| Card price | ~10–11 px | Bold | Card price |
| Caption / meta | ~8–9 px | Regular, muted | Card subtitle (`256GB - Titanium Black`), review count, breadcrumbs, trust-bar subtitles, footer links |
| Nav link | ~10 px | Medium | Header nav |

- Line height for description paragraphs is generous (about 1.8–2×, judging by the detail-page tab content).
- Old prices use muted gray with **strikethrough**.

---

## 4. Layout and spacing

### 4.1 Container

- Content sits in a centered container that spans about **95%** of the canvas width (roughly 24–44 px side gutters on the 1024 canvas). Hero/banners reach about x=23–1001. Card rows and trust bars are slightly inset, about x=43–980.
- Max container width in real px: **unspecified**.
- The header is full width. The footer is full-bleed (edge to edge) with inner content aligned to the container.

### 4.2 Grids

| Area | Columns (desktop) |
|---|---|
| Homepage category tiles | 6 equal tiles |
| Listing category tiles | 5 equal tiles |
| Homepage best-seller row | 4 cards |
| Homepage promo banners | 2 equal banners |
| Listing page body | Filter sidebar on the **right** (~22% of width) + product grid on the left (~75%) |
| Listing product grid | 4 columns × 3 rows (12 per page) |
| Detail page top | Info column on the **right** (~45%) + gallery on the left (~50%, including the thumbnail strip) |
| Detail page lower | Tabs panel on the left (~65%) + "مشخصات کلیدی" card on the right (~28%) |
| Similar products | 5 cards |
| Trust bar | 4 equal items with vertical dividers |
| Footer | 4 columns: contact (right), customer services, quick links, brand block (left) |

### 4.3 Spacing

- Spacing is consistent and roomy. Vertical gaps between homepage sections are about 30–40 px on the canvas. Gutters between cards are about 16–20 px.
- Card inner padding is about 10–12 px. Panels (filters, tabs, key specs) use about 16–24 px inner padding.
- Exact spacing scale: **unspecified**. Use a consistent 4/8-based scale.

### 4.4 Corner radius

| Element | Radius (relative) |
|---|---|
| Hero slider, listing banner, promo banners | Large (~12–16 px) |
| Product cards, category tiles, panels, trust bar, brand strip | Medium (~8–12 px) |
| Primary CTA buttons, search field, sort dropdown, qty stepper | Fully rounded pill |
| Small cart icon button, view toggles, pagination items | Small (~4–6 px) |
| Badges | Small rounded rectangle (~4 px) |
| Color swatches, wishlist button, gallery arrows, cart count badge | Circle |

### 4.5 Elevation

- Cards and panels are mostly **flat with a 1 px light border**, or a very faint shadow. Shadow values: **unspecified**.
- Header: no visible shadow. It separates from the body only by the background change.

---

## 5. Components

### 5.1 Header (all pages)

Two rows on a white background.

**Row 1 (RTL order, right → left):**
1. Logo: N-mark plus "NEXAIVON" wordmark, dark green.
2. Search field: wide pill (~35–42% of the width), light gray fill `#F5F5F7`, no visible border, magnifier icon at the inline-start (right) edge inside the field, placeholder `جستجو در محصولات...`.
3. Far left: user (profile) outline icon and cart outline icon. The cart has a small **circular dark-green count badge** with a white number at its top-right corner.

**Row 2:** Centered horizontal nav links. The active link uses primary-green text with a 2 px green underline under the label.

- **Inconsistent nav items** across mockups:
  - Homepage: صفحه اصلی (active) · موبایل هدفون و هندزفری · ساعت هوشمند · گجت‌های دیجیتال · لوازم جانبی
  - Listing: صفحه اصلی · محصولات (active) · گجت‌های هوشمند · ساعت هوشمند · گوشی‌های دیجیتال · لوازم جانبی, plus درباره ما and تماس با ما at the far left
  - Detail: محصولات (active) · موبایل و تبلت‌ها · ساعت هوشمند · هدفون‌های بی‌سیم · لوازم جانبی
  - The final nav item set is **unspecified**.
- Dropdowns / mega-menu behaviour: **unspecified**.
- Sticky header behaviour: **unspecified**.

### 5.2 Breadcrumbs

- Small muted text separated by `›` chevrons pointing left (RTL), e.g. `خانه › موبایل و تبلت › iPhone 16 Pro Max`.
- Shown on the listing banner (top-right, inside the banner) and on the detail page (above the content, right-aligned).
- Current page styling: same muted color. No distinct emphasis is visible.

### 5.3 Buttons

| Variant | Look | Example |
|---|---|---|
| **Primary CTA** | Primary-green fill, white text, pill, optional leading icon | Detail "افزودن به سبد خرید" with cart icon (wide, ~60% of the info column). Hero "مشاهده محصولات" with arrow icon |
| **Secondary (white pill)** | White fill, dark text, pill, chevron or a small green circular arrow icon | Promo banner "مشاهده محصولات" buttons |
| **Card cart button** | Small square, small radius, sage-tint fill `#D9E0CB`, dark-green cart-plus outline icon | Every product card, bottom-left |
| **Icon circle button** | White circle, dark outline icon, faint shadow | Gallery prev/next, gallery wishlist |
| **Wishlist (card)** | Bare outline heart, no background | Top-left of listing/similar product cards |
| **Text link with icon** | Muted/dark small text plus icon | "مشاهده همه ←", "پاک کردن همه ↻", "نمایش بیشتر", "علاقه‌مندی" (filled heart), "مقایسه" (compare icon) |
| **Back-to-top** | Small dark square on the footer, slightly lighter than the footer background, up chevron | Footer bottom-left |

Hover, focus, active and disabled states: **unspecified**.

### 5.4 Badges and chips

- **Product badge:** small rounded rectangle, white text, top-right of the card image area (top of the detail info column). Labels: `پرفروش`, `جدید`, `تخفیف`, `پیشنهاد ویژه`. See §2.3 for colors and inconsistencies.
- **Discount percent badge** (detail page): primary-green pill, white text `٪۹`, placed between the old price and the stock status.
- **Promo banner chip:** translucent / light pill with small text naming the category (e.g. `ساعت‌های هوشمند`), above the banner title.
- **Cart count badge:** dark-green circle with a white numeral.

### 5.5 Product card

Shared structure (white surface, 1 px light border, medium radius):

1. **Image area** (top ~55–60% of the card): soft gray background `#F5F6F8`, product photo centered on a transparent/clean background.
   - Badge at top-right (optional).
   - Wishlist heart at top-left (listing and similar-products variants; **absent** on homepage cards).
2. **Body** (right-aligned):
   - Title:
     - Homepage variant: Persian descriptor on line 1 plus Latin model on line 2 (e.g. `هندزفری بلوتوثی جی بی ال مدل` / `Tune 230NC`).
     - Listing variant: Latin name (`Samsung Galaxy S24 Ultra`) plus a muted subtitle line with specs (`12GB/512GB - Titanium Gray`).
     - Similar-products variant: Latin name only.
   - Rating row: 5 amber stars plus review count in parentheses (`(۱۳۲)`).
3. **Footer row:** price (bold, with `تومان`) on the right and the sage cart button on the left. When discounted, the old price shows above the current price in muted strikethrough (homepage JBL card).

Out-of-stock card state: **unspecified**.

### 5.6 Category tile

- Soft gray tile `#F4F5F5`, medium radius, no border. Product image centered in the upper part, label centered below in dark text.
- Homepage: 6 tiles (موبایل, تبلت, هدفون و هندزفری, ساعت هوشمند, گجت‌های دیجیتال, لوازم جانبی).
- Listing: 5 tiles (موبایل, تبلت, هندزفری بلوتوثی, ساعت هوشمند, لوازم جانبی).
- Selected/active tile state: **unspecified**.

### 5.7 Hero slider (homepage)

- Full container width, large radius, aspect about 3.1:1 on the canvas.
- Photographic warm beige/stone background with a plant-shadow mood. The product photo fills the left half.
- Text block on the right:
  - Muted eyebrow (`تکنولوژی، همراه زندگی شما`).
  - Bold H1 (`جدیدترین گوشی‌های هوشمند`).
  - Regular subtitle (`با بهترین برندها، جدیدترین مدل‌ها و گارانتی معتبر`).
  - Primary pill CTA with arrow (`مشاهده محصولات`).
- Controls at bottom-left: 3 pagination dots (active is filled dark, the others are outlined) plus `‹ ›` chevrons.
- Autoplay and transition timing: **unspecified**.

### 5.8 Page banner (listing)

- Full container width, large radius, light gray photographic background. Product composite (phone, watch, AirPods) on the left.
- Right side: breadcrumb, large bold title `محصولات`, muted subtitle `جدیدترین موبایل‌ها، گجت‌های هوشمند و لوازم جانبی با بهترین قیمت`.

### 5.9 Promo banners (homepage)

Two side-by-side banners with a large radius and a photographic background:

- **Dark variant:** deep green-gray `#36483F`, white text, watch image. Chip, bold title `سبک زندگی هوشمند`, subtitle, white pill button with chevron.
- **Light variant:** light gray, dark text, AirPods image. Chip, bold title `صدای شفاف، تجربه بهتر`, subtitle, white pill button with a small dark-green circular arrow icon.

### 5.10 Brand strip (homepage)

- Soft gray rounded panel. Centered small heading `برندهای محبوب`.
- One row of 7 monochrome dark-gray logos, evenly spaced: Apple, Samsung, Xiaomi (mi), Sony, JBL, Huawei, Anker.
- Logo hover / link behaviour: **unspecified**.

### 5.11 Trust bar (service highlights)

- Rounded panel with 4 equal items separated by thin vertical dividers.
- Each item has an outline icon (dark), a bold short title and a muted one-line subtitle, aligned beside the icon.
- Background: soft gray on the homepage and listing, **pale green `#EFF4F2` on the detail page**.
- Items, with order varying per page:
  - ارسال سریع (truck) · به سراسر کشور / با پست پیشتاز
  - ضمانت اصالت کالا (shield-check) · با گارانتی معتبر
  - پرداخت امن (card) · با درگاه‌های مطمئن
  - پشتیبانی ۲۴/۷ (headset) · در تمام مراحل خرید / همیشه در کنار شما

### 5.12 Filter sidebar (listing)

White card with a border and medium radius, on the right side of the listing page.

- **Header:** `فیلترها` (bold) on the right; `پاک کردن همه` with a refresh icon (muted, small) on the left.
- **Sections** separated by hairline dividers, each with a bold heading:
  1. **دسته‌بندی:** checkboxes with label and count in parentheses (`موبایل (۴۲)`).
  2. **برند:** checkboxes (Apple, Samsung, Xiaomi, Huawei, Sony) plus a `نمایش بیشتر` link.
  3. **قیمت:** dual-handle range slider (primary-green track and round handles) with min/max price labels below.
  4. **وضعیت موجودی:** `موجود در انبار` (checked), `ناموجود`.
  5. **رنگ:** a row of circular color swatches (white has a gray outline). Selected-swatch styling in the filter: **unspecified**.
  6. **ویژگی‌ها:** 5G, NFC, ضد آب, شارژ سریع checkboxes.
- **Checkbox:** small rounded square. Unchecked has a light gray border. Checked has a primary-green fill with a white check. The checkbox sits on the left of its label (RTL trailing side).
- Collapsible sections: **unspecified**.

### 5.13 Listing toolbar

One row above the grid:

- Right: result count `۹۸ محصول`.
- Center-right: sort dropdown, a white pill with border, `مرتب‌سازی بر اساس : محبوبیت`, chevron-down at the left end.
- Left: view toggles, two small squares. Active (grid) has a primary-green fill with a white icon. Inactive (list) is outlined.
- List view layout: **unspecified** (only the grid view is shown).

### 5.14 Pagination

- Right: muted summary `نمایش ۱ تا ۱۲ از ۹۸ محصول`.
- Left/center: `‹` prev box, page numbers, ellipsis `…`, last page, `›` next box. The active page is a small primary-green filled square with white text. Inactive pages are plain text. Prev/next are small outlined squares.

### 5.15 Product gallery (detail)

- **Main image:** soft gray rounded panel holding the product photo.
  - Top-left: white circular wishlist (heart) button.
  - Left/right: white circular `‹` / `›` arrow buttons near the bottom corners.
  - Bottom center: counter pill `1 / 7`.
- **Thumbnail strip:** vertical column on the far left with 4 square thumbnails plus a `+3` tile. Thumbnails are small rounded squares on a pale green-gray `#F0F4F2` background. The active thumbnail has a primary-green border.
- Zoom / lightbox: **unspecified**.

### 5.16 Buy box (detail info column)

Top to bottom, right-aligned:

1. `پرفروش` badge.
2. Title `iPhone 16 Pro Max` (bold, large).
3. Subtitle `256GB | Titanium Natural`.
4. Rating: stars, `4.8`, `(۱۲۴ نظر)` muted.
5. Description paragraph (2 lines).
6. **Spec highlights row:** 4 cells divided by vertical hairlines. Each cell stacks a centered outline icon, a label and a value:
   - باتری / تا ۳۳ ساعت
   - چیپست / A18 Pro
   - صفحه نمایش / 6.9" OLED
   - دوربین / 48MP
7. Divider.
8. **Price row:**
   - Right: in-stock dot plus `موجود در انبار`.
   - Middle: discount badge `٪۹` and old price (strikethrough, muted).
   - Left: current price, large and bold.
9. **Action row:**
   - Primary CTA `افزودن به سبد خرید` with cart icon.
   - Quantity stepper: white pill with border, `+` / value / `−`. `+` is on the right in RTL.
10. **Secondary actions:** `علاقه‌مندی` (filled heart) and `مقایسه` (compare icon), small text links.
11. Divider.
12. **Color selector:** label `رنگ: Titanium Natural` plus circular swatches. The selected swatch has an outer ring with a gap. The white swatch has a gray outline.

### 5.17 Tabs (detail)

- White panel with a border. The tab bar has 3 tabs: `توضیحات` (active), `مشخصات فنی`, `نظرات کاربران (۱۲۴)`.
- The active tab uses primary-green text with a green underline. Inactive tabs use dark/muted text. A hairline separates the tab bar from the content.
- **Description content:**
  - Bold sub-heading (`طراحی تیتانیومی، قدرت بی‌نظیر`).
  - Paragraph with generous line height.
  - Feature checklist: each line has a green filled check-circle icon on the right.
- Content of the "مشخصات فنی" and "نظرات کاربران" tabs: **unspecified**.

### 5.18 Key specs card (detail)

- White bordered panel titled `مشخصات کلیدی`.
- Key–value rows separated by hairlines. The label (muted) is on the right and the value (dark) on the left.
- Rows: برند, مدل, حافظه داخلی, رنگ, صفحه نمایش, دوربین اصلی, باتری, وزن.

### 5.19 Footer

- Full-bleed dark background `#18212B`.
- **Columns, right to left:**
  1. **تماس با ما:** phone, email, address, each with a small outline icon (phone, envelope, map pin).
  2. **خدمات مشتریان:** links (پشتیبانی و تماس, پیگیری سفارش / وضعیت سفارش, راهنمای خرید, سوالات متداول, شرایط و ضوابط, حریم خصوصی).
  3. **دسترسی سریع:** category/page links.
  4. **Brand block** (left): white logo, a 2-line description, and social icons (Instagram, Telegram, LinkedIn, YouTube) in white outline.
- Column headings are white and bold. Links are light gray and small.
- **Bottom row:** `© 2025 NEXAIVON. All rights reserved.` (small, muted) and the back-to-top button at the far left.
- Link lists differ slightly between mockups. Final link sets are **unspecified**.

### 5.20 Forms and inputs

- The only inputs shown are the **search field** (§5.1), **checkboxes** (§5.12), **range slider** (§5.12), **sort dropdown** (§5.13), **quantity stepper** (§5.16) and **color swatches**.
- Text inputs, labels, validation/error states, login/OTP, checkout and profile forms: **unspecified** (no references).

---

## 6. Iconography

- Thin **outline** icons (stroke about 1.5 px), rounded joins, consistent with a Lucide/Feather-style set. The exact icon library is **unspecified**.
- Filled exceptions: the `علاقه‌مندی` heart on the buy box, the checklist check-circles, and the rating stars.
- Icons used: search, user, cart / cart-plus, heart, chevrons, arrow, refresh, grid, list, truck, shield-check, credit-card, headset, camera, smartphone/screen, chip/cpu, battery, compare/arrows, phone, mail, map-pin, Instagram, Telegram, LinkedIn, YouTube.

---

## 7. Imagery

- Product photos are clean cut-outs on light backgrounds inside soft gray tiles. They are centered and contained, never cropped.
- Hero and banners use **lifestyle photography**: warm neutral stone, soft natural light, plant shadows, and a dark green-toned scene for the watch banner.
- Image aspect ratios for real assets: **unspecified**. Card image areas are roughly 1.6:1 (w:h) on the homepage and roughly square-ish (~1.2:1) on the listing.

---

## 8. Responsive behavior

**Unspecified.** All three references are desktop layouts. Breakpoints and the tablet/mobile layouts aren't shown, including:

- Header collapse / hamburger menu
- Sidebar-to-drawer filters
- Grid column counts below desktop
- Gallery thumbnail orientation on mobile
- Footer stacking

Don't infer these from the mockups. Get a decision before implementing.

---

## 9. Interaction and motion

**Unspecified.** No hover, focus, pressed, loading, empty, error or animation states appear in the references. Keep accessible focus outlines regardless.

---

## 10. Known inconsistencies between mockups (resolve before relying on them)

1. Header nav item set and order differ on every page (§5.1).
2. Badge colors: `پرفروش` is bright green on the homepage/listing and dark brand green on the detail page. `تخفیف` is coral on one card and green on another (§2.3).
3. Trust-bar background is gray on the homepage/listing and pale green on the detail page. Item order and subtitles differ (§5.11).
4. Product card title format differs between the homepage, listing and similar-products variants (§5.5).
5. Wishlist heart appears on listing/similar cards but not on homepage cards (§5.5).
6. Category tile count and labels differ: 6 tiles on the homepage, 5 on the listing (§5.6).
7. Mixed Persian and Latin digits (§1).
8. Footer link lists differ slightly per page (§5.19).
