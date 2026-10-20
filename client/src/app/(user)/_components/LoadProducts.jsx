import { getProducts } from "@/services/productService";
import queryString from "query-string";
import { toLocalDateStringShort } from "@/utils/toLocalDate";
import Link from "next/link";
import { cookies } from "next/headers";
import { toStringCookies } from "@/utils/toStringCookies";
import LikeProduct from "../products/LikeProduct";
import AddToCart from "../products/[slug]/AddToCart";

export const dynamic = "force-dynamic";

async function LoadProducts({ searchParams }) {
  const cookieStore = await cookies();
  const strCookies = await toStringCookies(cookieStore);
  const { products } = await getProducts(
    queryString.stringify(await searchParams),
    strCookies
  );

  return (
    <div className="flex flex-col sm:flex-row gap-y-8 sm:gap-0">
      <div className="flex-1">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              className="border rounded-xl shadow-md p-4 space-y-4"
              key={product._id}
            >
              <h2 className="font-bold text-xl ">{product.title}</h2>
              <div className="">
                <span>تاریخ ساختن: </span>
                <span className="font-bold">
                  {toLocalDateStringShort(product.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-x-2">
                <LikeProduct product={product} />
                <Link
                  className="block text-primary-900 font-bold border-r pr-2"
                  href={`/products/${product.slug}`}
                >
                  مشاهده محصول
                </Link>
              </div>
              <AddToCart product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default LoadProducts;
