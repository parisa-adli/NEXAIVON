import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";
import CategorySidebar from "./CategorySidebar";
import queryString from "query-string";
import { toLocalDateStringShort } from "@/utils/toLocalDate";
import Link from "next/link";
import AddToCart from "./[slug]/AddToCart";
import LikeProduct from "./LikeProduct";
import { cookies } from "next/headers";
import { toStringCookies } from "@/utils/toStringCookies";
import Image from "next/image";
import { toPersianNumbersWithComma } from "@/utils/toPersianNumber";

export const dynamic = "force-dynamic"; // eq to { cache: 'no-store'} or SSR in page

async function ProductsPage({ searchParams }) {
  // const { products } = await getProducts(
  //   await queryString.stringify(searchParams)
  // );
  // const { categories } = await getCategories();

  const cookieStore = await cookies();
  const strCookies = await toStringCookies(cookieStore);
  const productPromise = getProducts(
    queryString.stringify(await searchParams),
    strCookies
  );
  const categoryPromise = getCategories();
  const [{ products }, { categories }] = await Promise.all([
    productPromise,
    categoryPromise,
  ]);

  return (
    <div className="px-4">
      <h1 className="text-xl font-bold mb-6">صفحه محصولات</h1>
      <div className="flex flex-col sm:flex-row gap-y-8 sm:gap-0">
        <CategorySidebar categories={categories} />
        <div className="flex-1">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                className="border rounded-xl shadow-md p-4 space-y-4 "
                key={product._id}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg ">
                  <Image
                    src={product.imageLink}
                    alt={product.title}
                    fill
                    className="w-full h-full object-contain"
                  />
                </div>
                <Link
                  className="block font-bold"
                  href={`/products/${product.slug}`}
                >
                  {product.title}
                </Link>
                <div className="flex items-center justify-between">
                  <LikeProduct product={product} />
                  <div className="flex items-center gap-x-1 text-lg">
                    <p>{toPersianNumbersWithComma(product.price)}</p>
                    <span className="text-xs">تومان</span>
                  </div>
                </div>
                <AddToCart product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductsPage;
