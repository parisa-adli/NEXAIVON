// PROTOTYPE: three structurally different homepages on /?variant=A|B|C.
// Question: how should the restyled homepage arrange a static hero, the
// "new products" section and the sortable full product list?
// Uses the same two getProducts calls today's homepage makes; product cards
// are the winning card from prototype/product-card (Variant A, Gallery).
// Lives on prototype/homepage only; never merge into main.

import Image from "next/image";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { toPersianNumbers } from "@/utils/toPersianNumber";
import { CardA, c } from "../products/_prototype/ProductCardPrototype";
import SortChips from "./SortChips";
import "../products/_prototype/product-card-prototype.css";

export const HOME_VARIANT_NAMES = {
  current: "today's homepage",
  A: "Stack",
  B: "Split",
  C: "Magazine",
};

const HERO = {
  eyebrow: "فروشگاه فناوری",
  title: "فناوری، ساده و سنجیده",
  body: "گوشی، ساعت هوشمند، هدفون و لوازم جانبی؛ انتخاب‌شده با دقت، با قیمت روشن و ارسال سریع.",
  cta: "مشاهده محصولات",
};

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between gap-x-4 mb-6">
      <div className="space-y-1">
        <p className={`text-xs font-medium tracking-wide ${c.sandInk}`}>
          {eyebrow}
        </p>
        <h2 className="text-[22px] sm:text-[28px] font-bold leading-tight">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function SeeAll({ href = "/products?sort=latest" }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-x-2 text-sm font-medium whitespace-nowrap ${c.sageInk} hover:underline underline-offset-4 rounded ${c.focus}`}
    >
      مشاهده همه <FaArrowLeftLong className="w-3 h-3" />
    </Link>
  );
}

function Wordmark({ className = "" }) {
  return (
    <bdi className={`font-bold tracking-[0.3em] ${className}`}>NEXAIVON</bdi>
  );
}

// ---------------------------------------------------------------- Variant A
// Stack: full-width inverse hero, a horizontal rail of new products, then the
// full grid with sort chips. One column of sections, generous rhythm.
function HomeA({ latest, products }) {
  return (
    <div className="space-y-16 sm:space-y-24">
      <section className="relative overflow-hidden rounded-[24px] bg-[rgb(var(--p-cta))] text-[rgb(var(--p-on-cta))] px-6 py-14 sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="absolute -top-24 -end-24 w-72 h-72 rounded-full bg-[rgb(var(--p-sage)/0.55)]"
        />
        <div
          aria-hidden
          className="absolute -bottom-28 end-24 w-56 h-56 rounded-full bg-[rgb(var(--p-sand)/0.6)]"
        />
        <div className="relative max-w-xl space-y-5">
          <p className="text-xs opacity-80">
            <Wordmark /> · {HERO.eyebrow}
          </p>
          <h1 className="text-[36px] sm:text-[56px] font-bold leading-[1.2]">
            {HERO.title}
          </h1>
          <p className="text-base leading-8 opacity-85">{HERO.body}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-x-3 rounded-full bg-[rgb(var(--p-on-cta))] text-[rgb(var(--p-cta))] px-6 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--p-on-cta))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--p-cta))]"
          >
            {HERO.cta} <FaArrowLeftLong className="w-3 h-3" />
          </Link>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="تازه‌ها" title="محصولات جدید" action={<SeeAll />} />
        <div className="-mx-4 px-4 flex gap-x-4 overflow-x-auto snap-x snap-mandatory pb-2">
          {latest.map((p) => (
            <div key={p._id} className="snap-start shrink-0 w-[46%] sm:w-[240px]">
              <CardA product={p} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="فروشگاه" title="همه محصولات" />
        <div className="mb-8">
          <SortChips />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {products.map((p) => (
            <CardA key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- Variant B
// Split: two-column hero with the newest product shown big on a sand panel;
// new products become a numbered ranking list instead of cards; the grid gets
// a segmented sort control aligned with its heading.
function HomeB({ latest, products }) {
  const [newest, ...rest] = latest;
  return (
    <div className="space-y-16 sm:space-y-24">
      <section className="grid lg:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col justify-center gap-y-5 py-6 lg:py-12">
          <p className={`text-xs font-medium ${c.sandInk}`}>
            <Wordmark /> · {HERO.eyebrow}
          </p>
          <h1 className="text-[36px] sm:text-[56px] font-bold leading-[1.2]">
            {HERO.title}
          </h1>
          <p className={`text-base leading-8 ${c.muted} max-w-md`}>{HERO.body}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className={`inline-flex items-center gap-x-3 rounded-full px-6 py-3 text-sm font-bold ${c.cta} ${c.focus}`}
            >
              {HERO.cta} <FaArrowLeftLong className="w-3 h-3" />
            </Link>
            <Link
              href="/products?sort=popular"
              className={`rounded-full border border-[rgb(var(--p-line)/0.2)] px-6 py-3 text-sm font-medium hover:border-[rgb(var(--p-ink))] ${c.focus}`}
            >
              محبوب ترین‌ها
            </Link>
          </div>
        </div>
        {newest && (
          <Link
            href={`/products/${newest.slug}`}
            className={`group relative block min-h-[320px] rounded-[24px] overflow-hidden bg-[rgb(var(--p-sand)/0.45)] ${c.focus}`}
          >
            <Image
              src={newest.imageLink}
              alt={newest.title}
              fill
              priority
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-contain p-10 pb-24 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between rounded-[16px] bg-[rgb(var(--p-surface)/0.9)] px-4 py-3">
              <div>
                <p className={`text-[11px] ${c.sandInk}`}>تازه رسیده</p>
                <p className="font-bold text-sm line-clamp-1">{newest.title}</p>
              </div>
              <FaArrowLeftLong className="w-4 h-4" />
            </div>
          </Link>
        )}
      </section>

      <section className="grid lg:grid-cols-[1fr_2fr] gap-8">
        <SectionHeader
          eyebrow="تازه‌ها"
          title="محصولات جدید"
          action={<span className="lg:hidden"><SeeAll /></span>}
        />
        <ol className={`rounded-[20px] border ${c.line} ${c.surface} divide-y divide-[rgb(var(--p-line)/0.08)]`}>
          {[newest, ...rest].filter(Boolean).map((p, i) => (
            <li key={p._id}>
              <Link
                href={`/products/${p.slug}`}
                className={`flex items-center gap-x-4 px-4 py-3 hover:bg-[rgb(var(--p-sage)/0.12)] ${c.focus}`}
              >
                <span className={`w-8 text-xl font-bold ${c.sandInk}`}>
                  {toPersianNumbers(String(i + 1).padStart(2, "0"))}
                </span>
                <span className="relative w-14 h-14 shrink-0 rounded-xl bg-[rgb(var(--p-sand)/0.3)]">
                  <Image src={p.imageLink} alt="" fill sizes="56px" className="object-contain p-1.5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-sm line-clamp-1">{p.title}</span>
                  <span className={`block text-xs ${c.muted}`}>{p.brand}</span>
                </span>
                <FaArrowLeftLong className={`w-3 h-3 ${c.muted}`} />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <SectionHeader eyebrow="فروشگاه" title="همه محصولات" />
          <div className="sm:mb-6">
            <SortChips layout="segmented" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {products.map((p) => (
            <CardA key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- Variant C
// Magazine: a slim sage banner instead of a big hero; below it a two-column
// layout with a sticky side rail (section links + sort as a list) and a main
// column whose new products are a bento (one large tile, four small).
function HomeC({ latest, products }) {
  const [lead, ...small] = latest;
  return (
    <div className="space-y-10 sm:space-y-16">
      <section className="relative overflow-hidden rounded-[24px] bg-[rgb(var(--p-sage)/0.55)] px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <h1 className="text-[28px] sm:text-[40px] font-bold leading-tight">
            {HERO.title}
          </h1>
          <p className="text-sm leading-7">{HERO.body}</p>
        </div>
        <Link
          href="/products"
          className={`self-start sm:self-auto inline-flex items-center gap-x-3 rounded-full px-6 py-3 text-sm font-bold ${c.cta} ${c.focus}`}
        >
          {HERO.cta} <FaArrowLeftLong className="w-3 h-3" />
        </Link>
        <Wordmark className="hidden xl:block absolute -bottom-6 end-6 text-[88px] leading-none opacity-[0.07] pointer-events-none" />
      </section>

      <div className="grid lg:grid-cols-[200px_1fr] gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <nav aria-label="بخش‌های صفحه" className="space-y-1">
              <p className={`text-xs font-medium mb-2 ${c.sandInk}`}>در این صفحه</p>
              <a href="#new" className={`block rounded-lg px-3 py-2 text-sm hover:bg-[rgb(var(--p-sage)/0.15)] ${c.focus}`}>محصولات جدید</a>
              <a href="#all" className={`block rounded-lg px-3 py-2 text-sm hover:bg-[rgb(var(--p-sage)/0.15)] ${c.focus}`}>همه محصولات</a>
            </nav>
            <div>
              <p className={`text-xs font-medium mb-2 ${c.sandInk}`}>مرتب سازی</p>
              <SortChips layout="list" />
            </div>
          </div>
        </aside>

        <div className="space-y-16 min-w-0">
          <section id="new" className="scroll-mt-24">
            <SectionHeader eyebrow="تازه‌ها" title="محصولات جدید" action={<SeeAll />} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {lead && (
                <Link
                  href={`/products/${lead.slug}`}
                  className={`relative col-span-2 row-span-2 min-h-[320px] rounded-[24px] overflow-hidden bg-[rgb(var(--p-sand)/0.45)] ${c.focus}`}
                >
                  <Image src={lead.imageLink} alt={lead.title} fill sizes="50vw" className="object-contain p-10 pb-24" />
                  <div className="absolute bottom-3 inset-x-3 rounded-[16px] bg-[#242424]/90 text-[#F5F2EC] px-4 py-3">
                    <p className="text-[11px] text-[#D9BDA7]">{lead.brand}</p>
                    <p className="font-bold line-clamp-1">{lead.title}</p>
                  </div>
                </Link>
              )}
              {small.map((p) => (
                <Link
                  key={p._id}
                  href={`/products/${p.slug}`}
                  className={`flex flex-col rounded-[20px] ${c.surface} border ${c.line} p-3 hover:border-[rgb(var(--p-ink)/0.4)] ${c.focus}`}
                >
                  <span className="relative aspect-square rounded-xl bg-[rgb(var(--p-sage)/0.2)]">
                    <Image src={p.imageLink} alt="" fill sizes="25vw" className="object-contain p-3" />
                  </span>
                  <span className="mt-2 text-xs font-bold line-clamp-2 leading-5">{p.title}</span>
                </Link>
              ))}
            </div>
          </section>

          <section id="all" className="scroll-mt-24">
            <SectionHeader eyebrow="فروشگاه" title="همه محصولات" />
            <div className="lg:hidden mb-8">
              <SortChips />
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
              {products.map((p) => (
                <CardA key={p._id} product={p} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Switch

function HomePrototype({ variant, latest, products }) {
  const Home = { A: HomeA, B: HomeB, C: HomeC }[variant] ?? HomeA;
  return (
    <div className={`proto-scope ${c.bg} ${c.ink} rounded-[24px] p-4 sm:p-6`}>
      <p
        dir="ltr"
        className="mb-6 font-mono text-[11px] text-fuchsia-700 dark:text-fuchsia-300"
      >
        PROTOTYPE home variant {variant} ({HOME_VARIANT_NAMES[variant]}) · new ={" "}
        {latest.length} · all = {products.length} · hero is static copy · cards
        = product-card A · like + cart are stubs, sort is real
      </p>
      <Home latest={latest} products={products} />
    </div>
  );
}
export default HomePrototype;
