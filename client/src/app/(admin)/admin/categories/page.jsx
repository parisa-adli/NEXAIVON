"use client";

import Loading from "@/common/Loading";
import Link from "next/link";
import { FaPlusCircle } from "react-icons/fa";
import { useGetCategories } from "@/hooks/useCategories";
import CategoryListTable from "./CategoryListTable";

function CategoryPage() {
  const { data, isLoading } = useGetCategories();
  const { categories } = data || {};

  if (isLoading) return <Loading />;

  return (
    <div className="border rounded-xl p-4 mt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold">دسته بندی ها</h1>
        <Link
          href="/admin/categories/add"
          className="flex items-center text-primary-900 gap-x-1 text-sm font-bold"
        >
          <FaPlusCircle />
          اضافه کردن دسته بندی
        </Link>
      </div>
      <CategoryListTable categories={categories} />
    </div>
  );
}
export default CategoryPage;
