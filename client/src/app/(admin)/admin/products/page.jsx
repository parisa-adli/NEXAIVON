"use client";

import Loading from "@/common/Loading";
import { useGetProducts } from "@/hooks/useProducts";
import ProductsTable from "./ProductListTable";
import Link from "next/link";
import { FaPlusCircle } from "react-icons/fa";

function ProductsPage() {
  const { data, isLoading } = useGetProducts();
  const { products } = data || {};

  if (isLoading) return <Loading />;

  return (
    <div className="border rounded-xl p-4 mt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold">محصولات</h1>
        <Link
          href="/admin/products/add"
          className="theme-accent flex items-center text-primary-900 gap-x-1 text-sm font-bold"
        >
          <FaPlusCircle />
          اضافه کردن محصول
        </Link>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
export default ProductsPage;
