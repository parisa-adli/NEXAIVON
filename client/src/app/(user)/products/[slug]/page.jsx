import BreadCrumbs from "@/common/BreadCrumbs";
import { getOneProductBySlug, getProducts } from "@/services/productService";
import AddToCart from "./AddToCart";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "@/utils/toPersianNumber";
import Image from "next/image";

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

  return (
    <div className="px-4">
      <BreadCrumbs
        breadcrumbs={[
          {
            label: "محصولات",
            href: "/products",
          },
          {
            label: `${product.title}`,
            href: `/products/${product.slug}`,
            active: true,
          },
        ]}
      />
      <div className="flex-col space-y-8 p-4 md:p-0 md:grid md:grid-cols-3 md:gap-x-10">
        <div className="relative aspect-auto overflow-hidden rounded-lg ">
          {/* <div> */}
          <Image
            src={product.imageLink}
            alt={product.title}
            width={300}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="space-y-6 col-span-2">
          <div className="space-y-4">
            <h1 className="font-bold text-2xl">{product.title}</h1>
            <p>{product.description}</p>
          </div>
          <div className="space-y-6 md:text-lg ">
            <p>
              <span>قیمت محصول: </span>
              <span
                className={`${product.discount ? "line-through" : "font-bold"}`}
              >
                {toPersianNumbersWithComma(product.price)}
              </span>
            </p>
            {!!product.discount && (
              <div className="flex justify-between text-md font-bold  md:justify-start md:space-x-4">
                <p>قیمت با تخفیف:</p>
                <div className="flex items-center gap-x-2">
                  <div
                    className="
                  bg-rose-500 px-2 py-0.5 rounded-xl text-white text-sm"
                  >
                    {toPersianNumbers(product.discount)} %
                  </div>
                  <p className="text-md font-bold">
                    {toPersianNumbersWithComma(product.offPrice)}
                    <span className="text-xs mr-1">تومان</span>
                  </p>
                </div>
              </div>
            )}
            <div className="md:max-w-sm">
              <AddToCart product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SlugPage;
