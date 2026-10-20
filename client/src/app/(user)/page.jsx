import SortProducts from "./_components/SortProducts";
import LoadProducts from "./_components/LoadProducts";
import LatestProducts from "./_components/LatestProducts";

export default async function Home({ searchParams }) {
  return (
    <div className="flex flex-col gap-y-10 px-4">
      <LatestProducts />
      <div>
        <h3 className="font-bold text-lg mb-2">محصولات</h3>
        <SortProducts />
        <LoadProducts searchParams={searchParams} />
      </div>
    </div>
  );
}
