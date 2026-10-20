import { getProducts } from "@/services/productService";
import { toLocalDateStringShort } from "@/utils/toLocalDate";
import Link from "next/link";
import AddToCart from "../products/[slug]/AddToCart";

async function LatestProducts() {
  const { products } = await getProducts();
  const newProducts = products
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      <h2 className="font-bold text-xl mb-4">محصولات جدید</h2>
      <div className="border rounded-xl p-8">
        <div className="flex gap-x-8 overflow-x-auto">
          {newProducts.map((product) => (
            <div
              className="border rounded-xl shadow-md p-4 space-y-4 whitespace-nowrap"
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
                <Link
                  className="block text-primary-900 font-bold"
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
export default LatestProducts;
