import SortProducts from "./_components/SortProducts";
import LoadProducts from "./_components/LoadProducts";
import LatestProducts from "./_components/LatestProducts";
// PROTOTYPE: homepage variants (prototype/homepage branch only)
import PrototypeSwitcher from "@/components/prototype/PrototypeSwitcher";
import HomePrototype, { HOME_VARIANT_NAMES } from "./_prototype/HomePrototype";
import { getProducts } from "@/services/productService";
import { cookies } from "next/headers";
import { toStringCookies } from "@/utils/toStringCookies";
import queryString from "query-string";

export default async function Home({ searchParams }) {
  // PROTOTYPE: `variant` picks a homepage prototype and must not reach the API.
  const { variant, ...apiParams } = await searchParams;
  const switcher = (
    <PrototypeSwitcher
      variants={["current", "A", "B", "C"]}
      names={HOME_VARIANT_NAMES}
    />
  );

  if (variant && variant !== "current") {
    // Same two calls today's LatestProducts and LoadProducts make.
    const cookieStore = await cookies();
    const strCookies = await toStringCookies(cookieStore);
    const [{ products: all }, { products }] = await Promise.all([
      getProducts(),
      getProducts(queryString.stringify(apiParams), strCookies),
    ]);
    const latest = all
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    return (
      <div className="px-4">
        {switcher}
        <HomePrototype variant={variant} latest={latest} products={products} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-10 px-4">
      {switcher}
      <LatestProducts />
      <div>
        <h3 className="font-bold text-lg mb-2">محصولات</h3>
        <SortProducts />
        <LoadProducts searchParams={searchParams} />
      </div>
    </div>
  );
}
