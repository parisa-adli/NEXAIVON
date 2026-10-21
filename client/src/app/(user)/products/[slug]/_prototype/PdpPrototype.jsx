// PROTOTYPE: three structurally different product pages on
// /products/<slug>?variant=A|B|C.
// Question: how should the product page arrange image, title, price, stock,
// add-to-cart and description?
// Uses the page's existing getOneProductBySlug result; add-to-cart is a visual
// stub. Lives on prototype/product-detail only; never merge into main.

import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa6";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "@/utils/toPersianNumber";
import { c } from "../../_prototype/ProductCardPrototype";
import ReadMore from "./ReadMore";
import "../../_prototype/product-card-prototype.css";

export const PDP_VARIANT_NAMES = {
  current: "today's product page",
  A: "Classic split",
  B: "Buy box",
  C: "Immersive band",
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

function Crumbs({ product }) {
  return (
    <nav aria-label="مسیر صفحه" className={`flex items-center gap-x-2 text-xs ${c.muted}`}>
      <Link href="/" className={`hover:underline rounded ${c.focus}`}>خانه</Link>
      <FaChevronLeft className="w-2.5 h-2.5" />
      <Link href="/products" className={`hover:underline rounded ${c.focus}`}>محصولات</Link>
      <FaChevronLeft className="w-2.5 h-2.5" />
      <span aria-current="page" className={`line-clamp-1 ${c.ink}`}>{product.title}</span>
    </nav>
  );
}

function Eyebrow({ product }) {
  return (
    <p className={`text-xs font-medium tracking-wide ${c.sandInk}`}>
      <bdi>{product.brand}</bdi>
      {product.category?.title ? ` · ${product.category.title}` : ""}
    </p>
  );
}

function PriceBlock({ product, size = "lg" }) {
  const hasDiscount = product.discount > 0;
  return (
    <div className="space-y-1">
      {hasDiscount && (
        <div className="flex items-center gap-x-2">
          <span className={`text-sm line-through ${c.muted}`}>
            {toPersianNumbersWithComma(product.price)}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-[rgb(var(--p-sale))] text-[#F5F2EC]">
            ٪{toPersianNumbers(product.discount)} تخفیف
          </span>
        </div>
      )}
      <p className="flex items-baseline gap-x-1.5">
        <span className={`${size === "lg" ? "text-[28px]" : "text-xl"} font-bold`}>
          {toPersianNumbersWithComma(hasDiscount ? product.offPrice : product.price)}
        </span>
        <span className="text-sm">تومان</span>
      </p>
    </div>
  );
}

function CartStub({ product, className = "" }) {
  const out = stockOf(product).tone === "out";
  return (
    <button
      type="button"
      disabled={out}
      title="PROTOTYPE stub: no request is sent"
      className={`rounded-full py-3.5 px-8 text-sm font-bold ${c.cta} ${c.focus} disabled:opacity-40 ${className}`}
    >
      {out ? "ناموجود" : "افزودن به سبد خرید"}
    </button>
  );
}

// ---------------------------------------------------------------- Variant A
// Classic split: big image panel on the start side (sticky on desktop), all
// buying information stacked in the other column, description below the CTA
// with "show more". Closest to today's structure.
function PdpA({ product }) {
  const stock = stockOf(product);
  return (
    <div className="space-y-8">
      <Crumbs product={product} />
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
        <div className="lg:sticky lg:top-24 relative aspect-square rounded-[24px] overflow-hidden bg-[rgb(var(--p-sand)/0.35)]">
          <Image src={product.imageLink} alt={product.title} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-contain p-10" />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Eyebrow product={product} />
            <h1 className="text-[28px] sm:text-[40px] font-bold leading-tight">{product.title}</h1>
          </div>
          <PriceBlock product={product} />
          <p className={`text-sm ${stockText[stock.tone]}`}>{stock.label}</p>
          <CartStub product={product} className="w-full sm:w-auto sm:min-w-[280px]" />
          <hr className={`border-t ${c.line}`} />
          <section className="space-y-3">
            <h2 className="text-xl font-bold">توضیحات</h2>
            <ReadMore text={product.description} />
          </section>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Variant B
// Buy box: three columns on desktop (image, reading column, a bordered buy box
// that stays in view). On mobile the buy box collapses into a bar fixed to the
// bottom of the screen with price + CTA, so buying is always one tap away.
function PdpB({ product }) {
  const stock = stockOf(product);
  return (
    <div className="space-y-6 pb-28 lg:pb-0">
      <Crumbs product={product} />
      <div className="grid lg:grid-cols-[5fr_6fr_4fr] gap-8 items-start">
        <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden bg-[rgb(var(--p-sage)/0.3)]">
          <Image src={product.imageLink} alt={product.title} fill priority sizes="(min-width:1024px) 33vw, 100vw" className="object-contain p-8" />
        </div>
        <div className="space-y-6 min-w-0">
          <div className="space-y-2">
            <Eyebrow product={product} />
            <h1 className="text-[28px] font-bold leading-tight">{product.title}</h1>
          </div>
          <p className="whitespace-pre-line leading-8 text-[rgb(var(--p-ink)/0.85)]">{product.description}</p>
        </div>
        <aside className={`hidden lg:block sticky top-24 rounded-[20px] border ${c.line} ${c.surface} p-5 space-y-5`}>
          <PriceBlock product={product} />
          <div className={`flex items-center gap-x-2 text-sm ${stockText[stock.tone]}`}>
            <span aria-hidden className="w-2 h-2 rounded-full bg-current" />
            {stock.label}
          </div>
          <CartStub product={product} className="w-full" />
        </aside>
      </div>
      <div className={`lg:hidden fixed inset-x-0 bottom-14 z-20 border-t ${c.line} ${c.surface} px-4 py-3 flex items-center justify-between gap-x-4`}>
        <div className="min-w-0">
          <PriceBlock product={product} size="md" />
          <p className={`text-[11px] ${stockText[stock.tone]}`}>{stock.label}</p>
        </div>
        <CartStub product={product} className="shrink-0 px-6" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Variant C
// Immersive band: a full-width sage band carries the image and title as a
// hero; price, stock and CTA sit in one horizontal strip under it; the
// description becomes a narrow, large-type reading column.
function PdpC({ product }) {
  const stock = stockOf(product);
  return (
    <div className="space-y-8">
      <Crumbs product={product} />
      <section className="relative overflow-hidden rounded-[24px] bg-[rgb(var(--p-sage)/0.5)] grid md:grid-cols-2 items-center gap-6 px-6 py-10 sm:px-12">
        <div className="space-y-3 order-2 md:order-1">
          <Eyebrow product={product} />
          <h1 className="text-[36px] sm:text-[56px] font-bold leading-[1.15]">{product.title}</h1>
        </div>
        <div className="relative aspect-square md:aspect-[4/3] order-1 md:order-2">
          <Image src={product.imageLink} alt={product.title} fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-contain drop-shadow-xl" />
        </div>
      </section>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-[20px] border ${c.line} ${c.surface} px-6 py-5`}>
        <PriceBlock product={product} />
        <span className={`self-start sm:self-auto rounded-full border ${c.line} px-3 py-1 text-xs ${stockText[stock.tone]}`}>
          {stock.label}
        </span>
        <CartStub product={product} className="sm:min-w-[240px]" />
      </div>
      <section className="max-w-2xl mx-auto space-y-4 py-6">
        <p className={`text-xs font-medium ${c.sandInk}`}>درباره این محصول</p>
        <p className="whitespace-pre-line text-lg leading-9">{product.description}</p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- Frame

export function PdpVariants({ product }) {
  const frame = (key, Body) => (
    <div className={`proto-scope mx-4 ${c.bg} ${c.ink} rounded-[24px] p-4 sm:p-6`}>
      <p dir="ltr" className="mb-6 font-mono text-[11px] text-fuchsia-700 dark:text-fuchsia-300">
        PROTOTYPE pdp variant {key} ({PDP_VARIANT_NAMES[key]}) · stock ={" "}
        {product.countInStock} ({stockOf(product).tone}) · discount ={" "}
        {product.discount}% · add-to-cart is a stub
      </p>
      <Body product={product} />
    </div>
  );
  return { A: frame("A", PdpA), B: frame("B", PdpB), C: frame("C", PdpC) };
}
