import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";
import CategorySidebar from "./CategorySidebar";
import queryString from "query-string";
import { cookies } from "next/headers";
import { toStringCookies } from "@/utils/toStringCookies";
import { toPersianNumbers } from "@/utils/toPersianNumber";
import BreadCrumbs from "@/common/BreadCrumbs";
import ProductCard from "../_components/ProductCard";
import Pagination from "./Pagination";

export const dynamic = "force-dynamic"; // eq to { cache: 'no-store'} or SSR in page

const PAGE_SIZE = 12;

async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  // a bad ?page= would make the API answer 400; fall back to the first page
  const page = Math.max(1, Number.parseInt(params.page) || 1);

  const cookieStore = await cookies();
  const strCookies = await toStringCookies(cookieStore);
  const productPromise = getProducts(
    queryString.stringify({ ...params, page, limit: PAGE_SIZE }),
    strCookies,
  );
  const categoryPromise = getCategories();
  const [{ products, pagination }, { categories }] = await Promise.all([
    productPromise,
    categoryPromise,
  ]);

  return (
    <div className="px-4 space-y-8">
      <section className="rounded-xl bg-secondary-100 p-6 md:p-10">
        <BreadCrumbs
          breadcrumbs={[
            { label: "خانه", href: "/" },
            { label: "محصولات", href: "/products", active: true },
          ]}
        />
        <h1 className="text-2xl md:text-4xl font-black text-secondary-900 mb-3">
          محصولات
        </h1>
        <p className="text-secondary-600">
          جدیدترین موبایل‌ها، گجت‌های هوشمند و لوازم جانبی با بهترین قیمت
        </p>
      </section>
      <div className="flex flex-col sm:flex-row gap-8">
        <CategorySidebar categories={categories} />
        <div className="flex-1 space-y-6">
          <p className="text-sm text-secondary-700">
            {toPersianNumbers(pagination.total)} محصول
          </p>
          {products.length ? (
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showRating={false}
                  showLike
                />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-secondary-500">
              محصولی یافت نشد.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Pagination pagination={pagination} searchParams={params} />
            <p className="text-xs text-secondary-500">
              نمایش {toPersianNumbers((page - 1) * PAGE_SIZE + products.length)}{" "}
              از {toPersianNumbers(pagination.total)} محصول
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductsPage;
