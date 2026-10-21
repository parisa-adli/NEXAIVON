// PROTOTYPE: three structurally different product cards on /products?variant=A|B|C.
// Question: what shape should the storefront product card take?
// Data comes from the page's existing getProducts call; nothing new is fetched.
// Like and add-to-cart are visual stubs (no mutation) so the question stays about looks.
// Lives on prototype/product-card only; never merge into main.

import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaPlus } from "react-icons/fa6";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "@/utils/toPersianNumber";
import "./product-card-prototype.css";

export const VARIANT_NAMES = {
  current: "today's card",
  A: "Gallery",
  B: "Row",
  C: "Editorial overlay",
};

const c = {
  bg: "bg-[rgb(var(--p-bg))]",
  surface: "bg-[rgb(var(--p-surface))]",
  ink: "text-[rgb(var(--p-ink))]",
  muted: "text-[rgb(var(--p-muted))]",
  sandInk: "text-[rgb(var(--p-sand-ink))]",
  sageInk: "text-[rgb(var(--p-sage-ink))]",
  cta: "bg-[rgb(var(--p-cta))] text-[rgb(var(--p-on-cta))]",
  line: "border-[rgb(var(--p-line)/0.12)]",
  focus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--p-ink))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--p-bg))]",
};

function stockOf(product) {
  const n = product.countInStock ?? 0;
  if (n <= 0) return { tone: "out", label: "ناموجود" };
  if (n <= 3)
    return { tone: "low", label: `تنها ${toPersianNumbers(n)} عدد باقی مانده` };
  return { tone: "in", label: "موجود در انبار" };
}

const stockText = {
  out: "text-[rgb(var(--p-muted))]",
  low: "text-[rgb(var(--p-sale))]",
  in: "text-[rgb(var(--p-in-stock))]",
};

function Price({ product, size = "md", onDark = false }) {
  const hasDiscount = product.discount > 0;
  const main = size === "lg" ? "text-xl" : "text-base";
  return (
    <div className="flex flex-col items-start leading-tight">
      {hasDiscount && (
        <div className="flex items-center gap-x-2">
          <span
            className={`text-xs line-through ${
              onDark ? "text-[#F5F2EC]/70" : c.muted
            }`}
          >
            {toPersianNumbersWithComma(product.price)}
          </span>
          <span className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-[rgb(var(--p-sale))] text-[#F5F2EC]">
            ٪{toPersianNumbers(product.discount)}
          </span>
        </div>
      )}
      <div className="flex items-baseline gap-x-1">
        <span className={`${main} font-bold`}>
          {toPersianNumbersWithComma(
            hasDiscount ? product.offPrice : product.price
          )}
        </span>
        <span className="text-xs">تومان</span>
      </div>
    </div>
  );
}

function LikeStub({ product, className = "" }) {
  return (
    <button
      type="button"
      title="PROTOTYPE stub: no request is sent"
      aria-label={product.isLiked ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
      className={`grid place-items-center w-10 h-10 rounded-full ${c.focus} ${className}`}
    >
      {product.isLiked ? (
        <FaHeart className="w-4 h-4" />
      ) : (
        <FaRegHeart className="w-4 h-4" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------- Variant A
// Gallery: image is the hero on a tinted panel, text sits below with no box,
// full-width pill CTA. Reads like a boutique catalogue.
function CardA({ product }) {
  const stock = stockOf(product);
  return (
    <article className="flex flex-col">
      <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden bg-[rgb(var(--p-sand)/0.35)]">
        <Image
          src={product.imageLink}
          alt={product.title}
          fill
          sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, 50vw"
          className={`object-contain p-6 ${
            stock.tone === "out" ? "opacity-50 grayscale" : ""
          }`}
        />
        {product.discount > 0 && (
          <span className="absolute top-3 start-3 rounded-full px-2.5 py-1 text-xs font-bold bg-[rgb(var(--p-sale))] text-[#F5F2EC]">
            ٪{toPersianNumbers(product.discount)} تخفیف
          </span>
        )}
        <LikeStub
          product={product}
          className={`absolute top-2 end-2 ${c.surface} ${c.ink} shadow-sm`}
        />
      </div>
      <div className="pt-4 flex flex-col gap-y-1.5 flex-1">
        <p className={`text-xs font-medium tracking-wide ${c.sandInk}`}>
          {product.brand}
          {product.category?.title ? ` · ${product.category.title}` : ""}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className={`text-base font-bold leading-7 line-clamp-2 hover:underline underline-offset-4 rounded ${c.focus}`}
        >
          {product.title}
        </Link>
        <p className={`text-xs ${stockText[stock.tone]}`}>{stock.label}</p>
        <div className="mt-auto pt-2">
          <Price product={product} />
        </div>
        <button
          type="button"
          disabled={stock.tone === "out"}
          title="PROTOTYPE stub: no request is sent"
          className={`mt-3 w-full rounded-full py-3 text-sm font-bold ${c.cta} ${c.focus} disabled:opacity-40`}
        >
          افزودن به سبد خرید
        </button>
      </div>
    </article>
  );
}

function GridA({ products }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
      {products.map((p) => (
        <CardA key={p._id} product={p} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Variant B
// Row: horizontal, information-dense card with a hairline border. Thumbnail on
// the start side, facts in the middle, price and icon actions at the end.
// Scans like a spec sheet; good for comparing many products.
function CardB({ product }) {
  const stock = stockOf(product);
  return (
    <article
      className={`flex items-stretch gap-x-4 rounded-xl border ${c.line} ${c.surface} p-3`}
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-[rgb(var(--p-sage)/0.25)]">
        <Image
          src={product.imageLink}
          alt={product.title}
          fill
          sizes="112px"
          className="object-contain p-2"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-y-1 py-1">
        <Link
          href={`/products/${product.slug}`}
          className={`text-sm sm:text-base font-bold leading-6 line-clamp-2 hover:underline underline-offset-4 rounded ${c.focus}`}
        >
          {product.title}
        </Link>
        <p className={`text-xs ${c.muted}`}>
          برند <bdi>{product.brand}</bdi>
        </p>
        <span
          className={`mt-auto self-start rounded-full border ${c.line} px-2.5 py-0.5 text-[11px] ${stockText[stock.tone]}`}
        >
          {stock.label}
        </span>
      </div>
      <div className="flex flex-col items-end justify-between py-1">
        <LikeStub product={product} className={`${c.ink} -m-2`} />
        <div className="flex items-end gap-x-3">
          <Price product={product} />
          <button
            type="button"
            disabled={stock.tone === "out"}
            aria-label="افزودن به سبد خرید"
            title="PROTOTYPE stub: no request is sent"
            className={`grid place-items-center w-11 h-11 rounded-xl ${c.cta} ${c.focus} disabled:opacity-40`}
          >
            <HiOutlineShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function GridB({ products }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {products.map((p) => (
        <CardB key={p._id} product={p} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Variant C
// Editorial overlay: the image fills the tile, a charcoal panel carries title
// and price over it, add-to-cart shrinks to a round "+". The first product is
// a 2x2 feature tile, so the grid has rhythm instead of uniform rows.
function CardC({ product, featured }) {
  const stock = stockOf(product);
  return (
    <article
      className={`relative overflow-hidden rounded-[24px] bg-[rgb(var(--p-sage)/0.45)] ${
        featured ? "col-span-2 row-span-2 min-h-[420px]" : "aspect-[3/4]"
      }`}
    >
      <Image
        src={product.imageLink}
        alt={product.title}
        fill
        sizes={featured ? "66vw" : "33vw"}
        className="object-contain p-8 pb-28"
      />
      <div className="absolute top-3 inset-x-3 flex items-start justify-between">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${c.surface} ${stockText[stock.tone]}`}
        >
          {stock.label}
        </span>
        <LikeStub product={product} className={`${c.surface} ${c.ink}`} />
      </div>
      <div className="absolute inset-x-2 bottom-2 rounded-[18px] bg-[#242424]/90 text-[#F5F2EC] p-3 sm:p-4 flex items-end justify-between gap-x-3 backdrop-blur">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] text-[#D9BDA7]">{product.brand}</p>
          <Link
            href={`/products/${product.slug}`}
            className={`block font-bold leading-6 line-clamp-2 rounded ${
              featured ? "text-lg sm:text-xl" : "text-sm"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F2EC]`}
          >
            {product.title}
          </Link>
          <Price product={product} size={featured ? "lg" : "md"} onDark />
        </div>
        <button
          type="button"
          disabled={stock.tone === "out"}
          aria-label="افزودن به سبد خرید"
          title="PROTOTYPE stub: no request is sent"
          className="shrink-0 grid place-items-center w-11 h-11 rounded-full bg-[#F5F2EC] text-[#242424] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F2EC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#242424]"
        >
          <FaPlus className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

function GridC({ products }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 grid-flow-dense">
      {products.map((p, i) => (
        <CardC key={p._id} product={p} featured={i === 0} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Switch

function ProductCardPrototype({ products, variant }) {
  const Grid = { A: GridA, B: GridB, C: GridC }[variant] ?? GridA;
  const counts = products.reduce(
    (acc, p) => {
      acc[stockOf(p).tone] += 1;
      if (p.discount > 0) acc.discounted += 1;
      return acc;
    },
    { in: 0, low: 0, out: 0, discounted: 0 }
  );

  return (
    <div className={`proto-scope ${c.bg} ${c.ink} rounded-[24px] p-4 sm:p-6`}>
      <p
        dir="ltr"
        className="mb-6 font-mono text-[11px] text-fuchsia-700 dark:text-fuchsia-300"
      >
        PROTOTYPE variant {variant} ({VARIANT_NAMES[variant]}) · {products.length}{" "}
        products · stock in/low/out = {counts.in}/{counts.low}/{counts.out} ·
        discounted = {counts.discounted} · like + cart are stubs
      </p>
      <Grid products={products} />
    </div>
  );
}
export default ProductCardPrototype;
