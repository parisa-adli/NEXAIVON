import Image from "next/image";
import Link from "next/link";
import { LuArrowLeft, LuChevronLeft } from "react-icons/lu";
import { getProducts } from "@/services/productService";
import { brands, promos, services } from "@/constants/home";
import CategoriesSection from "./_components/CategoriesSection";
import Hero from "./_components/Hero";
import ProductCard from "./_components/ProductCard";

export const revalidate = 60;

export default async function Home() {
  // keep the rest of the homepage up when the API is unreachable
  const { products } = await getProducts("sort=popular&limit=4").catch(() => ({
    products: [],
  }));

  return (
    <div className="flex flex-col gap-y-12 px-4">
      <Hero />
      <CategoriesSection />

      {products.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-secondary-900">
              پرفروش‌ترین محصولات
            </h2>
            <Link
              href="/products?sort=popular"
              className="flex items-center gap-x-1 text-sm text-secondary-600"
            >
              مشاهده همه
              <LuArrowLeft />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-5 md:grid-cols-2">
        {promos.map(({ chip, title, subtitle, image, dark }) => (
          <div
            key={title}
            className={`flex min-w-0 items-center justify-between gap-4 rounded-2xl p-5 sm:p-8 ${
              dark
                ? "bg-promo-dark text-white"
                : "bg-secondary-100 text-secondary-900"
            }`}
          >
            {/* min-w-0 lets the text wrap instead of pushing the card wider than the screen */}
            <div className="min-w-0 space-y-3">
              <span
                className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                  dark ? "bg-white/15" : "bg-secondary-0"
                }`}
              >
                {chip}
              </span>
              <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
              <p
                className={`text-sm ${dark ? "text-white/80" : "text-secondary-600"}`}
              >
                {subtitle}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-x-2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-medium text-gray-900"
              >
                مشاهده محصولات
                <LuChevronLeft />
              </Link>
            </div>
            <Image
              src={image}
              alt=""
              width={160}
              height={160}
              className="w-24 h-24 sm:w-36 sm:h-36 shrink-0 object-contain"
            />
          </div>
        ))}
      </section>

      <section className="">
        <h2 className="text-center text-lg font-bold text-secondary-900 mb-6">
          <span className="border-b pb-2">برندهای محبوب</span>
        </h2>
        <ul className="flex flex-wrap items-center justify-around gap-6 rounded-xl bg-secondary-100 px-6 py-6 text-secondary-600">
          {brands.map(({ name, icon: Icon, wide }) => (
            <li key={name} title={name}>
              {Icon ? (
                // scale enlarges the wordmark without changing the row's layout box
                <Icon
                  aria-label={name}
                  className={`w-16 h-8 ${wide ? "scale-[2]" : ""}`}
                />
              ) : (
                <span className="text-xl font-bold tracking-wider">{name}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="خدمات فروشگاه">
        <h2 className="text-center text-lg font-bold text-secondary-900 mb-6">
          <span className="border-b pb-2">خدمات فروشگاه</span>
        </h2>
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 rounded-xl bg-secondary-100 px-4 py-6 lg:divide-x lg:divide-x-reverse divide-secondary-200">
          {services.map(({ title, subtitle, icon: Icon }) => (
            <li
              key={title}
              className="flex items-center justify-center gap-x-3"
            >
              <Icon aria-hidden className="w-7 h-7 text-secondary-800" />
              <div>
                <p className="text-sm font-bold text-secondary-900">{title}</p>
                <p className="text-xs text-secondary-500">{subtitle}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
