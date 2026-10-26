import BreadCrumbs from "@/common/BreadCrumbs";
import { getOneProductBySlug, getProducts } from "@/services/productService";
import AddToCart from "./AddToCart";
import ProductTabs from "./ProductTabs";
import LikeProduct from "../LikeProduct";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "@/utils/toPersianNumber";
import Image from "next/image";
import { LuStar } from "react-icons/lu";
import ProductCard from "../../_components/ProductCard";
import ServicesSection from "../../_components/ServicesSection";

export const dynamic = "force-static"; // SSG or {cache: "force-cache"}
export const dynamicParams = false;
export async function generateStaticParams() {
  const { products } = await getProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

async function SlugPage({ params }) {
  const { slug } = await params;
  const { product } = await getOneProductBySlug(slug);
  const { category } = product;
  const { products: related } = await getProducts(
    `category=${category.englishTitle}&limit=6`,
  );
  const similar = related.filter((p) => p._id !== product._id).slice(0, 5);

  const hasDiscount = product.discount > 0;
  // slug endpoint returns raw likes, not the list's likesCount
  const isBestseller = product.likes?.length > 2;
  const inStock = product.countInStock > 0;

  const specs = [
    ["برند", product.brand],
    ["دسته‌بندی", category.title],
    [
      "موجودی",
      inStock ? `${toPersianNumbers(product.countInStock)} عدد` : "ناموجود",
    ],
    ["امتیاز", `${toPersianNumbers(product.rating)} از ۵`],
  ];

  const specList = (
    <dl className="divide-y divide-secondary-200 text-sm">
      {specs.map(([label, value]) => (
        <div key={label} className="flex justify-between py-3">
          <dt className="text-secondary-500">{label}</dt>
          <dd className="text-secondary-900">{value}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <div className="px-4 space-y-10">
      <BreadCrumbs
        breadcrumbs={[
          { label: "خانه", href: "/" },
          {
            label: category.title,
            href: `/products?category=${category.englishTitle}`,
          },
          {
            label: product.title,
            href: `/products/${product.slug}`,
            active: true,
          },
        ]}
      />

      <section className="grid gap-10 md:grid-cols-2">
        {/* height capped so the whole image fits in the viewport */}
        <div className="relative w-full aspect-square max-h-[min(65vh,460px)] rounded-xl bg-secondary-100 overflow-hidden">
          <Image
            src={product.imageLink}
            alt={product.title}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain p-8"
          />
          <div className="absolute top-3 left-3">
            <LikeProduct product={product} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            {isBestseller && (
              <span className="inline-block rounded px-2 py-0.5 text-xs text-white bg-badge-best">
                پرفروش
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-black text-secondary-900">
              {product.title}
            </h1>
            <p className="text-secondary-600">
              {product.brand} | {category.title}
            </p>
            <div className="flex items-center gap-x-2 text-sm text-secondary-500">
              <span
                className="flex"
                aria-label={`امتیاز ${product.rating} از ۵`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <LuStar
                    key={n}
                    aria-hidden
                    className={`w-4 h-4 ${
                      n <= Math.round(product.rating)
                        ? "fill-star text-star"
                        : "text-secondary-300"
                    }`}
                  />
                ))}
              </span>
              <span>({toPersianNumbers(product.numReviews)} نظر)</span>
            </div>
          </div>

          <p className="leading-8 text-secondary-700">{product.description}</p>

          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-secondary-200 py-6">
            <p className="flex items-center gap-x-2 text-sm text-secondary-700">
              <span
                aria-hidden
                className={`w-2.5 h-2.5 rounded-full ${
                  inStock ? "bg-brand" : "bg-secondary-400"
                }`}
              />
              {inStock ? "موجود در انبار" : "ناموجود"}
            </p>
            <div className="flex items-center gap-x-3">
              {hasDiscount && (
                <>
                  <span className="rounded-md bg-brand px-2 py-0.5 text-xs font-bold text-white">
                    ٪{toPersianNumbers(product.discount)}
                  </span>
                  <del className="text-sm text-secondary-400">
                    {toPersianNumbersWithComma(product.price)} تومان
                  </del>
                </>
              )}
              <p className="text-2xl font-black text-brand">
                {toPersianNumbersWithComma(product.offPrice)}
                <span className="text-sm font-normal mr-1">تومان</span>
              </p>
            </div>
          </div>

          <AddToCart product={product} />
        </div>
      </section>

      <ServicesSection />

      <section className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2">
          <ProductTabs
            tabs={[
              {
                label: "توضیحات",
                content: (
                  <p className="leading-8 text-secondary-700">
                    {product.description}
                  </p>
                ),
              },
              { label: "مشخصات فنی", content: specList },
            ]}
          />
        </div>
        <div className="rounded-xl border border-secondary-200 bg-secondary-0 p-6 space-y-4">
          <h2 className="font-bold text-secondary-900">مشخصات کلیدی</h2>
          {specList}
        </div>
      </section>

      {!!similar.length && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-secondary-900">
            محصولات مشابه
          </h2>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {similar.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
export default SlugPage;
